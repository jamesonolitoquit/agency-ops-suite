'use client'

import { motion } from 'framer-motion'

interface SurprisePopupProps {
  onOpen: () => void
}

export default function SurprisePopup({ onOpen }: SurprisePopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="bg-gray-800 p-8 rounded-lg text-center max-w-md mx-4"
      >
        <h2 className="text-2xl font-bold mb-4 text-white">You have a new message</h2>
        <p className="mb-6 text-gray-300">Click to view your message.</p>
        <button
          onClick={onOpen}
          className="bg-white text-black px-6 py-3 rounded-full hover:bg-gray-200 transition-colors text-lg font-semibold"
        >
          Open
        </button>
      </motion.div>
    </div>
  )
}