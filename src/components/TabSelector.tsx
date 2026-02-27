type TabKey = 'simple' | 'gem'

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
        aria-selected={activeTab === 'gem'}
        className={`tab ${activeTab === 'gem' ? 'is-active' : ''}`}
        onClick={() => onSelectTab('gem')}
      >
        보석 쌀값 계산
      </button>
    </section>
  )
}
