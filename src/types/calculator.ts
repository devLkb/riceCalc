export type TabKey = 'simple' | 'market' | 'auction'

export type MarketSearchItem = {
  id: number
  name: string
  icon: string
  currentMinPrice: number | null
}

export type AuctionSearchItem = {
  id: number
  name: string
  icon: string
  buyPrice: number | null
}
