package com.ravikarmakar.splitshare.downloads

import android.content.ContentValues
import android.content.Context
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.InputStream

class AndroidDownloadsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AndroidDownloads")

    AsyncFunction("saveToDownloads") { options: Map<String, Any?> ->
      val sourceUriStr = options["sourceUri"] as? String
        ?: throw IllegalArgumentException("sourceUri is required")
      val rawFileName = options["fileName"] as? String
        ?: throw IllegalArgumentException("fileName is required")
      val mimeType = options["mimeType"] as? String
        ?: throw IllegalArgumentException("mimeType is required")
      val userRelativePath = options["relativePath"] as? String

      val sanitizedFileName = sanitizeFileName(rawFileName)
      val relativePath = buildRelativePath(userRelativePath)

      val context = appContext.reactContext ?: throw Exceptions.ReactContextLost()

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        saveUsingMediaStoreApi29(context, sourceUriStr, sanitizedFileName, mimeType, relativePath)
      } else {
        saveUsingLegacyStorage(context, sourceUriStr, sanitizedFileName, mimeType, relativePath)
      }
    }
  }

  private fun sanitizeFileName(fileName: String): String {
    val clean = fileName.replace("[^a-zA-Z0-9_.-]".toRegex(), "_")
      .replace("^\\.+".toRegex(), "")
    return if (clean.isEmpty()) "SplitShare_Export_${System.currentTimeMillis()}" else clean
  }

  private fun buildRelativePath(userPath: String?): String {
    val defaultSubPath = "SplitShare/Transactions"

    if (userPath.isNullOrBlank()) {
      return "${Environment.DIRECTORY_DOWNLOADS}/$defaultSubPath"
    }

    var cleanPath = userPath.replace("\\", "/").trim('/')
    if (cleanPath.startsWith("Download/")) {
      cleanPath = cleanPath.removePrefix("Download/").trim('/')
    }

    if (!cleanPath.startsWith("SplitShare")) {
      cleanPath = defaultSubPath
    }

    return "${Environment.DIRECTORY_DOWNLOADS}/$cleanPath"
  }

  private fun openSourceInputStream(context: Context, sourceUriStr: String): InputStream {
    val uri = Uri.parse(sourceUriStr)
    return when {
      uri.scheme == "content" || uri.scheme == "file" -> {
        context.contentResolver.openInputStream(uri)
          ?: throw Exception("Could not open stream for source URI: $sourceUriStr")
      }
      else -> {
        val file = File(sourceUriStr)
        if (!file.exists()) {
          throw Exception("Source file does not exist: $sourceUriStr")
        }
        FileInputStream(file)
      }
    }
  }

  private fun saveUsingMediaStoreApi29(
    context: Context,
    sourceUriStr: String,
    fileName: String,
    mimeType: String,
    relativePath: String
  ): String {
    val resolver = context.contentResolver
    val collection = MediaStore.Downloads.EXTERNAL_CONTENT_URI

    val values = ContentValues().apply {
      put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
      put(MediaStore.MediaColumns.MIME_TYPE, mimeType)
      put(MediaStore.MediaColumns.RELATIVE_PATH, relativePath)
      put(MediaStore.MediaColumns.IS_PENDING, 1)
    }

    val itemUri = resolver.insert(collection, values)
      ?: throw Exception("Failed to insert MediaStore downloads record")

    try {
      val outputStream = resolver.openOutputStream(itemUri)
        ?: throw Exception("Failed to open MediaStore output stream")

      outputStream.use { out ->
        openSourceInputStream(context, sourceUriStr).use { input ->
          input.copyTo(out)
        }
      }

      val updateValues = ContentValues().apply {
        put(MediaStore.MediaColumns.IS_PENDING, 0)
      }
      resolver.update(itemUri, updateValues, null, null)

      return itemUri.toString()
    } catch (e: Exception) {
      resolver.delete(itemUri, null, null)
      throw Exception("Failed to save file to MediaStore: ${e.message}", e)
    }
  }

  private fun saveUsingLegacyStorage(
    context: Context,
    sourceUriStr: String,
    fileName: String,
    mimeType: String,
    relativePath: String
  ): String {
    val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
    val subFolder = relativePath.removePrefix("${Environment.DIRECTORY_DOWNLOADS}/").removePrefix(Environment.DIRECTORY_DOWNLOADS)
    val targetFolder = File(downloadsDir, subFolder)

    if (!targetFolder.exists()) {
      targetFolder.mkdirs()
    }

    var targetFile = File(targetFolder, fileName)
    if (targetFile.exists()) {
      val nameWithoutExt = fileName.substringBeforeLast('.', fileName)
      val ext = if (fileName.contains('.')) ".${fileName.substringAfterLast('.')}" else ""
      var counter = 1
      while (targetFile.exists()) {
        val nextName = String.format("%s_%03d%s", nameWithoutExt, counter, ext)
        targetFile = File(targetFolder, nextName)
        counter++
      }
    }

    try {
      FileOutputStream(targetFile).use { out ->
        openSourceInputStream(context, sourceUriStr).use { input ->
          input.copyTo(out)
        }
      }

      MediaScannerConnection.scanFile(
        context,
        arrayOf(targetFile.absolutePath),
        arrayOf(mimeType),
        null
      )

      return Uri.fromFile(targetFile).toString()
    } catch (e: Exception) {
      if (targetFile.exists()) {
        targetFile.delete()
      }
      throw Exception("Failed to save file to legacy storage: ${e.message}", e)
    }
  }
}
