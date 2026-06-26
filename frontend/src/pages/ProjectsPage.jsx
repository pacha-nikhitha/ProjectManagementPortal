import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon, MagnifyingGlassIcon, FunnelIcon, Squares2X2Icon,
  ListBulletIcon, ArchiveBoxIcon, DocumentDuplicateIcon, PencilIcon,
  TrashIcon, ArrowPathIcon, FolderOpenIcon,
} from '@heroicons/react/24/outline';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', description: '', category: '', status: 'Planning', priority: 'Medium',
  deadline: '', startDate: '', endDate: '', tags: '', teamMembers: '', estimatedHours: '', progress: 0, notes: '',
};

const STATUS_OPTS = ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled', 'Archived'];
const PRIORITY_OPTS = ['Low', 'Medium', 'High', 'Critical'];
const FILTER_OPTS = ['All', 'Active', 'Completed', 'Archived', 'Planning', 'On Hold'];
const SORT_OPTS = ['Newest', 'Oldest', 'Name', 'Deadline', 'Priority'];

function ProjectForm({ form, setForm, onSave, onClose, isEdit }) {
  const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));
  const inputCls = 'w-full rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-white text-sm input-glow transition placeholder:text-slate-500';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Project Name *</label>
          <input id="project-name" type="text" value={form.name} onChange={f('name')} className={inputCls} placeholder="My Awesome Project" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
          <input type="text" value={form.category} onChange={f('category')} className={inputCls} placeholder="Web App, Research..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
          <select value={form.status} onChange={f('status')} className={inputCls}>
            {STATUS_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
          <select value={form.priority} onChange={f('priority')} className={inputCls}>
            {PRIORITY_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
          <input type="date" value={form.startDate} onChange={f('startDate')} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Deadline</label>
          <input type="date" value={form.deadline} onChange={f('deadline')} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Estimated Hours</label>
          <input type="number" value={form.estimatedHours} onChange={f('estimatedHours')} className={inputCls} placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Progress (%)</label>
          <input type="number" min="0" max="100" value={form.progress} onChange={(e) => setForm(p => ({ ...p, progress: Math.min(100, Math.max(0, Number(e.target.value))) }))} className={inputCls} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
          <input type="text" value={form.tags} onChange={f('tags')} className={inputCls} placeholder="design, backend, urgent (comma-separated)" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Team Members</label>
          <input type="text" value={form.teamMembers} onChange={f('teamMembers')} className={inputCls} placeholder="John, Jane, Mike (comma-separated)" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
          <textarea value={form.description} onChange={f('description')} rows={3} className={inputCls} placeholder="Describe the project goals and scope..." />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
          <textarea value={form.notes} onChange={f('notes')} rows={2} className={inputCls} placeholder="Additional notes..." />
        </div>
      </div>

      {/* Progress bar preview */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1.5"><span>Progress</span><span>{form.progress}%</span></div>
        <div className="h-2 rounded-full bg-slate-700">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-500" style={{ width: `${form.progress}%` }} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 rounded-2xl border border-slate-700 bg-slate-800 py-3 text-sm text-slate-300 hover:bg-slate-700 transition">Cancel</button>
        <button id="save-project-btn" onClick={onSave} className="flex-1 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 py-3 text-sm font-semibold text-white hover:scale-[1.02] transition">
          {isEdit ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </div>
  );
}

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 'Invalid date' || dateStr.toLowerCase().includes('invalid')) return '';
  return dateStr.split('T')[0];
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Newest');
  const [viewMode, setViewMode] = useState('grid');

  const load = useCallback(async () => {
    try {
      const r = await api.get('/projects');
      setProjects(r.data.projects || []);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditProject(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (p) => {
    setEditProject(p);
    setForm({
      name: p.name || '',
      description: p.description || '',
      category: p.category || '',
      status: p.status || 'Planning',
      priority: p.priority || 'Medium',
      deadline: formatDate(p.deadline),
      startDate: formatDate(p.startDate),
      endDate: formatDate(p.endDate),
      tags: p.tags || '',
      teamMembers: p.teamMembers || '',
      estimatedHours: p.estimatedHours || '',
      progress: p.progress || 0,
      notes: p.notes || ''
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Project name is required'); return; }
    try {
      if (editProject) {
        await api.put(`/projects/${editProject.id}`, form);
        toast.success('Project updated!');
      } else {
        await api.post('/projects', form);
        toast.success('Project created!');
      }
      setModalOpen(false);
      load();
    } catch (err) { toast.error(err?.message || 'Failed to save project'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/projects/${deleteTarget.id}`);
      toast.success('Project deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const handleArchive = async (p) => {
    try {
      await api.patch(`/projects/${p.id}/${p.archived ? 'restore' : 'archive'}`);
      toast.success(p.archived ? 'Project restored' : 'Project archived');
      load();
    } catch { toast.error('Action failed'); }
  };

  const handleDuplicate = async (p) => {
    try {
      await api.post(`/projects/${p.id}/duplicate`);
      toast.success('Project duplicated!');
      load();
    } catch { toast.error('Failed to duplicate'); }
  };

  // Filter + search + sort
  const filtered = projects
    .filter(p => {
      if (filter === 'Archived') return p.archived;
      if (filter !== 'All') return p.status === filter && !p.archived;
      return true;
    })
    .filter(p => {
      if (!search) return true;
      const q = search.toLowerCase();
      return p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.tags?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === 'Newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'Oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'Name') return a.name.localeCompare(b.name);
      if (sort === 'Deadline') return new Date(a.deadline || '9999') - new Date(b.deadline || '9999');
      if (sort === 'Priority') {
        const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
      }
      return 0;
    });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <p className="text-slate-400 text-sm mt-1">{projects.length} total · {filtered.length} shown</p>
        </div>
        <button id="add-project-btn" onClick={openCreate} className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white hover:scale-105 transition shadow-lg shadow-violet-500/20">
          <PlusIcon className="h-4 w-4" /> New Project
        </button>
      </div>

      {/* Search + Filter toolbar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-2xl border border-slate-700 bg-slate-800/60 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 input-glow transition"
          />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white">
          {FILTER_OPTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white">
          {SORT_OPTS.map(s => <option key={s} value={s}>Sort: {s}</option>)}
        </select>
        <div className="flex rounded-2xl border border-slate-700 bg-slate-800/60 overflow-hidden">
          <button onClick={() => setViewMode('grid')} className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white'} transition`}>
            <Squares2X2Icon className="h-4 w-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={`px-3 py-2 ${viewMode === 'list' ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white'} transition`}>
            <ListBulletIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Projects */}
      {loading ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : ''}`}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-48 rounded-3xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpenIcon}
          title={search ? 'No projects found' : 'No projects yet'}
          message={search ? `No results for "${search}"` : 'Create your first project to get started tracking tasks and milestones.'}
          action={!search ? openCreate : undefined}
          actionLabel="Create Project"
        />
      ) : (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          <AnimatePresence>
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className={`group relative rounded-3xl border bg-slate-900/80 p-5 backdrop-blur-sm card-hover ${p.archived ? 'border-purple-500/20 bg-purple-900/10' : 'border-slate-800 hover:border-violet-500/30'}`}
              >
                {p.archived && (
                  <div className="absolute top-3 right-3 rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-400 font-medium">Archived</div>
                )}

                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-base font-semibold text-white leading-tight truncate pr-4">{p.name}</h3>
                  <div className="flex-shrink-0">
                    <PriorityBadge priority={p.priority} />
                  </div>
                </div>

                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{p.description || 'No description provided.'}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <StatusBadge status={p.status} />
                  {p.category && <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-400">{p.category}</span>}
                  {p.deadline && (
                    <span className={`rounded-full px-2.5 py-1 text-xs ${new Date(p.deadline) < new Date() ? 'bg-red-500/15 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                      Due {new Date(p.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Progress</span><span>{p.progress || 0}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-700" style={{ width: `${p.progress || 0}%` }} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button onClick={() => openEdit(p)} className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition">
                    <PencilIcon className="h-3 w-3" /> Edit
                  </button>
                  <button onClick={() => handleArchive(p)} className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition">
                    {p.archived ? <ArrowPathIcon className="h-3 w-3" /> : <ArchiveBoxIcon className="h-3 w-3" />}
                    {p.archived ? 'Restore' : 'Archive'}
                  </button>
                  <button onClick={() => handleDuplicate(p)} className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition">
                    <DocumentDuplicateIcon className="h-3 w-3" /> Duplicate
                  </button>
                  <button onClick={() => setDeleteTarget(p)} className="flex items-center gap-1.5 rounded-xl bg-red-500/15 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/25 transition">
                    <TrashIcon className="h-3 w-3" /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editProject ? 'Edit Project' : 'Create New Project'} size="lg">
        <ProjectForm form={form} setForm={setForm} onSave={handleSave} onClose={() => setModalOpen(false)} isEdit={!!editProject} />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also remove all associated tasks.`}
        confirmLabel="Delete Project"
      />
    </motion.div>
  );
}
