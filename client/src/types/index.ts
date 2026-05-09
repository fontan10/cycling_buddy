export interface Subcategory {
  id: string
  label: string
}

export interface Reporter {
  _id: string
  username: string
  avatarUrl?: string
  isCoach: boolean
}

export interface Report {
  _id: string
  categoryId: string
  subcategoryId?: string
  address: string
  coords: { lat: number; lng: number }
  description: string
  photoUrl: string
  createdAt: string
  likeCount: number
  commentCount: number
  reporter?: Reporter | null
}

export interface Category {
  id: string
  emoji: string
  label: string
  color: string
  subcategories?: Subcategory[]
}

export type Tab = 'map' | 'report' | 'rankings'

export interface Team {
  _id: string
  name: string
  photoUrl: string
  teamCode: string
  createdAt: string
}

export interface TeamMember {
  _id: string
  role: 'coach' | 'member'
  joinedAt: string
  user: {
    _id: string
    username: string
    avatarUrl?: string
  }
}
