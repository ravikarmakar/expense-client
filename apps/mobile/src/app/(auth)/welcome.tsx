import React from 'react';
import { AuthFlowScreen } from '../../module/auth/components/AuthFlowScreen';

export default function WelcomeRoute() {
  return <AuthFlowScreen initialMode="WELCOME" />;
}
