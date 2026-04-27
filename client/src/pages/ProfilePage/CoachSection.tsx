import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import type { User } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import { ShieldIcon } from '../../components/Icons'

export function CoachSection() {
  const { user, updateUser } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleBecomeCoach() {
    setError('')
    setLoading(true)
    try {
      const { user: updated } = await apiFetch<{ user: User }>('/user/become-coach', { method: 'POST' })
      updateUser({ isCoach: updated.isCoach })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleResignCoach() {
    setError('')
    setLoading(true)
    try {
      const { user: updated } = await apiFetch<{ user: User }>('/user/resign-coach', { method: 'POST' })
      updateUser({ isCoach: updated.isCoach })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="profile-page__card">
      <h2 className="profile-page__section-title">Coach Role</h2>
      {user?.isCoach ? (
        <>
          <div className="profile-page__coach-badge">
            <ShieldIcon /> You are a coach
          </div>
          {error && <p className="profile-page__error">{error}</p>}
          <button
            className="profile-page__save-btn profile-page__save-btn--full profile-page__save-btn--danger"
            disabled={loading}
            onClick={handleResignCoach}
          >
            {loading ? 'Saving…' : 'Resign as Coach'}
          </button>
        </>
      ) : (
        <>
          <p className="profile-page__coach-desc">
            Coaches can create and manage a team. You can still submit reports as normal.
          </p>
          {error && <p className="profile-page__error">{error}</p>}
          <button
            className="profile-page__save-btn profile-page__save-btn--full"
            disabled={loading}
            onClick={handleBecomeCoach}
          >
            {loading ? 'Saving…' : 'Become a Coach'}
          </button>
        </>
      )}
    </section>
  )
}