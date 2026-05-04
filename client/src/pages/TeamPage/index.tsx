import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import type { Team, TeamMember } from '../../types'
import { TeamHeader } from './TeamHeader'
import { AddMemberCard } from './AddMemberCard'
import { MemberRow } from './MemberRow'
import { DangerZone } from './DangerZone'
import './TeamPage.css'

export function TeamPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [team, setTeam] = useState<Team | null | undefined>(undefined)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) { navigate('/auth', { replace: true }); return }
    apiFetch<{ team: Team | null; members: TeamMember[] }>('/teams/mine/members')
      .then(({ team: t, members: m }) => {
        setTeam(t)
        const coaches = m.filter(x => x.role === 'coach')
        const rest = m.filter(x => x.role !== 'coach')
        setMembers([...coaches, ...rest])
      })
      .catch(() => setError('Could not load team members.'))
      .finally(() => setLoading(false))
  }, [user?._id])

  function handleMemberAdded(newMember: TeamMember) {
    setMembers(prev => {
      const coaches = prev.filter(m => m.role === 'coach')
      const regular = prev.filter(m => m.role !== 'coach')
      return [...coaches, ...regular, newMember]
    })
  }

  function handleMemberRemoved(id: string) {
    setMembers(prev => prev.filter(x => String(x._id) !== id))
  }

  return (
    <div className="team-page">
      <div className="team-page__inner">

        <header className="team-page__header">
          <button
            className="team-page__back"
            aria-label="Back to home"
            onClick={() => navigate('/')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="team-page__header-text">
            <p className="team-page__eyebrow">Roster</p>
            <h1 className="team-page__title">My Team</h1>
          </div>
        </header>

        {loading && (
          <p className="team-page__muted">Loading…</p>
        )}

        {!loading && error && (
          <p className="team-page__error">{error}</p>
        )}

        {!loading && !error && team === null && (
          <div className="team-page__card team-page__empty">
            <p className="team-page__empty-title">You're not on a team yet</p>
            <p className="team-page__muted">
              {user?.isCoach
                ? 'Create a team from your profile to get started.'
                : 'Ask your coach for a team code, then join from your profile.'}
            </p>
            <button className="team-page__btn" onClick={() => navigate('/profile')}>
              Go to Profile
            </button>
          </div>
        )}

        {!loading && !error && team && (
          <>
            <TeamHeader team={team} members={members} />

            {user?.isCoach && (
              <AddMemberCard onAdded={handleMemberAdded} />
            )}

            <div className="team-page__card">
              <h2 className="team-page__section-title">Roster</h2>
              <ul className="team-page__member-list">
                {members.map(m => (
                  <MemberRow
                    key={String(m._id)}
                    member={m}
                    isCoach={!!user?.isCoach}
                    isSelf={String(m.user._id) === String(user?._id)}
                    onRemove={handleMemberRemoved}
                  />
                ))}
              </ul>
            </div>

            {user?.isCoach && (
              <DangerZone onDissolved={() => navigate('/profile')} />
            )}
          </>
        )}

      </div>
    </div>
  )
}
