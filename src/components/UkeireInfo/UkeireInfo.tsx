import { useMemo } from 'react'
import type { HaiKindId } from '@pai-forge/riichi-mahjong'
import { Hai } from '@pai-forge/mahjong-react-ui'

type Props = {
  /** 現在のシャンテン数 */
  currentShanten: number
  /** 切った後のシャンテン数 */
  nextShanten: number
  /** 有効牌（受け入れ） */
  ukeire: HaiKindId[]
  /** モーダルを閉じる */
  onClose: () => void
  /** 牌を切る */
  onDiscard: () => void
}

/**
 * 牌種IDから牌の種類（萬子・筒子・索子・字牌）を判定
 */
function getSuitGroup(kindId: HaiKindId): 'manzu' | 'pinzu' | 'souzu' | 'jihai' {
  if (kindId <= 8) return 'manzu'
  if (kindId <= 17) return 'pinzu'
  if (kindId <= 26) return 'souzu'
  return 'jihai'
}

/**
 * 有効牌情報モーダルコンポーネント
 *
 * 選択した牌を切った場合のシャンテン数変化と有効牌を表示する。
 */
export function UkeireInfo({
  currentShanten,
  nextShanten,
  ukeire,
  onClose,
  onDiscard,
}: Props) {
  const isShantenDown = nextShanten < currentShanten

  // 牌を種類ごとにグループ化
  const groupedUkeire = useMemo(() => {
    const groups: Record<'manzu' | 'pinzu' | 'souzu' | 'jihai', HaiKindId[]> = {
      manzu: [],
      pinzu: [],
      souzu: [],
      jihai: [],
    }
    for (const kindId of ukeire) {
      groups[getSuitGroup(kindId)].push(kindId)
    }
    return groups
  }, [ukeire])

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-green-900/95 text-white p-4 rounded-lg max-w-md border border-green-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* シャンテン数表示 */}
        <div className="mb-4 text-center">
          <span>{currentShanten}シャンテン</span>
          {currentShanten !== nextShanten && (
            <>
              <span className="mx-2">→</span>
              <span className={isShantenDown ? 'text-yellow-400 font-bold text-lg' : ''}>
                {nextShanten}
              </span>
              <span>シャンテン</span>
            </>
          )}
        </div>

        {/* 有効牌表示 */}
        <div className="mb-2 text-green-300 text-sm">受け入れ</div>
        <div className="flex flex-col gap-1 mb-4">
          {groupedUkeire.manzu.length > 0 && (
            <div className="flex justify-start gap-1">
              {groupedUkeire.manzu.map((kindId) => (
                <Hai key={kindId} hai={kindId} size="sm" />
              ))}
            </div>
          )}
          {groupedUkeire.pinzu.length > 0 && (
            <div className="flex justify-start gap-1">
              {groupedUkeire.pinzu.map((kindId) => (
                <Hai key={kindId} hai={kindId} size="sm" />
              ))}
            </div>
          )}
          {groupedUkeire.souzu.length > 0 && (
            <div className="flex justify-start gap-1">
              {groupedUkeire.souzu.map((kindId) => (
                <Hai key={kindId} hai={kindId} size="sm" />
              ))}
            </div>
          )}
          {groupedUkeire.jihai.length > 0 && (
            <div className="flex justify-start gap-1">
              {groupedUkeire.jihai.map((kindId) => (
                <Hai key={kindId} hai={kindId} size="sm" />
              ))}
            </div>
          )}
        </div>

        {/* 切るボタン */}
        <button
          className="w-full py-2 bg-green-700 hover:bg-green-600 text-white rounded transition-colors"
          onClick={onDiscard}
        >
          切る
        </button>

        {/* 閉じるヒント */}
        <div className="mt-3 text-center text-xs text-green-400/70">
          または同じ牌をもう一度タップ
        </div>
      </div>
    </div>
  )
}
