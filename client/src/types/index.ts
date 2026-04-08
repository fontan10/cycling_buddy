export interface Report {
  _id: string
  categoryId: string
  address: string
  coords: { lat: number; lng: number }
  description: string
  photoUrl: string
  createdAt: string
  likeCount: number
  commentCount: number
}

export interface Category {
  id: string
  emoji: string
  label: string
  color: string
}

export type Tab = 'map' | 'report' | 'badges'
