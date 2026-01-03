import { Hai } from '@pai-forge/mahjong-react-ui'
import type { HaiId } from '@pai-forge/riichi-mahjong'
import type { GameHai } from '@/types'

type Props = {
  /** 手牌 */
  tehai: GameHai[]
  /** 選択中の牌ID */
  selectedHaiId?: HaiId
  /** 牌がクリックされた時のコールバック */
  onHaiClick: (haiId: HaiId) => void
}

/**
 * 手牌コンポーネント
 *
 * 手牌を横一列で表示し、クリックで牌を選択できる。
 * 選択中の牌は半透明で表示される。
 */
export function Tehai({ tehai, selectedHaiId, onHaiClick }: Props) {
  return (
    <div className="flex items-center justify-center">
      {tehai.map((hai) => (
        <div
          key={hai.haiId}
          className={selectedHaiId === hai.haiId ? 'opacity-50' : ''}
        >
          <Hai
            hai={hai.kindId}
            size="md"
            onClick={() => onHaiClick(hai.haiId)}
          />
        </div>
      ))}
    </div>
  )
}
