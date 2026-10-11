import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, X, Tag, Loader2, Calendar, User, CheckSquare, Clock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import supabase from '@/lib/supabase';

const TAG_OPTIONS = ['Frontend', 'Backend', 'Security', 'DevOps', 'UI/UX', 'Database', 'Testing', 'Documentation'];

const COL_CONFIG = [
  { id: 'todo',     title: 'To Do',       accent: 'var(--color-gs-text-muted)', dot: 'bg-gray-500' },
  { id: 'progress', title: 'In Progress', accent: 'var(--color-gs-amber)',      dot: 'bg-amber-400'  },
  { id: 'done',     title: 'Done',        accent: 'var(--color-gs-green)',      dot: 'bg-green-400'  },
];

/* ─ helpers ─────────────────────────────────────────────────────────── */
const safeTags = (tags) => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    try { const p = JSON.parse(tags); return Array.isArray(p) ? p : [tags]; }
    catch { return [tags]; }
  }
  return [];
};

const TAG_COLORS = {
  Frontend:      'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Backend:       'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Security:      'bg-red-500/15 text-red-400 border-red-500/30',
  DevOps:        'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'UI/UX':       'bg-pink-500/15 text-pink-400 border-pink-500/30',
  Database:      'bg-teal-500/15 text-teal-400 border-teal-500/30',
  Testing:       'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  Documentation: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  General:       'bg-gray-500/15 text-gray-400 border-gray-500/30',
};

function formatDueDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (diff < 0)  return { label, cls: 'text-red-400',   icon: '⚠️' };
  if (diff === 0) return { label: 'Today', cls: 'text-amber-400', icon: '🔥' };
  if (diff <= 3) return { label, cls: 'text-amber-400', icon: '⏳' };
  return { label, cls: 'text-[var(--color-gs-text-muted)]', icon: '📅' };
}

