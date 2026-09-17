import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Redirect } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import { createTask, deleteTask, getTasks, updateTask } from '@/services/taskService'
import type { Task, TaskStatus } from '@/types'
import { STATUS_LABEL, StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/Button'
import {
  IconClipboard,
  IconLogout,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@/components/icons'

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

export default function TasksScreen() {
  const { user, token, logout } = useAuth()
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

  const loadTasks = useCallback(async () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const stats = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'TODO').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      done: tasks.filter((t) => t.status === 'DONE').length,
    }),
    [tasks],
  )

  async function handleCreate() {
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

  async function handleUpdate(id: number) {
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

  if (!token) return <Redirect href="/login" />

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5">
        <View className="flex-row items-center gap-2.5">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
            <IconClipboard size={18} color="#ffffff" />
          </View>
          <Text className="font-extrabold text-lg text-slate-900">Task Manager</Text>
        </View>

        <View className="flex-row items-center gap-2.5">
          {user && (
            <View className="h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
              <Text className="font-semibold text-indigo-700 text-xs">
                {initials(user.name, user.email)}
              </Text>
            </View>
          )}
          <Pressable
            onPress={logout}
            className="flex-row items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 active:bg-red-50"
          >
            <IconLogout size={15} color="#dc2626" />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName="px-4 pb-10 pt-5"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <View className="mb-5 flex-row flex-wrap gap-3">
              <StatCard label="Total" value={stats.total} accent="bg-indigo-500" />
              <StatCard label={STATUS_LABEL.TODO} value={stats.todo} accent="bg-slate-400" />
              <StatCard
                label={STATUS_LABEL.IN_PROGRESS}
                value={stats.inProgress}
                accent="bg-amber-400"
              />
              <StatCard label={STATUS_LABEL.DONE} value={stats.done} accent="bg-emerald-400" />
            </View>

            <View className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
              <Text className="mb-3 font-semibold text-slate-700 text-sm">Nouvelle tâche</Text>
              <View className="gap-3">
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Titre de la tâche"
                  placeholderTextColor="#94a3b8"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 text-sm"
                />
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Description (optionnel)"
                  placeholderTextColor="#94a3b8"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 text-sm"
                />
                <Button
                  title="Ajouter"
                  onPress={handleCreate}
                  loading={creating}
                  icon={<IconPlus size={16} color="#ffffff" />}
                />
              </View>
            </View>

            <View className="mb-4 gap-3">
              <View className="flex-row items-center rounded-lg border border-slate-300 bg-white px-3">
                <IconSearch size={16} color="#94a3b8" />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  onSubmitEditing={loadTasks}
                  placeholder="Rechercher une tâche..."
                  placeholderTextColor="#94a3b8"
                  returnKeyType="search"
                  className="ml-2.5 flex-1 py-3 text-slate-900 text-sm"
                />
              </View>

              <View className="flex-row flex-wrap gap-1.5 rounded-lg bg-slate-100 p-1">
                {STATUS_FILTERS.map((f) => (
                  <Pressable
                    key={f.value}
                    onPress={() => setStatusFilter(f.value)}
                    className={`rounded-md px-3 py-1.5 ${
                      statusFilter === f.value ? 'bg-white shadow-sm' : ''
                    }`}
                  >
                    <Text
                      className={`font-medium text-xs ${
                        statusFilter === f.value ? 'text-indigo-700' : 'text-slate-500'
                      }`}
                    >
                      {f.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {error && (
              <View className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <Text className="text-red-700 text-sm">{error}</Text>
              </View>
            )}

            {loading && (
              <View className="items-center py-10">
                <ActivityIndicator color="#4f46e5" />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View className="items-center rounded-2xl border border-slate-300 border-dashed bg-white py-14">
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
                <IconClipboard size={22} color="#6366f1" />
              </View>
              <Text className="font-medium text-slate-700 text-sm">
                Aucune tâche pour l'instant
              </Text>
              <Text className="mt-1 text-slate-500 text-sm">
                Ajoutez votre première tâche à l'aide du formulaire ci-dessus.
              </Text>
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View className="h-2.5" />}
        renderItem={({ item: task }) =>
          editingId === task.id ? (
            <View className="overflow-hidden rounded-xl border border-indigo-300 bg-white p-4">
              <View className="gap-3">
                <TextInput
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Titre de la tâche"
                  placeholderTextColor="#94a3b8"
                  autoFocus
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 text-sm"
                />
                <TextInput
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Description (optionnel)"
                  placeholderTextColor="#94a3b8"
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 text-sm"
                />
                <View className="flex-row flex-wrap gap-1.5 rounded-lg bg-slate-100 p-1">
                  {(Object.entries(STATUS_LABEL) as [TaskStatus, string][]).map(
                    ([value, label]) => (
                      <Pressable
                        key={value}
                        onPress={() => setEditStatus(value)}
                        className={`rounded-md px-2.5 py-1.5 ${
                          editStatus === value ? 'bg-white shadow-sm' : ''
                        }`}
                      >
                        <Text
                          className={`font-medium text-xs ${
                            editStatus === value ? 'text-indigo-700' : 'text-slate-500'
                          }`}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    ),
                  )}
                </View>
                <View className="flex-row justify-end gap-2">
                  <Pressable
                    onPress={cancelEdit}
                    className="rounded-lg border border-slate-300 px-3 py-2 active:bg-slate-100"
                  >
                    <Text className="font-medium text-slate-600 text-xs">Annuler</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleUpdate(task.id)}
                    className="rounded-lg bg-indigo-600 px-3 py-2 active:bg-indigo-700"
                  >
                    <Text className="font-semibold text-white text-xs">Enregistrer</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            <View className="flex-row overflow-hidden rounded-xl border border-slate-200 bg-white">
              <View className={`w-1.5 ${STATUS_BAR[task.status]}`} />
              <View className="flex-1 gap-2 px-4 py-3.5">
                <View>
                  <Text className="font-medium text-slate-900">{task.title}</Text>
                  {task.description ? (
                    <Text numberOfLines={1} className="mt-1 text-slate-500 text-sm">
                      {task.description}
                    </Text>
                  ) : null}
                </View>
                <View className="flex-row items-center justify-between">
                  <StatusBadge status={task.status} />
                  <View className="flex-row gap-1">
                    <Pressable
                      onPress={() => startEdit(task)}
                      className="rounded-lg p-1.5 active:bg-indigo-50"
                    >
                      <IconPencil size={16} color="#6366f1" />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(task.id)}
                      className="rounded-lg p-1.5 active:bg-red-50"
                    >
                      <IconTrash size={16} color="#dc2626" />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          )
        }
      />
    </SafeAreaView>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <View className="w-[47%] flex-1 rounded-2xl border border-slate-200 bg-white p-4">
      <View className="flex-row items-center gap-2">
        <View className={`h-2 w-2 rounded-full ${accent}`} />
        <Text className="font-medium text-slate-500 text-xs">{label}</Text>
      </View>
      <Text className="mt-2 font-bold text-2xl text-slate-900">{value}</Text>
    </View>
  )
}
