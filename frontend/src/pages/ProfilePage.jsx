import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SectionCard from '../components/SectionCard';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  UserCircleIcon, CameraIcon, LockClosedIcon, PlusIcon,
  GlobeAltIcon, TrophyIcon, BriefcaseIcon, BuildingOffice2Icon
} from '@heroicons/react/24/outline';

const ROLES = ['Student', 'Working Professional', 'Freelancer', 'Team Leader', 'Faculty', 'Startup Founder', 'Admin'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', profession: '', organization: '',
    bio: '', skills: '', experience: '', profilePicture: '', socialLinks: ''
  });
  const [skillsArr, setSkillsArr] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Password fields
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [updatingPw, setUpdatingPw] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        profession: user.profession || '',
        organization: user.organization || '',
        bio: user.bio || '',
        skills: user.skills || '',
        experience: user.experience || '',
        profilePicture: user.profilePicture || '',
        socialLinks: user.socialLinks || ''
      });
      setSkillsArr(user.skills ? user.skills.split(',').filter(Boolean) : []);
    }
  }, [user]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setProfile(p => ({ ...p, profilePicture: reader.result }));
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    const trimmed = skillInput.trim();
    if (skillsArr.includes(trimmed)) { toast.error('Skill already added'); return; }
    const updated = [...skillsArr, trimmed];
    setSkillsArr(updated);
    setProfile(p => ({ ...p, skills: updated.join(',') }));
    setSkillInput('');
  };

  const removeSkill = (s) => {
    const updated = skillsArr.filter(x => x !== s);
    setSkillsArr(updated);
    setProfile(p => ({ ...p, skills: updated.join(',') }));
  };

  const handleSaveProfile = async () => {
    if (!profile.name.trim()) { toast.error('Name is required'); return; }
    if (!profile.email.trim()) { toast.error('Email is required'); return; }
    setSaving(true);
    try {
      const { data } = await api.put('/profile', profile);
      updateUser(data.user);
      toast.success('Profile details updated!');
    } catch (err) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword) { toast.error('Current password is required'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('New passwords do not match'); return; }

    setUpdatingPw(true);
    try {
      await api.put('/profile/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      });
      toast.success('Password updated successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err?.message || 'Failed to change password');
    } finally {
      setUpdatingPw(false);
    }
  };

  const inputCls = 'w-full rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-white text-sm input-glow transition placeholder:text-slate-500';
  const labelCls = 'block text-sm font-medium text-slate-300 mb-2';

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left Column: Summary Card */}
      <div className="space-y-6 lg:col-span-1">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 text-center backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20" />
          
          <div className="relative mt-8 mb-4 inline-block">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt="avatar" className="h-28 w-28 rounded-3xl object-cover border-2 border-violet-500/50 shadow-xl" />
            ) : (
              <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-4xl font-extrabold text-white border-2 border-white/20 shadow-xl">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 rounded-xl bg-violet-500 hover:bg-violet-600 p-2 text-white shadow-lg cursor-pointer transition">
              <CameraIcon className="h-4 w-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          <h3 className="text-xl font-bold text-white mt-4">{profile.name || 'Unnamed User'}</h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
          <span className="inline-flex rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-400 mt-3">
            {user?.role || 'Member'}
          </span>

          <div className="mt-6 border-t border-slate-800/80 pt-6 text-left space-y-3 text-sm text-slate-400">
            <div className="flex items-center gap-2"><BriefcaseIcon className="h-4 w-4 text-slate-500" /><span>{profile.profession || 'No profession specified'}</span></div>
            <div className="flex items-center gap-2"><BuildingOffice2Icon className="h-4 w-4 text-slate-500" /><span>{profile.organization || 'No organization specified'}</span></div>
            <div className="flex items-center gap-2"><TrophyIcon className="h-4 w-4 text-slate-500" /><span>{profile.experience || 'Experience level not set'}</span></div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <LockClosedIcon className="h-5 w-5 text-violet-400" /> Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className={labelCls}>Current Password</label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                className={inputCls}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className={labelCls}>New Password</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                className={inputCls}
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <label className={labelCls}>Confirm New Password</label>
              <input
                type="password"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                className={inputCls}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={updatingPw}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 py-3 text-sm font-semibold text-slate-950 hover:scale-[1.02] transition disabled:opacity-60"
            >
              {updatingPw ? 'Updating password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Profile Form Details */}
      <div className="space-y-6 lg:col-span-2">
        <SectionCard title="Personal Workspace Settings">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Full Name</label>
              <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className={inputCls} placeholder="+1 234 567 890" />
            </div>
            <div>
              <label className={labelCls}>Profession</label>
              <input type="text" value={profile.profession} onChange={e => setProfile({ ...profile, profession: e.target.value })} className={inputCls} placeholder="e.g. Lead Designer" />
            </div>
            <div>
              <label className={labelCls}>College / Organization</label>
              <input type="text" value={profile.organization} onChange={e => setProfile({ ...profile, organization: e.target.value })} className={inputCls} placeholder="e.g. Stanford University" />
            </div>
            <div>
              <label className={labelCls}>Experience</label>
              <select value={profile.experience} onChange={e => setProfile({ ...profile, experience: e.target.value })} className={inputCls}>
                <option value="">Select experience</option>
                {['0-1 year', '1-2 years', '2-5 years', '5-10 years', '10+ years'].map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            
            <div className="col-span-2">
              <label className={labelCls}>Social Links</label>
              <textarea
                value={profile.socialLinks}
                onChange={e => setProfile({ ...profile, socialLinks: e.target.value })}
                className={inputCls}
                rows={2}
                placeholder="LinkedIn URL, GitHub URL, Portfolio Link (one per line)"
              />
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Bio / Notes</label>
              <textarea
                value={profile.bio}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                className={inputCls}
                rows={3}
                placeholder="Briefly describe your responsibilities or workspace duties..."
              />
            </div>

            {/* Skills tag editor */}
            <div className="col-span-2 border-t border-slate-800/80 pt-4">
              <label className={labelCls}>Workspace Skills</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className={`${inputCls} flex-1`}
                  placeholder="e.g. React, Node.js, Photoshop"
                />
                <button type="button" onClick={addSkill} className="rounded-2xl bg-slate-800 px-5 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skillsArr.map(s => (
                  <span key={s} className="flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 px-3.5 py-1.5 text-xs text-violet-400 font-semibold shadow-sm">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} className="text-violet-400 hover:text-white font-bold text-sm">&times;</button>
                  </span>
                ))}
                {skillsArr.length === 0 && (
                  <p className="text-xs text-slate-500">No skills registered yet.</p>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-3.5 text-sm font-bold text-slate-950 hover:scale-105 transition shadow-lg"
          >
            {saving ? 'Saving changes...' : 'Save Profile Changes'}
          </button>
        </SectionCard>
      </div>
    </div>
  );
}
