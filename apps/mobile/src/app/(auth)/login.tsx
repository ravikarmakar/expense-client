import React from 'react';
import { AuthFlowScreen } from '../../module/auth/components/AuthFlowScreen';

export default function LoginRoute() {
  return <AuthFlowScreen initialMode="LOGIN" />;
}
