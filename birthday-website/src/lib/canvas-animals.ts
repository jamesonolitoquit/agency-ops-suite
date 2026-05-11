export class AnimalCanvas {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animals: Animal[] = []
  private animationId: number | null = null
  private isRunning = false
  private animalImages: HTMLImageElement[] = []
  private animalFilenames = [
    // Cats
    '/sprites/vecteezy_american-shorthair-clipart_24077598.png',
    '/sprites/vecteezy_cat-cartoon-character-clipart_23369092.png',
    '/sprites/vecteezy_siamese-cat-clipart_24077589.png',
    // Dogs (add dog sprite images here)
    // '/sprites/dog1.png',
    // '/sprites/dog2.png',
  ]

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.resize()
    window.addEventListener('resize', () => this.resize())
    this.loadAnimalImages()
  }

  private loadAnimalImages() {
    this.animalImages = []
    for (const src of this.animalFilenames) {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => console.log(`Image loaded: ${src}`)
      img.onerror = () => console.error(`Failed to load image: ${src}`)
      img.src = src
      this.animalImages.push(img)
    }
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect()
    this.canvas.width = rect.width * window.devicePixelRatio
    this.canvas.height = rect.height * window.devicePixelRatio
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    this.canvas.style.width = rect.width + 'px'
    this.canvas.style.height = rect.height + 'px'
  }

  start() {
    if (this.isRunning) return
    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) return
    this.isRunning = true
    this.spawnAnimals()
    this.animate()
  }

  stop() {
    this.isRunning = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  private spawnAnimals() {
    // Spawn 3-5 animals with random properties
    for (let i = 0; i < 4; i++) {
      const imgIdx = Math.floor(Math.random() * this.animalImages.length)
      this.animals.push(new Animal(
        Math.random() * this.canvas.width,
        Math.random() * this.canvas.height,
        this.animalImages[imgIdx],
        Math.random() * 2 + 1 // speed
      ))
    }
  }

  private animate = () => {
    if (!this.isRunning) return
    // Throttle on mobile
    const isMobile = window.innerWidth < 768
    if (isMobile && Math.random() > 0.5) {
      this.animationId = requestAnimationFrame(this.animate)
      return
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.animals.forEach(animal => {
      animal.update()
      animal.draw(this.ctx)
    })

    this.animationId = requestAnimationFrame(this.animate)
  }
}

class Animal {
  x: number
  y: number
  img: HTMLImageElement
  speed: number
  direction: number
  frame: number = 0
  frameCount: number = 1 // static image

  constructor(x: number, y: number, img: HTMLImageElement, speed: number) {
    this.x = x
    this.y = y
    this.img = img
    this.speed = speed
    this.direction = Math.random() * Math.PI * 2
  }

  update() {
    // Simple movement
    this.x += Math.cos(this.direction) * this.speed
    this.y += Math.sin(this.direction) * this.speed

    // Bounce off edges (use canvas size 800x600 fallback)
    if (this.x < 0 || this.x > 800) this.direction = Math.PI - this.direction
    if (this.y < 0 || this.y > 600) this.direction = -this.direction

    // Animate frames (not used for static PNGs)
    this.frame = (this.frame + 1) % this.frameCount
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Draw the cat image, scaled to 48x48
    if (this.img.complete) {
      ctx.drawImage(this.img, this.x, this.y, 48, 48)
    } else {
      // fallback: draw a cat emoji
      ctx.font = '48px Arial'
      ctx.fillText('🐱', this.x, this.y)
    }
  }
}