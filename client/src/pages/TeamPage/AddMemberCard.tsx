import { useState } from 'react'
import { apiFetch } from '../../lib/api'
import type { TeamMember } from '../../types'

type SearchResult =
  | { found: false }
  | { found: true; available: false; reason: 'alreadyOnTeam' | 'cannotAddSelf' }
  | { found: true; available: true; user: { _id: string; username: string; avatarUrl?: string } }

export function AddMemberCard({ onAdded }: { onAdded: (member: TeamMember) => void }) {
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
