import { calculateShanten, getUkeire } from '@pai-forge/riichi-mahjong'
import type { HaiKindId, HaiId } from '@pai-forge/riichi-mahjong'
import type { GameHai } from '@/types'

// ----------------------------------------------------------------------
// Types & Helpers
// ----------------------------------------------------------------------

/**
 * 牌の suit を判定する
 */
export function getSuit(kindId: number): 'man' | 'pin' | 'sou' | 'ji' {
    if (kindId <= 8) return 'man'
    if (kindId <= 17) return 'pin'
    if (kindId <= 26) return 'sou'
    return 'ji'
}

/**
 * 3枚の牌が順子（シュンツ）を構成するか判定する
 */
function isShuntsu(a: number, b: number, c: number): boolean {
    if (getSuit(a) === 'ji' || getSuit(b) === 'ji' || getSuit(c) === 'ji') return false
    const sorted = [a, b, c].sort((x, y) => x - y)
    // 連続しており、かつ同じスートであること
    return (
        sorted[0] + 1 === sorted[1] &&
        sorted[1] + 1 === sorted[2] &&
        getSuit(sorted[0]) === getSuit(sorted[2])
    )
}

/**
 * 3枚の牌が刻子（コーツ）を構成するか判定する
 */
function isKoutsu(a: number, b: number, c: number): boolean {
    return a === b && b === c
}

/**
 * ある牌 (tile) を加えることで、手牌の中の2枚と合わせてメンツが完成するか判定する
 */
function completesMentsu(handKindIds: HaiKindId[], tile: HaiKindId): boolean {
    // 手牌のペアを総当たりして、tile と合わせてメンツになるかチェック
    for (let i = 0; i < handKindIds.length; i++) {
        for (let j = i + 1; j < handKindIds.length; j++) {
            const a = handKindIds[i]
            const b = handKindIds[j]
            if (isShuntsu(a, b, tile) || isKoutsu(a, b, tile)) {
                return true
            }
        }
    }
    return false
}

// ----------------------------------------------------------------------
// Main Logic
// ----------------------------------------------------------------------

/**
 * 場の状況（見えている牌）を考慮して、最善の打牌候補を計算する
 * 
 * 評価基準:
 * 1. シャンテン数 (最小化)
 * 2. 評価スコア (最大化)
 *    - 受け入れ牌の残り枚数 × 重み
 *    - 重み: メンツ完成(=10点) > ターツ/対子作成(=1点)
 * 
 * @param tehai 手牌
 * @param sutehai 捨て牌（ドラなど他家の情報は今回は考慮外とするが、将来的には拡張可能）
 * @returns 推奨される打牌のIDリスト
 */
export function calculateBestMoves(tehai: GameHai[], sutehai: GameHai[]): HaiId[] {
    if (tehai.length < 14) return []

    // 1. 全ての見えている牌をカウント (枚数管理)
    const visibleCounts = new Map<number, number>()
    const countVisible = (kindId: number) => {
        visibleCounts.set(kindId, (visibleCounts.get(kindId) || 0) + 1)
    }

    tehai.forEach(h => countVisible(h.kindId))
    sutehai.forEach(h => countVisible(h.kindId))

    // 2. 各打牌候補の評価
    // メモ化用: kindIdごとの結果をキャッシュ (同じ種類の牌なら結果は同じため)
    const memo = new Map<HaiKindId, { shanten: number; score: number }>()

    const evaluations = tehai.map((discardCandidate) => {
        // 既に計算済みの牌種ならスキップ
        if (memo.has(discardCandidate.kindId)) {
            const cached = memo.get(discardCandidate.kindId)!
            return {
                haiId: discardCandidate.haiId,
                shanten: cached.shanten,
                weightedScore: cached.score,
                ukeireCount: 0 // キャッシュ利用時は詳細不要
            }
        }

        // 打牌後の手牌
        const tehaiAfterDiscard = tehai.filter((h) => h.haiId !== discardCandidate.haiId)
        const closedIds = tehaiAfterDiscard.map((h) => h.kindId)

        // A. シャンテン数
        const shanten = calculateShanten({ closed: closedIds, exposed: [] })

        // B. 有効牌 (受け入れ)
        const ukeireList = getUkeire({ closed: closedIds, exposed: [] })

        // C. スコア計算
        let totalScore = 0

        for (const ukeireKind of ukeireList) {
            // 残り枚数 (4 - 見えている数)。見えている数には「自分の手牌」も含まれていることに注意。
            // (discardCandidate は手牌から除外済みなので、tehaiAfterDiscard + sutehai のカウントが必要)
            // visibleCounts は「打牌前」のカウントなので、discardCandidate の分を 1 引く必要がある...
            // いや、論理的には:
            // 「今、山に残っている枚数」を知りたい。
            // visibleCounts = currentTehai + sutehai.
            // 自分が切る牌も「見えている」に含まれる（河に出るため）。
            // なので visibleCounts そのままでOK。
            // ただし、もし ukeireKind が discardCandidate と同じなら...
            // discardCandidate は「これから切る牌」なので、山には戻らない。カウント済みでOK。

            const visible = visibleCounts.get(ukeireKind) || 0
            const remaining = Math.max(0, 4 - visible)

            if (remaining === 0) continue

            // 重み付け
            // その牌を引いた時、メンツが完成するか？
            const formsMentsu = completesMentsu(closedIds, ukeireKind)
            const weight = formsMentsu ? 10 : 1

            totalScore += remaining * weight
        }

        memo.set(discardCandidate.kindId, { shanten, score: totalScore })

        return {
            haiId: discardCandidate.haiId,
            shanten,
            weightedScore: totalScore,
            ukeireCount: ukeireList.length
        }
    })

    // 3. 最善手の絞り込み
    // 最小シャンテン数
    const minShanten = Math.min(...evaluations.map(e => e.shanten))

    // 最小シャンテンかつ、スコアが最大のものを探す
    const bestCandidates = evaluations.filter(e => e.shanten === minShanten)
    if (bestCandidates.length === 0) return []

    const maxScore = Math.max(...bestCandidates.map(e => e.weightedScore))

    // スコアが最大(およびそれに近い)牌を推奨
    // 浮動小数誤差はないが、念のため完全一致で比較
    return bestCandidates
        .filter(e => e.weightedScore >= maxScore)
        .map(e => e.haiId)
}
