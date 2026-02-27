import type { MarketSearchItem } from '../types/calculator'

type LostArkMarketResponseItem = {
  Id: number
  Name: string
  Icon: string
  CurrentMinPrice: number | null
}

type SearchMarketItemsParams = {
  query: string
  apiKey: string
}

const LOST_ARK_MARKET_URL = 'https://developer-lostark.game.onstove.com/markets/items'

export async function searchMarketItems({
  query,
  apiKey,
}: SearchMarketItemsParams): Promise<MarketSearchItem[]> {
  const response = await fetch(LOST_ARK_MARKET_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      authorization: `bearer ${apiKey}`,
    },
    body: JSON.stringify({
      ItemName: query,
      Sort: 'GRADE',
      SortCondition: 'DESC',
      PageNo: 1,
    }),
  })

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`)
  }

  const payload = (await response.json()) as LostArkMarketResponseItem[]
  if (!Array.isArray(payload)) {
    return []
  }

  return payload.map((item) => ({
    id: item.Id,
    name: item.Name,
    icon: item.Icon,
    currentMinPrice: item.CurrentMinPrice,
  }))
}
