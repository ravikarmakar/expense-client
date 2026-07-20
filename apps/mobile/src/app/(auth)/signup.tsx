import React from 'react';
import { AuthFlowScreen } from '../../module/auth/components/AuthFlowScreen';

export default function SignupRoute() {
  return <AuthFlowScreen initialMode="SIGNUP" />;
}
