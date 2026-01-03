import { useEffect, useRef } from 'react'
import lottie from 'lottie-web'
import animationData from '@/assets/lottie/complete.json'

/**
 * 完了アニメーションコンポーネント
 *
 * 和了時に表示するLottieアニメーション。
 */
export function CompleteAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const animation = lottie.loadAnimation({
      container: containerRef.current,
      loop: false,
      autoplay: true,
      animationData: animationData,
    })

    return () => {
      animation.destroy()
    }
  }, [])

  return <div ref={containerRef} />
}
