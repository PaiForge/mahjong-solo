import type { HaiId, HaiKindId } from '@pai-forge/riichi-mahjong'

/**
 * ゲーム内で使用する牌の型
 *
 * 物理牌ID（haiId）と牌種ID（kindId）の両方を持つ。
 * - haiId: 136枚の牌それぞれを識別するID（0-135）
 * - kindId: 34種類の牌種を識別するID（0-33）
 */
export type GameHai = {
  readonly haiId: HaiId
  readonly kindId: HaiKindId
}

/**
 * ゲームの状態
 */
export type GameState = {
  /** 手牌（13枚 + ツモ牌1枚 = 14枚） */
  tehai: GameHai[]
  /** 牌山（残りの牌） */
  yama: GameHai[]
  /** 捨て牌 */
  sutehai: GameHai[]
}

// @pai-forge/riichi-mahjong の型を再エクスポート
export type { HaiId, HaiKindId, Tehai13 } from '@pai-forge/riichi-mahjong'
