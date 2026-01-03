import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { calculateShanten, getUkeire } from '@pai-forge/riichi-mahjong'
import type { HaiId, HaiKindId } from '@pai-forge/riichi-mahjong'
import type { HaiSize } from '@pai-forge/mahjong-react-ui'
import { Tehai, SuteHaiList, UkeireInfo } from '@/components'
import { useGameStore } from '../stores/useGameStore'

/**
 * 画面の向きに応じた牌のサイズを取得するフック
 */
function useHaiSize(): HaiSize {
  const getSize = useCallback((): HaiSize => {
    if (typeof window === 'undefined') return 'md'
    // 縦向き（portrait）の場合は xs
    return window.matchMedia('(orientation: portrait)').matches ? 'xs' : 'md'
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
    <div className="h-screen bg-green-700 flex flex-col">
      {/* メインエリア（捨て牌表示） */}
      <div className="main-area flex-1 overflow-auto">
        <SuteHaiList sutehai={sutehai} />
      </div>

      {/* 手牌エリア（画面下部に固定、モーダルより前面に表示） */}
      <div className="tehai-area fixed bottom-0 left-0 right-0 z-[60]">
        {/* シャンテン数表示 */}
        <div className="flex justify-end px-2 pb-1">
          <span className="text-white/80 text-xs">
            {currentShanten === 0 ? 'テンパイ' : `${currentShanten}シャンテン`}
          </span>
        </div>
        {/* 手牌 */}
        <div className="flex justify-center items-center bg-green-800/50 py-2">
          <Tehai
            tehai={tehai}
            selectedHaiId={selectedHaiId}
            onHaiClick={handleHaiClick}
            size={haiSize}
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
