import React, { useEffect, useMemo, useRef, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { motion, useAnimation, useScroll, useTransform } from 'framer-motion'

// Utility: grain overlay using CSS noise
const Grain = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
    style={{
      backgroundImage:
        'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'2\' stitchTiles=\'stitch\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.6\'/></svg>")',
      backgroundSize: 'auto',
    }}
  />
)

// Background: slow morphing radial gradient (45s)
const FluidBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute -inset-[10%]"
        style={{
          background:
            'radial-gradient(60% 70% at 50% 50%, rgba(44,95,77,0.6), rgba(26,26,26,0.95) 60%, rgba(26,26,26,1) 100%)',
          filter: 'blur(20px)',
        }}
        animate={{
          scale: [1, 1.05, 1],
          borderRadius: ['35%', '40%', '35%'],
          rotate: [0, 2, 0],
        }}
        transition={{ duration: 45, repeat: Infinity, ease: 'easeInOut' }}
      />
      <Grain />
    </div>
  )
}

const DataTicker = () => {
  const items = useMemo(
    () => [
      'Currently accepting 3 clients this quarter',
      '127% average conversion lift',
      '92ms median interaction latency',
      '4.9/5 engagement quality score',
    ],
    []
  )
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 2800)
    return () => clearInterval(id)
  }, [items.length])
  return (
    <div className="h-6 overflow-hidden mt-6">
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.5 }}
        className="text-[#2C5F4D] text-[14px] tracking-tight font-mono"
        style={{ fontFamily: 'Space Mono, ui-monospace, SFMono-Regular, monospace' }}
      >
        {items[index]}
      </motion.div>
    </div>
  )
}

const ScrollIndicator = () => {
  const [hide, setHide] = useState(false)
  useEffect(() => {
    const onScroll = () => setHide(true)
    window.addEventListener('scroll', onScroll, { passive: true })
    const id = setTimeout(() => setHide(true), 3000)
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(id)
    }
  }, [])
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: hide ? 0 : 1 }}
      transition={{ duration: 0.6 }}
      className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <span className="text-xs text-[#FAFAFA]/70">Scroll to see psychology in action</span>
      <div className="relative h-8 flex items-start">
        <div className="w-px h-8 bg-[#2C5F4D]" />
        <motion.span
          className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#2C5F4D]"
          animate={{ y: [0, 22, 0], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ bottom: 0 }}
        />
      </div>
    </motion.div>
  )
}

const Hero = () => {
  const containerRef = useRef(null)
  const { scrollY } = useScroll()
  const yProgress = useTransform(scrollY, [0, window.innerHeight], [0, 1])

  // Transformations on scroll (0-100vh)
  const splineScale = useTransform(yProgress, [0, 1], [1, 0.7])
  const splineY = useTransform(yProgress, [0, 1], [0, -150])
  const titleScale = useTransform(yProgress, [0, 1], [1, 0.85])
  const titleOpacity = useTransform(yProgress, [0, 1], [1, 0.3])

  // Headline animation controls
  const controls = useAnimation()
  useEffect(() => {
    const run = async () => {
      await controls.start(i => ({
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        transition: { delay: 0.3 + i * 0.8, duration: 0.9, ease: [0.22, 1, 0.36, 1] }
      }))
    }
    run()
  }, [controls])

  // Mouse parallax for spline wrapper
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const onMouseMove = (e) => {
    const { innerWidth, innerHeight } = window
    const x = (e.clientX - innerWidth / 2) / innerWidth
    const y = (e.clientY - innerHeight / 2) / innerHeight
    setMouse({ x, y })
  }

  return (
    <section
      ref={containerRef}
      onMouseMove={onMouseMove}
      className="relative min-h-screen w-full bg-[#1A1A1A] overflow-hidden"
    >
      <FluidBackground />

      {/* 3D Spline scene */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ scale: splineScale, y: splineY }}
      >
        <div className="relative w-[60vw] h-[60vh] md:w-[48vw] md:h-[70vh]">
          <Spline scene="https://prod.spline.design/Zn7XRxnnbSat5OJG/scene.splinecode" style={{ width: '100%', height: '100%' }} />
          {/* Glow overlay reacting to mouse */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background:
                'radial-gradient(30% 30% at 50% 50%, rgba(44,95,77,0.25), transparent 70%)',
              mixBlendMode: 'screen',
              opacity: 0.65,
              rotateX: mouse.y * -5,
              rotateY: mouse.x * 5,
            }}
          />
        </div>
      </motion.div>

      {/* Left content block */}
      <div className="relative z-10 h-screen max-w-7xl mx-auto px-6 md:px-10 flex items-center">
        <div className="w-full md:w-[45%]">
          <motion.h1
            style={{ scale: titleScale, opacity: titleOpacity }}
            className="text-[44px] leading-[1.05] md:text-[64px] font-extrabold text-[#FAFAFA] font-display"
          >
            {['We Engineer', 'Attention,', 'Emotion,', 'Action.'].map((line, i) => (
              <motion.span
                key={i}
                custom={i}
                initial={{ opacity: 0, filter: 'blur(8px)', y: 8 }}
                animate={controls}
                className="block"
              >
                {line}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + 0.8 * 4 + 1.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-[18px] text-[#999999] max-w-xl"
          >
            Psychology-driven design for brands that demand measurable results.
          </motion.p>

          <DataTicker />

          <motion.button
            whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(44,95,77,0.3)' }}
            transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.35 }}
            className="mt-8 inline-flex items-center gap-2 bg-[#2C5F4D] text-white px-5 py-3 rounded-md"
          >
            <span>Explore The Framework</span>
            <span>→</span>
          </motion.button>
        </div>
      </div>

      <ScrollIndicator />
    </section>
  )
}

export default Hero
