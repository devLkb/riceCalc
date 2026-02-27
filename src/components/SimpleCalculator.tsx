export function SimpleCalculator({
  goldInput,
  wonInput,
  onGoldChange,
  onWonChange,
  formatGold,
  formatWon,
}: {
  goldInput: string
  wonInput: string
  onGoldChange: (value: string) => void
  onWonChange: (value: string) => void
  formatGold: (value: number) => string
  formatWon: (value: number) => string
}) {
  return (
    <div className="grid">
      <label className="field-label" htmlFor="goldInput">
        골드
      </label>
      <input
        id="goldInput"
        className="input"
        inputMode="numeric"
        value={goldInput}
        onChange={(event) => onGoldChange(event.target.value)}
        placeholder="정수만 입력"
      />

      <label className="field-label" htmlFor="wonInput">
        원화
      </label>
      <input
        id="wonInput"
        className="input"
        inputMode="numeric"
        value={wonInput}
        onChange={(event) => onWonChange(event.target.value)}
        placeholder="숫자 입력"
      />

      <div className="result-row">
        <p>골드 표시: {goldInput ? formatGold(Number(goldInput)) : '- G'}</p>
        <p>원화 표시: {wonInput ? formatWon(Number(wonInput)) : '₩-'}</p>
      </div>
    </div>
  )
}
