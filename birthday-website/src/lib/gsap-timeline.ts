import { gsap } from 'gsap'
import confetti from 'canvas-confetti'

export function createMasterTimeline(
  onComplete: () => void,
  elements: {
    portfolioContent: HTMLElement
    birthdayContent: HTMLElement
    body: HTMLElement
  },
  audio: HTMLAudioElement | null
) {
  const tl = gsap.timeline({
    paused: true,
    onComplete: () => {
      // Unlock scroll and refresh ScrollTrigger
      document.body.style.overflow = ''
      onComplete()
    }
  })

  // 1. Lock scroll
  tl.set(elements.body, { overflow: 'hidden' })

  // 2. Fade down portfolio UI
  tl.to(elements.portfolioContent, {
    opacity: 0,
    y: -50,
    duration: 0.8,
    ease: 'power2.out'
  })

  // 3. Switch to pastel theme (add class to body)
  tl.call(() => {
    document.body.classList.add('pastel-theme')
  })

  // 4. Reveal birthday hero section
  tl.fromTo(elements.birthdayContent,
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
  )

  // 5. Play music
  tl.call(() => {
    if (audio) {
      audio.currentTime = 0
      audio.play()
    }
  })

  // 6. Trigger confetti burst (multiple bursts for festivity)
  tl.call(() => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 70 + i * 10,
          origin: { y: 0.6 - i * 0.1 },
          colors: ['#ff69b4', '#87ceeb', '#98fb98', '#dda0dd', '#fff7ae']
        })
      }, i * 200)
    }
  })

  // 6-7. Birthday text and name morph will be handled by components
  // 8. Canvas animals will start via component
  // 9-10. Scroll unlock and refresh handled in onComplete

  return tl
}