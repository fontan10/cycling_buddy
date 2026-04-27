import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import { LockIcon, CheckIcon } from '../../components/Icons'

export function PasswordSection() {
  const { user } = useAuth()
  const isGoogleOnly = !!user?.googleId && !user?.email

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  if (isGoogleOnly) return null

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await apiFetch('/user/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="profile-page__card">
      <h2 className="profile-page__section-title">Change Password</h2>
      <form onSubmit={handleSave} className="profile-page__form">
        <div className="profile-page__field">
          <label className="profile-page__label" htmlFor="currentPassword">Current Password</label>
          <div className="profile-page__input-wrap">
            <span className="profile-page__input-icon"><LockIcon /></span>
            <input
              id="currentPassword"
              className="profile-page__input"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
        </div>

        <div className="profile-page__field">
          <label className="profile-page__label" htmlFor="newPassword">New Password</label>
          <div className="profile-page__input-wrap">
            <span className="profile-page__input-icon"><LockIcon /></span>
            <input
              id="newPassword"
              className="profile-page__input"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="profile-page__field">
          <label className="profile-page__label" htmlFor="confirmPassword">Confirm New Password</label>
          <div className="profile-page__input-wrap">
            <span className="profile-page__input-icon"><LockIcon /></span>
            <input
              id="confirmPassword"
              className="profile-page__input"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>

        {error && <p className="profile-page__error">{error}</p>}

        <button
          type="submit"
          className="profile-page__save-btn"
          disabled={loading || !currentPassword || !newPassword || !confirmPassword}
        >
          {saved ? <><CheckIcon /> Saved!</> : loading ? 'Saving…' : 'Change Password'}
        </button>
      </form>
    </section>
  )
}