import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import {
  useLogin,
  useRegister,
  useVerifyEmail,
  useResendVerification,
  useForgotPassword,
  useVerifyResetCode,
  useResetPassword,
  useVerifyPassword,
  useChangePassword,
} from './auth.hooks';
import {
  clientLoginSchema,
  clientRegisterSchema,
  clientVerifyEmailSchema,
  clientForgotPasswordSchema,
  clientVerifyResetCodeSchema,
  clientResetPasswordSchema,
  clientVerifyPasswordSchema,
  clientChangePasswordSchema,
} from './auth.validation';
import { getErrorMessage } from './auth.api';
import { getStorage } from '../client';

interface LoginControllerConfig {
  onSuccess: (data: any) => void;
  onError: (errorMessage: string) => void;
}

export function useLoginController({ onSuccess, onError }: LoginControllerConfig) {
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSignIn = async () => {
    const result = clientLoginSchema.safeParse({ email: email.trim(), password });
    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? 'Validation failed';
      setErrorMessage(msg);
      onError(msg);
      return;
    }
    setErrorMessage('');
    loginMutation.mutate(result.data, {
      onSuccess: (data) => {
        onSuccess(data.data);
      },
      onError: (err) => {
        const msg = getErrorMessage(err, 'Invalid email or password');
        setErrorMessage(msg);
        onError(msg);
      },
    });
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errorMessage) setErrorMessage('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errorMessage) setErrorMessage('');
  };

  const loading = loginMutation.isPending;
  const isSubmitDisabled = !email.trim() || !password.trim() || loading;

  return {
    email,
    password,
    errorMessage,
    setErrorMessage,
    isPasswordVisible,
    setIsPasswordVisible,
    loading,
    isSubmitDisabled,
    handleSignIn,
    handleEmailChange,
    handlePasswordChange,
  };
}

interface RegisterControllerConfig {
  onSuccess: (data: any) => void;
  onError: (errorMessage: string) => void;
}

export function useRegisterController({ onSuccess, onError }: RegisterControllerConfig) {
  const registerMutation = useRegister();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      const msg = 'Passwords do not match';
      setErrorMessage(msg);
      onError(msg);
      return;
    }

    const result = clientRegisterSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      password,
    });
    if (!result.success) {
      const msg = result.error.issues[0].message;
      setErrorMessage(msg);
      onError(msg);
      return;
    }

    setErrorMessage('');
    registerMutation.mutate(result.data, {
      onSuccess: (data) => {
        onSuccess(data.data);
      },
      onError: (err) => {
        const msg = getErrorMessage(err, 'Registration failed. Please try again.');
        setErrorMessage(msg);
        onError(msg);
      },
    });
  };

  const handleNameChange = (text: string) => {
    setName(text);
    if (errorMessage) setErrorMessage('');
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errorMessage) setErrorMessage('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errorMessage) setErrorMessage('');
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (errorMessage) setErrorMessage('');
  };

  const loading = registerMutation.isPending;
  const isSubmitDisabled =
    !name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || loading;

  return {
    name,
    email,
    password,
    confirmPassword,
    errorMessage,
    setErrorMessage,
    isPasswordVisible,
    setIsPasswordVisible,
    isConfirmPasswordVisible,
    setIsConfirmPasswordVisible,
    loading,
    isSubmitDisabled,
    handleSignUp,
    handleNameChange,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
  };
}

interface OtpControllerConfig {
  initialEmail?: string;
  onSuccess: (data: any) => void;
  onError: (errorMessage: string, isRateLimit?: boolean) => void;
}

