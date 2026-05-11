import { useState } from 'react'
import { Settings2 } from 'lucide-react'

export interface CardFields {
  email: boolean
  phone: boolean
  dealValue: boolean
  lastActivity: boolean
  links: boolean
}

const DEFAULT_FIELDS: CardFields = {
  email: true,
  phone: true,
  dealValue: true,
  lastActivity: true,
  links: false,
}

// ⚠️ Change this key per entity: 'task-card-fields', 'candidate-card-fields', etc.
const STORAGE_KEY = 'item-card-fields'

export function useCardFields() {
  const [fields, setFields] = useState<CardFields>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return { ...DEFAULT_FIELDS, ...JSON.parse(saved) }
    } catch {}
    return DEFAULT_FIELDS
  })

  const toggleField = (key: keyof CardFields) => {
    setFields(prev => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return { fields, toggleField }
}

interface CardFieldToggleProps {
  fields: CardFields
  onToggle: (key: keyof CardFields) => void
}

const FIELD_LABELS: { key: keyof CardFields; label: string }[] = [
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'dealValue', label: 'Deal Value' },
  { key: 'lastActivity', label: 'Last Activity' },
  { key: 'links', label: 'Links' },
]

export function CardFieldToggle({ fields, onToggle }: CardFieldToggleProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        title="Card display options"
      >
        <Settings2 className="w-4 h-4" strokeWidth={1.5} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-lg p-3 min-w-[180px]">
            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2 px-1">
              Show on cards
            </p>
            {FIELD_LABELS.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700/50 cursor-pointer transition-colors">
                <input type="checkbox" checked={fields[key]} onChange={() => onToggle(key)}
                  className="w-3.5 h-3.5 rounded border-stone-300 dark:border-stone-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0" />
                <span className="text-sm text-stone-700 dark:text-stone-300">{label}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
