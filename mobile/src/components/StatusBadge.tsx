import { Text, View } from 'react-native'
import type { TaskStatus } from '../types'

export const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'À faire',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminé',
}

const STATUS_STYLE: Record<TaskStatus, { wrap: string; text: string; dot: string }> = {
  TODO: { wrap: 'bg-slate-100 border border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' },
  IN_PROGRESS: {
    wrap: 'bg-amber-50 border border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  DONE: {
    wrap: 'bg-emerald-50 border border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const style = STATUS_STYLE[status]
  return (
    <View className={`flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1 ${style.wrap}`}>
      <View className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      <Text className={`font-medium text-xs ${style.text}`}>{STATUS_LABEL[status]}</Text>
    </View>
  )
}
