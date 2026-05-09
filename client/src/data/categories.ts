import type { Category } from '../types'

export const CATEGORIES: Category[] = [
  {
    id: 'hard-to-get-around',
    emoji: '🗺️',
    label: 'Tricky to Get Around',
    color: '#FFD600',
    subcategories: [
      { id: 'no-bike-parking', label: 'Nowhere to park my bike' },
      { id: 'path-blocked',    label: 'Path blocked or hard to follow' },
      { id: 'no-signs',        label: 'No signs to show the way' },
      { id: 'other',           label: 'Something else' },
    ],
  },
  {
    id: 'broken-or-missing',
    emoji: '🔧',
    label: 'Broken or Missing',
    color: '#7ED957',
    subcategories: [
      { id: 'broken-path',        label: 'Broken or bumpy path' },
      { id: 'lights-not-working', label: 'Lights not working' },
      { id: 'something-missing',  label: 'Something is missing or broken' },
      { id: 'other',              label: 'Something else' },
    ],
  },
  {
    id: 'felt-scary',
    emoji: '😨',
    label: 'Felt Scary',
    color: '#E74C3C',
    subcategories: [
      { id: 'scary-crossing',   label: 'Scary road crossing' },
      { id: 'traffic-too-close', label: 'Cars or people too close' },
      { id: 'hard-to-see',      label: 'Hard to see the path ahead' },
      { id: 'other',            label: 'Something else' },
    ],
  },
  {
    id: 'road-hazard',
    emoji: '⚠️',
    label: 'Road Hazard',
    color: '#FF6B35',
    subcategories: [
      { id: 'holes-or-cracks', label: 'Deep holes or cracks in the path' },
      { id: 'building-works',  label: 'Building works blocking the way' },
      { id: 'unsafe-design',   label: 'Unsafe road design' },
      { id: 'other',           label: 'Something else' },
    ],
  },
  {
    id: 'accident-or-close-call',
    emoji: '🚑',
    label: 'Accident or Close Call',
    color: '#5C799B',
    subcategories: [
      { id: 'accident',   label: 'I had an accident' },
      { id: 'close-call', label: 'Nearly had an accident' },
      { id: 'other',      label: 'Something else' },
    ],
  },
  {
    id: 'other',
    emoji: '❓',
    label: 'Other',
    color: '#2C3E6B',
  },
]
