import { useMemo, useState } from 'react'
import './App.css'
import { ApiSettings } from './components/ApiSettings'
import { GemCalculator } from './components/GemCalculator'
import { PriceInputSection } from './components/PriceInputSection'
import { SimpleCalculator } from './components/SimpleCalculator'
import { TabSelector } from './components/TabSelector'
import { useApiSettings } from './hooks/useApiSettings'
import { useRiceCalculator } from './hooks/useRiceCalculator'
import type { RoundUnit, TabKey } from './types/calculator'
import { formatGold, formatWon } from './utils/format'
import { calculateGemCashValue } from './utils/gem'
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
  const [itemGoldInput, setItemGoldInput] = useState<string>('')
  const [roundUnit, setRoundUnit] = useState<RoundUnit>(1000)

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

  const gemCashValue = useMemo(() => {
    if (!canCalculate) {
      return null
    }

    return calculateGemCashValue(itemGoldInput, ricePrice, roundUnit)
  }, [canCalculate, itemGoldInput, ricePrice, roundUnit])

  const handleRicePriceChange = (value: string): void => {
    const sanitized = sanitizeDigits(value)
    setRicePriceInput(sanitized)
    localStorage.setItem(STORAGE_KEYS.ricePrice, sanitized)
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
