'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface NameMorphProps {
  trigger: boolean
}

const FULL_NAME = "Franchezca Anne Ortiz".replace(/\s/g, '').split('')
const NICKNAME = ['C', 'H', 'A', 'Z', 'I', 'E']

// Map nickname letters to their positions in full name
const LETTER_MAPPING: Record<string, number> = {
  'C': 4,  // 'c' in Franchezca
  'H': 5,  // 'h' in Franchezca
  'A': 2,  // 'a' in Franchezca
  'Z': 7,  // 'z' in Franchezca
  'I': 17, // 'i' in Ortiz
  'E': 6   // 'e' in Franchezca
}

export default function NameMorph({ trigger }: NameMorphProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!trigger || !containerRef.current) return

    const letters = Array.from(containerRef.current.querySelectorAll<HTMLSpanElement>('.letter'))
    const keptIndices = NICKNAME.map(char => LETTER_MAPPING[char.toUpperCase()])

    // Animate unused letters out (slower for more noticeable effect)
    letters.forEach((letter, i) => {
      if (!keptIndices.includes(i)) {
        gsap.to(letter, {
          y: -100,
          opacity: 0,
          rotate: gsap.utils.random(-45, 45),
          duration: 1.2,
          ease: 'power2.in',
          delay: i * 0.08
        })
      }
    })

    // Animate kept letters to new positions for "CHAZIE" (properly centered)
    const containerCenter = 300 // adjusted center for better positioning
    const letterSpacing = 60
    const totalWidth = (NICKNAME.length - 1) * letterSpacing
    const startPos = containerCenter - totalWidth / 2

    // Final positions for C H A Z I E centered in container
    const finalPositions = [
      startPos,                    // C
      startPos + letterSpacing,    // H
      startPos + letterSpacing * 2, // A
      startPos + letterSpacing * 3, // Z
      startPos + letterSpacing * 4, // I
      startPos + letterSpacing * 5  // E
    ]

    keptIndices.forEach((origIdx, newIdx) => {
      const letter = letters[origIdx]
      const currentPos = origIdx * 25 // current absolute position
      const targetPos = finalPositions[newIdx] // desired final position
      const targetX = targetPos - currentPos // relative movement needed

      gsap.to(letter, {
        x: targetX,
        y: 0,
        opacity: 1,
        scale: 1.3,
        color: '#ff69b4',
        duration: 2.5, // slower animation
        ease: 'elastic.out(1,0.2)',
        delay: 0.8 + newIdx * 0.15 // longer delays
      })
    })
  }, [trigger])

  return (
    <div ref={containerRef} className="relative mb-4 h-16 font-festive text-4xl w-[450px] mx-auto">
      {FULL_NAME.map((letter, index) => (
        <span
          key={index}
          className="letter absolute text-2xl font-bold text-[var(--accent-secondary)]"
          style={{ left: `${index * 25}px` }}
        >
          {letter}
        </span>
      ))}
    </div>
  )
}
