import type { Activity } from '../types'
import { Phone, Mail, Users, FileText, Clock } from 'lucide-react'

interface ActivityTimelineProps {
  activities: Activity[]
}

const typeConfig: Record<Activity['type'], { icon: typeof Phone; color: string; bg: string }> = {
  Call:    { icon: Phone,    color: 'text-blue-500 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-950/40' },
  Email:   { icon: Mail,     color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
  Meeting: { icon: Users,    color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40' },
  Note:    { icon: FileText, color: 'text-stone-500 dark:text-stone-400',  bg: 'bg-stone-50 dark:bg-stone-800' },
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-6 text-stone-400 dark:text-stone-500 text-sm">
        <Clock className="w-6 h-6 mx-auto mb-2 opacity-40" strokeWidth={1.5} />
        <p>No activities yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {activities.map((activity, index) => {
        const config = typeConfig[activity.type] || typeConfig.Note
        const Icon = config.icon

        return (
          <div key={activity.id} className="flex gap-3">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${config.color}`} strokeWidth={1.5} />
              </div>
              {index < activities.length - 1 && (
                <div className="w-px flex-1 bg-stone-200 dark:bg-stone-700/50 my-1 min-h-[8px]" />
              )}
            </div>

            {/* Activity content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                    {activity.type}
                  </span>
                  <p className="text-sm text-stone-700 dark:text-stone-300 mt-0.5 leading-relaxed">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-stone-400 dark:text-stone-500 shrink-0 whitespace-nowrap tabular-nums">
                  {formatDate(activity.date)}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
