import { useState } from 'react'
import { apiFetch } from '../../lib/api'

export function DangerZone({ onDissolved }: { onDissolved: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const [dissolving, setDissolving] = useState(false)
  const [dissolveError, setDissolveError] = useState('')

  async function handleDissolve() {
    setDissolving(true)
    setDissolveError('')
    try {
      await apiFetch('/teams/mine', { method: 'DELETE' })
      onDissolved()
    } catch (err) {
      setDissolveError(err instanceof Error ? err.message : 'Failed to dissolve team.')
      setDissolving(false)
    }
  }

  return (
    <div className="team-page__card team-page__danger-zone">
      <h2 className="team-page__section-title">Danger Zone</h2>
      {!confirming && (
        <button
          className="team-page__remove-btn"
          type="button"
          onClick={() => setConfirming(true)}
        >
          Dissolve Team
        </button>
      )}
      {confirming && (
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
              onClick={() => { setConfirming(false); setDissolveError('') }}
              disabled={dissolving}
            >
              Cancel
            </button>
          </span>
          {dissolveError && <p className="team-page__error">{dissolveError}</p>}
        </div>
      )}
    </div>
  )
}
