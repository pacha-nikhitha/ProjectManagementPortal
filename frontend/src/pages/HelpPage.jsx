import { useState } from 'react';
import SectionCard from '../components/SectionCard';
import {
  QuestionMarkCircleIcon, ChatBubbleLeftRightIcon,
  AcademicCapIcon, RocketLaunchIcon, ChevronDownIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const FAQS = [
  {
    q: 'How do I create and manage projects in ProjectNest?',
    a: 'Navigate to the Projects tab using the sidebar and click the "New Project" button. Complete the name, category, dates, and estimated hours fields. To update, copy, or archive the project, hover over its card and select the corresponding quick-action icons.'
  },
  {
    q: 'What does the Productivity Score on the dashboard represent?',
    a: 'The Productivity Score represents the percentage of tasks that have been successfully marked as "Completed" relative to the total number of tasks in your workspace. Completing pending tasks increases this rating in real time.'
  },
  {
    q: 'How does the drag-and-drop Kanban Board function?',
    a: 'Go to the Tasks tab, toggle to the "Kanban Board" view, click and hold any task card, then drag it into the "Pending," "In Progress," or "Completed" columns. The system automatically saves the new task status state to the backend.'
  },
  {
    q: 'Can ProjectNest work offline or without a MySQL connection?',
    a: 'Yes. If MySQL credentials are not configured or if a connection fails, ProjectNest automatically launches in fallback mode using an in-memory JSON state representation, ensuring zero interruptions to your experience.'
  },
  {
    q: 'How can I change my visual theme preference permanently?',
    a: 'Open Settings in the sidebar or click the theme toggler at the bottom left of your layout. You can select Light Mode, Dark Mode, or System Mode. The browser will persist your settings in local storage.'
  }
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const [query, setQuery] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!email || !message) { toast.error('Please fill in all contact fields'); return; }
    toast.success('Your support request was dispatched! We will reply shortly.');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <QuestionMarkCircleIcon className="h-7 w-7 text-cyan-400" /> Help Center & FAQs
        </h2>
        <p className="text-slate-400 text-sm mt-1">Get instant guidance, search questions, or request human technician review.</p>
      </div>

      {/* Onboarding Checklist */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-violet-900/10 to-cyan-900/15 p-6 backdrop-blur-sm">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
          <RocketLaunchIcon className="h-5 w-5 text-violet-400" /> Quick-Start Onboarding
        </h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex items-center gap-2">✔ <span className="text-slate-100">Step 1:</span> Complete your profile in the Profile settings and upload a profile photo.</li>
          <li className="flex items-center gap-2">✔ <span className="text-slate-100">Step 2:</span> Build a new workspace container in the Projects page.</li>
          <li className="flex items-center gap-2">✔ <span className="text-slate-100">Step 3:</span> Assign task cards to columns inside the Tasks list/Kanban view.</li>
          <li className="flex items-center gap-2">✔ <span className="text-slate-100">Step 4:</span> Verify monthly progress lines in the Reports portal.</li>
        </ul>
      </div>

      {/* FAQ Accordions */}
      <SectionCard title="Frequently Asked Questions">
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-slate-800/30 transition text-sm font-bold text-white"
              >
                <span>{faq.q}</span>
                <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/40 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Contact Support Form */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-cyan-400" /> Direct Ticket Submission
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Having workspace rendering anomalies, MySQL schema issues, or authorization errors? Open a ticket, and our systems engineers will debug your instance.
            </p>
          </div>
          <div className="space-y-2 text-xs text-slate-500 font-mono">
            <p>Support SLA: &lt; 2 hours</p>
            <p>System Version: v1.0.4 Production</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <form onSubmit={handleSupportSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Reply Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Describe your issue</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                placeholder="Explain the error code or UI state you encountered..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-xs text-white outline-none"
              />
            </div>
            <button type="submit" className="w-full rounded-xl bg-violet-500 py-2.5 text-xs font-bold text-white hover:bg-violet-600 transition">
              Dispatch Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
