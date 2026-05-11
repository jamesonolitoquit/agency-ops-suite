import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initScrollTrigger() {
  // Kill any existing ScrollTriggers
  ScrollTrigger.getAll().forEach(trigger => trigger.kill())

  // Set up parallax effects
  gsap.utils.toArray('.parallax-element').forEach((element: any) => {
    gsap.to(element, {
      yPercent: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })
  })

  // Progressive reveals
  gsap.utils.toArray('.reveal-on-scroll').forEach((element: any) => {
    gsap.fromTo(element,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    )
  })
}

export function refreshScrollTrigger() {
  ScrollTrigger.refresh()
}