export function useOtpController({ initialEmail = '', onSuccess, onError }: OtpControllerConfig) {
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    } else {
      getStorage()
        .getItem('pending_verification_email')
        .then((storedEmail) => {
          if (storedEmail) setEmail(storedEmail);
        })
        .catch(() => {});
    }
  }, [initialEmail]);

  useEffect(() => {
    if (code.every((digit) => digit !== '') && email) {
      handleVerify();
    }
  }, [code, email]);

  const handleVerify = () => {
    if (!email || verifyMutation.isPending || cooldown > 60) return;
    const fullCode = code.join('');
    const result = clientVerifyEmailSchema.safeParse({ email, code: fullCode });
    if (!result.success) {
      setErrorMessage(result.error.issues[0].message);
      return;
    }

    setErrorMessage('');
    verifyMutation.mutate(result.data, {
      onSuccess: (data) => {
        getStorage()
          .removeItem('pending_verification_email')
          .catch(() => {});
        onSuccess(data.data);
      },
      onError: (err) => {
        const msg = getErrorMessage(err, 'Invalid or expired code. Please try again.');
        setErrorMessage(msg);
        const isRateLimit = err instanceof AxiosError && err.response?.status === 429;
        onError(msg, isRateLimit);
        setCode(Array(6).fill(''));
      },
    });
  };

  const handleResend = () => {
    if (!email || cooldown > 0 || resendMutation.isPending) return;
    setErrorMessage('');
    setSuccessMessage('');
    resendMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setSuccessMessage('A new verification code has been sent to your email.');
          setCode(Array(6).fill(''));
          setCooldown(60);
          onSuccess(null);
        },
        onError: (err) => {
          const msg = getErrorMessage(err, 'Failed to resend code. Please try again.');
          setErrorMessage(msg);
          onError(msg);
        },
      }
    );
  };

  const handleTextChange = (text: string, index: number, focusNext: (idx: number) => void) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 1) {
      const newCode = [...code];
      const pasteLength = Math.min(cleaned.length, 6 - index);
      for (let i = 0; i < pasteLength; i++) {
        newCode[index + i] = cleaned[i];
      }
      setCode(newCode);
      const lastFocusIndex = Math.min(index + pasteLength - 1, 5);
      focusNext(lastFocusIndex);
      return;
    }

    const digit = cleaned.slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit.length > 0 && index < 5) {
      focusNext(index + 1);
    }
  };

  const handleKeyPress = (key: string, index: number, focusPrevious: (idx: number) => void) => {
    if (key === 'Backspace' && code[index] === '' && index > 0) {
      focusPrevious(index - 1);
    }
  };

  const loading = verifyMutation.isPending;
  const resendLoading = resendMutation.isPending;
  const isSubmitDisabled = code.some((digit) => !digit) || loading;

  return {
    email,
    setEmail,
    code,
    setCode,
    errorMessage,
    setErrorMessage,
    successMessage,
    setSuccessMessage,
    cooldown,
    setCooldown,
    loading,
    resendLoading,
    isSubmitDisabled,
    handleVerify,
    handleResend,
    handleTextChange,
    handleKeyPress,
  };
}

interface ForgotPasswordControllerConfig {
  onSuccess: (step: string) => void;
  onError: (errorMessage: string, isRateLimit?: boolean) => void;
}

