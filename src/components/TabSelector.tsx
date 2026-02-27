type TabKey = 'simple' | 'market'

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
        단순 쌀값 계산
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'market'}
        className={`tab ${activeTab === 'market' ? 'is-active' : ''}`}
        onClick={() => onSelectTab('market')}
      >
        아이템 현금가 조회
      </button>
    </section>
  )
}
