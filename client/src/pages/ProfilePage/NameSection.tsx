import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import { PersonIcon, CheckIcon } from '../../components/Icons'

export function NameSection() {
  const { user, updateUser } = useAuth()

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiFetch('/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ firstName, lastName }),
      })
      updateUser({ firstName, lastName })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const unchanged = firstName === (user?.firstName ?? '') && lastName === (user?.lastName ?? '')

  return (
    <section className="profile-page__card">
      <h2 className="profile-page__section-title">Change Name</h2>
      <form onSubmit={handleSave} className="profile-page__form">
        <div className="profile-page__field">
          <label className="profile-page__label" htmlFor="firstName">First Name</label>
          <div className="profile-page__input-wrap">
            <span className="profile-page__input-icon"><PersonIcon /></span>
            <input
              id="firstName"
              className="profile-page__input"
              type="text"
              placeholder="Your first name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              autoComplete="given-name"
            />
          </div>
        </div>

        <div className="profile-page__field">
          <label className="profile-page__label" htmlFor="lastName">Last Name</label>
          <div className="profile-page__input-wrap">
            <span className="profile-page__input-icon"><PersonIcon /></span>
            <input
              id="lastName"
              className="profile-page__input"
              type="text"
              placeholder="Your last name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              autoComplete="family-name"
            />
          </div>
        </div>

        {error && <p className="profile-page__error">{error}</p>}

        <button
          type="submit"
          className="profile-page__save-btn"
          disabled={loading || unchanged}
        >
          {saved ? <><CheckIcon /> Saved!</> : loading ? 'Saving…' : 'Save Name'}
        </button>
      </form>
    </section>
  )
}