import { create } from 'zustand'
import type { GameHai } from '@/types'
import { createAllHai, sortTehai } from '../utils/hai'

type GameStore = {
  /** 手牌（13枚 + ツモ牌1枚 = 14枚） */
  tehai: GameHai[]
  /** 牌山（残りの牌） */
  yama: GameHai[]
  /** 捨て牌 */
  sutehai: GameHai[]
  /** ゲームを初期化する */
  reset: () => void
  /** 牌を切る */
  discard: (haiId: number) => void
  /** 牌山から1枚ツモる */
  draw: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  tehai: [],
  yama: [],
  sutehai: [],

  reset: () => {
    const allHai = createAllHai()

    // 最初の13枚をソートして手牌に、14枚目はツモ牌として末尾に
    const initialTehai = sortTehai(allHai.slice(0, 13))
    const tsumoHai = allHai[13]

    set({
      tehai: [...initialTehai, tsumoHai],
      yama: allHai.slice(14),
      sutehai: [],
    })
  },

  discard: (haiId: number) => {
    set((state) => {
      const discardedHai = state.tehai.find((hai) => hai.haiId === haiId)
      if (!discardedHai) return state

      return {
        tehai: state.tehai.filter((hai) => hai.haiId !== haiId),
        sutehai: [...state.sutehai, discardedHai],
      }
    })
  },

  draw: () => {
    set((state) => {
      if (state.yama.length === 0) return state

      const [tsumoHai, ...restYama] = state.yama
      // 手牌をソートしてからツモ牌を末尾に追加
      const sortedTehai = sortTehai(state.tehai)

      return {
        tehai: [...sortedTehai, tsumoHai],
        yama: restYama,
      }
    })
  },
}))
