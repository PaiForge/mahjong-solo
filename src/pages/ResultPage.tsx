import { Link } from 'react-router-dom'
import { CompleteAnimation } from '@/components'

/**
 * 結果ページ
 *
 * 和了時に表示される画面。アニメーションを表示し、クリックでゲームに戻る。
 */
export function ResultPage() {
  return (
    <div className="h-screen bg-green-700 flex items-center justify-center">
      <div className="max-w-xs">
        <Link to="/">
          <CompleteAnimation />
        </Link>
      </div>
    </div>
  )
}
