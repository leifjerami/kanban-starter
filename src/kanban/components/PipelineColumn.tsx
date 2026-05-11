import { Droppable, Draggable } from '@hello-pangea/dnd'
import type { Item } from '../types'
import type { CardFields } from './CardFields'
import { ItemCard } from './ItemCard'
import { Plus } from 'lucide-react'

interface PipelineColumnProps {
  droppableId: string
  label: string
  color: string
  items: Item[]
  totalValue: number
  onCardClick: (item: Item) => void
  visibleFields?: CardFields
}

const colorMap: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  blue:   { bg: 'bg-blue-50/50 dark:bg-blue-950/20',   text: 'text-blue-700 dark:text-blue-300',   border: 'border-blue-200/60 dark:border-blue-800/60',   dot: 'bg-blue-500' },
  sky:    { bg: 'bg-sky-50/50 dark:bg-sky-950/20',      text: 'text-sky-700 dark:text-sky-300',     border: 'border-sky-200/60 dark:border-sky-800/60',     dot: 'bg-sky-500' },
  amber:  { bg: 'bg-amber-50/50 dark:bg-amber-950/20',  text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200/60 dark:border-amber-800/60', dot: 'bg-amber-500' },
  lime:   { bg: 'bg-lime-50/50 dark:bg-lime-950/20',    text: 'text-lime-700 dark:text-lime-300',   border: 'border-lime-200/60 dark:border-lime-800/60',   dot: 'bg-lime-500' },
  stone:  { bg: 'bg-stone-50/50 dark:bg-stone-800/20',  text: 'text-stone-600 dark:text-stone-400', border: 'border-stone-200/60 dark:border-stone-700/60', dot: 'bg-stone-400' },
}

const formatValue = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)

export function PipelineColumn({ droppableId, label, color, items, totalValue, onCardClick, visibleFields }: PipelineColumnProps) {
  const colors = colorMap[color] || colorMap.blue

  return (
    <div className={`w-72 shrink-0 rounded-2xl border flex flex-col ${colors.border} ${colors.bg}`}>
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
            <h3 className={`font-semibold text-sm ${colors.text}`}>{label}</h3>
            <span className={`text-xs tabular-nums font-medium px-1.5 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
              {items.length}
            </span>
          </div>
          <button className={`p-1 rounded-md ${colors.text} opacity-50 hover:opacity-100`}>
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
        {totalValue > 0 && (
          <div className={`text-xs ${colors.text} opacity-60 tabular-nums mt-1`}>{formatValue(totalValue)}</div>
        )}
      </div>

      {/* Droppable card area */}
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 px-3 pb-3 min-h-[80px] rounded-b-2xl transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''}`}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                  >
                    <div className="mb-2.5 last:mb-0">
                      <ItemCard item={item} onClick={() => onCardClick(item)} isDragging={snapshot.isDragging} visibleFields={visibleFields} />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {items.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center py-6 text-stone-400 dark:text-stone-600 text-xs">Drop cards here</div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
