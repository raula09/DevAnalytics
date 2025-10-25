import React, { useEffect, useRef } from "react"

type Props = {
  labels: string[]
  values: number[]
  title?: string
}

export default function BarChart({ labels, values, title }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height
    const padX = 48
    const padY = 42
    const chartW = w - padX * 2
    const chartH = h - padY * 2

    const accent =
      getComputedStyle(document.documentElement).getPropertyValue("--accent") ||
      "#4f8ef7"
    const accent2 =
      getComputedStyle(document.documentElement).getPropertyValue("--accent-2") ||
      "#8c5bff"
    const text =
      getComputedStyle(document.documentElement).getPropertyValue("--text") ||
      "#fff"

    const maxVal = Math.max(1, ...values)
    const barCount = values.length
    const barSpacing = chartW / barCount
    const barW = barSpacing * 0.55

    let progress = 0
    const duration = 800
    const startTime = performance.now()

    const draw = (time: number) => {
      const t = Math.min(1, (time - startTime) / duration)
      progress = easeOutCubic(t)

      ctx.clearRect(0, 0, w, h)
      ctx.font = "14px Inter, sans-serif"
      ctx.fillStyle = text
      ctx.textBaseline = "middle"

      if (title) {
        ctx.font = "600 16px Inter, sans-serif"
        ctx.fillText(title, padX, 20)
      }

      ctx.strokeStyle = "rgba(255,255,255,0.06)"
      ctx.lineWidth = 1
      for (let i = 0; i <= 5; i++) {
        const y = padY + (chartH / 5) * i
        ctx.beginPath()
        ctx.moveTo(padX, y)
        ctx.lineTo(padX + chartW, y)
        ctx.stroke()
      }

      values.forEach((val, i) => {
        const x = padX + i * barSpacing + barSpacing * 0.225
        const barHeight = (val / maxVal) * chartH * progress
        const y = padY + chartH - barHeight

        const grad = ctx.createLinearGradient(x, y, x + barW, y + barHeight)
        grad.addColorStop(0, accent.trim())
        grad.addColorStop(1, accent2.trim())
        ctx.fillStyle = grad

        ctx.shadowColor = "rgba(0,0,0,0.25)"
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.roundRect(x, y, barW, barHeight, 6)
        ctx.fill()
        ctx.shadowBlur = 0

        const glow = ctx.createLinearGradient(x, y, x, y + barHeight)
        glow.addColorStop(0, "rgba(255,255,255,0.4)")
        glow.addColorStop(1, "rgba(255,255,255,0)")
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.roundRect(x, y, barW, barHeight * 0.2, [6, 6, 0, 0])
        ctx.fill()

        ctx.font = "12px Inter, sans-serif"
        ctx.fillStyle = text
        ctx.textAlign = "center"
        ctx.fillText(labels[i], x + barW / 2, padY + chartH + 14)

        ctx.fillStyle = "rgba(0,0,0,0.55)"
        ctx.beginPath()
        const bx = x + barW / 2
        const by = y - 16
        ctx.roundRect(bx - 18, by - 10, 36, 20, 6)
        ctx.fill()
        ctx.fillStyle = "#fff"
        ctx.font = "11px Inter, sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(val.toString(), bx, by)
      })

      if (progress < 1) requestAnimationFrame(draw)
    }

    requestAnimationFrame(draw)
  }, [labels, values, title])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "320px",
        borderRadius: "14px",
        background:
          "linear-gradient(145deg, rgba(255,255,255,.04), rgba(255,255,255,.02))",
        boxShadow: "inset 0 0 30px rgba(255,255,255,.02)",
      }}
    />
  )
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}
