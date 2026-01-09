'use client'

import { useEffect } from 'react'
import { authClient } from '@/lib/auth-client'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Better Auth client
    authClient.$Infer.Session
  }, [])

  return (
    <>
      {children}
    </>
  )
}