import { useState, useCallback, useRef } from 'react'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { Item, ItemStatus } from './types'
import { useItemsData } from './useItemsData'
import { useCardFields, CardFieldToggle } from './components/CardFields'
import { PipelineColumn } from './components/PipelineColumn'
import { ItemDetailModal } from './components/ItemDetailModal'

// ⚠️ Customize columns for your entity
const STATUS_COLUMNS: { status: ItemStatus; label: string; color: string }[] = [
  { status: 'New', label: 'New', color: 'blue' },
  { status: 'Contacted', label: 'Contacted', color: 'sky' },
  { status: 'Negotiating', label: 'Negotiating', color: 'amber' },
  { status: 'Won', label: 'Won', color: 'lime' },
  { status: 'Lost', label: 'Lost', color: 'stone' },
]

function reorder<T>(list: T[], from: number, to: number): T[] {
  const result = Array.from(list)
  const [removed] = result.splice(from, 1)
  result.splice(to, 0, removed)
  return result
}

export function ItemsPipeline() {
  const { items, loading, error, createItem, updateItem, deleteItem, clearError } = useItemsData()
  const { fields: cardFields, toggleField } = useCardFields()
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)

  // Local card order per column
  const [columnOrder, setColumnOrder] = useState<Record<string, string[]>>({})
  const initialized = useRef(false)

  const getOrderedItems = useCallback((status: ItemStatus): Item[] => {
    const filtered = items.filter(i => i.status === status)
    const order = columnOrder[status]
    if (order?.length) {
      const ordered = order.map(id => filtered.find(i => i.id === id)).filter(Boolean) as Item[]
      for (const i of filtered) { if (!order.includes(i.id)) ordered.unshift(i) }
      return ordered
    }
    return filtered
  }, [items, columnOrder])

  if (!initialized.current && items.length > 0) {
    const initial: Record<string, string[]> = {}
    for (const col of STATUS_COLUMNS) {
      initial[col.status] = items.filter(i => i.status === col.status).map(i => i.id)
    }
    setColumnOrder(initial)
    initialized.current = true
  }

  const handleDragEnd = useCallback((result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const sourceCol = source.droppableId
    const destCol = destination.droppableId

    if (sourceCol === destCol) {
      setColumnOrder(prev => ({ ...prev, [sourceCol]: reorder(prev[sourceCol] || [], source.index, destination.index) }))
    } else {
      const sourceIds = [...(columnOrder[sourceCol] || [])]
      const destIds = [...(columnOrder[destCol] || [])]
      sourceIds.splice(source.index, 1)
      destIds.splice(destination.index, 0, draggableId)
      setColumnOrder(prev => ({ ...prev, [sourceCol]: sourceIds, [destCol]: destIds }))
      updateItem(draggableId, { status: destCol as ItemStatus })
    }
  }, [columnOrder, updateItem])

  const handleCloseModal = () => { setSelectedItem(null); setIsCreating(false) }
  const handleCreateNew = () => { setIsCreating(true); setSelectedItem(null) }

  const handleCreate = async (item: Omit<Item, 'id' | 'activities' | 'lastActivity'>) => {
    setSaving(true)
    try {
      const newItem = await createItem(item)
      if (newItem) setColumnOrder(prev => ({ ...prev, [newItem.status]: [newItem.id, ...(prev[newItem.status] || [])] }))
      handleCloseModal()
    } catch {} finally { setSaving(false) }
  }

  const handleUpdate = async (id: string, updates: Partial<Item>) => {
    setSaving(true)
    try {
      await updateItem(id, updates)
      const updated = items.find(i => i.id === id)
      if (updated) setSelectedItem({ ...updated, ...updates })
    } catch {} finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    setSaving(true)
    try {
      await deleteItem(id)
      setColumnOrder(prev => {
        const next = { ...prev }
        for (const col of STATUS_COLUMNS) next[col.status] = (next[col.status] || []).filter(i => i !== id)
        return next
      })
      handleCloseModal()
    } catch {} finally { setSaving(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-stone-500 dark:text-stone-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300 flex-1">{error}</p>
          <button onClick={clearError} className="text-xs text-red-500 hover:text-red-700 font-medium">Dismiss</button>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-1">Items</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">{items.length} items in pipeline</p>
          </div>
          <div className="flex items-center gap-2">
            <CardFieldToggle fields={cardFields} onToggle={toggleField} />
            <button onClick={handleCreateNew}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm hover:shadow-md flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </button>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex overflow-x-auto pb-4">
          {STATUS_COLUMNS.map(({ status, label, color }) => {
            const columnItems = getOrderedItems(status)
            return (
              <div key={status} className="mr-4 last:mr-0">
                <PipelineColumn
                  droppableId={status}
                  label={label}
                  color={color}
                  items={columnItems}
                  totalValue={columnItems.reduce((sum, i) => sum + i.dealValue, 0)}
                  onCardClick={setSelectedItem}
                  visibleFields={cardFields}
                />
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {(selectedItem || isCreating) && (
        <ItemDetailModal
          item={selectedItem}
          isCreating={isCreating}
          saving={saving}
          onClose={handleCloseModal}
          onStatusChange={(s) => { if (selectedItem) handleUpdate(selectedItem.id, { status: s }) }}
          onUpdate={(u) => { if (selectedItem) handleUpdate(selectedItem.id, u) }}
          onActivityLog={(a) => { console.log('Log activity:', selectedItem?.id, a) }}
          onCreate={handleCreate}
          onDelete={() => { if (selectedItem) handleDelete(selectedItem.id) }}
        />
      )}
    </div>
  )
}
