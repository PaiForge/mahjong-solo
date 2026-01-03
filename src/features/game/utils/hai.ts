import type { HaiId, HaiKindId } from '@pai-forge/riichi-mahjong'
import type { GameHai } from '@/types'

/**
 * 物理牌ID（0-135）から牌種ID（0-33）に変換する
 *
 * 牌の配置:
 * - 0-35: 萬子（9種 × 4枚 = 36枚）→ kindId 0-8
 * - 36-71: 筒子（9種 × 4枚 = 36枚）→ kindId 9-17
 * - 72-107: 索子（9種 × 4枚 = 36枚）→ kindId 18-26
 * - 108-135: 字牌（7種 × 4枚 = 28枚）→ kindId 27-33
 */
export function haiIdToKindId(haiId: HaiId): HaiKindId {
  const id = haiId as number
  if (id < 36) return Math.floor(id / 4) as HaiKindId // 萬子
  if (id < 72) return (9 + Math.floor((id - 36) / 4)) as HaiKindId // 筒子
  if (id < 108) return (18 + Math.floor((id - 72) / 4)) as HaiKindId // 索子
  return (27 + Math.floor((id - 108) / 4)) as HaiKindId // 字牌
}

/**
 * 全136枚の牌を生成する
 *
 * @param shuffle シャッフルするかどうか（デフォルト: true）
 * @returns 136枚の牌の配列
 */
export function createAllHai(shuffle = true): GameHai[] {
  const hai: GameHai[] = []

  for (let i = 0; i < 136; i++) {
    const haiId = i as HaiId
    hai.push({
      haiId,
      kindId: haiIdToKindId(haiId),
    })
  }

  if (shuffle) {
    // Fisher-Yates シャッフル
    for (let i = hai.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[hai[i], hai[j]] = [hai[j], hai[i]]
    }
  }

  return hai
}

/**
 * 手牌を牌種ID順にソートする
 *
 * @param tehai ソート対象の手牌
 * @returns ソートされた手牌（新しい配列）
 */
export function sortTehai(tehai: GameHai[]): GameHai[] {
  return [...tehai].sort((a, b) => a.kindId - b.kindId)
}
