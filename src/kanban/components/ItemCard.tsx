import type { Item } from '../types'
import type { CardFields } from './CardFields'

interface ItemCardProps {
  item: Item
  onClick?: () => void
  isDragging?: boolean
  visibleFields?: CardFields
}

function formatRelativeDate(dateString: string): string {
  if (!dateString) return 'No activity'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatValue = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)

const LINK_ICONS: Record<string, string> = {
  LinkedIn: 'in', Website: '🌐', Twitter: '𝕏', GitHub: 'GH', Portfolio: '📁', Other: '🔗',
}

export function ItemCard({ item, onClick, isDragging, visibleFields }: ItemCardProps) {
  const show = visibleFields || { email: true, phone: true, dealValue: true, lastActivity: true, links: false }
  const hasContact = (show.email && item.email) || (show.phone && item.phone)
  const hasFooter = show.dealValue || show.lastActivity
  const hasLinks = show.links && item.links?.length > 0

  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700
        p-3.5 cursor-grab active:cursor-grabbing group
        transition-[shadow,border-color] duration-200
        hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600
        ${isDragging ? 'shadow-xl ring-2 ring-blue-400/50' : ''}
      `}
    >
      {/* Header — always visible */}
      <div className="mb-2">
        <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {item.name}
        </h3>
        <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{item.company}</p>
      </div>

      {/* Contact — toggled */}
      {hasContact && (
        <div className="space-y-1 mb-2 text-xs text-stone-500 dark:text-stone-400">
          {show.email && item.email && (
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3 shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <span className="truncate">{item.email}</span>
            </div>
          )}
          {show.phone && item.phone && (
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3 shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              <span>{item.phone}</span>
            </div>
          )}
        </div>
      )}

      {/* Links — toggled */}
      {hasLinks && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {item.links.map((link, i) => (
            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-stone-100 dark:bg-stone-700 rounded text-[10px] font-medium text-stone-600 dark:text-stone-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title={link.url}
            >
              <span>{LINK_ICONS[link.label] || '🔗'}</span>
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      )}

      {/* Footer — toggled */}
      {hasFooter && (
        <div className="flex items-center justify-between pt-2.5 border-t border-stone-100 dark:border-stone-700/50">
          {show.dealValue ? (
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 tabular-nums">{formatValue(item.dealValue)}</span>
          ) : <span />}
          {show.lastActivity && (
            <span className="text-xs text-stone-400 dark:text-stone-500">{formatRelativeDate(item.lastActivity)}</span>
          )}
        </div>
      )}
    </div>
  )
}
