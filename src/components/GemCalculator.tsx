type RoundUnit = 100 | 1000

export function GemCalculator({
  itemGoldInput,
  roundUnit,
  gemCashValue,
  onItemGoldChange,
  onRoundUnitChange,
  onCopyGemValue,
  onReset,
  formatWon,
}: {
  itemGoldInput: string
  roundUnit: RoundUnit
  gemCashValue: number | null
  onItemGoldChange: (value: string) => void
  onRoundUnitChange: (unit: RoundUnit) => void
  onCopyGemValue: () => void
  onReset: () => void
  formatWon: (value: number) => string
}) {
  return (
    <div className="grid">
      <label className="field-label" htmlFor="itemGoldInput">
        아이템 가격 (골드)
      </label>
      <input
        id="itemGoldInput"
        className="input"
        inputMode="numeric"
        value={itemGoldInput}
        onChange={(event) => onItemGoldChange(event.target.value)}
        placeholder="정수만 입력"
      />

      <fieldset className="rounding-box">
        <legend className="field-label">표시 단위</legend>
        <label className="radio">
          <input
            type="radio"
            name="roundUnit"
            checked={roundUnit === 1000}
            onChange={() => onRoundUnitChange(1000)}
          />
          1000원 단위
        </label>
        <label className="radio">
          <input
            type="radio"
            name="roundUnit"
            checked={roundUnit === 100}
            onChange={() => onRoundUnitChange(100)}
          />
          100원 단위
        </label>
      </fieldset>

      <div className="result-card" role="status" aria-live="polite">
        <p className="field-label">현금 환산</p>
        <strong>{gemCashValue === null ? '₩-' : formatWon(gemCashValue)}</strong>
      </div>

      <div className="btn-row">
        <button type="button" className="btn" onClick={onCopyGemValue} disabled={gemCashValue === null}>
          복사
        </button>
        <button type="button" className="btn" onClick={onReset}>
          초기화
        </button>
      </div>
    </div>
  )
}
