import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon, DocumentArrowDownIcon, ArrowDownTrayIcon, PrinterIcon,
  Squares2X2Icon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { getReports } from '../services/reportService';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReports()
      .then((res) => {
        setData(res.data);
      })
      .catch(() => {
        toast.error('Failed to retrieve reports from API');
        setData({ projectSummary: [], taskSummary: { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 }, monthlyData: [], projects: [], tasks: [] });
      })
      .finally(() => setLoading(false));
  }, []);

  const projectSummary = data?.projectSummary || [];
  const taskSummary = data?.taskSummary || { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 };
  const monthlyData = data?.monthlyData || [];
  const projects = data?.projects || [];
  const tasks = data?.tasks || [];

  // Export CSV
  const handleExportCSV = () => {
    if (!projects.length) { toast.error('No project data to export'); return; }
    
    const headers = ['Project ID', 'Project Name', 'Category', 'Status', 'Priority', 'Progress %', 'Deadline', 'Estimated Hours'];
    const rows = projects.map(p => [
      p.id,
      p.name,
      p.category || '',
      p.status || '',
      p.priority || '',
      p.progress || 0,
      p.deadline || '',
      p.estimatedHours || 0
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ProjectNest_Project_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Report downloaded!');
  };

  // Export Excel (uses XLS compatible XML or rich CSV)
  const handleExportExcel = () => {
    if (!tasks.length) { toast.error('No task data to export'); return; }

    const headers = ['Task ID', 'Task Title', 'Project ID', 'Category', 'Status', 'Priority', 'Deadline', 'Assigned User', 'Estimated Hours'];
    const rows = tasks.map(t => [
      t.id,
      t.title,
      t.projectId,
      t.category || '',
      t.status || '',
      t.priority || '',
      t.deadline || '',
      t.assignedTo || '',
      t.estimatedHours || 0
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');
      
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ProjectNest_Task_Report_${new Date().toISOString().slice(0,10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Excel-compatible Report downloaded!');
  };

  // Export PDF via specialized browser printing tab
  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(el => el.outerHTML)
      .join('\n');

    const projectRows = projectSummary.map(p => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.status}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.priority}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.totalTasks}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.completedTasks}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.completionRate}%</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <title>ProjectNest Executive Report</title>
          ${styles}
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
            h1 { font-size: 28px; font-weight: bold; margin-bottom: 5px; color: #1e1b4b; }
            .header-meta { font-size: 12px; color: #666; margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: 700; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { text-align: left; padding: 8px; background: #f1f5f9; font-size: 12px; text-transform: uppercase; color: #475569; }
            .stats-grid { display: grid; grid-template-cols: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; text-align: center; }
            .stat-val { font-size: 22px; font-weight: 800; color: #4f46e5; }
            .stat-lbl { font-size: 11px; color: #64748b; margin-top: 5px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <h1>ProjectNest Executive Summary</h1>
          <div className="header-meta">Generated on ${new Date().toLocaleString()} · Workspace Report</div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-val">${projects.length}</div>
              <div className="stat-lbl">Total Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">${taskSummary.total}</div>
              <div className="stat-lbl">Total Tasks</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">${taskSummary.completed}</div>
              <div className="stat-lbl">Completed Tasks</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">${taskSummary.overdue}</div>
              <div className="stat-lbl">Overdue Tasks</div>
            </div>
          </div>

          <div className="section-title">Projects Performance Metrics</div>
          <table>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Tasks</th>
                <th>Completed</th>
                <th>Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              ${projectRows}
            </tbody>
          </table>

          <div className="section-title">End of Report</div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Reports</h2>
          <p className="text-slate-400 text-sm mt-1">Generate dynamic spreadsheet files and export comprehensive PDF executive briefings.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition">
            <DocumentArrowDownIcon className="h-4 w-4" /> CSV Report
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition">
            <ArrowDownTrayIcon className="h-4 w-4" /> Excel Report
          </button>
          <button onClick={handlePrintPDF} className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:scale-105 transition shadow-lg">
            <PrinterIcon className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="skeleton h-24" />)
        ) : (
          <>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 flex items-center gap-4">
              <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-400"><Squares2X2Icon className="h-6 w-6" /></div>
              <div><p className="text-xs text-slate-500 font-semibold uppercase">Projects</p><p className="text-xl font-bold text-white mt-1">{projects.length}</p></div>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 flex items-center gap-4">
              <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-400"><ChartBarIcon className="h-6 w-6" /></div>
              <div><p className="text-xs text-slate-500 font-semibold uppercase">Total Tasks</p><p className="text-xl font-bold text-white mt-1">{taskSummary.total}</p></div>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 flex items-center gap-4">
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400"><CheckCircleIcon className="h-6 w-6" /></div>
              <div><p className="text-xs text-slate-500 font-semibold uppercase">Completed</p><p className="text-xl font-bold text-white mt-1">{taskSummary.completed}</p></div>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 flex items-center gap-4">
              <div className="rounded-2xl bg-red-500/10 p-3 text-red-400"><ExclamationTriangleIcon className="h-6 w-6" /></div>
              <div><p className="text-xs text-slate-500 font-semibold uppercase">Overdue</p><p className="text-xl font-bold text-white mt-1">{taskSummary.overdue}</p></div>
            </div>
          </>
        )}
      </div>

      {/* Monthly chart */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
        <h3 className="text-base font-semibold text-white mb-4">Monthly Productive Output</h3>
        {loading ? (
          <div className="skeleton h-[250px]" />
        ) : monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
              <Legend formatter={(val) => <span className="text-slate-400 text-xs">{val}</span>} />
              <Area type="monotone" dataKey="projects" name="Created Projects" stroke="#38bdf8" fillOpacity={1} fill="url(#pGrad)" />
              <Area type="monotone" dataKey="completed" name="Completed Tasks" stroke="#a855f7" fillOpacity={1} fill="url(#cGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-slate-500 text-center py-10">No monthly activity data yet.</p>
        )}
      </div>

      {/* Project Summary Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 overflow-hidden">
        <h3 className="text-base font-semibold text-white mb-4">Project Summary Report</h3>
        {loading ? (
          <div className="skeleton h-44" />
        ) : projectSummary.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Project Name</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Total Tasks</th>
                  <th className="px-6 py-3">Completed</th>
                  <th className="px-6 py-3">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {projectSummary.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/20 transition">
                    <td className="px-6 py-4 font-semibold text-white">{p.name}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">{p.status}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{p.priority}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{p.totalTasks}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{p.completedTasks}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${p.completionRate}%` }} />
                        </div>
                        <span className="text-xs font-bold text-white">{p.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No active projects to summarize.</p>
        )}
      </div>
    </motion.div>
  );
}
