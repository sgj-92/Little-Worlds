import type { RouteObject } from 'react-router';
import { AppShell } from './AppShell';
import { GuestOnly, RequireAccount, RequireOnboarding } from './guards';
import { HomeScreen } from '@/features/home/HomeScreen';
import { CreateScreen } from '@/features/create/CreateScreen';
import { GeneratingScreen } from '@/features/generating/GeneratingScreen';
import { PlayerScreen } from '@/features/player/PlayerScreen';
import { LibraryScreen } from '@/features/library/LibraryScreen';
import { ParentScreen } from '@/features/parent/ParentScreen';
import { ForgotPasswordScreen, ResetPasswordScreen, SignInScreen, SignUpScreen } from '@/features/auth/AuthScreens';
import { OnboardingScreen } from '@/features/auth/OnboardingScreen';
import { NotFoundScreen } from './NotFoundScreen';

export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    errorElement: <NotFoundScreen crashed />,
    children: [
      {
        element: <GuestOnly />,
        children: [
          { path: 'sign-in', element: <SignInScreen /> },
          { path: 'sign-up', element: <SignUpScreen /> },
          { path: 'forgot-password', element: <ForgotPasswordScreen /> },
        ],
      },
      { path: 'reset-password', element: <ResetPasswordScreen /> },
      { element: <RequireOnboarding />, children: [{ path: 'setup', element: <OnboardingScreen /> }] },
      {
        element: <RequireAccount />,
        children: [
          { index: true, element: <HomeScreen /> },
          { path: 'create', element: <CreateScreen /> },
          { path: 'making/:jobId', element: <GeneratingScreen /> },
          { path: 'story/:storyId', element: <PlayerScreen /> },
          { path: 'library', element: <LibraryScreen /> },
          { path: 'parent', element: <ParentScreen /> },
        ],
      },
      { path: '*', element: <NotFoundScreen /> },
    ],
  },
];
