import { useState } from 'react'
import { apiFetch } from '../../lib/api'
import type { TeamMember } from '../../types'

export function MemberRow({ member, isCoach, isSelf, onRemove, onRoleChange }: {
  member: TeamMember
  isCoach: boolean
  isSelf: boolean
  onRemove: (membershipId: string) => void
  onRoleChange: (membershipId: string, newRole: 'coach' | 'member') => void
}) {
  const [open, setOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'role' | 'remove' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const initial = member.user.username.charAt(0).toUpperCase()
  const canRemove = isCoach && member.role !== 'coach' && !isSelf
  const canChangeRole = isCoach && !isSelf
  const hasActions = canRemove || canChangeRole
  const newRole: 'coach' | 'member' = member.role === 'coach' ? 'member' : 'coach'

  function handleClose() {
    setOpen(false)
    setConfirmAction(null)
    setError('')
  }

  async function handleRemove() {
    setLoading(true)
    setError('')
    try {
      await apiFetch(`/teams/members/${member._id}`, { method: 'DELETE' })
      onRemove(String(member._id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove member.')
      setConfirmAction(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleChange() {
    setLoading(true)
    setError('')
    try {
      await apiFetch(`/teams/members/${member._id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      })
      onRoleChange(String(member._id), newRole)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change role.')
      setConfirmAction(null)
    } finally {
      setLoading(false)
    }
  }

  const confirmVariant =
    confirmAction === 'remove'
      ? 'remove-confirm'
      : newRole === 'coach'
        ? 'promote'
        : 'demote'

  return (
    <li className="team-page__member-row">
      <div className="team-page__member-main">
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
        {hasActions && (
          <button
            className={`team-page__more-btn${open ? ' team-page__more-btn--open' : ''}`}
            type="button"
            aria-label={open ? 'Close actions' : 'More actions'}
            onClick={() => (open ? handleClose() : setOpen(true))}
          >
            {open ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="1" y1="1" x2="11" y2="11" />
                <line x1="11" y1="1" x2="1" y2="11" />
              </svg>
            ) : (
              <svg width="16" height="4" viewBox="0 0 16 4" fill="currentColor" aria-hidden="true">
                <circle cx="2" cy="2" r="1.5" />
                <circle cx="8" cy="2" r="1.5" />
                <circle cx="14" cy="2" r="1.5" />
              </svg>
            )}
          </button>
        )}
      </div>

      {open && (
        <div className="team-page__member-actions">
          {confirmAction === null ? (
            <>
              {canChangeRole && (
                <button
                  className={`team-page__action-btn team-page__action-btn--${newRole === 'coach' ? 'promote' : 'demote'}`}
                  type="button"
                  onClick={() => setConfirmAction('role')}
                >
                  {member.role === 'coach' ? 'Demote to Member' : 'Promote to Coach'}
                </button>
              )}
              {canRemove && (
                <button
                  className="team-page__action-btn team-page__action-btn--remove"
                  type="button"
                  onClick={() => setConfirmAction('remove')}
                >
                  Remove from Team
                </button>
              )}
            </>
          ) : (
            <div className="team-page__confirm-row">
              <button
                className={`team-page__action-btn team-page__action-btn--${confirmVariant}`}
                type="button"
                onClick={confirmAction === 'role' ? handleRoleChange : handleRemove}
                disabled={loading}
              >
                {loading ? '…' : 'Yes, confirm'}
              </button>
              <button
                className="team-page__action-btn team-page__action-btn--cancel"
                type="button"
                onClick={() => { setConfirmAction(null); setError('') }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          )}
          {error && <p className="team-page__error">{error}</p>}
        </div>
      )}
    </li>
  )
}
