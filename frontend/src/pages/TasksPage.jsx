import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon, MagnifyingGlassIcon, Squares2X2Icon, ListBulletIcon,
  ArchiveBoxIcon, DocumentDuplicateIcon, PencilIcon, TrashIcon,
  ArrowPathIcon, CheckCircleIcon, ViewColumnsIcon, UserIcon,
  ClockIcon, CalendarDaysIcon, TagIcon, PaperClipIcon,
} from '@heroicons/react/24/outline';
import {
  getTasks, createTask, updateTask, deleteTask,
  changeTaskStatus, archiveTask, restoreTask, duplicateTask
} from '../services/taskService';
import { getProjects } from '../services/projectService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  title: '', description: '', projectId: '', category: '', status: 'Pending',
  priority: 'Medium', deadline: '', assignedTo: '', estimatedHours: '', tags: '', notes: '', attachments: ''
};

const STATUS_OPTS = ['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];
const PRIORITY_OPTS = ['Low', 'Medium', 'High', 'Critical'];
const SORT_OPTS = ['Newest', 'Oldest', 'Title', 'Deadline', 'Priority'];
const VIEW_OPTS = [
  { id: 'kanban', label: 'Kanban Board', icon: ViewColumnsIcon },
  { id: 'grid', label: 'Grid View', icon: Squares2X2Icon },
  { id: 'list', label: 'List View', icon: ListBulletIcon },
];

function TaskForm({ form, setForm, projects, onSave, onClose, isEdit }) {
  const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));
  const inputCls = 'w-full rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-white text-sm input-glow transition placeholder:text-slate-500';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Task Title *</label>
          <input type="text" value={form.title} onChange={f('title')} className={inputCls} placeholder="Write API specifications" />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-slate-300 mb-2">Project *</label>
          <select value={form.projectId} onChange={f('projectId')} className={inputCls}>
            <option value="">Select Project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
          <input type="text" value={form.category} onChange={f('category')} className={inputCls} placeholder="Development, Copywriting..." />
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
          <label className="block text-sm font-medium text-slate-300 mb-2">Deadline</label>
          <input type="date" value={form.deadline} onChange={f('deadline')} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Estimated Hours</label>
          <input type="number" value={form.estimatedHours} onChange={f('estimatedHours')} className={inputCls} placeholder="e.g. 5" />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-slate-300 mb-2">Assigned User</label>
          <input type="text" value={form.assignedTo} onChange={f('assignedTo')} className={inputCls} placeholder="John Doe" />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
          <input type="text" value={form.tags} onChange={f('tags')} className={inputCls} placeholder="api, backend (comma-separated)" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Attachments (URL or names)</label>
          <input type="text" value={form.attachments} onChange={f('attachments')} className={inputCls} placeholder="https://resource-link.com" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
          <textarea value={form.description} onChange={f('description')} rows={3} className={inputCls} placeholder="Provide details about the task tasks..." />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
          <textarea value={form.notes} onChange={f('notes')} rows={2} className={inputCls} placeholder="Additional development notes..." />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 rounded-2xl border border-slate-700 bg-slate-800 py-3 text-sm text-slate-300 hover:bg-slate-700 transition">Cancel</button>
        <button onClick={onSave} className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 py-3 text-sm font-semibold text-slate-950 hover:scale-[1.02] transition">
          {isEdit ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sort, setSort] = useState('Newest');
  const [viewMode, setViewMode] = useState('kanban');

  const load = useCallback(async () => {
    try {
      const [tRes, pRes] = await Promise.all([getTasks(), getProjects()]);
      setTasks(tRes.data.tasks || []);
      setProjects(pRes.data.projects || []);
    } catch {
      toast.error('Failed to load tasks and projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'Invalid date' || dateStr.toLowerCase().includes('invalid')) return '';
    return dateStr.split('T')[0];
  };

  const openCreate = () => {
    setEditTask(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setEditTask(t);
    setForm({
      title: t.title || '',
      description: t.description || '',
      projectId: t.projectId || '',
      category: t.category || '',
      status: t.status || 'Pending',
      priority: t.priority || 'Medium',
      deadline: formatDate(t.deadline),
      assignedTo: t.assignedTo || '',
      estimatedHours: t.estimatedHours || '',
      tags: t.tags || '',
      notes: t.notes || '',
      attachments: t.attachments || ''
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Task title is required'); return; }
    if (!form.projectId) { toast.error('Please select a project'); return; }
    try {
      const payload = {
        ...form,
        projectId: Number(form.projectId),
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : 0
      };
      if (editTask) {
        await updateTask(editTask.id, payload);
        toast.success('Task updated!');
      } else {
        await createTask(payload);
        toast.success('Task created!');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err?.message || 'Failed to save task');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(deleteTarget.id);
      toast.success('Task deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleToggleComplete = async (t) => {
    const nextStatus = t.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await changeTaskStatus(t.id, nextStatus);
      toast.success(`Task status updated to ${nextStatus}`);
      load();
    } catch {
      toast.error('Action failed');
    }
  };

  const handleArchive = async (t) => {
    try {
      await (t.archived ? restoreTask(t.id) : archiveTask(t.id));
      toast.success(t.archived ? 'Task restored' : 'Task archived');
      load();
    } catch {
      toast.error('Action failed');
    }
  };

  const handleDuplicate = async (t) => {
    try {
      await duplicateTask(t.id);
      toast.success('Task duplicated');
      load();
    } catch {
      toast.error('Failed to duplicate task');
    }
  };

  // Drag and Drop implementation
  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = async (e, columnStatus) => {
    const taskIdStr = e.dataTransfer.getData('text/plain');
    if (!taskIdStr) return;
    const taskId = Number(taskIdStr);
    try {
      await changeTaskStatus(taskId, columnStatus);
      toast.success(`Moved to ${columnStatus}`);
      load();
    } catch {
      toast.error('Failed to move task');
    }
  };

  // Filter & Search & Sort logic
  const filtered = tasks
    .filter(t => {
      // Archive filter
      if (statusFilter === 'Archived') return t.archived;
      if (t.archived) return false;

      // Project filter
      if (projectFilter !== 'All' && String(t.projectId) !== String(projectFilter)) return false;

      // Status filter
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;

      // Priority filter
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;

      return true;
    })
    .filter(t => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.tags?.toLowerCase().includes(q) ||
        t.status?.toLowerCase().includes(q) ||
        t.priority?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === 'Newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'Oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'Title') return a.title.localeCompare(b.title);
      if (sort === 'Deadline') return new Date(a.deadline || '9999') - new Date(b.deadline || '9999');
      if (sort === 'Priority') {
        const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
      }
      return 0;
    });

  const getProjectName = (projId) => {
    const proj = projects.find(p => String(p.id) === String(projId));
    return proj ? proj.name : 'Unknown Project';
  };

  // Kanban Columns
  const kanbanColumns = ['Pending', 'In Progress', 'Completed'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Tasks</h2>
          <p className="text-slate-400 text-sm mt-1">
            {tasks.length} tasks total · {filtered.length} shown
          </p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:scale-105 transition shadow-lg">
          <PlusIcon className="h-4 w-4 stroke-[2.5]" /> New Task
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-2xl border border-slate-700 bg-slate-800/60 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 input-glow transition"
          />
        </div>

        {/* Project select */}
        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white">
          <option value="All">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        {/* Status select */}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white">
          <option value="All">All Statuses</option>
          {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
          <option value="Archived">Archived</option>
        </select>

        {/* Priority select */}
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white">
          <option value="All">All Priorities</option>
          {PRIORITY_OPTS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        {/* Sort Select */}
        <select value={sort} onChange={e => setSort(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white">
          {SORT_OPTS.map(s => <option key={s} value={s}>Sort: {s}</option>)}
        </select>

        {/* View toggles */}
        <div className="flex rounded-2xl border border-slate-700 bg-slate-800/60 overflow-hidden">
          {VIEW_OPTS.map(v => {
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                className={`px-3.5 py-2 ${viewMode === v.id ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white'} transition`}
                title={v.label}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-44 rounded-3xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? 'No tasks matched filters' : 'No tasks yet'}
          message={search ? 'Try adjusting your search keywords or filter settings.' : 'Start assigning workloads by clicking New Task above.'}
          icon={CheckCircleIcon}
          action={!search ? openCreate : undefined}
          actionLabel="Add Task"
        />
      ) : (
        <AnimatePresence mode="wait">
          {/* KANBAN VIEW */}
          {viewMode === 'kanban' && (
            <motion.div
              key="kanban-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid gap-6 md:grid-cols-3"
            >
              {kanbanColumns.map(column => {
                const columnTasks = filtered.filter(t => t.status === column);
                return (
                  <div
                    key={column}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, column)}
                    className="flex flex-col rounded-3xl border border-slate-800 bg-slate-950/40 p-4 min-h-[500px]"
                  >
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${column === 'Completed' ? 'bg-emerald-400' : column === 'In Progress' ? 'bg-blue-400' : 'bg-amber-400'}`} />
                        {column}
                      </h3>
                      <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-xs text-slate-400 font-mono">
                        {columnTasks.length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
                      {columnTasks.map(t => (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, t.id)}
                          className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 cursor-grab active:cursor-grabbing hover:border-violet-500/20 transition-all shadow-md group relative"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium text-white text-sm line-clamp-1">{t.title}</h4>
                            <PriorityBadge priority={t.priority} />
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{t.description || 'No description.'}</p>
                          
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            <span className="text-[10px] rounded bg-slate-800 px-2 py-0.5 text-slate-400 font-medium truncate max-w-[120px]">
                              {getProjectName(t.projectId)}
                            </span>
                            {t.category && (
                              <span className="text-[10px] rounded bg-slate-800 px-2 py-0.5 text-slate-400 font-medium">
                                {t.category}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <UserIcon className="h-3 w-3" />
                              {t.assignedTo || 'Unassigned'}
                            </span>
                            {t.deadline && (
                              <span className="flex items-center gap-1 font-mono">
                                <CalendarDaysIcon className="h-3 w-3" />
                                {new Date(t.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {/* Quick action overlay inside card */}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 rounded-lg p-0.5 shadow">
                            <button onClick={() => openEdit(t)} className="p-1 hover:text-white text-slate-400 transition" title="Edit"><PencilIcon className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleDuplicate(t)} className="p-1 hover:text-white text-slate-400 transition" title="Duplicate"><DocumentDuplicateIcon className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleArchive(t)} className="p-1 hover:text-white text-slate-400 transition" title={t.archived ? 'Restore' : 'Archive'}><ArchiveBoxIcon className="h-3.5 w-3.5" /></button>
                            <button onClick={() => setDeleteTarget(t)} className="p-1 hover:text-red-400 text-slate-400 transition" title="Delete"><TrashIcon className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                      ))}
                      {columnTasks.length === 0 && (
                        <div className="border border-dashed border-slate-800 rounded-2xl py-8 text-center text-xs text-slate-600">
                          Drag tasks here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <motion.div
              key="grid-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 group relative card-hover"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-white truncate pr-4">{t.title}</h3>
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <p className="text-xs text-slate-500 mb-2 font-mono text-violet-400">{getProjectName(t.projectId)}</p>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">{t.description || 'No description provided.'}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <StatusBadge status={t.status} />
                    {t.category && <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-400">{t.category}</span>}
                    {t.deadline && (
                      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <CalendarDaysIcon className="h-3.5 w-3.5 text-slate-500" />
                        Due {new Date(t.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Badges row */}
                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800 pt-3 text-slate-400">
                    <div className="flex items-center gap-1.5"><UserIcon className="h-4 w-4 text-slate-500" /><span>{t.assignedTo || 'Unassigned'}</span></div>
                    <div className="flex items-center gap-1.5"><ClockIcon className="h-4 w-4 text-slate-500" /><span>{t.estimatedHours || 0} hrs</span></div>
                  </div>

                  {/* Actions overlay */}
                  <div className="mt-4 pt-3 border-t border-slate-800/50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleToggleComplete(t)} className="flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition">
                      <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-400" /> Complete
                    </button>
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded-xl bg-slate-800 hover:text-white text-slate-400 transition" title="Edit"><PencilIcon className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDuplicate(t)} className="p-1.5 rounded-xl bg-slate-800 hover:text-white text-slate-400 transition" title="Duplicate"><DocumentDuplicateIcon className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleArchive(t)} className="p-1.5 rounded-xl bg-slate-800 hover:text-white text-slate-400 transition" title={t.archived ? 'Restore' : 'Archive'}><ArchiveBoxIcon className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setDeleteTarget(t)} className="p-1.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 transition ml-auto" title="Delete"><TrashIcon className="h-3.5 w-3.5" /></button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm"
            >
              <table className="w-full text-left text-sm text-slate-300 border-collapse">
                <thead className="bg-slate-850 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Project</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4">Assignee</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filtered.map(t => (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-semibold text-white">{t.title}</td>
                      <td className="px-6 py-4 font-mono text-violet-400 text-xs">{getProjectName(t.projectId)}</td>
                      <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                      <td className="px-6 py-4"><PriorityBadge priority={t.priority} /></td>
                      <td className="px-6 py-4 font-mono text-xs">{t.deadline ? new Date(t.deadline).toLocaleDateString() : '-'}</td>
                      <td className="px-6 py-4 text-xs">{t.assignedTo || 'Unassigned'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleToggleComplete(t)} className="p-1 hover:text-white text-slate-400 transition" title="Toggle Done"><CheckCircleIcon className="h-4 w-4" /></button>
                          <button onClick={() => openEdit(t)} className="p-1 hover:text-white text-slate-400 transition" title="Edit"><PencilIcon className="h-4 w-4" /></button>
                          <button onClick={() => handleDuplicate(t)} className="p-1 hover:text-white text-slate-400 transition" title="Duplicate"><DocumentDuplicateIcon className="h-4 w-4" /></button>
                          <button onClick={() => handleArchive(t)} className="p-1 hover:text-white text-slate-400 transition" title={t.archived ? 'Restore' : 'Archive'}><ArchiveBoxIcon className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteTarget(t)} className="p-1 hover:text-red-400 text-slate-400 transition" title="Delete"><TrashIcon className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Forms Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTask ? 'Edit Task' : 'Create New Task'} size="lg">
        <TaskForm
          form={form}
          setForm={setForm}
          projects={projects}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
          isEdit={!!editTask}
        />
      </Modal>

      {/* Confirm Deletion */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete task "${deleteTarget?.title}"? This action is permanent.`}
        confirmLabel="Delete Task"
      />
    </motion.div>
  );
}
