import { create } from 'zustand'
import type { GameHai } from '@/types'
import { createAllHai, sortTehai } from '../utils/hai'

type GameState = {
  tehai: GameHai[]
  yama: GameHai[]
  sutehai: GameHai[]
}

type GameStore = GameState & {
  /** 履歴（元に戻す用） */
  history: GameState[]
  /** 元に戻せるかどうか */
  canUndo: boolean
  /** ゲームを初期化する */
  reset: () => void
  /** 牌を切ってツモる（1アクションとして履歴に保存） */
  discardAndDraw: (haiId: number) => void
  /** 元に戻す */
  undo: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  tehai: [],
  yama: [],
  sutehai: [],
  history: [],
  canUndo: false,

  reset: () => {
    const allHai = createAllHai()

    // 最初の13枚をソートして手牌に、14枚目はツモ牌として末尾に
    const initialTehai = sortTehai(allHai.slice(0, 13))
    const tsumoHai = allHai[13]

    set({
      tehai: [...initialTehai, tsumoHai],
      yama: allHai.slice(14),
      sutehai: [],
      history: [],
      canUndo: false,
    })
  },

  discardAndDraw: (haiId: number) => {
    const state = get()
    const discardedHai = state.tehai.find((hai) => hai.haiId === haiId)
    if (!discardedHai || state.yama.length === 0) return

    // 現在の状態を履歴に保存
    const currentState: GameState = {
      tehai: state.tehai,
      yama: state.yama,
      sutehai: state.sutehai,
    }

    // 牌を切る
    const tehaiAfterDiscard = state.tehai.filter((hai) => hai.haiId !== haiId)
    const newSutehai = [...state.sutehai, discardedHai]

    // ツモる
    const [tsumoHai, ...restYama] = state.yama
    const sortedTehai = sortTehai(tehaiAfterDiscard)

    set({
      tehai: [...sortedTehai, tsumoHai],
      yama: restYama,
      sutehai: newSutehai,
      history: [...state.history, currentState],
      canUndo: true,
    })
  },

  undo: () => {
    const state = get()
    if (state.history.length === 0) return

    const previousState = state.history[state.history.length - 1]
    const newHistory = state.history.slice(0, -1)

    set({
      tehai: previousState.tehai,
      yama: previousState.yama,
      sutehai: previousState.sutehai,
      history: newHistory,
      canUndo: newHistory.length > 0,
    })
  },
}))
