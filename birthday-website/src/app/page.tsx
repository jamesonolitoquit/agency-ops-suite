'use client'

import { useState, useEffect, useRef } from 'react'
import { useCallback } from 'react'
import { motion } from 'framer-motion'
import PortfolioHero from '../components/PortfolioHero'
import ScrollSections from '../components/ScrollSections'
import BirthdayHero from '../components/BirthdayHero'
import SurprisePopup from '../components/SurprisePopup'
import AnimalCanvas from '../components/AnimalCanvas'
import { createMasterTimeline } from '../lib/gsap-timeline'
import { initScrollTrigger, refreshScrollTrigger } from '../lib/scroll-trigger'

export default function Home() {
  const [showPopup, setShowPopup] = useState(false)
  const [isSurpriseTriggered, setIsSurpriseTriggered] = useState(false)
  const [triggerNameMorph, setTriggerNameMorph] = useState(false)
  const [startAnimals, setStartAnimals] = useState(false)
  const [musicMuted, setMusicMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const portfolioRef = useRef<HTMLDivElement>(null)
  const birthdayRef = useRef<HTMLDivElement>(null)

  // Generate random balloons for floating animation
  const [randomBalloons] = useState(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: `${Math.random() * 100}vw`,
      color: ['#ffb6e6', '#b6eaff', '#b6ffb6', '#ffffb6', '#ffb6ff', '#e0b6ff', '#ffb6d9', '#b6fff5', '#ffd6b6'][Math.floor(Math.random() * 9)],
      stroke: ['#e75480', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#f97316', '#06b6d4', '#ea580c'][Math.floor(Math.random() * 9)],
      duration: 10 + Math.random() * 10, // 10-20 seconds
      delay: 0
    }))
  )

  useEffect(() => {
    // Show popup after 3 seconds
    const timer = setTimeout(() => {
      setShowPopup(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      // Disable complex animations
      setStartAnimals(false)
    }
  }, [])

  useEffect(() => {
    // Mobile performance: reduce animals on small screens
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        // Could reduce animal count here if needed
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Create GSAP master timeline
    if (portfolioRef.current && birthdayRef.current) {
      timelineRef.current = createMasterTimeline(
        () => {
          // onComplete callback
          setIsSurpriseTriggered(true)
          setTriggerNameMorph(true)
          setStartAnimals(true)
          refreshScrollTrigger()
        },
        {
          portfolioContent: portfolioRef.current,
          birthdayContent: birthdayRef.current,
          body: document.body
        },
        audioRef.current
      )
    }
  }, [])

  useEffect(() => {
    if (showPopup) {
      // Lock scroll and reset scroll position
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      window.scrollTo({ top: 0, behavior: 'auto' })
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    } else if (!isSurpriseTriggered) {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [showPopup, isSurpriseTriggered])

  const handlePopupClick = () => {
    setShowPopup(false)
    // Keep scroll locked until GSAP timeline completes
    if (timelineRef.current) {
      timelineRef.current.play()
      // Unlock scroll in GSAP timeline's onComplete only
    }
  }

  // Confetti canvas ref
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null)

  // Helper to resize confetti canvas
  const resizeConfettiCanvas = useCallback(() => {
    const canvas = confettiCanvasRef.current
    if (canvas) {
      canvas.width = window.innerWidth * window.devicePixelRatio
      canvas.height = window.innerHeight * window.devicePixelRatio
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
    }
  }, [])

  useEffect(() => {
    resizeConfettiCanvas()
    window.addEventListener('resize', resizeConfettiCanvas)
    return () => window.removeEventListener('resize', resizeConfettiCanvas)
  }, [resizeConfettiCanvas])

  return (
    <div className="min-h-screen">
      {/* Portfolio State A */}
      <div ref={portfolioRef} className={isSurpriseTriggered ? 'hidden' : ''}>
        <PortfolioHero />
        <ScrollSections />
      </div>

      {/* Birthday State B (pre-rendered, but hidden/paused until triggered) */}
      <div
        ref={birthdayRef}
        style={{
          display: isSurpriseTriggered ? 'block' : 'none',
          pointerEvents: isSurpriseTriggered ? 'auto' : 'none',
        }}
      >
        {/* Confetti Canvas (always on top for birthday state) */}
        <canvas
          ref={confettiCanvasRef}
          className="fixed inset-0 w-full h-full pointer-events-none z-[100]"
          aria-hidden="true"
          style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 100 }}
        />
        {/* Birthday Music Audio */}
        <audio
          ref={audioRef}
          src="/audio/happy-birthday-469282.mp3"
          loop
          autoPlay={false}
          muted={musicMuted}
        />
        {/* Festive background and decor */}
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-black overflow-x-hidden">
          <BirthdayHero triggerNameMorph={isSurpriseTriggered} />
          <AnimalCanvas start={isSurpriseTriggered} />
          {/* Music Controls */}
          <button
            aria-label={musicMuted ? 'Unmute music' : 'Mute music'}
            onClick={() => {
              setMusicMuted(m => !m)
              if (audioRef.current) audioRef.current.muted = !musicMuted
            }}
            className="absolute top-4 right-4 z-50 bg-[var(--bg-primary)] text-[var(--accent-primary)] rounded-full px-4 py-2 shadow-lg hover:opacity-80 transition-opacity"
            style={{ fontWeight: 700 }}
          >
            {musicMuted ? 'Unmute Music' : 'Mute Music'}
          </button>
        </div>
        
        {/* Messages Section */}
        <section className="py-20 px-4 bg-[var(--bg-secondary)]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-[var(--accent-primary)] reveal-on-scroll">
              Special Messages
            </h2>
            <div className="space-y-8">
              <div className="p-6 bg-[var(--bg-primary)] rounded-lg border border-[var(--accent-secondary)] reveal-on-scroll">
                <p className="text-lg text-[var(--accent-secondary)]">Happy Birthday, Franchezca! May your day be filled with joy and your year with success. 🎉</p>
              </div>
              <div className="p-6 bg-[var(--bg-primary)] rounded-lg border border-[var(--accent-tertiary)] reveal-on-scroll">
                <p className="text-lg text-[var(--accent-tertiary)]">Wishing you an amazing birthday! Keep being awesome. 🐱🐶</p>
              </div>
            </div>
          </div>
        </section>

        {/* Single Photo */}
        <section className="py-20 px-4 bg-[var(--bg-primary)]">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-[var(--accent-primary)] reveal-on-scroll">
              Memories
            </h2>
            <div className="flex justify-center">
              <img 
                src="/images/chazie.jpg" 
                alt="Chazie smiling and celebrating her birthday" 
                className="rounded-lg shadow-lg max-w-xs w-full aspect-square object-cover border-4 border-[var(--accent-primary)] reveal-on-scroll" 
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {/* Final Message */}
        <section className="py-20 px-4 bg-[var(--bg-secondary)]">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl text-[var(--text-secondary)] mb-8 reveal-on-scroll">
              Happy Birthday once again! Hope this surprise made your day special. 🎂
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[var(--accent-primary)] text-[var(--bg-primary)] px-6 py-3 rounded-full hover:opacity-80 transition-opacity reveal-on-scroll"
            >
              Replay Surprise
            </button>
          </div>
        </section>
      </div>

      {/* Floating Balloons during popup */}
      {showPopup && randomBalloons.map((balloon) => (
        <motion.div
          key={balloon.id}
          className="fixed bottom-0 z-[1010] pointer-events-none"
          style={{ left: balloon.x }}
          initial={{ y: '100vh' }}
          animate={{ y: '-200px' }}
          transition={{
            duration: balloon.duration,
            delay: balloon.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          <svg width="50" height="100" aria-hidden="true" focusable="false">
            <ellipse cx="25" cy="40" rx="18" ry="26" fill={balloon.color} stroke={balloon.stroke} strokeWidth="2" />
            <rect x="22" y="66" width="6" height="16" fill={balloon.stroke} />
            <path d="M25 82 Q27 88 23 94" stroke={balloon.stroke} strokeWidth="2" fill="none" />
          </svg>
        </motion.div>
      ))}

      {/* Popup */}
      {showPopup && <SurprisePopup onOpen={handlePopupClick} />}
    </div>
  )
}
