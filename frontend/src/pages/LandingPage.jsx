import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function ParticleCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animFrame;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.6 + 0.1,
      color: ['#38bdf8', '#a855f7', '#f43f5e', '#34d399'][Math.floor(Math.random() * 4)],
    }));

    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouse);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;

      // Mouse glow
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200);
      grad.addColorStop(0, 'rgba(168,85,247,0.12)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        // Attract slightly to mouse
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.vx += dx * 0.00008;
          p.vy += dy * 0.00008;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(168,85,247,${(1 - dist / 100) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      animFrame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Animated aurora background */}
      <div className="absolute inset-0 bg-gradient-aurora opacity-10 animate-aurora" />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(56,189,248,0.18),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.2),transparent_50%),radial-gradient(ellipse_at_center,rgba(244,63,94,0.08),transparent_60%)]" />

      {/* Blob decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-violet-600/20 blur-[100px] animate-blob" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-cyan-500/15 blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-10 left-10 h-64 w-64 rounded-full bg-fuchsia-600/15 blur-[100px] animate-blob animation-delay-4000" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 rounded-full bg-blue-600/10 blur-[150px] animate-blob animation-delay-6000" />
      </div>

      {/* Particle canvas */}
      <ParticleCanvas />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Logo badge */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.1, type: 'spring', damping: 15 }}
            className="mb-8 inline-flex"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 blur-lg opacity-60 animate-pulse-glow" />
              <div className="relative flex items-center gap-3 rounded-3xl border border-white/20 bg-slate-900/80 px-6 py-3 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 text-lg font-bold text-white shadow-glow">
                  PN
                </div>
                <span className="text-xl font-bold tracking-wide text-white">ProjectNest</span>
              </div>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-5xl font-bold tracking-tight sm:text-7xl leading-tight"
          >
            <span className="text-white">Your Command</span>
            <br />
            <span className="gradient-text">Center for Every</span>
            <br />
            <span className="text-white">Project.</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed"
          >
            Manage projects, tasks, teams, and timelines with beautiful insights, real-time collaboration, and a polished dashboard built for high-performance teams.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
          >
            {['Kanban Board', 'Team Collaboration', 'Smart Reports', 'Calendar View', 'JWT Auth'].map((f) => (
              <span key={f} className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-400 backdrop-blur-sm">
                {f}
              </span>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <button
              id="get-started-btn"
              onClick={() => navigate('/register')}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-violet-500/30 transition hover:scale-[1.03] hover:shadow-violet-500/50"
            >
              <span className="relative z-10">Get Started — It's Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button
              id="login-btn"
              onClick={() => navigate('/login')}
              className="rounded-2xl border border-slate-700 bg-slate-900/60 px-8 py-4 text-base font-medium text-slate-300 backdrop-blur-sm transition hover:border-violet-500/50 hover:text-white hover:bg-slate-800/80"
            >
              Sign In
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-center"
          >
            {[
              { num: '10K+', label: 'Projects Tracked' },
              { num: '50K+', label: 'Tasks Completed' },
              { num: '99.9%', label: 'Uptime' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold gradient-text">{s.num}</p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 text-slate-600">
            <div className="h-8 w-5 rounded-full border border-slate-700 flex justify-center pt-1.5">
              <div className="h-1.5 w-1 rounded-full bg-slate-500 animate-bounce" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
