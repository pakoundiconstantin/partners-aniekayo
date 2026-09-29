import { createContext, useContext } from 'react'
import type { AppSnapshot } from '../types/domain'

export interface AppDataContextValue {
  data: AppSnapshot
  update: (next: AppSnapshot) => void
  apiStatus: { state: 'demo' | 'loading' | 'connected' | 'error'; message?: string }
  refreshAdmin: () => Promise<void>
}

export const DataContext = createContext<AppDataContextValue | null>(null)

export function useAppData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useAppData doit être utilisé dans AppDataProvider.')
  return context
}