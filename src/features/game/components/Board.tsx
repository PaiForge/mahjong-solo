import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { calculateShanten, getUkeire } from '@pai-forge/riichi-mahjong'
import type { HaiId, HaiKindId } from '@pai-forge/riichi-mahjong'
import type { HaiSize } from '@pai-forge/mahjong-react-ui'
import { Tehai, SuteHaiList, UkeireInfo } from '@/components'
import { useGameStore } from '../stores/useGameStore'

/**
 * 画面サイズに応じた牌のサイズを取得するフック
 */
function useHaiSize(): HaiSize {
  const getSize = useCallback((): HaiSize => {
    if (typeof window === 'undefined') return 'md'
    const height = window.innerHeight
    const width = window.innerWidth
    // 縦向きスマホ（幅が狭い）は xs
    if (width < 500) return 'xs'
    // 横向きスマホ（高さが低いが幅は十分）は sm
    if (height < 500 && width > height) return 'sm'
    // それ以外は md
    return 'md'
  }, [])

  const [size, setSize] = useState<HaiSize>(getSize)

  useEffect(() => {
    const handleResize = () => setSize(getSize())
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [getSize])

  return size
}

/**
 * ゲームボードコンポーネント
 *
 * ゲームのメイン画面。手牌・捨て牌の表示とゲームロジックを管理する。
 */
export function Board() {
  const navigate = useNavigate()
  const { tehai, sutehai, reset, discardAndDraw, undo, canUndo } = useGameStore()
  const [selectedHaiId, setSelectedHaiId] = useState<HaiId | undefined>(undefined)
  const [showModal, setShowModal] = useState(false)
  const [showBestMove, setShowBestMove] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const haiSize = useHaiSize()

  // ゲーム初期化（マウント時のみ）
  useEffect(() => {
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 現在のシャンテン数（13枚で計算）
  const currentShanten = useMemo(() => {
    if (tehai.length < 14) return 8
    // ツモ牌を除いた13枚で計算
    const tehaiWithoutTsumo = tehai.slice(0, 13)
    return calculateShanten({
      closed: tehaiWithoutTsumo.map((h) => h.kindId),
      exposed: [],
    })
  }, [tehai])

  // 選択した牌を切った後のシャンテン数と有効牌
  const { nextShanten, ukeire } = useMemo(() => {
    // selectedHaiIdが未定義、手牌が14枚未満、または選択中の牌が手牌に存在しない場合は計算しない
    const selectedHaiExists = tehai.some((h) => h.haiId === selectedHaiId)
    if (selectedHaiId === undefined || tehai.length < 14 || !selectedHaiExists) {
      return { nextShanten: currentShanten, ukeire: [] as HaiKindId[] }
    }

    const tehaiAfterDiscard = tehai.filter((h) => h.haiId !== selectedHaiId)
    const nextShanten = calculateShanten({
      closed: tehaiAfterDiscard.map((h) => h.kindId),
      exposed: [],
    })
    const ukeire = getUkeire({
      closed: tehaiAfterDiscard.map((h) => h.kindId),
      exposed: [],
    })

    return { nextShanten, ukeire }
  }, [tehai, selectedHaiId, currentShanten])

  // ベストムーブを計算（シャンテン数が最小で、受け入れ枚数が最大の打牌、同率は全てハイライト）
  const bestMoveHaiIds = useMemo(() => {
    if (tehai.length < 14) return []

    // 各牌のシャンテン数と受け入れ枚数を計算
    const evaluations = tehai.map((hai) => {
      const tehaiAfterDiscard = tehai.filter((h) => h.haiId !== hai.haiId)
      const shanten = calculateShanten({
        closed: tehaiAfterDiscard.map((h) => h.kindId),
        exposed: [],
      })
      const ukeireList = getUkeire({
        closed: tehaiAfterDiscard.map((h) => h.kindId),
        exposed: [],
      })
      return { haiId: hai.haiId, shanten, ukeireCount: ukeireList.length }
    })

    // 最小シャンテン数を取得
    const minShanten = Math.min(...evaluations.map((e) => e.shanten))
    // 最小シャンテン数の牌の中で最大受け入れ枚数を取得
    const maxUkeireCount = Math.max(
      ...evaluations.filter((e) => e.shanten === minShanten).map((e) => e.ukeireCount)
    )
    // 同率一位の牌を全て返す
    return evaluations
      .filter((e) => e.shanten === minShanten && e.ukeireCount === maxUkeireCount)
      .map((e) => e.haiId)
  }, [tehai])

  // テンパイで有効牌をツモったら和了
  useEffect(() => {
    if (tehai.length < 14) return

    const tehaiWithoutTsumo = tehai.slice(0, 13)
    const tsumoHai = tehai[13]

    const shanten = calculateShanten({
      closed: tehaiWithoutTsumo.map((h) => h.kindId),
      exposed: [],
    })

    if (shanten === 0) {
      const ukeire = getUkeire({
        closed: tehaiWithoutTsumo.map((h) => h.kindId),
        exposed: [],
      })

      if (ukeire.includes(tsumoHai.kindId)) {
        navigate('/result', { replace: true, state: { tehai } })
      }
    }
  }, [tehai, navigate])

  // 牌がクリックされた時の処理
  const handleHaiClick = (haiId: HaiId) => {
    if (selectedHaiId === haiId) {
      // 同じ牌を再度クリック → 切る
      discardAndDraw(haiId as number)
      setSelectedHaiId(undefined)
      setShowModal(false)
    } else {
      // 別の牌をクリック → 選択
      setSelectedHaiId(haiId)
      setShowModal(true)
    }
  }

  // モーダルを閉じる
  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedHaiId(undefined)
  }

  // モーダルから牌を切る
  const handleDiscardFromModal = () => {
    if (selectedHaiId !== undefined) {
      discardAndDraw(selectedHaiId as number)
      setSelectedHaiId(undefined)
      setShowModal(false)
    }
  }

  return (
    <div className="h-dvh bg-green-700 flex flex-col overflow-hidden">
      {/* メインエリア（捨て牌表示） */}
      <div className="main-area flex-1 overflow-auto min-h-0">
        <SuteHaiList sutehai={sutehai} />
      </div>

      {/* 手牌エリア（画面下部） */}
      <div className="tehai-area shrink-0 z-[60]">
        {/* シャンテン数・ヒント・元に戻す */}
        <div className="flex justify-between items-center px-2 py-1">
          <div className="flex gap-2">
            <div
              className={`text-xs px-2 py-1 rounded cursor-pointer select-none ${
                showBestMove
                  ? 'bg-yellow-400 text-yellow-900'
                  : 'bg-green-600/80 text-white/80'
              }`}
              onClick={() => setShowBestMove((prev) => !prev)}
            >
              ★ ヒント
            </div>
            <div
              className={`text-xs px-2 py-1 rounded select-none ${
                canUndo
                  ? 'bg-green-600/80 text-white/80 cursor-pointer'
                  : 'bg-green-800/50 text-white/30 cursor-not-allowed'
              }`}
              onClick={canUndo ? () => {
                undo()
                setSelectedHaiId(undefined)
                setShowModal(false)
              } : undefined}
            >
              ↩ 戻す
            </div>
            <div
              className="text-xs px-2 py-1 rounded cursor-pointer select-none bg-orange-600/80 text-white/80"
              onClick={() => setShowResetConfirm(true)}
            >
              ↻ リセット
            </div>
          </div>
          <span className="text-white/80 text-xs">
            {currentShanten === 0 ? 'テンパイ' : `${currentShanten}シャンテン`}
          </span>
        </div>
        {/* 手牌 */}
        <div className="flex justify-center items-center bg-green-800/50">
          <Tehai
            tehai={tehai}
            selectedHaiId={selectedHaiId}
            onHaiClick={handleHaiClick}
            size={haiSize}
            highlightedHaiIds={showBestMove ? bestMoveHaiIds : []}
          />
        </div>
      </div>

      {/* 有効牌情報モーダル */}
      {showModal && selectedHaiId !== undefined && (
        <UkeireInfo
          currentShanten={currentShanten}
          nextShanten={nextShanten}
          ukeire={ukeire}
          onClose={handleCloseModal}
          onDiscard={handleDiscardFromModal}
        />
      )}

      {/* リセット確認モーダル */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            className="bg-green-900/95 text-white p-4 rounded-lg max-w-xs border border-green-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 text-center">
              配牌からやり直しますか？
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 py-2 bg-green-700 hover:bg-green-600 text-white rounded transition-colors"
                onClick={() => setShowResetConfirm(false)}
              >
                キャンセル
              </button>
              <button
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                onClick={() => {
                  reset()
                  setShowResetConfirm(false)
                  setSelectedHaiId(undefined)
                  setShowModal(false)
                  setShowBestMove(false)
                }}
              >
                リセット
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
