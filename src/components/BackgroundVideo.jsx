import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

const CROSSFADE_DURATION = 1.6; // Crossfade window in seconds
const VIDEO_SRC_LOCAL = '/background.mp4';
const VIDEO_SRC_FALLBACK = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085844_21a8f4b3-dea5-4ede-be16-d53f6973bb14.mp4';

export default function BackgroundVideo() {
  const { theme } = useAppContext();
  const isLight = theme === 'light';

  // Video dual-buffer refs and opacities
  const videoRefA = useRef(null);
  const videoRefB = useRef(null);
  const [opacityA, setOpacityA] = useState(1);
  const [opacityB, setOpacityB] = useState(0);

  // Active tracking
  const activeVideoRef = useRef('A'); // 'A' or 'B'
  const isCrossfadingRef = useRef(false);

  // Canvas ref for continuous dynamic constellation & cyber grid
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999, targetX: -9999, targetY: -9999 });

  // ── Seamless Video Crossfading Engine ───────────────────────────────────────
  const startVideo = useCallback((video) => {
    if (!video) return;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay may wait for user interaction
      });
    }
  }, []);

  useEffect(() => {
    const vA = videoRefA.current;
    const vB = videoRefB.current;
    if (!vA || !vB) return;

    vA.muted = true;
    vB.muted = true;
    vA.playsInline = true;
    vB.playsInline = true;

    // Preload both
    vA.load();
    vB.load();

    // Play initial buffer
    startVideo(vA);

    // Crossfade trigger function
    const triggerCrossfade = (fromBuffer) => {
      if (isCrossfadingRef.current) return;
      isCrossfadingRef.current = true;

      if (fromBuffer === 'A') {
        activeVideoRef.current = 'B';
        vB.currentTime = 0;
        startVideo(vB);
        setOpacityB(1);
        setOpacityA(0);

        setTimeout(() => {
          if (vA) {
            vA.pause();
            vA.currentTime = 0;
          }
          isCrossfadingRef.current = false;
        }, CROSSFADE_DURATION * 1000);
      } else {
        activeVideoRef.current = 'A';
        vA.currentTime = 0;
        startVideo(vA);
        setOpacityA(1);
        setOpacityB(0);

        setTimeout(() => {
          if (vB) {
            vB.pause();
            vB.currentTime = 0;
          }
          isCrossfadingRef.current = false;
        }, CROSSFADE_DURATION * 1000);
      }
    };

    // Monitor playback progress on both videos
    const checkTimeA = () => {
      if (activeVideoRef.current === 'A' && !isCrossfadingRef.current && vA.duration > 0) {
        if (vA.currentTime >= vA.duration - CROSSFADE_DURATION) {
          triggerCrossfade('A');
        }
      }
    };

    const checkTimeB = () => {
      if (activeVideoRef.current === 'B' && !isCrossfadingRef.current && vB.duration > 0) {
        if (vB.currentTime >= vB.duration - CROSSFADE_DURATION) {
          triggerCrossfade('B');
        }
      }
    };

    // Fallback if video reaches ended before crossfade triggered
    const handleEndedA = () => {
      if (activeVideoRef.current === 'A') triggerCrossfade('A');
    };

    const handleEndedB = () => {
      if (activeVideoRef.current === 'B') triggerCrossfade('B');
    };

    vA.addEventListener('timeupdate', checkTimeA);
    vB.addEventListener('timeupdate', checkTimeB);
    vA.addEventListener('ended', handleEndedA);
    vB.addEventListener('ended', handleEndedB);

    // Interaction unlock for browser autoplay policy
    const handleUnlock = () => {
      const activeEl = activeVideoRef.current === 'A' ? vA : vB;
      if (activeEl && activeEl.paused) {
        activeEl.play().catch(() => {});
      }
      window.removeEventListener('click', handleUnlock);
      window.removeEventListener('touchstart', handleUnlock);
      window.removeEventListener('keydown', handleUnlock);
      window.removeEventListener('pointerdown', handleUnlock);
    };

    window.addEventListener('click', handleUnlock, { once: true });
    window.addEventListener('touchstart', handleUnlock, { once: true });
    window.addEventListener('keydown', handleUnlock, { once: true });
    window.addEventListener('pointerdown', handleUnlock, { once: true });

    return () => {
      vA.removeEventListener('timeupdate', checkTimeA);
      vB.removeEventListener('timeupdate', checkTimeB);
      vA.removeEventListener('ended', handleEndedA);
      vB.removeEventListener('ended', handleEndedB);
      window.removeEventListener('click', handleUnlock);
      window.removeEventListener('touchstart', handleUnlock);
      window.removeEventListener('keydown', handleUnlock);
      window.removeEventListener('pointerdown', handleUnlock);
    };
  }, [startVideo]);

  // ── High-Performance Continuous Canvas Animation ────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let rafId;
    let lastTime = performance.now();
    let width = window.innerWidth;
    let height = window.innerHeight;
    let gridOffset = 0;

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = -9999;
      mouseRef.current.targetY = -9999;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // Color palettes
    const darkPalette = [
      { r: 0, g: 240, b: 255 },    // Cyan
      { r: 168, g: 85, b: 247 },   // Purple
      { r: 56, g: 189, b: 248 },   // Sky Blue
      { r: 236, g: 72, b: 153 },   // Pink accent
    ];

    const lightPalette = [
      { r: 2, g: 132, b: 199 },    // Deep Sky
      { r: 99, g: 102, b: 241 },   // Indigo
      { r: 13, g: 148, b: 136 },   // Teal
      { r: 147, g: 51, b: 234 },   // Violet
    ];

    // Initialize floating nodes
    const particleCount = Math.min(Math.floor((width * height) / 26000), 55);
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const palette = isLight ? lightPalette : darkPalette;
      const col = palette[Math.floor(Math.random() * palette.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        baseRadius: Math.random() * 1.8 + 1.2,
        alpha: Math.random() * 0.4 + 0.3,
        color: col,
        pulseSpeed: Math.random() * 0.025 + 0.012,
        pulseAngle: Math.random() * Math.PI * 2,
        driftAngle: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.008 + 0.003,
      });
    }

    let isVisible = true;
    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        lastTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Continuous rendering loop with delta-time normalization
    const render = (now) => {
      if (!isVisible) {
        rafId = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min((now - lastTime) / 16.667, 2.0);
      lastTime = now;

      // Mouse smooth lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08 * dt;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08 * dt;

      ctx.clearRect(0, 0, width, height);

      // Continuous perspective cyber grid (bottom subtle horizon)
      const horizonY = height * 0.55;
      const gridSpacing = 40;
      gridOffset = (gridOffset + 0.35 * dt) % gridSpacing;

      ctx.save();
      ctx.beginPath();
      // Draw smooth horizon perspective lines
      const gridColor = isLight ? 'rgba(99, 102, 241, ' : 'rgba(0, 240, 255, ';
      
      // Horizontal scrolling lines
      for (let y = horizonY + gridOffset; y < height; y += gridSpacing) {
        const progress = (y - horizonY) / (height - horizonY);
        const lineAlpha = progress * (isLight ? 0.06 : 0.08);
        ctx.strokeStyle = `${gridColor}${lineAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vanishing perspective vertical lines
      const vanishingX = width * 0.5;
      const numRays = 16;
      for (let i = -numRays; i <= numRays; i++) {
        const bottomX = vanishingX + (i * (width / numRays) * 1.5);
        ctx.strokeStyle = `${gridColor}${isLight ? '0.04)' : '0.06)'}`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(vanishingX, horizonY);
        ctx.lineTo(bottomX, height);
        ctx.stroke();
      }
      ctx.restore();

      const maxDist = 120;
      const mouseMaxDist = 150;

      // Update & draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Smooth sinusoidal harmonic drift
        p.driftAngle += p.driftSpeed * dt;
        p.pulseAngle += p.pulseSpeed * dt;

        const harmonicVx = Math.cos(p.driftAngle) * 0.22;
        const harmonicVy = Math.sin(p.driftAngle) * 0.22;

        p.x += (p.vx + harmonicVx) * dt;
        p.y += (p.vy + harmonicVy) * dt;

        // Subtle mouse repulsion / proximity effect
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);

        if (distToMouse < mouseMaxDist && distToMouse > 0) {
          const force = (1 - distToMouse / mouseMaxDist) * 0.6;
          p.x -= (dx / distToMouse) * force * 2.5 * dt;
          p.y -= (dy / distToMouse) * force * 2.5 * dt;
        }

        // Screen boundary wrap with smooth overflow
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Pulsing radius & alpha
        const currentAlpha = p.alpha + Math.sin(p.pulseAngle) * 0.15;
        const currentRadius = p.baseRadius + Math.sin(p.pulseAngle) * 0.35;
        const clampedAlpha = Math.max(0.12, Math.min(currentAlpha, 0.8));

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.6, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${isLight ? clampedAlpha * 0.75 : clampedAlpha})`;
        ctx.fill();

        // Connect nearby particles with smooth lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const ldx = p.x - p2.x;
          const ldy = p.y - p2.y;
          const dist = Math.sqrt(ldx * ldx + ldy * ldy);

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * (isLight ? 0.14 : 0.22);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isLight]);

  return (
    <div
      aria-hidden="true"
      className="video-bg-container"
    >
      {/* ── Ambient Smooth Aurora Glowing Orbs (CSS Hardware-Accelerated) ──── */}
      <div
        className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full pointer-events-none opacity-45 blur-[110px]"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, rgba(99,102,241,0.15) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0,240,255,0.25) 0%, rgba(168,85,247,0.15) 50%, transparent 70%)',
          animation: 'aurora-drift-1 22s infinite alternate ease-in-out',
          willChange: 'transform, opacity',
        }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-[700px] h-[700px] rounded-full pointer-events-none opacity-40 blur-[120px]"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, rgba(236,72,153,0.12) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(168,85,247,0.22) 0%, rgba(0,240,255,0.12) 50%, transparent 70%)',
          animation: 'aurora-drift-2 26s infinite alternate ease-in-out',
          willChange: 'transform, opacity',
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[550px] h-[550px] rounded-full pointer-events-none opacity-30 blur-[100px]"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(236,72,153,0.18) 0%, rgba(0,240,255,0.1) 50%, transparent 70%)',
          animation: 'aurora-drift-3 18s infinite alternate ease-in-out',
          willChange: 'transform, opacity',
        }}
      />

      {/* ── Dual-Buffer Seamless Crossfading Video Elements ───────────────── */}
      <video
        ref={videoRefA}
        autoPlay
        muted
        playsInline
        preload="auto"
        className="video-bg-element"
        style={{
          opacity: opacityA,
          transition: `opacity ${CROSSFADE_DURATION}s cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        <source src={VIDEO_SRC_LOCAL} type="video/mp4" />
        <source src={VIDEO_SRC_FALLBACK} type="video/mp4" />
      </video>

      <video
        ref={videoRefB}
        muted
        playsInline
        preload="auto"
        className="video-bg-element"
        style={{
          opacity: opacityB,
          transition: `opacity ${CROSSFADE_DURATION}s cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        <source src={VIDEO_SRC_LOCAL} type="video/mp4" />
        <source src={VIDEO_SRC_FALLBACK} type="video/mp4" />
      </video>

      {/* ── Continuous Canvas Constellation & Cyber Grid Layer ─────────────── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
        style={{ willChange: 'transform' }}
      />

      {/* ── Theme Tint & Vignette Gradient Overlay ───────────────────────── */}
      <div className="video-bg-overlay z-[2]" />
    </div>
  );
}
