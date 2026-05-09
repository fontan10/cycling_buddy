import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { StarIcon } from '../../components/Icons'
import './LeaderboardPage.css'

interface LeaderboardTeam {
  _id: string
  name: string
  photoUrl: string
  totalPoints: number
}

interface MyRank {
  rank: number
  team: LeaderboardTeam
}

// Module-level cache so leaderboard data survives React unmount/remount without
// a new network request. The data is intentionally app-lifetime scoped —
// call clearLeaderboardCache() after any action that changes team rankings.
let cachedTeams: LeaderboardTeam[] | null = null
let teamsPromise: Promise<LeaderboardTeam[]> | null = null
let cachedMyRank: MyRank | null | undefined = undefined // undefined = not yet fetched, null = no team

// Incremented on every cache clear so that in-flight promises from a previous
// fetch cycle can detect they are stale and skip writing to the cache.
let cacheVersion = 0

export function clearLeaderboardCache() {
  cacheVersion++
  cachedTeams = null
  teamsPromise = null
  cachedMyRank = undefined
}

function prefetchLeaderboard() {
  if (teamsPromise) return teamsPromise
  // Capture the version at the moment the request starts. If clearLeaderboardCache()
  // is called before this promise resolves, the version will have advanced and we
  // discard the now-stale response instead of repopulating the cleared cache.
  const v = cacheVersion
  teamsPromise = apiFetch<LeaderboardTeam[]>('/teams/leaderboard')
    .then(data => { if (cacheVersion === v) cachedTeams = data; return data })
    .catch(err => { teamsPromise = null; throw err })
  return teamsPromise
}

// Start prefetch as soon as this module is imported so the data is likely
// already in cache by the time the user navigates to the leaderboard.
prefetchLeaderboard()

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
  const { user } = useAuth()
  const [teams, setTeams]     = useState<LeaderboardTeam[]>(cachedTeams ?? [])
  const [myRank, setMyRank]   = useState<MyRank | null>(cachedMyRank ?? null)
  const [loading, setLoading] = useState(cachedTeams === null)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (cachedTeams !== null) return
    prefetchLeaderboard()
      .then(data => { setTeams(data); setLoading(false) })
      .catch(() => { setError('Could not load leaderboard.'); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!user) return
    if (cachedMyRank !== undefined) { setMyRank(cachedMyRank); return }
    apiFetch<{ rank?: number; team: LeaderboardTeam | null }>('/teams/my-rank')
      .then(data => {
        const rank = (data.team && data.rank) ? { rank: data.rank, team: data.team } : null
        cachedMyRank = rank
        setMyRank(rank)
      })
      .catch((err) => console.error('Failed to fetch team rank:', err))
  }, [user])

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
                        <StarIcon className="lb-star" fill="#E8A020" />
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
              {rest.map((team, i) => {
                const isMyTeam = myRank?.team._id === team._id
                return (
                  <div key={team._id} className={`lb-list-row${isMyTeam ? ' lb-list-row--mine' : ''}`}>
                    <span className="lb-list-rank">{i + 4}</span>
                    <TeamAvatar team={team} size={40} rank={i + 4} />
                    <span className="lb-list-name">{team.name}</span>
                    {isMyTeam && <span className="lb-you-chip">YOU</span>}
                    <span className="lb-list-pts">
                      {team.totalPoints.toLocaleString()}
                      <span className="lb-pts-label"> pts</span>
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {myRank && myRank.rank > 10 && (
            <div className="lb-my-team-section">
              <p className="lb-my-team-label">📍 Your Team</p>
              <div className="lb-my-team-row">
                <span className="lb-my-team-rank">#{myRank.rank}</span>
                <TeamAvatar team={myRank.team} size={40} rank={myRank.rank} />
                <span className="lb-list-name">{myRank.team.name}</span>
                <span className="lb-you-chip">YOU</span>
                <span className="lb-list-pts">
                  {myRank.team.totalPoints.toLocaleString()}
                  <span className="lb-pts-label"> pts</span>
                </span>
              </div>
            </div>
          )}
        </>
      )}

    </main>
  )
}
