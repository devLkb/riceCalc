import type { TabKey } from '../types/calculator'

export function TabSelector({
  activeTab,
  onSelectTab,
}: {
  activeTab: TabKey
  onSelectTab: (key: TabKey) => void
}) {
  return (
    <section className="tabs" role="tablist" aria-label="계산 탭">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'simple'}
        className={`tab ${activeTab === 'simple' ? 'is-active' : ''}`}
        onClick={() => onSelectTab('simple')}
      >
        쌀산기
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'market'}
        className={`tab ${activeTab === 'market' ? 'is-active' : ''}`}
        onClick={() => onSelectTab('market')}
      >
        거래소 계산기
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'auction'}
        className={`tab ${activeTab === 'auction' ? 'is-active' : ''}`}
        onClick={() => onSelectTab('auction')}
      >
        경매장 계산기
      </button>
    </section>
  )
}
