import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { createTask, deleteTask, getTasks, updateTask } from '../services/taskService'
import type { Task, TaskStatus } from '../types'
import { STATUS_LABEL, StatusBadge } from '../components/StatusBadge'
import {
  IconClipboard,
  IconLogout,
  IconPencil,
  IconPlus,
  IconSearch,
  IconSpinner,
  IconTrash,
} from '../components/icons'

const STATUS_FILTERS: { value: TaskStatus | ''; label: string }[] = [
  { value: '', label: 'Toutes' },
  { value: 'TODO', label: STATUS_LABEL.TODO },
  { value: 'IN_PROGRESS', label: STATUS_LABEL.IN_PROGRESS },
  { value: 'DONE', label: STATUS_LABEL.DONE },
]

const STATUS_BAR: Record<TaskStatus, string> = {
  TODO: 'bg-slate-300',
  IN_PROGRESS: 'bg-amber-400',
  DONE: 'bg-emerald-400',
}

function initials(name?: string, email?: string) {
  const source = name?.trim() || email || '?'
  const parts = source.split(/[\s@.]+/).filter(Boolean)
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?'
}

export default function Tasks() {
  const { user, logout } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStatus, setEditStatus] = useState<TaskStatus>('TODO')

  async function loadTasks() {
    setLoading(true)
    setError(null)
    try {
      const data = await getTasks({
        search: search || undefined,
        status: statusFilter || undefined,
      })
      setTasks(data)
    } catch {
      setError('Impossible de charger les tâches.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const stats = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'TODO').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      done: tasks.filter((t) => t.status === 'DONE').length,
    }),
    [tasks],
  )

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    try {
      const newTask = await createTask({ title, description })
      setTasks((prev) => [newTask, ...prev])
      setTitle('')
      setDescription('')
    } catch {
      setError('Impossible de créer la tâche.')
    } finally {
      setCreating(false)
    }
  }

  function startEdit(task: Task) {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description ?? '')
    setEditStatus(task.status)
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function handleUpdate(e: FormEvent, id: number) {
    e.preventDefault()
    if (!editTitle.trim()) return
    try {
      const updated = await updateTask(id, {
        title: editTitle,
        description: editDescription,
        status: editStatus,
      })
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
      setEditingId(null)
    } catch {
      setError('Impossible de mettre à jour la tâche.')
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTask(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch {
      setError('Impossible de supprimer la tâche.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
              <IconClipboard className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Task Manager
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden items-center gap-2.5 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                  {initials(user.name, user.email)}
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-medium text-slate-900">
                    {user.name || 'Mon compte'}
                  </p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <IconLogout className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={stats.total} accent="bg-indigo-500" />
          <StatCard label={STATUS_LABEL.TODO} value={stats.todo} accent="bg-slate-400" />
          <StatCard
            label={STATUS_LABEL.IN_PROGRESS}
            value={stats.inProgress}
            accent="bg-amber-400"
          />
          <StatCard label={STATUS_LABEL.DONE} value={stats.done} accent="bg-emerald-400" />
        </div>

        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Nouvelle tâche</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Titre de la tâche"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
            <input
              type="text"
              placeholder="Description (optionnel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              disabled={creating}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? (
                <IconSpinner className="h-4 w-4 animate-spin" />
              ) : (
                <IconPlus className="h-4 w-4" />
              )}
              Ajouter
            </button>
          </div>
        </form>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadTasks()}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-slate-100 p-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  statusFilter === f.value
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-17.5 animate-pulse rounded-xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
              <IconClipboard className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-slate-700">Aucune tâche pour l'instant</p>
            <p className="mt-1 text-sm text-slate-500">
              Ajoutez votre première tâche à l'aide du formulaire ci-dessus.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {tasks.map((task) =>
              editingId === task.id ? (
                <li
                  key={task.id}
                  className="animate-fade-in-up overflow-hidden rounded-xl border border-indigo-300 bg-white shadow-sm ring-1 ring-indigo-100"
                >
                  <form onSubmit={(e) => handleUpdate(e, task.id)} className="flex flex-col gap-3 p-4">
                    <input
                      type="text"
                      placeholder="Titre de la tâche"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      required
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="Description (optionnel)"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 p-1">
                        {(Object.entries(STATUS_LABEL) as [TaskStatus, string][]).map(
                          ([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setEditStatus(value)}
                              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                                editStatus === value
                                  ? 'bg-white text-indigo-700 shadow-sm'
                                  : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              {label}
                            </button>
                          ),
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500"
                        >
                          Enregistrer
                        </button>
                      </div>
                    </div>
                  </form>
                </li>
              ) : (
                <li
                  key={task.id}
                  className="group flex items-start gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
                >
                  <span className={`h-full w-1.5 self-stretch shrink-0 ${STATUS_BAR[task.status]}`} />
                  <div className="flex flex-1 items-start justify-between gap-4 py-3.5 pr-4">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{task.title}</p>
                      {task.description && (
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={task.status} />
                      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                        <button
                          onClick={() => startEdit(task)}
                          aria-label="Modifier"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <IconPencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          aria-label="Supprimer"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${accent}`} />
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  )
}
