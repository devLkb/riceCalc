import type { AuctionSearchItem, MarketSearchItem } from '../types/calculator'

type LostArkMarketResponseItem = {
  Id: number
  Name: string
  Icon: string
  CurrentMinPrice: number | null
}

type LostArkMarketResponse = {
  Items?: LostArkMarketResponseItem[]
}

type SearchMarketItemsParams = {
  query: string
  apiKey: string
}

type LostArkAuctionResponseItem = {
  Id: number
  Name: string
  Icon: string
  BuyPrice?: number | null
  AuctionInfo?: {
    BuyPrice?: number | null
  } | null
}

type LostArkAuctionResponse = {
  Items?: LostArkAuctionResponseItem[]
}

type LostArkAuctionSearchRequest = {
  CategoryCode: number
  ItemName: string
  Sort: 'BUY_PRICE'
  SortCondition: 'ASC' | 'DESC'
  PageNo: number
}

const LOST_ARK_MARKET_URL = 'https://developer-lostark.game.onstove.com/markets/items'
const LOST_ARK_MARKET_OPTIONS_URL = 'https://developer-lostark.game.onstove.com/markets/options'
const LOST_ARK_AUCTION_URL = 'https://developer-lostark.game.onstove.com/auctions/items'
const LOST_ARK_AUCTION_OPTIONS_URL = 'https://developer-lostark.game.onstove.com/auctions/options'
const DEFAULT_CATEGORY_CODES = [40000]
const DEFAULT_AUCTION_CATEGORY_CODES = [210000]

let cachedCategoryCodes: number[] | null = null
let cachedAuctionCategoryCodes: number[] | null = null

function collectNumericCodes(value: unknown, out: Set<number>): void {
  if (value === null || value === undefined) {
    return
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectNumericCodes(item, out)
    }
    return
  }

  if (typeof value !== 'object') {
    return
  }

  const record = value as Record<string, unknown>
  for (const [key, nestedValue] of Object.entries(record)) {
    if (key === 'Code' && typeof nestedValue === 'number' && Number.isInteger(nestedValue) && nestedValue > 0) {
      out.add(nestedValue)
    } else {
      collectNumericCodes(nestedValue, out)
    }
  }
}

async function getCategoryCodes(apiKey: string): Promise<number[]> {
  if (cachedCategoryCodes !== null) {
    return cachedCategoryCodes
  }

  const response = await fetch(LOST_ARK_MARKET_OPTIONS_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API options request failed: ${response.status} ${errorText}`)
  }

  const payload = (await response.json()) as unknown
  const codeSet = new Set<number>()
  collectNumericCodes(payload, codeSet)

  const codes = [...codeSet]
    .filter((code) => code >= 10000 && code < 1000000)
    .sort((a, b) => a - b)

  cachedCategoryCodes = codes.length > 0 ? codes : DEFAULT_CATEGORY_CODES
  return cachedCategoryCodes
}

async function getAuctionCategoryCodes(apiKey: string): Promise<number[]> {
  if (cachedAuctionCategoryCodes !== null) {
    return cachedAuctionCategoryCodes
  }

  const response = await fetch(LOST_ARK_AUCTION_OPTIONS_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Auction options request failed: ${response.status} ${errorText}`)
  }

  const payload = (await response.json()) as unknown
  const codeSet = new Set<number>()
  collectNumericCodes(payload, codeSet)

  const codes = [...codeSet]
    .filter((code) => code >= 10000 && code < 1000000)
    .sort((a, b) => a - b)

  cachedAuctionCategoryCodes = codes.length > 0 ? codes : DEFAULT_AUCTION_CATEGORY_CODES
  return cachedAuctionCategoryCodes
}

async function fetchMarketByCategory({
  query,
  apiKey,
  categoryCode,
}: {
  query: string
  apiKey: string
  categoryCode: number
}): Promise<LostArkMarketResponseItem[]> {
  const payload = await postLostArk<LostArkMarketResponse>({
    url: LOST_ARK_MARKET_URL,
    apiKey,
    body: {
      CategoryCode: categoryCode,
      ItemName: query,
      Sort: 'GRADE',
      SortCondition: 'DESC',
      PageNo: 1,
    },
    errorPrefix: 'API request failed',
  })
  return Array.isArray(payload.Items) ? payload.Items : []
}

async function postLostArk<TResponse>({
  url,
  apiKey,
  body,
  errorPrefix,
}: {
  url: string
  apiKey: string
  body: unknown
  errorPrefix: string
}): Promise<TResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`${errorPrefix}: ${response.status} ${errorText}`)
  }

  return (await response.json()) as TResponse
}

export async function searchMarketItems({
  query,
  apiKey,
}: SearchMarketItemsParams): Promise<MarketSearchItem[]> {
  const categoryCodes = await getCategoryCodes(apiKey)
  const uniqueItems = new Map<number, LostArkMarketResponseItem>()

  for (const categoryCode of categoryCodes) {
    let items: LostArkMarketResponseItem[] = []
    try {
      items = await fetchMarketByCategory({ query, apiKey, categoryCode })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (message.includes('400')) {
        continue
      }
      throw error
    }

    for (const item of items) {
      if (!uniqueItems.has(item.Id)) {
        uniqueItems.set(item.Id, item)
      }
    }
  }

  return [...uniqueItems.values()].map((item) => ({
    id: item.Id,
    name: item.Name,
    icon: item.Icon,
    currentMinPrice: item.CurrentMinPrice,
  }))
}

function extractBuyPrice(item: LostArkAuctionResponseItem): number | null {
  const directBuyPrice = item.BuyPrice
  if (typeof directBuyPrice === 'number' && Number.isFinite(directBuyPrice)) {
    return directBuyPrice
  }

  const nestedBuyPrice = item.AuctionInfo?.BuyPrice
  if (typeof nestedBuyPrice === 'number' && Number.isFinite(nestedBuyPrice)) {
    return nestedBuyPrice
  }

  return null
}

export async function searchAuctionItems({
  query,
  apiKey,
}: SearchMarketItemsParams): Promise<AuctionSearchItem[]> {
  const categoryCodes = await getAuctionCategoryCodes(apiKey)
  const uniqueItems = new Map<number, LostArkAuctionResponseItem>()

  for (const categoryCode of categoryCodes) {
    const requestBody: LostArkAuctionSearchRequest = {
      CategoryCode: categoryCode,
      ItemName: query,
      Sort: 'BUY_PRICE',
      SortCondition: 'ASC',
      PageNo: 1,
    }

    let payload: LostArkAuctionResponse
    try {
      payload = await postLostArk<LostArkAuctionResponse>({
        url: LOST_ARK_AUCTION_URL,
        apiKey,
        body: requestBody,
        errorPrefix: 'Auction API request failed',
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (message.includes('400')) {
        continue
      }
      throw error
    }

    const items = Array.isArray(payload.Items) ? payload.Items : []
    for (const item of items) {
      if (!uniqueItems.has(item.Id)) {
        uniqueItems.set(item.Id, item)
      }
    }
  }

  return [...uniqueItems.values()].map((item) => ({
    id: item.Id,
    name: item.Name,
    icon: item.Icon,
    buyPrice: extractBuyPrice(item),
  }))
}
