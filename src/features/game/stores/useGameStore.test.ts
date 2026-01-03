import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './useGameStore'

describe('useGameStore', () => {
  beforeEach(() => {
    // 各テスト前にストアをリセット
    useGameStore.setState({
      tehai: [],
      yama: [],
      sutehai: [],
    })
  })

  describe('reset', () => {
    it('ゲームを初期化すると手牌が14枚になる', () => {
      const { reset } = useGameStore.getState()
      reset()

      const { tehai } = useGameStore.getState()
      expect(tehai).toHaveLength(14)
    })

    it('ゲームを初期化すると牌山が122枚になる（136 - 14）', () => {
      const { reset } = useGameStore.getState()
      reset()

      const { yama } = useGameStore.getState()
      expect(yama).toHaveLength(122)
    })

    it('ゲームを初期化すると捨て牌が空になる', () => {
      const { reset } = useGameStore.getState()
      reset()

      const { sutehai } = useGameStore.getState()
      expect(sutehai).toHaveLength(0)
    })

    it('手牌はソートされている（ツモ牌を除く）', () => {
      const { reset } = useGameStore.getState()
      reset()

      const { tehai } = useGameStore.getState()

      // 最初の13枚がソートされていることを確認
      for (let i = 0; i < 12; i++) {
        expect(tehai[i].kindId).toBeLessThanOrEqual(tehai[i + 1].kindId)
      }
    })
  })

  describe('discard', () => {
    it('牌を切ると手牌から除かれる', () => {
      const { reset, discard } = useGameStore.getState()
      reset()

      const { tehai: beforeTehai } = useGameStore.getState()
      const discardHaiId = beforeTehai[0].haiId

      discard(discardHaiId as number)

      const { tehai: afterTehai } = useGameStore.getState()
      expect(afterTehai).toHaveLength(13)
      expect(afterTehai.find((h) => h.haiId === discardHaiId)).toBeUndefined()
    })

    it('牌を切ると捨て牌に追加される', () => {
      const { reset, discard } = useGameStore.getState()
      reset()

      const { tehai } = useGameStore.getState()
      const discardHai = tehai[0]

      discard(discardHai.haiId as number)

      const { sutehai } = useGameStore.getState()
      expect(sutehai).toHaveLength(1)
      expect(sutehai[0].haiId).toBe(discardHai.haiId)
    })
  })

  describe('draw', () => {
    it('ツモると手牌が1枚増える', () => {
      const { reset, discard, draw } = useGameStore.getState()
      reset()

      const { tehai: beforeTehai } = useGameStore.getState()
      discard(beforeTehai[0].haiId as number)

      const { tehai: afterDiscard } = useGameStore.getState()
      expect(afterDiscard).toHaveLength(13)

      draw()

      const { tehai: afterDraw } = useGameStore.getState()
      expect(afterDraw).toHaveLength(14)
    })

    it('ツモると牌山が1枚減る', () => {
      const { reset, discard, draw } = useGameStore.getState()
      reset()

      const { yama: beforeYama, tehai } = useGameStore.getState()
      const yamaLength = beforeYama.length

      discard(tehai[0].haiId as number)
      draw()

      const { yama: afterYama } = useGameStore.getState()
      expect(afterYama).toHaveLength(yamaLength - 1)
    })

    it('ツモ後の手牌はソートされている（ツモ牌を除く）', () => {
      const { reset, discard, draw } = useGameStore.getState()
      reset()

      const { tehai: initialTehai } = useGameStore.getState()
      discard(initialTehai[0].haiId as number)
      draw()

      const { tehai } = useGameStore.getState()

      // 最初の13枚がソートされていることを確認
      for (let i = 0; i < 12; i++) {
        expect(tehai[i].kindId).toBeLessThanOrEqual(tehai[i + 1].kindId)
      }
    })
  })
})
