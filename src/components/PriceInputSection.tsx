export function PriceInputSection({
  ricePriceInput,
  canCalculate,
  onRicePriceChange,
}: {
  ricePriceInput: string
  canCalculate: boolean
  onRicePriceChange: (value: string) => void
}) {
  return (
    <>
      <label className="field-label" htmlFor="ricePrice">
        쌀값 (100골드 = 원)
      </label>
      <input
        id="ricePrice"
        className="input"
        inputMode="numeric"
        value={ricePriceInput}
        onChange={(event) => onRicePriceChange(event.target.value)}
        placeholder="예: 23"
      />
      {!canCalculate && <p className="error">쌀값을 입력하면 계산이 활성화됩니다.</p>}
    </>
  )
}
