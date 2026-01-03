import { useLocation, useNavigate } from 'react-router-dom'
import { Hai } from '@pai-forge/mahjong-react-ui'
import { CompleteAnimation } from '@/components'
import { useGameStore } from '@/features/game/stores/useGameStore'
import type { GameHai } from '@/types'

/**
 * 結果ページ
 *
 * 和了時に表示される画面。アニメーションと和了手牌を表示し、再プレイボタンでゲームに戻る。
 */
export function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const reset = useGameStore((state) => state.reset)
  const tehai = (location.state as { tehai?: GameHai[] })?.tehai ?? []

  const handleReplay = () => {
    reset()
    navigate('/', { replace: true })
  }

  return (
    <div className="h-dvh bg-green-700 flex flex-col items-center justify-center gap-6 p-4">
      {/* アニメーション */}
      <div className="w-48 h-48">
        <CompleteAnimation />
      </div>

      {/* 和了時の手牌 */}
      {tehai.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1">
          {tehai.map((hai, index) => (
            <div key={hai.haiId} className={index === 13 ? 'ml-2' : ''}>
              <Hai hai={hai.kindId} size="sm" />
            </div>
          ))}
        </div>
      )}

      {/* 再プレイボタン */}
      <button
        onClick={handleReplay}
        className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
        style={{ color: 'rgba(255, 255, 255, 0.8)' }}
      >
        もう一度プレイ
      </button>
    </div>
  )
}
