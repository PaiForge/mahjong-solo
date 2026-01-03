import { useLocation } from 'react-router-dom'
import { Board } from '@/features/game/components'

/**
 * ゲームページ
 *
 * メインのゲーム画面。
 */
export function GamePage() {
  const location = useLocation()
  // locationのkeyを使って、ナビゲーション時にBoardを再マウントさせる
  return <Board key={location.key} />
}