export function useForgotPasswordController({
  onSuccess,
  onError,
}: ForgotPasswordControllerConfig) {
  const forgotPasswordMutation = useForgotPassword();
  const verifyResetCodeMutation = useVerifyResetCode();
  const resetPasswordMutation = useResetPassword();

  const [step, setStep] = useState<'EMAIL' | 'VERIFY' | 'RESET' | 'SUCCESS'>('EMAIL');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [verifiedCode, setVerifiedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const handleSendOtp = () => {
    const trimmedEmail = email.trim();
    const result = clientForgotPasswordSchema.safeParse({ email: trimmedEmail });
    if (!result.success) {
      const msg = result.error.issues[0].message;
      setErrorMessage(msg);
      onError(msg);
      return;
    }
    setErrorMessage('');
    forgotPasswordMutation.mutate(
      { email: trimmedEmail },
      {
        onSuccess: () => {
          setStep('VERIFY');
          setCooldown(60);
          setSuccessMessage('A 6-digit reset code has been sent to your email.');
          onSuccess('VERIFY');
        },
        onError: (err) => {
          const msg = getErrorMessage(err, 'Failed to send reset code. Please try again.');
          setErrorMessage(msg);
          onError(msg);
        },
      }
    );
  };

  const handleResendOtp = () => {
    if (cooldown > 0) return;
    const trimmedEmail = email.trim();
    setErrorMessage('');
    setSuccessMessage('');
    forgotPasswordMutation.mutate(
      { email: trimmedEmail },
      {
        onSuccess: () => {
          setSuccessMessage('A new verification code has been sent to your email.');
          setCode(Array(6).fill(''));
          setCooldown(60);
          onSuccess('VERIFY');
        },
        onError: (err) => {
          const msg = getErrorMessage(err, 'Failed to resend code. Please try again.');
          setErrorMessage(msg);
          onError(msg);
        },
      }
    );
  };

  const handleVerifyOtp = () => {
    if (verifyResetCodeMutation.isPending || cooldown > 60) return;
    const fullCode = code.join('');
    const trimmedEmail = email.trim();

    const result = clientVerifyResetCodeSchema.safeParse({
      email: trimmedEmail,
      code: fullCode,
    });

    if (!result.success) {
      const msg = result.error.issues[0].message;
      setErrorMessage(msg);
      onError(msg);
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    verifyResetCodeMutation.mutate(result.data, {
      onSuccess: () => {
        setVerifiedCode(fullCode);
        setStep('RESET');
        onSuccess('RESET');
      },
      onError: (err) => {
        const msg = getErrorMessage(err, 'Invalid or expired code. Please try again.');
        setErrorMessage(msg);
        const isRateLimit = err instanceof AxiosError && err.response?.status === 429;
        onError(msg, isRateLimit);
        setCode(Array(6).fill(''));
      },
    });
  };

  const handleResetPassword = () => {
    const trimmedEmail = email.trim();

    const validation = clientResetPasswordSchema.safeParse({
      email: trimmedEmail,
      code: verifiedCode,
      newPassword,
    });

    if (!validation.success) {
      const msg = validation.error.issues[0].message;
      setErrorMessage(msg);
      onError(msg);
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    resetPasswordMutation.mutate(validation.data, {
      onSuccess: () => {
        setStep('SUCCESS');
        onSuccess('SUCCESS');
      },
      onError: (err) => {
        const msg = getErrorMessage(err, 'Password reset failed. Please check your inputs.');
        setErrorMessage(msg);
        onError(msg);
      },
    });
  };

  const handleBackPress = (navigateBack: () => void) => {
    setErrorMessage('');
    setSuccessMessage('');
    if (step === 'VERIFY') {
      setStep('EMAIL');
    } else if (step === 'RESET') {
      setStep('VERIFY');
    } else {
      navigateBack();
    }
  };

  const emailLoading = forgotPasswordMutation.isPending;
  const verifyLoading = verifyResetCodeMutation.isPending;
  const resetLoading = resetPasswordMutation.isPending;

  return {
    step,
    setStep,
    email,
    setEmail,
    code,
    setCode,
    verifiedCode,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    errorMessage,
    setErrorMessage,
    successMessage,
    setSuccessMessage,
    cooldown,
    setCooldown,
    emailLoading,
    verifyLoading,
    resetLoading,
    handleSendOtp,
    handleResendOtp,
    handleVerifyOtp,
    handleResetPassword,
    handleBackPress,
  };
}

interface ChangePasswordControllerConfig {
  onSuccess: (action: 'VERIFIED' | 'CHANGED') => void;
  onError: (errorMessage: string) => void;
}

export function useChangePasswordController({
  onSuccess,
  onError,
}: ChangePasswordControllerConfig) {
  const verifyPasswordMutation = useVerifyPassword();
  const changePasswordMutation = useChangePassword();

  const [step, setStep] = useState<'VERIFY' | 'CHANGE'>('VERIFY');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerifyPassword = () => {
    setErrorMessage('');
    const validation = clientVerifyPasswordSchema.safeParse({ password: currentPassword });
    if (!validation.success) {
      const msg = validation.error.issues[0].message;
      setErrorMessage(msg);
      onError(msg);
      return;
    }

    verifyPasswordMutation.mutate(
      { password: currentPassword },
      {
        onSuccess: () => {
          setStep('CHANGE');
          setErrorMessage('');
          onSuccess('VERIFIED');
        },
        onError: (err) => {
          const msg = getErrorMessage(err, 'Incorrect password. Please try again.');
          setErrorMessage(msg);
          onError(msg);
        },
      }
    );
  };

  const handleChangePassword = () => {
    setErrorMessage('');
    const validation = clientChangePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (!validation.success) {
      const msg = validation.error.issues[0].message;
      setErrorMessage(msg);
      onError(msg);
      return;
    }

    changePasswordMutation.mutate(
      {
        currentPassword,
        newPassword,
      },
      {
        onSuccess: () => {
          setStep('VERIFY');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          onSuccess('CHANGED');
        },
        onError: (err) => {
          const msg = getErrorMessage(err, 'Failed to change password.');
          setErrorMessage(msg);
          onError(msg);
        },
      }
    );
  };

  const resetController = () => {
    setStep('VERIFY');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    setIsCurrentPasswordVisible(false);
    setIsNewPasswordVisible(false);
    setIsConfirmPasswordVisible(false);
  };

  const verifyLoading = verifyPasswordMutation.isPending;
  const changeLoading = changePasswordMutation.isPending;

  return {
    step,
    setStep,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isCurrentPasswordVisible,
    setIsCurrentPasswordVisible,
    isNewPasswordVisible,
    setIsNewPasswordVisible,
    isConfirmPasswordVisible,
    setIsConfirmPasswordVisible,
    errorMessage,
    setErrorMessage,
    verifyLoading,
    changeLoading,
    handleVerifyPassword,
    handleChangePassword,
    resetController,
  };
}
