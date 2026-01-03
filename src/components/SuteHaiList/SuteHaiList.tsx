import type { GameHai } from '@/types'
import { Hai } from '@pai-forge/mahjong-react-ui'

type Props = {
  /** 捨て牌 */
  sutehai: GameHai[]
}

/**
 * 捨て牌一覧コンポーネント
 *
 * 捨て牌を複数行で折り返して表示する。
 */
export function SuteHaiList({ sutehai }: Props) {
  return (
    <div className="flex flex-wrap p-2 gap-1">
      {sutehai.map((hai) => (
        <Hai key={hai.haiId} hai={hai.kindId} size="sm" />
      ))}
    </div>
  )
}
