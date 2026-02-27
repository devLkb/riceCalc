import { useState } from 'react'

type UseApiSettingsParams = {
  initialActiveKey: string
  initialEnabled: boolean
  storageKeys: {
    apiKeyActive: string
    apiEnabled: string
  }
}

type UseApiSettingsResult = {
  apiKeyDraft: string
  apiKeyActive: string
  apiEnabled: boolean
  apiError: string
  setApiKeyDraft: (value: string) => void
  handleApiToggle: () => void
}

export function useApiSettings({
  initialActiveKey,
  initialEnabled,
  storageKeys,
}: UseApiSettingsParams): UseApiSettingsResult {
  const [apiKeyDraft, setApiKeyDraft] = useState<string>('')
  const [apiKeyActive, setApiKeyActive] = useState<string>(initialActiveKey)
  const [apiEnabled, setApiEnabled] = useState<boolean>(initialEnabled)
  const [apiError, setApiError] = useState<string>('')

  const handleApiToggle = (): void => {
    if (apiEnabled) {
      setApiEnabled(false)
      localStorage.setItem(storageKeys.apiEnabled, 'false')
      return
    }

    const nextKey = apiKeyDraft.trim()
    if (nextKey === '') {
      setApiError('API Key를 입력해야 활성화할 수 있습니다.')
      return
    }

    setApiError('')
    setApiKeyActive(nextKey)
    setApiEnabled(true)
    localStorage.setItem(storageKeys.apiKeyActive, nextKey)
    localStorage.setItem(storageKeys.apiEnabled, 'true')
  }

  return {
    apiKeyDraft,
    apiKeyActive,
    apiEnabled,
    apiError,
    setApiKeyDraft,
    handleApiToggle,
  }
}
