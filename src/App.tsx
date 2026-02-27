import { useMemo, useState } from 'react'
import './App.css'
import { ApiSettings } from './components/ApiSettings'
import { GemCalculator } from './components/GemCalculator'
import { PriceInputSection } from './components/PriceInputSection'
import { SimpleCalculator } from './components/SimpleCalculator'
import { TabSelector } from './components/TabSelector'

type TabKey = 'simple' | 'gem'
type RoundUnit = 100 | 1000

const STORAGE_KEYS = {
  ricePrice: 'rice_price_per_100g',
  apiKeyActive: 'loa_api_key_active',
  apiEnabled: 'loa_api_enabled',
} as const

const sanitizeDigits = (value: string): string => value.replace(/[^\d]/g, '')

const formatWon = (value: number): string => `₩${Math.round(value).toLocaleString('ko-KR')}`
const formatGold = (value: number): string => `${Math.round(value).toLocaleString('ko-KR')} G`

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('simple')
  const [ricePriceInput, setRicePriceInput] = useState<string>(
    localStorage.getItem(STORAGE_KEYS.ricePrice) ?? '',
  )
  const [goldInput, setGoldInput] = useState<string>('')
  const [wonInput, setWonInput] = useState<string>('')
  const [itemGoldInput, setItemGoldInput] = useState<string>('')
  const [roundUnit, setRoundUnit] = useState<RoundUnit>(1000)
  const [apiKeyDraft, setApiKeyDraft] = useState<string>('')
  const [apiKeyActive, setApiKeyActive] = useState<string>(
    localStorage.getItem(STORAGE_KEYS.apiKeyActive) ?? '',
  )
  const [apiEnabled, setApiEnabled] = useState<boolean>(
    localStorage.getItem(STORAGE_KEYS.apiEnabled) === 'true',
  )
  const [apiError, setApiError] = useState<string>('')

  const ricePrice = Number(ricePriceInput)
  const canCalculate = Number.isFinite(ricePrice) && ricePrice > 0

  const gemCashValue = useMemo(() => {
    if (!canCalculate || itemGoldInput === '') {
      return null
    }

    const rawWon = Number(itemGoldInput) * (ricePrice / 100)
    return Math.round(rawWon / roundUnit) * roundUnit
  }, [canCalculate, itemGoldInput, ricePrice, roundUnit])

  const handleRicePriceChange = (value: string): void => {
    const sanitized = sanitizeDigits(value)
    setRicePriceInput(sanitized)
    localStorage.setItem(STORAGE_KEYS.ricePrice, sanitized)
  }

  const handleGoldChange = (value: string): void => {
    const sanitized = sanitizeDigits(value)
    setGoldInput(sanitized)

    if (!canCalculate || sanitized === '') {
      setWonInput('')
      return
    }

    const won = Number(sanitized) * (ricePrice / 100)
    setWonInput(String(Math.round(won)))
  }

  const handleWonChange = (value: string): void => {
    const sanitized = sanitizeDigits(value)
    setWonInput(sanitized)

    if (!canCalculate || sanitized === '') {
      setGoldInput('')
      return
    }

    const gold = Number(sanitized) * (100 / ricePrice)
    setGoldInput(String(Math.round(gold)))
  }

  const handleApiToggle = (): void => {
    if (apiEnabled) {
      setApiEnabled(false)
      localStorage.setItem(STORAGE_KEYS.apiEnabled, 'false')
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
    localStorage.setItem(STORAGE_KEYS.apiKeyActive, nextKey)
    localStorage.setItem(STORAGE_KEYS.apiEnabled, 'true')
  }

  const handleCopyGemValue = async (): Promise<void> => {
    if (gemCashValue === null) {
      return
    }
    await navigator.clipboard.writeText(formatWon(gemCashValue))
  }

  const handleGemReset = (): void => {
    setItemGoldInput('')
    setRoundUnit(1000)
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

          {activeTab === 'gem' && (
            <GemCalculator
              itemGoldInput={itemGoldInput}
              roundUnit={roundUnit}
              gemCashValue={gemCashValue}
              onItemGoldChange={(value) => setItemGoldInput(sanitizeDigits(value))}
              onRoundUnitChange={setRoundUnit}
              onCopyGemValue={handleCopyGemValue}
              onReset={handleGemReset}
              formatWon={formatWon}
            />
          )}
        </section>
      </main>
    </div>
  )
}

export default App
