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
  const [confirmingDissolve, setConfirmingDissolve] = useState(false)
  const [dissolving, setDissolving] = useState(false)
  const [dissolveError, setDissolveError] = useState('')

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

  function handleRemoveMember(id: string) {
    setMembers(prev => prev.filter(x => String(x._id) !== id))
  }

  async function handleDissolve() {
    setDissolving(true)
    setDissolveError('')
    try {
      await apiFetch('/teams/mine', { method: 'DELETE' })
      navigate('/profile')
    } catch (err) {
      setDissolveError(err instanceof Error ? err.message : 'Failed to dissolve team.')
      setDissolving(false)
    }
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

            {user?.isCoach && (
              <AddMemberCard onAdded={(newMember: TeamMember) => setMembers(prev => {
                const coaches = prev.filter(m => m.role === 'coach')
                const regular = prev.filter(m => m.role !== 'coach')
                return [...coaches, ...regular, newMember]
              })} />
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
                    onRemove={handleRemoveMember}
                  />
                ))}
              </ul>
            </div>

            {user?.isCoach && (
              <div className="team-page__card team-page__danger-zone">
                <h2 className="team-page__section-title">Danger Zone</h2>
                {!confirmingDissolve && (
                  <button
                    className="team-page__remove-btn"
                    type="button"
                    onClick={() => setConfirmingDissolve(true)}
                  >
                    Dissolve Team
                  </button>
                )}
                {confirmingDissolve && (
                  <div className="team-page__dissolve-confirm">
                    <p className="team-page__muted">This will permanently remove all members. This cannot be undone.</p>
                    <span className="team-page__remove-confirm">
                      <button
                        className="team-page__remove-btn team-page__remove-btn--confirm"
                        type="button"
                        onClick={handleDissolve}
                        disabled={dissolving}
                      >
                        {dissolving ? '…' : 'Confirm'}
                      </button>
                      <button
                        className="team-page__remove-btn team-page__remove-btn--cancel"
                        type="button"
                        onClick={() => { setConfirmingDissolve(false); setDissolveError('') }}
                        disabled={dissolving}
                      >
                        Cancel
                      </button>
                    </span>
                    {dissolveError && <p className="team-page__error">{dissolveError}</p>}
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

type SearchResult =
  | { found: false }
  | { found: true; available: false; reason: 'alreadyOnTeam' | 'cannotAddSelf' }
  | { found: true; available: true; user: { _id: string; username: string; avatarUrl?: string } }

function AddMemberCard({ onAdded }: { onAdded: (member: TeamMember) => void }) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  async function handleSearch() {
    if (!query.trim()) return
    setSearching(true)
    setResult(null)
    setAddError('')
    try {
      const data = await apiFetch<SearchResult>(`/teams/search-user?username=${encodeURIComponent(query.trim())}`)
      setResult(data)
    } catch {
      setResult({ found: false })
    } finally {
      setSearching(false)
    }
  }

  async function handleAdd(username: string) {
    setAdding(true)
    setAddError('')
    try {
      const data = await apiFetch<{ member: TeamMember }>('/teams/add-member', {
        method: 'POST',
        body: JSON.stringify({ username }),
      })
      onAdded(data.member)
      setQuery('')
      setResult(null)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Could not add member.')
    } finally {
      setAdding(false)
    }
  }

  function getResultError(): string {
    if (!result) return ''
    if (!result.found) return 'No user found with that username.'
    if (!result.available) {
      return result.reason === 'cannotAddSelf'
        ? 'You cannot add yourself to the team.'
        : 'This user is already on a team.'
    }
    return ''
  }
  const resultError = getResultError()

  return (
    <div className="team-page__card">
      <h2 className="team-page__section-title">Add Member</h2>
      <form
        className="team-page__add-form"
        onSubmit={e => { e.preventDefault(); handleSearch() }}
      >
        <input
          className="team-page__search-input"
          type="text"
          placeholder="Enter username"
          value={query}
          onChange={e => { setQuery(e.target.value); setResult(null); setAddError('') }}
          disabled={searching || adding}
          autoComplete="new-password"
          autoCapitalize="none"
        />
        <button
          className="team-page__btn"
          type="submit"
          disabled={searching || adding || !query.trim()}
        >
          {searching ? '…' : 'Search'}
        </button>
      </form>

      {resultError && <p className="team-page__error">{resultError}</p>}

      {result?.found && result.available && (
        <SearchResultRow
          user={result.user}
          adding={adding}
          onAdd={handleAdd}
        />
      )}

      {addError && <p className="team-page__error">{addError}</p>}
    </div>
  )
}

function SearchResultRow({ user, adding, onAdd }: {
  user: { _id: string; username: string; avatarUrl?: string }
  adding: boolean
  onAdd: (username: string) => void
}) {
  return (
    <div className="team-page__search-result">
      <div className="team-page__member-avatar">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.username} />
        ) : (
          <span>{user.username.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <span className="team-page__member-name">{user.username}</span>
      <button
        className="team-page__add-btn"
        type="button"
        onClick={() => onAdd(user.username)}
        disabled={adding}
      >
        {adding ? '…' : 'Add'}
      </button>
    </div>
  )
}

function MemberRow({ member, isCoach, isSelf, onRemove }: {
  member: TeamMember
  isCoach: boolean
  isSelf: boolean
  onRemove: (membershipId: string) => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [removeError, setRemoveError] = useState('')
  const initial = member.user.username.charAt(0).toUpperCase()
  const canRemove = isCoach && member.role !== 'coach' && !isSelf

  async function handleRemove() {
    setRemoving(true)
    setRemoveError('')
    try {
      await apiFetch(`/teams/members/${member._id}`, { method: 'DELETE' })
      onRemove(String(member._id))
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : 'Could not remove member.')
      setConfirming(false)
    } finally {
      setRemoving(false)
    }
  }

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
      {canRemove && !confirming && (
        <button
          className="team-page__remove-btn"
          type="button"
          onClick={() => setConfirming(true)}
        >
          Remove
        </button>
      )}
      {canRemove && confirming && (
        <span className="team-page__remove-confirm">
          <button
            className="team-page__remove-btn team-page__remove-btn--confirm"
            type="button"
            onClick={handleRemove}
            disabled={removing}
          >
            {removing ? '…' : 'Yes'}
          </button>
          <button
            className="team-page__remove-btn team-page__remove-btn--cancel"
            type="button"
            onClick={() => { setConfirming(false); setRemoveError('') }}
            disabled={removing}
          >
            Cancel
          </button>
        </span>
      )}
      {removeError && <p className="team-page__error">{removeError}</p>}
    </li>
  )
}
