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
}: Props) {
  const isShantenDown = nextShanten < currentShanten

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 text-white p-4 rounded-lg max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* シャンテン数表示 */}
        <div className="mb-4 text-center">
          <span>{currentShanten}シャンテン</span>
          {currentShanten !== nextShanten && (
            <>
              <span className="mx-2">→</span>
              <span className={isShantenDown ? 'text-red-500 font-bold text-lg' : ''}>
                {nextShanten}
              </span>
              <span>シャンテン</span>
            </>
          )}
        </div>

        {/* 有効牌表示 */}
        <div className="mb-2 ml-2">受け入れ</div>
        <div className="flex flex-wrap justify-center gap-2">
          {ukeire.map((kindId, index) => (
            <Hai key={`${kindId}-${index}`} hai={kindId} size="sm" />
          ))}
        </div>

        {/* 閉じるヒント */}
        <div className="mt-4 text-center text-sm text-gray-400">
          同じ牌をもう一度タップで切る
        </div>
      </div>
    </div>
  )
}
