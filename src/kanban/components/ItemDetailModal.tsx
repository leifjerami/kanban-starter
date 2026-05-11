import type { Item, Activity, ItemStatus, ActivityType, ItemLink } from '../types'
import { X, Mail, Phone, DollarSign, Edit2, Plus, Save, Trash2, Building2, StickyNote, Loader2, ExternalLink, Link2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { ActivityTimeline } from './ActivityTimeline'

interface ItemDetailModalProps {
  item: Item | null
  isCreating: boolean
  saving?: boolean
  onClose: () => void
  onStatusChange?: (newStatus: ItemStatus) => void
  onUpdate?: (updates: Partial<Item>) => void
  onActivityLog?: (activity: Omit<Activity, 'id'>) => void
  onCreate?: (item: Omit<Item, 'id' | 'activities' | 'lastActivity'>) => void
  onDelete?: () => void
}

const STATUS_OPTIONS: ItemStatus[] = ['New', 'Contacted', 'Negotiating', 'Won', 'Lost']
const ACTIVITY_TYPES: ActivityType[] = ['Call', 'Email', 'Meeting', 'Note']

const statusColorMap: Record<ItemStatus, { bg: string; text: string; dot: string }> = {
  New:         { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  Contacted:   { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', dot: 'bg-sky-500' },
  Negotiating: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  Won:         { bg: 'bg-lime-50 dark:bg-lime-950/40', text: 'text-lime-700 dark:text-lime-300', dot: 'bg-lime-500' },
  Lost:        { bg: 'bg-stone-100 dark:bg-stone-800', text: 'text-stone-600 dark:text-stone-400', dot: 'bg-stone-400' },
}

interface FormErrors {
  name?: string
  email?: string
}

export function ItemDetailModal({
  item,
  isCreating,
  saving = false,
  onClose,
  onStatusChange,
  onUpdate,
  onActivityLog,
  onCreate,
  onDelete,
}: ItemDetailModalProps) {
  const [isEditing, setIsEditing] = useState(isCreating)
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [newActivity, setNewActivity] = useState({ type: 'Note' as ActivityType, description: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    dealValue: 0,
    notes: '',
    status: 'New' as ItemStatus,
    links: [] as ItemLink[],
  })
  const modalRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Initialize form when item changes
  useEffect(() => {
    if (item) {
      setEditForm({
        name: item.name,
        email: item.email,
        phone: item.phone,
        company: item.company,
        dealValue: item.dealValue,
        notes: item.notes,
        status: item.status,
        links: item.links || [],
      })
    }
  }, [item])

  // Focus name input when creating
  useEffect(() => {
    if (isCreating && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [isCreating])

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!editForm.name.trim()) newErrors.name = 'Name is required'
    if (!editForm.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) newErrors.email = 'Invalid email format'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    if (isCreating && onCreate) {
      onCreate({
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        company: editForm.company,
        dealValue: editForm.dealValue,
        status: editForm.status,
        notes: editForm.notes,
        links: editForm.links,
      })
    } else if (item && onUpdate) {
      onUpdate(editForm)
      setIsEditing(false)
    }
  }

  const handleLogActivity = () => {
    if (!newActivity.description.trim()) return
    if (item && onActivityLog) {
      onActivityLog({
        type: newActivity.type,
        date: new Date().toISOString(),
        description: newActivity.description,
      })
      setNewActivity({ type: 'Note', description: '' })
      setShowActivityForm(false)
    }
  }

  const currentStatus = isEditing ? editForm.status : item?.status || 'New'
  const statusColors = statusColorMap[currentStatus]

  const formatValue = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: 'fadeInOverlay 0.2s ease-out' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              {isEditing ? (
                <div className="flex-1">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className={`text-2xl font-bold bg-transparent border-b-2 ${errors.name ? 'border-red-400' : 'border-blue-300 dark:border-blue-600'} focus:outline-none text-stone-900 dark:text-stone-100 w-full`}
                    placeholder="Item name *"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
              ) : (
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 truncate">
                  {item?.name}
                </h2>
              )}
              {/* Status badge */}
              <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                {currentStatus}
              </div>
            </div>
            {isEditing ? (
              <div className="flex items-center gap-2 mt-2">
                <Building2 className="w-4 h-4 text-stone-400" strokeWidth={1.5} />
                <input
                  type="text"
                  value={editForm.company}
                  onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                  className="text-sm bg-transparent border-b border-stone-300 dark:border-stone-600 focus:outline-none text-stone-500 dark:text-stone-400 flex-1"
                  placeholder="Company"
                />
              </div>
            ) : (
              <p className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                {item?.company}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors ml-4 shrink-0"
          >
            <X className="w-5 h-5 text-stone-400" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {/* Contact Info & Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                Contact Info
              </h3>
              <div className="space-y-2.5">
                {isEditing ? (
                  <>
                    <div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-stone-400 shrink-0" strokeWidth={1.5} />
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                          className={`w-full px-2 py-1.5 border-b ${errors.email ? 'border-red-400' : 'border-stone-200 dark:border-stone-700'} bg-transparent text-stone-900 dark:text-stone-100 text-sm focus:outline-none`}
                          placeholder="Email *"
                        />
                      </div>
                      {errors.email && <p className="text-xs text-red-500 ml-6 mt-0.5">{errors.email}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-stone-400 shrink-0" strokeWidth={1.5} />
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-2 py-1.5 border-b border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-stone-100 text-sm focus:outline-none"
                        placeholder="Phone"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                      <Mail className="w-4 h-4 text-stone-400 shrink-0" strokeWidth={1.5} />
                      <span>{item?.email}</span>
                    </div>
                    {item?.phone && (
                      <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                        <Phone className="w-4 h-4 text-stone-400 shrink-0" strokeWidth={1.5} />
                        <span>{item.phone}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                Details
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-blue-500 shrink-0" strokeWidth={2} />
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.dealValue}
                      onChange={e => setEditForm({ ...editForm, dealValue: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 border-b border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-stone-100 text-sm focus:outline-none tabular-nums"
                      placeholder="Deal value"
                    />
                  ) : (
                    <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                      {formatValue(item?.dealValue || 0)}
                    </span>
                  )}
                </div>
                {/* Status dropdown (view mode) */}
                {!isEditing && item && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-stone-400">Status</span>
                    <select
                      value={item.status}
                      onChange={e => onStatusChange?.(e.target.value as ItemStatus)}
                      className="px-2 py-1 border border-stone-200 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Status (edit mode) */}
                {isEditing && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-stone-400">Status</span>
                    <select
                      value={editForm.status}
                      onChange={e => setEditForm({ ...editForm, status: e.target.value as ItemStatus })}
                      className="px-2 py-1 border border-stone-200 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Links */}
          {(isEditing || (item?.links && item.links.length > 0)) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Links
                </h3>
                {isEditing && (
                  <button
                    onClick={() => setEditForm({
                      ...editForm,
                      links: [...editForm.links, { label: 'LinkedIn', url: '' }],
                    })}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" strokeWidth={2} />
                    Add link
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  {editForm.links.map((link, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select
                        value={link.label}
                        onChange={e => {
                          const newLinks = [...editForm.links]
                          newLinks[i] = { ...newLinks[i], label: e.target.value }
                          setEditForm({ ...editForm, links: newLinks })
                        }}
                        className="px-2 py-1.5 border border-stone-200 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:outline-none w-28 shrink-0"
                      >
                        <option>LinkedIn</option>
                        <option>Website</option>
                        <option>Twitter</option>
                        <option>GitHub</option>
                        <option>Portfolio</option>
                        <option>Other</option>
                      </select>
                      <input
                        type="url"
                        value={link.url}
                        onChange={e => {
                          const newLinks = [...editForm.links]
                          newLinks[i] = { ...newLinks[i], url: e.target.value }
                          setEditForm({ ...editForm, links: newLinks })
                        }}
                        placeholder="https://..."
                        className="flex-1 px-2 py-1.5 border-b border-stone-200 dark:border-stone-700 bg-transparent text-stone-900 dark:text-stone-100 text-sm focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          setEditForm({
                            ...editForm,
                            links: editForm.links.filter((_, j) => j !== i),
                          })
                        }}
                        className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                  {editForm.links.length === 0 && (
                    <p className="text-xs text-stone-400 italic">No links added</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {item?.links?.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
                    >
                      <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" strokeWidth={1.5} />
                      <span className="font-medium">{link.label}</span>
                      <span className="text-stone-400 dark:text-stone-500 truncate text-xs">
                        {link.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {(item?.notes || isEditing) && (
            <div>
              <h3 className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5" strokeWidth={1.5} />
                Notes
              </h3>
              {isEditing ? (
                <textarea
                  value={editForm.notes}
                  onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none"
                  placeholder="Add notes..."
                />
              ) : (
                <p className="text-sm text-stone-600 dark:text-stone-400 whitespace-pre-wrap leading-relaxed">
                  {item?.notes || <span className="text-stone-400 italic">No notes</span>}
                </p>
              )}
            </div>
          )}

          {/* Activity Timeline */}
          {!isCreating && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                  Activity Timeline
                </h3>
                {!showActivityForm && (
                  <button
                    onClick={() => setShowActivityForm(true)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" strokeWidth={2} />
                    Log Activity
                  </button>
                )}
              </div>

              <ActivityTimeline activities={item?.activities || []} />

              {/* Log New Activity Form */}
              {showActivityForm && (
                <div className="mt-4 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 space-y-3">
                  <div className="flex gap-1.5">
                    {ACTIVITY_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => setNewActivity({ ...newActivity, type })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          newActivity.type === type
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-600 border border-stone-200 dark:border-stone-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={newActivity.description}
                    onChange={e => setNewActivity({ ...newActivity, description: e.target.value })}
                    placeholder="Describe the interaction..."
                    className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleLogActivity}
                      disabled={!newActivity.description.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Save Activity
                    </button>
                    <button
                      onClick={() => setShowActivityForm(false)}
                      className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <div>
            {!isCreating && !isEditing && onDelete && (
              <button
                onClick={() => {
                  if (confirm('Delete this item?')) {
                    onDelete()
                  }
                }}
                className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                {!isCreating && (
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setErrors({})
                      if (item) {
                        setEditForm({
                          name: item.name,
                          email: item.email,
                          phone: item.phone,
                          company: item.company,
                          dealValue: item.dealValue,
                          notes: item.notes,
                          status: item.status,
                        })
                      }
                    }}
                    className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" strokeWidth={2} />}
                  {saving ? 'Saving...' : isCreating ? 'Create Item' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
