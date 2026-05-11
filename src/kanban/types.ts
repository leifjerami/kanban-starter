/**
 * Kanban Board Types
 * 
 * Customize the status values and card fields for your entity.
 */

export type ItemStatus = 'New' | 'Contacted' | 'Negotiating' | 'Won' | 'Lost'
// Examples:
// export type ItemStatus = 'Todo' | 'InProgress' | 'Review' | 'Done'
// export type ItemStatus = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected'

export interface ItemLink {
  label: string
  url: string
}

export type ActivityType = 'Call' | 'Email' | 'Meeting' | 'Note'

export interface Activity {
  id: string
  type: ActivityType
  date: string
  description: string
}

/**
 * The main entity — customize fields to match your domain.
 */
export interface Item {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: ItemStatus
  dealValue: number
  lastActivity: string
  notes: string
  links: ItemLink[]
  activities: Activity[]
}
