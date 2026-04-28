import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import type { Team, TeamMember } from '../../types'
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

  const coaches = members.filter(m => m.role === 'coach')
  const regularMembers = members.filter(m => m.role === 'member')

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
            <button
              className="team-page__btn"
              onClick={() => navigate('/profile')}
            >
              Go to Profile
            </button>
          </div>
        )}

        {!loading && !error && team && (
          <>
            <div className="team-page__card team-page__team-header">
              {team.photoUrl && (
                <img
                  className="team-page__team-photo"
                  src={team.photoUrl}
                  alt={team.name}
                />
              )}
              <div className="team-page__team-info">
                <p className="team-page__team-name">{team.name}</p>
                <p className="team-page__member-count">
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </p>
              </div>
            </div>

            <div className="team-page__card">
              <h2 className="team-page__section-title">Roster</h2>
              <ul className="team-page__member-list">
                {coaches.map(m => (
                  <MemberRow key={String(m._id)} member={m} />
                ))}
                {regularMembers.map(m => (
                  <MemberRow key={String(m._id)} member={m} />
                ))}
              </ul>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

function MemberRow({ member }: { member: TeamMember }) {
  const initial = member.user.username.charAt(0).toUpperCase()

  return (
    <li className="team-page__member-row">
      <div className="team-page__member-avatar">
        {member.user.avatarUrl ? (
          <img src={member.user.avatarUrl} alt={member.user.username} />
        ) : (
          <span>{initial}</span>
        )}
      </div>
      <span className="team-page__member-name">{member.user.username}</span>
      <span className={`team-page__role-badge team-page__role-badge--${member.role}`}>
        {member.role === 'coach' ? 'Coach' : 'Member'}
      </span>
    </li>
  )
}