import { useMemo, useState } from 'react'
import './App.css'
import { ApiSettings } from './components/ApiSettings'
import { AuctionCalculator } from './components/AuctionCalculator'
import { MarketCalculator } from './components/MarketCalculator'
import { PriceInputSection } from './components/PriceInputSection'
import { SimpleCalculator } from './components/SimpleCalculator'
import { TabSelector } from './components/TabSelector'
import { useApiSettings } from './hooks/useApiSettings'
import { useRiceCalculator } from './hooks/useRiceCalculator'
import type { AuctionSearchItem, MarketSearchItem, TabKey } from './types/calculator'
import { formatGold, formatWon } from './utils/format'
import { searchAuctionItems, searchMarketItems } from './utils/marketApi'
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

  const [marketSearchQuery, setMarketSearchQuery] = useState<string>('')
  const [marketSearchResults, setMarketSearchResults] = useState<MarketSearchItem[]>([])
  const [selectedMarketItem, setSelectedMarketItem] = useState<MarketSearchItem | null>(null)
  const [marketLoading, setMarketLoading] = useState<boolean>(false)
  const [marketErrorMessage, setMarketErrorMessage] = useState<string>('')

  const [auctionSearchQuery, setAuctionSearchQuery] = useState<string>('')
  const [auctionSearchResults, setAuctionSearchResults] = useState<AuctionSearchItem[]>([])
  const [selectedAuctionItem, setSelectedAuctionItem] = useState<AuctionSearchItem | null>(null)
  const [auctionLoading, setAuctionLoading] = useState<boolean>(false)
  const [auctionErrorMessage, setAuctionErrorMessage] = useState<string>('')

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

  const marketCashValue = useMemo(() => {
    if (!canCalculate || selectedMarketItem?.currentMinPrice === null || !selectedMarketItem) {
      return null
    }
    return Math.round(selectedMarketItem.currentMinPrice * (ricePrice / 100))
  }, [canCalculate, selectedMarketItem, ricePrice])

  const auctionCashValue = useMemo(() => {
    if (!canCalculate || selectedAuctionItem?.buyPrice === null || !selectedAuctionItem) {
      return null
    }
    return Math.round(selectedAuctionItem.buyPrice * (ricePrice / 100))
  }, [canCalculate, selectedAuctionItem, ricePrice])

  const handleRicePriceChange = (value: string): void => {
    const sanitized = sanitizeDigits(value)
    setRicePriceInput(sanitized)
    localStorage.setItem(STORAGE_KEYS.ricePrice, sanitized)
  }

  const validateSearch = (query: string): string | null => {
    if (!canCalculate) {
      return '쌀값을 먼저 입력해주세요.'
    }
    if (!apiEnabled || apiKeyActive.trim() === '') {
      return 'API를 활성화해야 조회할 수 있습니다.'
    }
    if (query === '') {
      return '검색어를 입력해주세요.'
    }
    return null
  }

  const handleMarketSearch = async (): Promise<void> => {
    const query = marketSearchQuery.trim()
    const validationError = validateSearch(query)
    if (validationError !== null) {
      setMarketErrorMessage(validationError)
      return
    }

    setMarketLoading(true)
    setMarketErrorMessage('')
    setSelectedMarketItem(null)

    try {
      const items = await searchMarketItems({
        query,
        apiKey: apiKeyActive,
      })
      setMarketSearchResults(items)
      if (items.length === 0) {
        setMarketErrorMessage('검색 결과가 없습니다.')
      }
    } catch {
      setMarketSearchResults([])
      setMarketErrorMessage('조회에 실패했습니다. API 키 또는 네트워크 상태를 확인해주세요.')
    } finally {
      setMarketLoading(false)
    }
  }

  const handleAuctionSearch = async (): Promise<void> => {
    const query = auctionSearchQuery.trim()
    const validationError = validateSearch(query)
    if (validationError !== null) {
      setAuctionErrorMessage(validationError)
      return
    }

    setAuctionLoading(true)
    setAuctionErrorMessage('')
    setSelectedAuctionItem(null)

    try {
      const items = await searchAuctionItems({
        query,
        apiKey: apiKeyActive,
      })
      setAuctionSearchResults(items)
      if (items.length === 0) {
        setAuctionErrorMessage('검색 결과가 없습니다.')
      }
    } catch {
      setAuctionSearchResults([])
      setAuctionErrorMessage('조회에 실패했습니다. API 키 또는 네트워크 상태를 확인해주세요.')
    } finally {
      setAuctionLoading(false)
    }
  }

  const handleCopyMarketCashValue = async (): Promise<void> => {
    if (marketCashValue === null) {
      return
    }
    await navigator.clipboard.writeText(formatWon(marketCashValue))
  }

  const handleCopyAuctionCashValue = async (): Promise<void> => {
    if (auctionCashValue === null) {
      return
    }
    await navigator.clipboard.writeText(formatWon(auctionCashValue))
  }

  const handleResetMarket = (): void => {
    setMarketSearchQuery('')
    setMarketSearchResults([])
    setSelectedMarketItem(null)
    setMarketErrorMessage('')
  }

  const handleResetAuction = (): void => {
    setAuctionSearchQuery('')
    setAuctionSearchResults([])
    setSelectedAuctionItem(null)
    setAuctionErrorMessage('')
  }

  return (
    <div className="app">
      <div className="bg-orb bg-orb-left" />
      <div className="bg-orb bg-orb-right" />
      <main className="panel">
        <header className="header">
          <div>
            <p className="eyebrow">LOST ARK TOOL</p>
            <h1>로스트아크 쌀산기</h1>
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
              searchQuery={marketSearchQuery}
              searchResults={marketSearchResults}
              selectedItem={selectedMarketItem}
              itemCashValue={marketCashValue}
              loading={marketLoading}
              canSearch={canCalculate && apiEnabled}
              errorMessage={marketErrorMessage}
              onSearchQueryChange={setMarketSearchQuery}
              onSearch={handleMarketSearch}
              onSelectItem={setSelectedMarketItem}
              onCopyCashValue={handleCopyMarketCashValue}
              onReset={handleResetMarket}
              formatGold={formatGold}
              formatWon={formatWon}
            />
          )}

          {activeTab === 'auction' && (
            <AuctionCalculator
              searchQuery={auctionSearchQuery}
              searchResults={auctionSearchResults}
              selectedItem={selectedAuctionItem}
              itemCashValue={auctionCashValue}
              loading={auctionLoading}
              canSearch={canCalculate && apiEnabled}
              errorMessage={auctionErrorMessage}
              onSearchQueryChange={setAuctionSearchQuery}
              onSearch={handleAuctionSearch}
              onSelectItem={setSelectedAuctionItem}
              onCopyCashValue={handleCopyAuctionCashValue}
              onReset={handleResetAuction}
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
