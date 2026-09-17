import type { TaskStatus } from '../types'

export const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'À faire',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminé',
}

const STATUS_STYLE: Record<TaskStatus, string> = {
  TODO: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  DONE: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
}

const STATUS_DOT: Record<TaskStatus, string> = {
  TODO: 'bg-slate-400',
  IN_PROGRESS: 'bg-amber-500',
  DONE: 'bg-emerald-500',
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  )
}
