import { useMemo, useState } from 'react'
import './App.css'
import { ApiSettings } from './components/ApiSettings'
import { MarketCalculator } from './components/MarketCalculator'
import { PriceInputSection } from './components/PriceInputSection'
import { SimpleCalculator } from './components/SimpleCalculator'
import { TabSelector } from './components/TabSelector'
import { useApiSettings } from './hooks/useApiSettings'
import { useRiceCalculator } from './hooks/useRiceCalculator'
import type { MarketSearchItem, TabKey } from './types/calculator'
import { formatGold, formatWon } from './utils/format'
import { searchMarketItems } from './utils/marketApi'
import { sanitizeDigits } from './utils/sanitize'

const STORAGE_KEYS = {
  ricePrice: 'rice_price_per_100g',
  apiKeyActive: 'loa_api_key_active',
  apiEnabled: 'loa_api_enabled',
} as const

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('simple')
  const [ricePriceInput, setRicePriceInput] = useState<string>(
    localStorage.getItem(STORAGE_KEYS.ricePrice) ?? '',
  )
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<MarketSearchItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MarketSearchItem | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const ricePrice = Number(ricePriceInput)
  const canCalculate = Number.isFinite(ricePrice) && ricePrice > 0

  const { goldInput, wonInput, handleGoldChange, handleWonChange } = useRiceCalculator({
    ricePrice,
    canCalculate,
  })

  const {
    apiKeyDraft,
    apiKeyActive,
    apiEnabled,
    apiError,
    setApiKeyDraft,
    handleApiToggle,
  } = useApiSettings({
    initialActiveKey: localStorage.getItem(STORAGE_KEYS.apiKeyActive) ?? '',
    initialEnabled: localStorage.getItem(STORAGE_KEYS.apiEnabled) === 'true',
    storageKeys: STORAGE_KEYS,
  })

  const itemCashValue = useMemo(() => {
    if (!canCalculate || selectedItem?.currentMinPrice === null || !selectedItem) {
      return null
    }
    return Math.round(selectedItem.currentMinPrice * (ricePrice / 100))
  }, [canCalculate, selectedItem, ricePrice])

  const handleRicePriceChange = (value: string): void => {
    const sanitized = sanitizeDigits(value)
    setRicePriceInput(sanitized)
    localStorage.setItem(STORAGE_KEYS.ricePrice, sanitized)
  }

  const handleSearch = async (): Promise<void> => {
    const query = searchQuery.trim()
    if (!canCalculate) {
      setErrorMessage('쌀값을 먼저 입력하세요.')
      return
    }
    if (!apiEnabled || apiKeyActive.trim() === '') {
      setErrorMessage('API를 활성화해야 조회할 수 있습니다.')
      return
    }
    if (query === '') {
      setErrorMessage('검색어를 입력하세요.')
      return
    }

    setLoading(true)
    setErrorMessage('')
    setSelectedItem(null)

    try {
      const items = await searchMarketItems({
        query,
        apiKey: apiKeyActive,
      })
      setSearchResults(items)
      if (items.length === 0) {
        setErrorMessage('검색 결과가 없습니다.')
      }
    } catch {
      setSearchResults([])
      setErrorMessage('조회에 실패했습니다. API 키 또는 네트워크 상태를 확인하세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCashValue = async (): Promise<void> => {
    if (itemCashValue === null) {
      return
    }
    await navigator.clipboard.writeText(formatWon(itemCashValue))
  }

  const handleResetMarket = (): void => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedItem(null)
    setErrorMessage('')
  }

  return (
    <div className="app">
      <div className="bg-orb bg-orb-left" />
      <div className="bg-orb bg-orb-right" />
      <main className="panel">
        <header className="header">
          <div>
            <p className="eyebrow">LOST ARK TOOL</p>
            <h1>로스트아크 쌀값 계산기</h1>
          </div>
          <ApiSettings
            apiKeyDraft={apiKeyDraft}
            apiEnabled={apiEnabled}
            apiKeyActive={apiKeyActive}
            apiError={apiError}
            onApiKeyDraftChange={setApiKeyDraft}
            onToggleApi={handleApiToggle}
          />
        </header>

        <TabSelector activeTab={activeTab} onSelectTab={setActiveTab} />

        <section className="content">
          <PriceInputSection
            ricePriceInput={ricePriceInput}
            canCalculate={canCalculate}
            onRicePriceChange={handleRicePriceChange}
          />

          {activeTab === 'simple' && (
            <SimpleCalculator
              goldInput={goldInput}
              wonInput={wonInput}
              onGoldChange={handleGoldChange}
              onWonChange={handleWonChange}
              formatGold={formatGold}
              formatWon={formatWon}
            />
          )}

          {activeTab === 'market' && (
            <MarketCalculator
              searchQuery={searchQuery}
              searchResults={searchResults}
              selectedItem={selectedItem}
              itemCashValue={itemCashValue}
              loading={loading}
              canSearch={canCalculate && apiEnabled}
              errorMessage={errorMessage}
              onSearchQueryChange={setSearchQuery}
              onSearch={handleSearch}
              onSelectItem={setSelectedItem}
              onCopyCashValue={handleCopyCashValue}
              onReset={handleResetMarket}
              formatGold={formatGold}
              formatWon={formatWon}
            />
          )}
        </section>
      </main>
    </div>
  )
}

export default App
