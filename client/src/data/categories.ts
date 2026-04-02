import type { Category } from '../types'

export const CATEGORIES: Category[] = [
  { id: 'pothole',      emoji: '🕳️', label: 'Pothole',        color: '#E74C3C' },
  { id: 'blocked-path', emoji: '🚧', label: 'Blocked Path',   color: '#FFD600' },
  { id: 'bike-parking', emoji: '🔧', label: 'Broken Parking', color: '#7ED957' },
  { id: 'lighting',     emoji: '💡', label: 'Poor Lighting',  color: '#38B6FF' },
  { id: 'unsafe-route', emoji: '⚠️', label: 'Unsafe Route',   color: '#5C799B' },
  { id: 'other',        emoji: '❓', label: 'Other',          color: '#2C3E6B' },
]
