import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ROLES = ['Student', 'Working Professional', 'Freelancer', 'Team Leader', 'Faculty', 'Startup Founder', 'Admin'];
const STEPS = ['Account', 'Profile', 'Skills'];

function PasswordStrength({ password }) {
  const getStrength = (p) => {
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength = getStrength(password);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-amber-400', 'bg-emerald-400', 'bg-green-400'];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : 'bg-slate-700'}`} />
        ))}
      </div>
      <p className={`text-xs ${strength < 2 ? 'text-red-400' : strength < 4 ? 'text-amber-400' : 'text-emerald-400'}`}>
        Password strength: {labels[strength]}
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', role: 'Student', profession: '', organization: '',
    bio: '', skills: [], experience: '', profilePicture: '',
    socialLinks: '',
  });

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setForm(p => ({ ...p, profilePicture: reader.result }));
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setForm(p => ({ ...p, skills: [...p.skills, skillInput.trim()] }));
    setSkillInput('');
  };

  const removeSkill = (s) => setForm(p => ({ ...p, skills: p.skills.filter(x => x !== s) }));

  const validateStep = () => {
    if (step === 0) {
      if (!form.name.trim()) { toast.error('Name is required'); return false; }
      if (!form.email.trim()) { toast.error('Email is required'); return false; }
      if (!form.password || form.password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
      if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return false; }
    }
    if (step === 1) {
      if (!form.phone.trim()) { toast.error('Phone is required'); return false; }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    try {
      const payload = { ...form, skills: form.skills.join(',') };
      delete payload.confirmPassword;
      await register(payload);
      toast.success('Welcome to ProjectNest! 🎉');
      navigate('/app/dashboard');
    } catch (err) {
      toast.error(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-white text-sm input-glow transition placeholder:text-slate-500';
  const labelCls = 'block text-sm font-medium text-slate-300 mb-2';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 text-lg font-bold text-white shadow-glow group-hover:scale-105 transition">PN</div>
            <span className="text-xl font-bold text-white">ProjectNest</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 backdrop-blur-xl shadow-2xl shadow-black/50">
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-slate-400 text-sm mb-6">Join thousands of teams using ProjectNest</p>

          {/* Step progress */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  {i < step ? <CheckIcon className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-xs font-medium ${i === step ? 'text-white' : 'text-slate-500'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className={labelCls}>Full Name *</label>
                      <input id="reg-name" type="text" value={form.name} onChange={set('name')} className={inputCls} placeholder="John Doe" />
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Email Address *</label>
                      <input id="reg-email" type="email" value={form.email} onChange={set('email')} className={inputCls} placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className={labelCls}>Password *</label>
                      <div className="relative">
                        <input id="reg-password" type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} className={`${inputCls} pr-11`} placeholder="Min. 6 characters" />
                        <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                          {showPw ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                      </div>
                      <PasswordStrength password={form.password} />
                    </div>
                    <div>
                      <label className={labelCls}>Confirm Password *</label>
                      <div className="relative">
                        <input id="reg-confirm-password" type={showCpw ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} className={`${inputCls} pr-11`} placeholder="Repeat password" />
                        <button type="button" onClick={() => setShowCpw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                          {showCpw ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                      </div>
                      {form.confirmPassword && form.password !== form.confirmPassword && (
                        <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>User Type</label>
                      <select value={form.role} onChange={set('role')} className={inputCls}>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Phone Number *</label>
                      <input id="reg-phone" type="tel" value={form.phone} onChange={set('phone')} className={inputCls} placeholder="+1 234 567 8900" />
                    </div>
                    <div>
                      <label className={labelCls}>Profession</label>
                      <input id="reg-profession" type="text" value={form.profession} onChange={set('profession')} className={inputCls} placeholder="Software Engineer" />
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>College / Organization</label>
                      <input id="reg-organization" type="text" value={form.organization} onChange={set('organization')} className={inputCls} placeholder="MIT / Google Inc." />
                    </div>
                    <div>
                      <label className={labelCls}>Experience</label>
                      <select value={form.experience} onChange={set('experience')} className={inputCls}>
                        <option value="">Select experience</option>
                        {['0-1 year', '1-2 years', '2-5 years', '5-10 years', '10+ years'].map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Profile Picture</label>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-slate-400 file:mr-3 file:rounded-xl file:border-0 file:bg-violet-500/20 file:px-3 file:py-2 file:text-xs file:text-violet-400 file:cursor-pointer" />
                    </div>
                    {form.profilePicture && (
                      <div className="col-span-2 flex justify-center">
                        <img src={form.profilePicture} alt="preview" className="h-20 w-20 rounded-2xl object-cover border border-violet-500/30" />
                      </div>
                    )}
                    <div className="col-span-2">
                      <label className={labelCls}>Bio</label>
                      <textarea value={form.bio} onChange={set('bio')} rows={3} className={inputCls} placeholder="Tell us about yourself..." />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <label className={labelCls}>Skills</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        className={`${inputCls} flex-1`}
                        placeholder="e.g. React, Python, UI Design"
                      />
                      <button type="button" onClick={addSkill} className="rounded-2xl bg-violet-500 px-4 text-sm font-semibold text-white hover:bg-violet-600 transition">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.skills.map(s => (
                        <span key={s} className="flex items-center gap-1.5 rounded-full bg-violet-500/15 px-3 py-1 text-sm text-violet-300">
                          {s}
                          <button type="button" onClick={() => removeSkill(s)} className="text-violet-400 hover:text-white">&times;</button>
                        </span>
                      ))}
                      {form.skills.length === 0 && <p className="text-sm text-slate-500">No skills added yet</p>}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Social Links</label>
                    <textarea value={form.socialLinks} onChange={set('socialLinks')} rows={2} className={inputCls} placeholder="LinkedIn, GitHub, Portfolio URLs (one per line)" />
                  </div>
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-sm text-emerald-400 font-medium">✓ Ready to join ProjectNest!</p>
                    <p className="text-xs text-slate-400 mt-1">Click Register to create your account and start managing projects.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button type="button" onClick={prev} className="flex-1 rounded-2xl border border-slate-700 bg-slate-800 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 transition">
                  Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={next} className="flex-1 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 py-3 text-sm font-semibold text-white hover:scale-[1.02] transition">
                  Continue
                </button>
              ) : (
                <button
                  id="register-submit"
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 hover:scale-[1.02] transition disabled:opacity-60"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
