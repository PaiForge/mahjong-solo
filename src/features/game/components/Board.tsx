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
    // 高さが400px未満（横向きスマホ）または幅が500px未満（縦向きスマホ）は xs
    if (height < 400 || width < 500) return 'xs'
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
  const { tehai, sutehai, reset, discard, draw } = useGameStore()
  const [selectedHaiId, setSelectedHaiId] = useState<HaiId | undefined>(undefined)
  const [showModal, setShowModal] = useState(false)
  const [showBestMove, setShowBestMove] = useState(false)
  const haiSize = useHaiSize()

  // ゲーム初期化
  useEffect(() => {
    reset()
  }, [reset])

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
    if (selectedHaiId === undefined || tehai.length < 14) {
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

  // ベストムーブを計算（シャンテン数が最小で、受け入れ枚数が最大の打牌）
  const bestMoveHaiId = useMemo(() => {
    if (tehai.length < 14) return undefined

    let bestHaiId: HaiId | undefined = undefined
    let bestShanten = Infinity
    let bestUkeireCount = -1

    for (const hai of tehai) {
      const tehaiAfterDiscard = tehai.filter((h) => h.haiId !== hai.haiId)
      const shanten = calculateShanten({
        closed: tehaiAfterDiscard.map((h) => h.kindId),
        exposed: [],
      })
      const ukeireList = getUkeire({
        closed: tehaiAfterDiscard.map((h) => h.kindId),
        exposed: [],
      })

      // シャンテン数が小さい、または同じシャンテン数で受け入れ枚数が多い場合に更新
      if (
        shanten < bestShanten ||
        (shanten === bestShanten && ukeireList.length > bestUkeireCount)
      ) {
        bestShanten = shanten
        bestUkeireCount = ukeireList.length
        bestHaiId = hai.haiId
      }
    }

    return bestHaiId
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
        navigate('/result', { replace: true })
      }
    }
  }, [tehai, navigate])

  // 牌がクリックされた時の処理
  const handleHaiClick = (haiId: HaiId) => {
    if (selectedHaiId === haiId) {
      // 同じ牌を再度クリック → 切る
      discard(haiId as number)
      draw()
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
      discard(selectedHaiId as number)
      draw()
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
        {/* シャンテン数・ヒント表示 */}
        <div className="flex justify-between items-center px-2 py-1">
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
            highlightedHaiId={showBestMove ? bestMoveHaiId : undefined}
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
    </div>
  )
}