/* ─ TaskCard ─────────────────────────────────────────────────────────── */
function TaskCard({ task, members, onDelete, onDragStart }) {
  const tags       = safeTags(task.tags);
  const due        = formatDueDate(task.due_date);
  const assignee   = members?.find(m => m.id === task.assignee_id);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-gs-card border border-gs-border p-3.5 rounded-lg
                 cursor-grab active:cursor-grabbing hover:border-blue-500/40
                 transition-colors shadow-sm group relative select-none"
    >
      {/* Delete btn */}
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1
                   text-[var(--color-gs-text-muted)] hover:text-red-400
                   hover:bg-red-500/10 rounded-lg transition-all z-10"
      >
        <X size={13} />
      </button>

      {/* Task text */}
      <p className="text-sm font-semibold text-[var(--color-gs-text-main)] mb-3 pr-6 leading-snug">
        {task.text}
      </p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map(tag => (
            <span
              key={tag}
              className={twMerge(
                'text-[10px] px-2 py-0.5 rounded-full border font-medium',
                TAG_COLORS[tag] ?? TAG_COLORS.General
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: due date + assignee */}
      {(due || assignee) && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-gs-border)]">
          {due ? (
            <span className={`text-[10px] flex items-center gap-1 font-medium ${due.cls}`}>
              {due.icon} {due.label}
            </span>
          ) : <span />}
          {assignee && (
            <span className="text-[10px] flex items-center gap-1 text-[var(--color-gs-text-muted)]">
              <span className="text-sm">{assignee.avatar || '👤'}</span>
              <span className="truncate max-w-[80px]">{assignee.name?.split(' ')[0]}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ─ KanbanBoard ─────────────────────────────────────────────────────── */
export default function KanbanBoard({ groupId, members = [] }) {
  const [columns,      setColumns]      = useState(() => COL_CONFIG.map(c => ({ ...c, tasks: [] })));
  const [loading,      setLoading]      = useState(true);
  const [addingTo,     setAddingTo]     = useState(null);
  const [newText,      setNewText]      = useState('');
  const [newTags,      setNewTags]      = useState([]);
  const [newDueDate,   setNewDueDate]   = useState('');
  const [newAssignee,  setNewAssignee]  = useState('');
  const [dragOverCol,  setDragOverCol]  = useState(null);
  const [saving,       setSaving]       = useState(false);

  const dragTaskRef  = useRef(null);
  const dragFromRef  = useRef(null);

  /* ── data ── */
  const mapToColumns = useCallback((data) =>
    COL_CONFIG.map(c => ({ ...c, tasks: data.filter(t => t.column_id === c.id) })),
  []);

  const fetchTasks = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });
    if (!error && data) setColumns(mapToColumns(data));
    setLoading(false);
  }, [groupId, mapToColumns]);

  /* ── realtime ── */
  useEffect(() => {
    if (!groupId) return;
    fetchTasks();

    const channel = supabase
      .channel(`kanban:${groupId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `group_id=eq.${groupId}` },
        () => fetchTasks()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [groupId, fetchTasks]);

  /* ── add task ── */
  const handleAddTask = async (colId) => {
    if (!newText.trim() || saving) return;
    setSaving(true);

    const payload = {
      group_id:    groupId,
      column_id:   colId,
      text:        newText.trim(),
      tags:        newTags.length > 0 ? newTags : ['General'],
      due_date:    newDueDate  || null,
      assignee_id: newAssignee || null,
    };

    const { error } = await supabase.from('tasks').insert(payload);
    if (error) console.error('Insert error:', error);

    setSaving(false);
    setNewText('');
    setNewTags([]);
    setNewDueDate('');
    setNewAssignee('');
    setAddingTo(null);
  };

  const cancelAdd = () => {
    setAddingTo(null);
    setNewText('');
    setNewTags([]);
    setNewDueDate('');
    setNewAssignee('');
  };

  const toggleTag = (tag) =>
    setNewTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  /* ── delete task ── */
  const handleDeleteTask = async (taskId) => {
    await supabase.from('tasks').delete().eq('id', taskId);
    // realtime will refresh, but also update optimistically
    setColumns(prev => prev.map(c => ({ ...c, tasks: c.tasks.filter(t => t.id !== taskId) })));
  };

  /* ── drag & drop ── */
  const handleDragStart = (task, colId) => {
    dragTaskRef.current = task;
    dragFromRef.current = colId;
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDrop = async (toColId) => {
    setDragOverCol(null);
    const task   = dragTaskRef.current;
    const fromId = dragFromRef.current;
    dragTaskRef.current = null;
    dragFromRef.current = null;

    if (!task || fromId === toColId) return;

    // Optimistic update
    setColumns(prev => prev.map(c => {
      if (c.id === fromId) return { ...c, tasks: c.tasks.filter(t => t.id !== task.id) };
      if (c.id === toColId) return { ...c, tasks: [...c.tasks, { ...task, column_id: toColId }] };
      return c;
    }));

    await supabase.from('tasks').update({ column_id: toColId }).eq('id', task.id);
  };

  /* ── render ── */
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-gs-text-muted)] gap-3 py-16">
        <Loader2 className="animate-spin text-blue-500" size={28} />
        <p className="text-sm font-medium">Syncing Board...</p>
      </div>
    );
  }

  const totalTasks = columns.reduce((s, c) => s + c.tasks.length, 0);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Board header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="text-blue-500" size={18} />
          <h3 className="text-base font-semibold text-gs-text-main">Task board</h3>
          <span className="text-xs text-gs-text-muted bg-black/5 dark:bg-white/[0.04] border border-gs-border px-2 py-0.5 rounded-full ml-1">
            {totalTasks} task{totalTasks !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="text-[10px] text-gs-text-muted flex items-center gap-1">
          <span>Drag cards to move between columns</span>
        </p>
      </div>

      {/* Columns */}
      <div className="flex gap-4 overflow-x-auto pb-2 flex-1">
        {columns.map(col => (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={() => handleDrop(col.id)}
            className={twMerge(
              'min-w-[280px] w-[280px] flex flex-col gap-3 rounded-xl p-3.5 border shrink-0 transition-colors',
              dragOverCol === col.id
                ? 'bg-blue-500/5 border-blue-500/40'
                : 'bg-black/5 dark:bg-white/[0.02] border-gs-border'
            )}
          >
            {/* Column header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <h4 className="font-semibold text-gs-text-main text-xs">{col.title}</h4>
                <span className="text-[11px] text-gs-text-muted bg-gs-card border border-gs-border px-1.5 py-0.2 rounded-full">
                  {col.tasks.length}
                </span>
              </div>
            </div>

            {/* Task cards */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-[120px]">
              {col.tasks.length === 0 && dragOverCol !== col.id && (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-gs-text-muted opacity-50">
                  <div className="w-8 h-8 rounded-lg border-2 border-dashed border-current flex items-center justify-center mb-1">
                    <Plus size={14} />
                  </div>
                  <p className="text-[10px]">Drop here</p>
                </div>
              )}
              {col.tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  members={members}
                  onDelete={() => handleDeleteTask(task.id)}
                  onDragStart={() => handleDragStart(task, col.id)}
                />
              ))}
              {/* Drop zone indicator */}
              {dragOverCol === col.id && (
                <div className="border border-dashed border-blue-500/40 rounded-lg h-14 flex items-center justify-center">
                  <p className="text-[10px] text-blue-500 font-medium">Release to drop</p>
                </div>
              )}
            </div>

            {/* Add Task Area */}
            {addingTo === col.id ? (
              <div className="glass-card rounded-xl p-3 space-y-2.5">
                {/* Task title */}
                <input
                  type="text"
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddTask(col.id);
                    if (e.key === 'Escape') cancelAdd();
                  }}
                  placeholder="Task title..."
                  className="w-full bg-black/5 dark:bg-white/[0.03] border border-gs-border rounded-lg px-2.5 py-1.5
                             text-xs outline-none focus:border-blue-500 text-gs-text-main
                             placeholder-gs-text-muted"
                  autoFocus
                />

                {/* Due date */}
                <div>
                  <p className="text-[10px] text-gs-text-muted mb-1 flex items-center gap-1">
                    <Clock size={10} /> Due date (optional)
                  </p>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    className="w-full bg-black/5 dark:bg-white/[0.03] border border-gs-border rounded-lg px-2.5 py-1 text-xs outline-none focus:border-blue-500 text-gs-text-main"
                  />
                </div>

                {/* Assignee */}
                {members.length > 0 && (
                  <div>
                    <p className="text-[10px] text-gs-text-muted mb-1 flex items-center gap-1">
                      <User size={10} /> Assign to (optional)
                    </p>
                    <select
                      value={newAssignee}
                      onChange={e => setNewAssignee(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/[0.03] border border-gs-border rounded-lg px-2.5 py-1 text-xs outline-none focus:border-blue-500 text-gs-text-main"
                    >
                      <option value="">Unassigned</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.avatar || '👤'} {m.name || 'Member'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Tags */}
                <div>
                  <p className="text-[10px] text-gs-text-muted mb-1 flex items-center gap-1">
                    <Tag size={10} /> Tags
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {TAG_OPTIONS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={twMerge(
                          'text-[10px] px-2 py-0.5 rounded-full border transition-colors font-medium',
                          newTags.includes(tag)
                            ? TAG_COLORS[tag] ?? TAG_COLORS.General
                            : 'bg-black/5 dark:bg-white/[0.02] border-gs-border text-gs-text-muted hover:border-blue-500/40'
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleAddTask(col.id)}
                    disabled={!newText.trim() || saving}
                    className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg
                               transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                               flex items-center justify-center gap-1 shadow-sm"
                  >
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                    Add task
                  </button>
                  <button
                    onClick={cancelAdd}
                    className="px-2.5 py-1.5 text-gs-text-muted hover:text-gs-text-main
                               text-xs border border-gs-border rounded-lg
                               hover:bg-black/5 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setAddingTo(col.id); setNewText(''); setNewTags([]); setNewDueDate(''); setNewAssignee(''); }}
                className="w-full py-2 rounded-lg border border-dashed border-gs-border
                           text-gs-text-muted hover:border-blue-500/40
                           hover:text-blue-500 transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
              >
                <Plus size={13} /> Add task
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


