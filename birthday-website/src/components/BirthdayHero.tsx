'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import NameMorph from './NameMorph'

interface BirthdayHeroProps {
  triggerNameMorph: boolean
}

export default function BirthdayHero({ triggerNameMorph }: BirthdayHeroProps) {
  // Generate random stars on client-side to avoid hydration mismatch
  const [randomStars, setRandomStars] = useState<any[]>([])
  const [randomPlanets, setRandomPlanets] = useState<any[]>([])

  useEffect(() => {
    setRandomStars(
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
        opacity: Math.random() * 0.3 + 0.1, // More subtle
        size: Math.random() * 2 + 1 // Smaller stars
      }))
    )

    setRandomPlanets(
      Array.from({ length: 3 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 80 + 10}%`,
        left: `${Math.random() * 80 + 10}%`,
        size: Math.random() * 20 + 10,
        color: ['#8b5cf6', '#06b6d4', '#f59e0b'][Math.floor(Math.random() * 3)],
        glow: Math.random() * 0.5 + 0.3
      }))
    )
  }, [])

  // Generate random balloons for floating animation
  const [randomBalloons] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: `${Math.random() * 100}vw`,
      color: ['#ffb6e6', '#b6eaff', '#b6ffb6', '#ffffb6', '#ffb6ff', '#e0b6ff', '#ffb6d9', '#b6fff5', '#ffd6b6'][Math.floor(Math.random() * 9)],
      stroke: ['#e75480', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6', '#f97316', '#06b6d4', '#ea580c'][Math.floor(Math.random() * 9)],
      duration: 10 + Math.random() * 10, // 10-20 seconds
      delay: Math.random() * 5
    }))
  )

  return (
    <section className="h-screen flex items-center justify-center px-4 relative bg-black">
      {/* Night Sky Background - Dramatically Expanded */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Dense Star Field */}
        {randomStars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              top: star.top,
              left: star.left,
              animationDelay: star.delay,
              opacity: star.opacity,
              width: `${star.size}px`,
              height: `${star.size}px`
            }}
          />
        ))}

        {/* Subtle Planets */}
        {randomPlanets.map((planet) => (
          <div
            key={planet.id}
            className="absolute rounded-full animate-pulse"
            style={{
              top: planet.top,
              left: planet.left,
              width: `${planet.size}px`,
              height: `${planet.size}px`,
              backgroundColor: planet.color,
              opacity: planet.glow,
              boxShadow: `0 0 ${planet.size * 0.5}px ${planet.color}`
            }}
          />
        ))}

        {/* Larger Bright Stars */}
        <div className="absolute top-10 left-1/4 w-3 h-3 bg-yellow-200 rounded-full animate-pulse shadow-lg shadow-yellow-200/50"></div>
        <div className="absolute top-20 right-1/3 w-2 h-2 bg-white rounded-full animate-pulse shadow-lg shadow-white/30"></div>
        <div className="absolute top-32 left-1/2 w-2.5 h-2.5 bg-yellow-100 rounded-full animate-pulse shadow-lg shadow-yellow-100/40"></div>
        <div className="absolute top-16 right-1/4 w-3 h-3 bg-white rounded-full animate-pulse shadow-lg shadow-white/40"></div>
        <div className="absolute top-40 left-1/6 w-2 h-2 bg-yellow-200 rounded-full animate-pulse shadow-lg shadow-yellow-200/50"></div>
        <div className="absolute top-24 right-1/6 w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-lg shadow-white/35"></div>
        <div className="absolute top-48 left-3/4 w-3 h-3 bg-yellow-100 rounded-full animate-pulse shadow-lg shadow-yellow-100/45"></div>
        <div className="absolute top-12 right-1/2 w-2 h-2 bg-white rounded-full animate-pulse shadow-lg shadow-white/30"></div>

        {/* Massive Galaxy Swirls */}
        <div className="absolute top-1/4 left-1/5 w-64 h-64 opacity-25">
          <div className="w-full h-full bg-gradient-radial from-purple-300 via-purple-500 to-transparent rounded-full animate-spin shadow-2xl shadow-purple-500/20" style={{ animationDuration: '25s' }}></div>
        </div>
        <div className="absolute bottom-1/4 right-1/5 w-56 h-56 opacity-20">
          <div className="w-full h-full bg-gradient-radial from-blue-300 via-blue-500 to-transparent rounded-full animate-spin shadow-2xl shadow-blue-500/15" style={{ animationDuration: '30s', animationDirection: 'reverse' }}></div>
        </div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 opacity-30">
          <div className="w-full h-full bg-gradient-radial from-pink-300 via-pink-500 to-transparent rounded-full animate-spin shadow-2xl shadow-pink-500/25" style={{ animationDuration: '35s' }}></div>
        </div>
        <div className="absolute top-1/6 left-3/4 w-52 h-52 opacity-22">
          <div className="w-full h-full bg-gradient-radial from-indigo-300 via-indigo-500 to-transparent rounded-full animate-spin shadow-2xl shadow-indigo-500/20" style={{ animationDuration: '40s', animationDirection: 'reverse' }}></div>
        </div>
        <div className="absolute bottom-1/3 left-1/4 w-60 h-60 opacity-18">
          <div className="w-full h-full bg-gradient-radial from-cyan-300 via-cyan-500 to-transparent rounded-full animate-spin shadow-2xl shadow-cyan-500/15" style={{ animationDuration: '32s' }}></div>
        </div>
        <div className="absolute top-2/3 right-1/6 w-54 h-54 opacity-28">
          <div className="w-full h-full bg-gradient-radial from-violet-300 via-violet-500 to-transparent rounded-full animate-spin shadow-2xl shadow-violet-500/22" style={{ animationDuration: '38s', animationDirection: 'reverse' }}></div>
        </div>

        {/* Shooting Stars */}
        <div className="absolute top-1/5 left-1/6 w-20 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse opacity-60"
             style={{ transform: 'rotate(45deg)', animationDuration: '3s', animationDelay: '1s' }}></div>
        <div className="absolute top-3/5 right-1/4 w-16 h-0.5 bg-gradient-to-r from-transparent via-yellow-200 to-transparent animate-pulse opacity-50"
             style={{ transform: 'rotate(-30deg)', animationDuration: '2.5s', animationDelay: '4s' }}></div>
        <div className="absolute top-1/3 left-4/5 w-24 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse opacity-70"
             style={{ transform: 'rotate(60deg)', animationDuration: '4s', animationDelay: '2s' }}></div>
      </div>

      {/* Dancing Floating Elements */}
      <motion.div
        className="parallax-element absolute top-20 left-10 text-6xl"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, -10, 0],
          rotate: [0, 10, -10, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        🎂
      </motion.div>
      <motion.div
        className="parallax-element absolute top-40 right-20 text-4xl"
        animate={{
          y: [0, 15, -15, 0],
          x: [0, -15, 15, 0],
          rotate: [0, -15, 15, 0]
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        🐱
      </motion.div>
      <motion.div
        className="parallax-element absolute bottom-20 left-20 text-5xl"
        animate={{
          y: [0, -25, 0],
          x: [0, 20, -20, 0],
          rotate: [0, 20, -20, 0]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        🐶
      </motion.div>
      <motion.div
        className="parallax-element absolute bottom-40 right-10 text-4xl"
        animate={{
          y: [0, 20, -20, 0],
          x: [0, -25, 25, 0],
          rotate: [0, -25, 25, 0]
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        📖
      </motion.div>
      <motion.div
        className="parallax-element absolute top-1/2 left-5 text-5xl"
        animate={{
          y: [0, -30, 0],
          x: [0, 15, -15, 0],
          rotate: [0, 30, -30, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        🎈
      </motion.div>
      <motion.div
        className="parallax-element absolute top-1/3 right-5 text-4xl"
        animate={{
          y: [0, 25, -25, 0],
          x: [0, -20, 20, 0],
          rotate: [0, -35, 35, 0]
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        🎊
      </motion.div>

      {/* Canvas for animals will be added in main page */}
      {/* <canvas
        id="animal-canvas"
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      /> */}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10"
      >

        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-4 text-[var(--accent-primary)] font-festive"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Happy 25th Birthday!
        </motion.h1>

        <NameMorph trigger={triggerNameMorph} />
      </motion.div>
    </section>
  )
}