# Kanban Starter

A production-ready Trello-style kanban board for React + TypeScript + Tailwind CSS.

Built with [`@hello-pangea/dnd`](https://github.com/hello-pangea/dnd) (Atlassian's `react-beautiful-dnd` fork — the same engine that powers Trello).

## Features

- ✅ **Drag-and-drop** — cursor sticks to grab point, reorder within columns, cross-column drops
- ✅ **Optimistic updates** — instant UI, no loading flash, API fires in background
- ✅ **Field visibility toggle** — Trello-style card display options, persisted to localStorage
- ✅ **Links/URLs** — LinkedIn, website, portfolio, etc. stored as JSON
- ✅ **Dark mode** — full dark mode support via Tailwind
- ✅ **CRUD modal** — create, edit, delete with form validation
- ✅ **Activity timeline** — chronological interaction log

## Quick Start

### 1. Install dependency

```bash
npm install @hello-pangea/dnd
```

### 2. Copy the template

Copy `src/kanban/` into your project:

```
your-project/src/
└── pages/items/          # rename "items" to your entity
    ├── ItemsPipeline.tsx
    ├── useItemsData.ts
    ├── types.ts
    ├── index.ts
    └── components/
        ├── PipelineColumn.tsx
        ├── ItemCard.tsx
        ├── ItemDetailModal.tsx
        ├── ActivityTimeline.tsx
        ├── CardFields.tsx
        └── index.ts
```

### 3. Customize

Find and replace these placeholders with your entity:

| Placeholder | Example |
|------------|---------|
| `Item` (component names) | `Prospect`, `Task`, `Candidate` |
| `item` (variable names) | `prospect`, `task`, `candidate` |
| `Items` (display names) | `Prospects`, `Tasks`, `Candidates` |
| Column statuses in `types.ts` | `New, Contacted, Negotiating, Won, Lost` |
| Column colors in `ItemsPipeline.tsx` | `blue, sky, amber, lime, stone` |
| API paths in `useItemsData.ts` | Your API endpoints |
| Card fields in `CardFields.tsx` | Fields relevant to your entity |

### 4. Wire into your app

```tsx
// App.tsx
import { ItemsPipeline } from './pages/items/ItemsPipeline'

<Route path="/items" element={<ItemsPipeline />} />
```

### 5. Update your API

Make sure your backend has these endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/items` | List all items |
| POST | `/api/items` | Create item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

## Critical Rules

These are non-negotiable — violating them breaks drag-and-drop:

1. **No CSS transforms** on cards or any parent element
   - ❌ `hover:translate-y`, `scale-*`, `rotate-*`, `animate-*` with transform
   - ✅ `box-shadow` for hover effects, `border-color` transitions

2. **No CSS gap or space-y** for card/column spacing
   - ❌ `gap-4`, `space-y-2.5`
   - ✅ `margin-right` on column wrappers, `margin-bottom` on card wrappers

3. **No overflow scroll** on droppable containers
   - ❌ `overflow-y-auto` on the Droppable div
   - ✅ `overflow: visible`

4. **Never re-fetch** after mutations
   - ❌ `await api.update(); await api.list();`
   - ✅ Update local state instantly, fire API in background

## Architecture

```
ItemsPipeline.tsx      ← DragDropContext, columnOrder state, handlers
  └─ PipelineColumn    ← Droppable + Draggable wrappers
       └─ ItemCard     ← Pure presentational, no drag logic
```

The card component is **purely presentational** — all drag logic lives in the column wrapper. This separation is important for the drag-drop library to work correctly.

## Links/URLs Schema

Links are stored as a JSON TEXT column in your database:

```sql
ALTER TABLE items ADD COLUMN links TEXT;
```

Format: `[{"label":"LinkedIn","url":"https://linkedin.com/in/..."}]`

Available labels: LinkedIn, Website, Twitter, GitHub, Portfolio, Other

## API Hook Pattern

The `useItemsData` hook follows the optimistic update pattern:

```typescript
// Update: change local state instantly, fire API in background
const updateItem = async (id, updates) => {
  // 1. Optimistic update
  setState(prev => ({ items: prev.items.map(i => i.id === id ? { ...i, ...updates } : i) }))
  
  // 2. Fire API
  try {
    await api.update(id, updates)
    // No re-fetch! Local state is already correct.
  } catch {
    // Rollback on error
    setState(prev => ({ items: prev.items.map(i => i.id === id ? original : i) }))
  }
}
```

## License

MIT
