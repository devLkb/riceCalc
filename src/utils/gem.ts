import type { RoundUnit } from '../types/calculator'

export const calculateGemCashValue = (
  itemGoldInput: string,
  ricePrice: number,
  roundUnit: RoundUnit,
): number | null => {
  if (itemGoldInput === '') {
    return null
  }

  const rawWon = Number(itemGoldInput) * (ricePrice / 100)
  return Math.round(rawWon / roundUnit) * roundUnit
}
