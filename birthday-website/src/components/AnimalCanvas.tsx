'use client'

import { useEffect, useRef } from 'react'
import { AnimalCanvas as CanvasSystem } from '../lib/canvas-animals'

interface AnimalCanvasProps {
  start: boolean
}

export default function AnimalCanvas({ start }: AnimalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const systemRef = useRef<CanvasSystem | null>(null)

  useEffect(() => {
    if (canvasRef.current && !systemRef.current) {
      systemRef.current = new CanvasSystem(canvasRef.current)
    }
  }, [])

  useEffect(() => {
    if (start && systemRef.current) {
      systemRef.current.start()
    } else if (!start && systemRef.current) {
      systemRef.current.stop()
    }
  }, [start])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  )
}