'use client';

import { AppStateProvider } from '@/context/AppStateContext';

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <AppStateProvider>{children}</AppStateProvider>;
}
