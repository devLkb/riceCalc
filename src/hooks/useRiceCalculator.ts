import { useState } from 'react'
import { sanitizeDigits } from '../utils/sanitize'

type UseRiceCalculatorParams = {
  ricePrice: number
  canCalculate: boolean
}

type UseRiceCalculatorResult = {
  goldInput: string
  wonInput: string
  handleGoldChange: (value: string) => void
  handleWonChange: (value: string) => void
}

export function useRiceCalculator({
  ricePrice,
  canCalculate,
}: UseRiceCalculatorParams): UseRiceCalculatorResult {
  const [goldInput, setGoldInput] = useState<string>('')
  const [wonInput, setWonInput] = useState<string>('')

  const handleGoldChange = (value: string): void => {
    const sanitized = sanitizeDigits(value)
    setGoldInput(sanitized)

    if (!canCalculate || sanitized === '') {
      setWonInput('')
      return
    }

    const won = Number(sanitized) * (ricePrice / 100)
    setWonInput(String(Math.round(won)))
  }

  const handleWonChange = (value: string): void => {
    const sanitized = sanitizeDigits(value)
    setWonInput(sanitized)

    if (!canCalculate || sanitized === '') {
      setGoldInput('')
      return
    }

    const gold = Number(sanitized) * (100 / ricePrice)
    setGoldInput(String(Math.round(gold)))
  }

  return {
    goldInput,
    wonInput,
    handleGoldChange,
    handleWonChange,
  }
}
