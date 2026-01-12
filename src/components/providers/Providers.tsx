'use client'

import { PasswordGate } from '@/components/auth/PasswordGate'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return <PasswordGate>{children}</PasswordGate>
}
