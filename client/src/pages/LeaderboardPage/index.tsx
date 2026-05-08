import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import './LeaderboardPage.css'

interface LeaderboardTeam {
  _id: string
  name: string
  photoUrl: string
  totalPoints: number
}

const RANK_COLORS = ['#E8A020', '#38B6FF', '#7ED957']
const RANK_BG     = ['rgba(232,160,32,0.15)', 'rgba(56,182,255,0.15)', 'rgba(126,217,87,0.15)']

function TeamAvatar({ team, size, rank }: { team: LeaderboardTeam; size: number; rank: number }) {
  const ringColor = rank <= 3 ? RANK_COLORS[rank - 1] : undefined
  const bgColor   = rank <= 3 ? RANK_BG[rank - 1]    : undefined
  const initial   = team.name.charAt(0).toUpperCase()

  if (team.photoUrl) {
    return (
      <img
        className="lb-avatar lb-avatar--photo"
        src={team.photoUrl}
        alt={team.name}
        style={{ width: size, height: size, boxShadow: ringColor ? `0 0 0 3px ${ringColor}` : undefined }}
      />
    )
  }
  return (
    <div
      className="lb-avatar lb-avatar--initial"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        backgroundColor: bgColor ?? 'var(--surface-cell)',
        boxShadow: ringColor ? `0 0 0 3px ${ringColor}` : undefined,
        color: ringColor ?? 'var(--text-muted)',
      }}
    >
      {initial}
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <div className="lb-rank-badge" style={{ background: RANK_COLORS[rank - 1] }}>
      {rank}
    </div>
  )
}

const SLOT_CONFIG = [
  { rank: 2, cls: 'lb-podium-slot--2nd' },
  { rank: 1, cls: 'lb-podium-slot--1st' },
  { rank: 3, cls: 'lb-podium-slot--3rd' },
]

export function LeaderboardPage() {
  const [teams, setTeams]   = useState<LeaderboardTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    apiFetch<LeaderboardTeam[]>('/teams/leaderboard')
      .then(setTeams)
      .catch(() => setError('Could not load leaderboard.'))
      .finally(() => setLoading(false))
  }, [])

  const top3 = teams.slice(0, 3)
  const rest  = teams.slice(3)

  return (
    <main className="lb-page">

      <div className="lb-header">
        <p className="lb-eyebrow">Global</p>
        <h1 className="lb-title">Rankings</h1>
      </div>

      {loading && <p className="lb-muted">Loading…</p>}

      {!loading && error && <p className="lb-error">{error}</p>}

      {!loading && !error && teams.length === 0 && (
        <div className="lb-empty">
          <span className="lb-empty-icon">🏆</span>
          <p className="lb-empty-title">No teams yet</p>
          <p className="lb-muted">Be the first to create a team and climb the rankings!</p>
        </div>
      )}

      {!loading && !error && teams.length > 0 && (
        <>
          <div className="lb-podium">
            {SLOT_CONFIG.map(({ rank, cls }) => {
              const team = top3[rank - 1]
              return (
                <div key={team?._id ?? `empty-${rank}`} className={`lb-podium-slot ${cls}`}>
                  {team && (
                    <>
                      {rank === 1 && (
                        <svg className="lb-star" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
                          <polygon
                            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                            fill="#E8A020"
                          />
                        </svg>
                      )}
                      <div className="lb-podium-avatar-wrap">
                        <TeamAvatar team={team} size={rank === 1 ? 72 : 56} rank={rank} />
                        <RankBadge rank={rank} />
                      </div>
                      <p className="lb-podium-name">{team.name}</p>
                      <p className="lb-podium-pts" style={{ color: RANK_COLORS[rank - 1] }}>
                        {team.totalPoints.toLocaleString()}
                        <span className="lb-pts-label"> pts</span>
                      </p>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {rest.length > 0 && (
            <div className="lb-list">
              {rest.map((team, i) => (
                <div key={team._id} className="lb-list-row">
                  <span className="lb-list-rank">{i + 4}</span>
                  <TeamAvatar team={team} size={40} rank={i + 4} />
                  <span className="lb-list-name">{team.name}</span>
                  <span className="lb-list-pts">
                    {team.totalPoints.toLocaleString()}
                    <span className="lb-pts-label"> pts</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

    </main>
  )
}
