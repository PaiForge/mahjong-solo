import { describe, it, expect } from 'vitest'
import type { HaiId, HaiKindId } from '@pai-forge/riichi-mahjong'
import { haiIdToKindId, createAllHai, sortTehai } from './hai'

describe('haiIdToKindId', () => {
  it('萬子の物理牌IDを牌種IDに変換できる', () => {
    // 1萬 (haiId: 0-3 → kindId: 0)
    expect(haiIdToKindId(0 as HaiId)).toBe(0)
    expect(haiIdToKindId(3 as HaiId)).toBe(0)

    // 5萬 (haiId: 16-19 → kindId: 4)
    expect(haiIdToKindId(16 as HaiId)).toBe(4)

    // 9萬 (haiId: 32-35 → kindId: 8)
    expect(haiIdToKindId(35 as HaiId)).toBe(8)
  })

  it('筒子の物理牌IDを牌種IDに変換できる', () => {
    // 1筒 (haiId: 36-39 → kindId: 9)
    expect(haiIdToKindId(36 as HaiId)).toBe(9)

    // 5筒 (haiId: 52-55 → kindId: 13)
    expect(haiIdToKindId(52 as HaiId)).toBe(13)

    // 9筒 (haiId: 68-71 → kindId: 17)
    expect(haiIdToKindId(71 as HaiId)).toBe(17)
  })

  it('索子の物理牌IDを牌種IDに変換できる', () => {
    // 1索 (haiId: 72-75 → kindId: 18)
    expect(haiIdToKindId(72 as HaiId)).toBe(18)

    // 9索 (haiId: 104-107 → kindId: 26)
    expect(haiIdToKindId(107 as HaiId)).toBe(26)
  })

  it('字牌の物理牌IDを牌種IDに変換できる', () => {
    // 東 (haiId: 108-111 → kindId: 27)
    expect(haiIdToKindId(108 as HaiId)).toBe(27)

    // 中 (haiId: 132-135 → kindId: 33)
    expect(haiIdToKindId(135 as HaiId)).toBe(33)
  })
})

describe('createAllHai', () => {
  it('136枚の牌を生成する', () => {
    const hai = createAllHai(false)
    expect(hai).toHaveLength(136)
  })

  it('シャッフルなしの場合、順番通りに生成される', () => {
    const hai = createAllHai(false)

    // 最初の牌は haiId: 0
    expect(hai[0].haiId).toBe(0)
    expect(hai[0].kindId).toBe(0)

    // 最後の牌は haiId: 135
    expect(hai[135].haiId).toBe(135)
    expect(hai[135].kindId).toBe(33)
  })

  it('シャッフルありの場合、順番がランダムになる', () => {
    const hai1 = createAllHai(true)
    const hai2 = createAllHai(true)

    // 2回生成した結果が異なることを確認（確率的にほぼ必ず異なる）
    const ids1 = hai1.map((h) => h.haiId).join(',')
    const ids2 = hai2.map((h) => h.haiId).join(',')

    expect(ids1).not.toBe(ids2)
  })

  it('各牌のhaiIdとkindIdが正しく対応している', () => {
    const hai = createAllHai(false)

    for (const h of hai) {
      expect(h.kindId).toBe(haiIdToKindId(h.haiId))
    }
  })
})

describe('sortTehai', () => {
  it('手牌を牌種ID順にソートする', () => {
    const tehai = [
      { haiId: 108 as HaiId, kindId: 27 as HaiKindId }, // 東
      { haiId: 0 as HaiId, kindId: 0 as HaiKindId }, // 1萬
      { haiId: 72 as HaiId, kindId: 18 as HaiKindId }, // 1索
      { haiId: 36 as HaiId, kindId: 9 as HaiKindId }, // 1筒
    ]

    const sorted = sortTehai(tehai)

    expect(sorted[0].kindId).toBe(0) // 1萬
    expect(sorted[1].kindId).toBe(9) // 1筒
    expect(sorted[2].kindId).toBe(18) // 1索
    expect(sorted[3].kindId).toBe(27) // 東
  })

  it('元の配列を変更しない', () => {
    const tehai = [
      { haiId: 108 as HaiId, kindId: 27 as HaiKindId },
      { haiId: 0 as HaiId, kindId: 0 as HaiKindId },
    ]

    const sorted = sortTehai(tehai)

    expect(tehai[0].kindId).toBe(27) // 元の配列は変更されない
    expect(sorted[0].kindId).toBe(0) // ソートされた配列
  })
})
