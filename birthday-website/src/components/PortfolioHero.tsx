'use client'

import { motion } from 'framer-motion'

export default function PortfolioHero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Welcome to My <span className="text-[var(--accent-primary)]">Portfolio</span>
        </motion.h1>
        <motion.p
          className="text-xl text-[var(--text-secondary)] mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Full Stack Developer & Designer
        </motion.p>
        <motion.div
          className="flex gap-4 justify-center flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <a href="#projects" className="bg-[var(--accent-primary)] text-[var(--bg-primary)] px-6 py-3 rounded-full hover:opacity-80 transition-opacity">
            View Projects
          </a>
          <a href="#contact" className="border border-[var(--accent-primary)] text-[var(--accent-primary)] px-6 py-3 rounded-full hover:bg-[var(--accent-primary)] hover:text-[var(--bg-primary)] transition-colors">
            Contact Me
          </a>
        </motion.div>
      </motion.div>
    </section>
  )
}