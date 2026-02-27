export const formatWon = (value: number): string => `₩${Math.round(value).toLocaleString('ko-KR')}`

export const formatGold = (value: number): string => `${Math.round(value).toLocaleString('ko-KR')} G`
