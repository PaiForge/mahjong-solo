import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './useGameStore'

describe('useGameStore', () => {
  beforeEach(() => {
    // 各テスト前にストアをリセット
    useGameStore.setState({
      tehai: [],
      yama: [],
      sutehai: [],
      history: [],
      canUndo: false,
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

    it('ゲームを初期化すると履歴がクリアされる', () => {
      const { reset } = useGameStore.getState()
      reset()

      const { history, canUndo } = useGameStore.getState()
      expect(history).toHaveLength(0)
      expect(canUndo).toBe(false)
    })
  })

  describe('discardAndDraw', () => {
    it('牌を切ると手牌から除かれて新しい牌がツモられる', () => {
      const { reset, discardAndDraw } = useGameStore.getState()
      reset()

      const { tehai: beforeTehai } = useGameStore.getState()
      const discardHaiId = beforeTehai[0].haiId

      discardAndDraw(discardHaiId as number)

      const { tehai: afterTehai } = useGameStore.getState()
      expect(afterTehai).toHaveLength(14)
      expect(afterTehai.find((h) => h.haiId === discardHaiId)).toBeUndefined()
    })

    it('牌を切ると捨て牌に追加される', () => {
      const { reset, discardAndDraw } = useGameStore.getState()
      reset()

      const { tehai } = useGameStore.getState()
      const discardHai = tehai[0]

      discardAndDraw(discardHai.haiId as number)

      const { sutehai } = useGameStore.getState()
      expect(sutehai).toHaveLength(1)
      expect(sutehai[0].haiId).toBe(discardHai.haiId)
    })

    it('牌を切ると牌山が1枚減る', () => {
      const { reset, discardAndDraw } = useGameStore.getState()
      reset()

      const { yama: beforeYama, tehai } = useGameStore.getState()
      const yamaLength = beforeYama.length

      discardAndDraw(tehai[0].haiId as number)

      const { yama: afterYama } = useGameStore.getState()
      expect(afterYama).toHaveLength(yamaLength - 1)
    })

    it('牌を切った後の手牌はソートされている（ツモ牌を除く）', () => {
      const { reset, discardAndDraw } = useGameStore.getState()
      reset()

      const { tehai: initialTehai } = useGameStore.getState()
      discardAndDraw(initialTehai[0].haiId as number)

      const { tehai } = useGameStore.getState()

      // 最初の13枚がソートされていることを確認
      for (let i = 0; i < 12; i++) {
        expect(tehai[i].kindId).toBeLessThanOrEqual(tehai[i + 1].kindId)
      }
    })

    it('牌を切ると履歴に保存される', () => {
      const { reset, discardAndDraw } = useGameStore.getState()
      reset()

      const { tehai } = useGameStore.getState()
      discardAndDraw(tehai[0].haiId as number)

      const { history, canUndo } = useGameStore.getState()
      expect(history).toHaveLength(1)
      expect(canUndo).toBe(true)
    })
  })

  describe('undo', () => {
    it('元に戻すと直前の状態に戻る', () => {
      const { reset, discardAndDraw, undo } = useGameStore.getState()
      reset()

      const { tehai: beforeTehai, yama: beforeYama, sutehai: beforeSutehai } = useGameStore.getState()
      const beforeState = {
        tehaiLength: beforeTehai.length,
        yamaLength: beforeYama.length,
        sutehaiLength: beforeSutehai.length,
        firstHaiId: beforeTehai[0].haiId,
      }

      discardAndDraw(beforeTehai[0].haiId as number)
      undo()

      const { tehai: afterTehai, yama: afterYama, sutehai: afterSutehai } = useGameStore.getState()
      expect(afterTehai).toHaveLength(beforeState.tehaiLength)
      expect(afterYama).toHaveLength(beforeState.yamaLength)
      expect(afterSutehai).toHaveLength(beforeState.sutehaiLength)
      expect(afterTehai[0].haiId).toBe(beforeState.firstHaiId)
    })

    it('複数回元に戻せる', () => {
      const { reset, discardAndDraw, undo } = useGameStore.getState()
      reset()

      const { tehai: initialTehai } = useGameStore.getState()

      discardAndDraw(initialTehai[0].haiId as number)
      const { tehai: afterFirst } = useGameStore.getState()

      discardAndDraw(afterFirst[0].haiId as number)

      const { history } = useGameStore.getState()
      expect(history).toHaveLength(2)

      undo()
      const { canUndo: canUndoAfterFirst } = useGameStore.getState()
      expect(canUndoAfterFirst).toBe(true)

      undo()
      const { canUndo: canUndoAfterSecond } = useGameStore.getState()
      expect(canUndoAfterSecond).toBe(false)
    })

    it('履歴がない場合は何もしない', () => {
      const { reset, undo } = useGameStore.getState()
      reset()

      const { tehai: beforeTehai } = useGameStore.getState()
      undo()
      const { tehai: afterTehai } = useGameStore.getState()

      expect(afterTehai).toEqual(beforeTehai)
    })
  })
})
