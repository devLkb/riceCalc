import type { MarketSearchItem } from '../types/calculator'

// 거래소 아이템 검색 결과를 보여주고 선택 아이템의 현금 환산 정보를 표시하는 컴포넌트
export function MarketCalculator({
  searchQuery,
  searchResults,
  selectedItem,
  itemCashValue,
  loading,
  canSearch,
  errorMessage,
  onSearchQueryChange,
  onSearch,
  onSelectItem,
  onCopyCashValue,
  onReset,
  formatGold,
  formatWon,
}: {
  searchQuery: string
  searchResults: MarketSearchItem[]
  selectedItem: MarketSearchItem | null
  itemCashValue: number | null
  loading: boolean
  canSearch: boolean
  errorMessage: string
  onSearchQueryChange: (value: string) => void
  onSearch: () => void
  onSelectItem: (item: MarketSearchItem) => void
  onCopyCashValue: () => void
  onReset: () => void
  formatGold: (value: number) => string
  formatWon: (value: number) => string
}) {
  return (
    <div className="grid market-grid">
      <label className="field-label" htmlFor="marketQuery">
        아이템 검색
      </label>
      <div className="search-row">
        <input
          id="marketQuery"
          className="input"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="아이템명을 입력하세요"
        />
        <button type="button" className="btn btn-neon" onClick={onSearch} disabled={!canSearch || loading}>
          {loading ? '검색 중...' : '검색'}
        </button>
      </div>

      {!!errorMessage && <p className="error">{errorMessage}</p>}

      <div className="market-list" role="list" aria-label="거래소 검색 결과">
        {searchResults.length === 0 && !loading ? (
          <p className="note">검색 결과가 없습니다.</p>
        ) : (
          searchResults.map((item) => (
            <button
              key={item.id}
              type="button"
              role="listitem"
              className={`market-item ${selectedItem?.id === item.id ? 'is-selected' : ''}`}
              onClick={() => onSelectItem(item)}
            >
              <img
                className="market-icon"
                src={item.icon}
                alt=""
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
              <span className="market-name">{item.name}</span>
              <span className="market-price">
                {item.currentMinPrice === null ? '가격 없음' : formatGold(item.currentMinPrice)}
              </span>
            </button>
          ))
        )}
      </div>

      <div className="result-card" role="status" aria-live="polite">
        <p className="field-label">선택 아이템</p>
        <p>{selectedItem?.name ?? '-'}</p>
        <p>
          거래소 가격: {selectedItem?.currentMinPrice === null || !selectedItem ? '-' : formatGold(selectedItem.currentMinPrice)}
        </p>
        <strong>현금 환산: {itemCashValue === null ? '₩-' : formatWon(itemCashValue)}</strong>
      </div>

      <div className="btn-row">
        <button type="button" className="btn" onClick={onCopyCashValue} disabled={itemCashValue === null}>
          원화 복사
        </button>
        <button type="button" className="btn" onClick={onReset}>
          초기화
        </button>
      </div>
    </div>
  )
}
