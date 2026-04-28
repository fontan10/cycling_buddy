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
