const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace root directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [...(config.watchFolders || []), workspaceRoot];

// 2. Let Metro resolve packages from the workspace node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve symlinks
config.resolver.disableHierarchicalLookup = false;

// 4. Exclude web app and Next.js build files from being watched/resolved
const defaultBlockList = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(defaultBlockList)
    ? defaultBlockList
    : defaultBlockList
      ? [defaultBlockList]
      : []),
  /[\\/\\\\]apps[\\/\\\\]web[\\/\\\\]/,
  /[\\/\\\\]\.next[\\/\\\\]/,
];

module.exports = config;
