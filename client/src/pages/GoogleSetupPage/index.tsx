import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import { useUsernameSuggestions, RefreshIcon } from '../../hooks/useUsernameSuggestions'
import '../AuthPage/AuthPage.css'

export function GoogleSetupPage() {
  const [params] = useSearchParams()
  const { handleOAuthCallback } = useAuth()
  const navigate = useNavigate()

  const { username, isSpinning, isFetching, refreshError, refresh } = useUsernameSuggestions()
  const [firstName, setFirstName] = useState(params.get('firstName') ?? '')
  const [lastName, setLastName] = useState(params.get('lastName') ?? '')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const pendingToken = params.get('token')

  useEffect(() => {
    if (!pendingToken) navigate('/', { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const { token } = await apiFetch<{ token: string }>('/auth/google/complete', {
        method: 'POST',
        body: JSON.stringify({ pendingToken, username, firstName, lastName }),
      })
      await handleOAuthCallback(token)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__card">

        <div className="auth-page__header">
          <div className="auth-page__title-row">
            <h1 className="auth-page__title">One Last Thing!</h1>
            <span className="auth-page__badge">Almost!</span>
          </div>
          <p className="auth-page__subtitle">
            Pick a username for your cycling profile
          </p>
        </div>

        <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
          <div className="auth-page__field">
            <label className="auth-page__label">
              Username <span className="auth-page__required" aria-hidden="true">*</span>
              <span className="auth-page__label-hint"> · seen by all riders</span>
            </label>
            <div className="auth-page__input-wrap">
              <span className="auth-page__input-icon">
                <BikeIcon />
              </span>
              <span
                className={`auth-page__username-display${isFetching ? ' auth-page__username-display--loading' : ''}`}
                aria-live="polite"
                aria-label={isFetching ? 'Finding a username…' : `Suggested username: ${username}`}
              >
                {isFetching ? 'Finding your name…' : username}
              </span>
              <button
                type="button"
                className={`auth-page__username-refresh${isSpinning ? ' auth-page__username-refresh--spinning' : ''}`}
                onClick={refresh}
                disabled={isFetching}
                aria-label="Get a new username suggestion"
              >
                <RefreshIcon />
              </button>
            </div>
            {refreshError && <p className="auth-page__error">Couldn't get a new name — try again</p>}
          </div>

          <div className="auth-page__field">
            <label className="auth-page__label" htmlFor="firstName">
              First Name <span className="auth-page__optional">(optional)</span>
            </label>
            <div className="auth-page__input-wrap">
              <input
                id="firstName"
                className="auth-page__input"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
            </div>
          </div>

          <div className="auth-page__field">
            <label className="auth-page__label" htmlFor="lastName">
              Last Name <span className="auth-page__optional">(optional)</span>
            </label>
            <div className="auth-page__input-wrap">
              <input
                id="lastName"
                className="auth-page__input"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
              />
            </div>
          </div>

          {error && <p className="auth-page__error">{error}</p>}

          <button className="auth-page__submit" type="submit" disabled={isLoading || isFetching}>
            {isLoading ? 'Setting up...' : "Let's Ride!"}
          </button>
        </form>

        <div className="auth-page__tip">
          <span className="auth-page__tip-icon">
            <BikeIcon />
          </span>
          <p className="auth-page__tip-text">
            This is how other cyclists will know you on the map!
          </p>
        </div>

      </div>
    </div>
  )
}

function BikeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6h-5l-2 7h9l-2-7z" />
      <path d="M5.5 17.5L9 9" />
      <path d="M15 6l3.5 11.5" />
    </svg>
  )
}

