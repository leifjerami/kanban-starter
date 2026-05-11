import { useState, useEffect, useCallback } from 'react'
import type { Item, ItemStatus, ItemLink } from './types'

/**
 * API client — replace with your actual API module.
 * Expected methods:
 *   list()           → { items: Item[] }
 *   create(data)     → { item: Item }
 *   update(id, data) → { item: Item }
 *   delete(id)       → { success: boolean }
 */
const API_BASE = '/api/items'

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }
  return response.json()
}

// Temporary user ID — replace with your auth system
const USER_ID = 'user_dev'

// Status mapping — adjust if your API uses different casing
function apiToFrontendStatus(status: string): ItemStatus {
  const map: Record<string, ItemStatus> = {
    new: 'New', contacted: 'Contacted', negotiating: 'Negotiating', won: 'Won', lost: 'Lost',
    // Already correct casing
    New: 'New', Contacted: 'Contacted', Negotiating: 'Negotiating', Won: 'Won', Lost: 'Lost',
  }
  return map[status] || 'New'
}

function frontendToApiStatus(status: string): string {
  return status.toLowerCase()
}

function transformItem(p: any): Item {
  let links: ItemLink[] = []
  try { if (p.links) links = JSON.parse(p.links) } catch {}
  return {
    id: String(p.id),
    name: p.name,
    email: p.email || '',
    phone: p.phone || '',
    company: p.company || '',
    status: apiToFrontendStatus(p.status),
    dealValue: p.deal_value || 0,
    lastActivity: p.updated_at ? new Date(p.updated_at * 1000).toISOString() : new Date().toISOString(),
    notes: p.notes || '',
    links,
    activities: [],
  }
}

interface ItemsState {
  items: Item[]
  loading: boolean
  error: string | null
}

export function useItemsData() {
  const [state, setState] = useState<ItemsState>({
    items: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function load() {
      try {
        const result = await request<{ items: any[] }>('')
        setState({ items: result.items.map(transformItem), loading: false, error: null })
      } catch (err: any) {
        setState({ items: [], loading: false, error: err.message })
      }
    }
    load()
  }, [])

  const createItem = useCallback(async (data: Omit<Item, 'id' | 'activities' | 'lastActivity'>) => {
    try {
      const result = await request<{ item: any }>('', {
        method: 'POST',
        body: JSON.stringify({
          user_id: USER_ID,
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          status: frontendToApiStatus(data.status),
          notes: data.notes,
          deal_value: data.dealValue,
          links: data.links?.length > 0 ? JSON.stringify(data.links) : null,
        }),
      })
      const newItem = transformItem(result.item)
      setState(prev => ({ ...prev, items: [newItem, ...prev.items] }))
      return newItem
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }))
      throw err
    }
  }, [])

  const updateItem = useCallback(async (id: string, updates: Partial<Item>) => {
    // Optimistic: update local state instantly
    setState(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? { ...i, ...updates } : i),
    }))
    try {
      const current = state.items.find(i => i.id === id)
      if (!current) throw new Error('Not found')
      await request(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: updates.name ?? current.name,
          email: updates.email ?? current.email,
          phone: updates.phone ?? current.phone,
          company: updates.company ?? current.company,
          status: frontendToApiStatus(updates.status ?? current.status),
          notes: updates.notes ?? current.notes,
          deal_value: updates.dealValue ?? current.dealValue,
          links: updates.links ? JSON.stringify(updates.links) : current.links?.length > 0 ? JSON.stringify(current.links) : null,
        }),
      })
    } catch (err: any) {
      // Rollback
      setState(prev => ({
        ...prev,
        items: prev.items.map(i => i.id === id ? (state.items.find(o => o.id === id) || i) : i),
        error: err.message,
      }))
      throw err
    }
  }, [state.items])

  const deleteItem = useCallback(async (id: string) => {
    const removed = state.items.find(i => i.id === id)
    setState(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }))
    try {
      await request(`/${id}`, { method: 'DELETE' })
    } catch (err: any) {
      if (removed) {
        setState(prev => ({ ...prev, items: [...prev.items, removed], error: err.message }))
      }
      throw err
    }
  }, [state.items])

  const clearError = useCallback(() => setState(prev => ({ ...prev, error: null })), [])

  return { ...state, createItem, updateItem, deleteItem, clearError }
}
