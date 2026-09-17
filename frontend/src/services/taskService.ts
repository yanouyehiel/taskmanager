import { api } from './api'
import type { Task, TaskStatus } from '../types'

export interface TaskFilters {
  status?: TaskStatus
  search?: string
}

export interface TaskRequest {
  title: string
  description: string
  status: TaskStatus
}

export async function getTasks(filters?: TaskFilters): Promise<Task[]> {
  const { data } = await api.get<Task[]>('/tasks', { params: filters })
  return data
}

export async function createTask(payload: Pick<Task, 'title' | 'description'>): Promise<Task> {
  const { data } = await api.post<Task>('/tasks', payload)
  return data
}

export async function updateTask(id: number, payload: TaskRequest): Promise<Task> {
  const { data } = await api.put<Task>(`/tasks/${id}`, payload)
  return data
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}`)
}
