import SectionCard from '../components/SectionCard';
import { InformationCircleIcon, CommandLineIcon, GlobeAltIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const techStack = [
    { name: 'React & Vite', desc: 'Fast, lightweight frontend rendering engine' },
    { name: 'Tailwind CSS', desc: 'Premium responsive utility styling architecture' },
    { name: 'Framer Motion', desc: 'Fluid animations and page transition interpolation' },
    { name: 'Node.js & Express', desc: 'Scalable RESTful API route mapping middleware' },
    { name: 'Sequelize ORM', desc: 'Type-safe SQL dialect queries & MySQL synchronizers' },
    { name: 'JWT Auth & bcrypt', desc: 'Robust industry-standard security verification' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <InformationCircleIcon className="h-7 w-7 text-cyan-400" /> About ProjectNest
        </h2>
        <p className="text-slate-400 text-sm mt-1">Version controls, developers credit, and workspace details.</p>
      </div>

      {/* Brand Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col sm:flex-row items-center gap-6 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.1),transparent_50%)]" />
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl font-black text-white shadow-glow relative z-10 flex-shrink-0">
          PN
        </div>
        <div className="space-y-1 relative z-10 text-center sm:text-left">
          <h3 className="text-xl font-bold text-white">ProjectNest Portal</h3>
          <p className="text-xs text-slate-500 font-mono">Build v1.0.4 · Production Stable</p>
          <p className="text-sm text-slate-300 mt-2">
            ProjectNest is a modern, enterprise-ready workspace organizer designed for high-performance software engineering groups, startup founders, and student developers alike.
          </p>
        </div>
      </div>

      {/* Tech Stack Grid */}
      <SectionCard title="Technology Architecture">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {techStack.map((tech) => (
            <div key={tech.name} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-sm font-semibold text-white">{tech.name}</p>
              <p className="text-xs text-slate-500 mt-1">{tech.desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Bottom credits */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-6 space-y-3">
          <h4 className="font-semibold text-white flex items-center gap-2 text-sm">
            <CommandLineIcon className="h-5 w-5 text-cyan-400" /> Platform Credits
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            ProjectNest is built with a focus on speed, user experience, and aesthetic excellence. It demonstrates full-stack software architecture principles, showcasing role-based dashboard widgets, drag-and-drop task Kanban boards, and multi-tenant schema fallbacks.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-6 space-y-3">
          <h4 className="font-semibold text-white flex items-center gap-2 text-sm">
            <SparklesIcon className="h-5 w-5 text-fuchsia-400" /> Google Gemini Project
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Engineered in collaboration with Antigravity, the Google DeepMind agentic coding system. Designed to exemplify modern, beautiful glassmorphism SaaS styles, fluid responsive animations, and zero-placeholder user verification flows.
          </p>
        </div>
      </div>
    </div>
  );
}
