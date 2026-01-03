import type { HaiId } from '@pai-forge/riichi-mahjong'
import type { GameHai } from '@/types'
import { Hai, type HaiSize } from '@pai-forge/mahjong-react-ui'

type Props = {
  /** 手牌 */
  tehai: GameHai[]
  /** 選択中の牌ID */
  selectedHaiId?: HaiId
  /** 牌がクリックされた時のコールバック */
  onHaiClick: (haiId: HaiId) => void
  /** 牌のサイズ */
  size?: HaiSize
  /** ハイライト表示する牌IDの配列 */
  highlightedHaiIds?: HaiId[]
}

/**
 * 手牌コンポーネント
 *
 * 手牌を横一列で表示し、クリックで牌を選択できる。
 * 選択中の牌は半透明で表示される。
 * 14枚目（ツモ牌）は少し離して表示する。
 */
export function Tehai({
  tehai,
  selectedHaiId,
  onHaiClick,
  size = 'md',
  highlightedHaiIds = [],
}: Props) {
  return (
    <div className="flex items-center justify-center">
      {tehai.map((hai, index) => {
        // 14枚目（ツモ牌）は左にマージンを追加
        const isTsumo = index === 13
        const isSelected = selectedHaiId === hai.haiId
        const isHighlighted = highlightedHaiIds.includes(hai.haiId)
        return (
          <div
            key={hai.haiId}
            className={`${isSelected ? 'opacity-50' : ''} ${isTsumo ? 'ml-2' : ''}`}
            style={isHighlighted ? {
              outline: '3px solid #facc15',
              outlineOffset: '2px',
              borderRadius: '4px',
              backgroundColor: 'rgba(250, 204, 21, 0.3)',
            } : undefined}
          >
            <Hai
              hai={hai.kindId}
              size={size}
              onClick={() => onHaiClick(hai.haiId)}
            />
          </div>
        )
      })}
    </div>
  )
}
