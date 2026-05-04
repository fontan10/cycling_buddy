import { useState } from 'react'
import { apiFetch } from '../../lib/api'
import type { TeamMember } from '../../types'

export function MemberRow({ member, isCoach, isSelf, onRemove }: {
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
