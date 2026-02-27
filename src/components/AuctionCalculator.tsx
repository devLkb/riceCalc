import type { AuctionSearchItem } from '../types/calculator'

export function AuctionCalculator({
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
  searchResults: AuctionSearchItem[]
  selectedItem: AuctionSearchItem | null
  itemCashValue: number | null
  loading: boolean
  canSearch: boolean
  errorMessage: string
  onSearchQueryChange: (value: string) => void
  onSearch: () => void
  onSelectItem: (item: AuctionSearchItem) => void
  onCopyCashValue: () => void
  onReset: () => void
  formatGold: (value: number) => string
  formatWon: (value: number) => string
}) {
  return (
    <div className="grid market-grid">
      <label className="field-label" htmlFor="auctionQuery">
        아이템 검색
      </label>
      <div className="search-row">
        <input
          id="auctionQuery"
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

      <div className="market-list" role="list" aria-label="경매장 검색 결과">
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
              <span className="market-price">{item.buyPrice === null ? '가격 없음' : formatGold(item.buyPrice)}</span>
            </button>
          ))
        )}
      </div>

      <div className="result-card" role="status" aria-live="polite">
        <p className="field-label">선택 아이템</p>
        <p>{selectedItem?.name ?? '-'}</p>
        <p>즉시입찰가: {selectedItem?.buyPrice === null || !selectedItem ? '-' : formatGold(selectedItem.buyPrice)}</p>
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
