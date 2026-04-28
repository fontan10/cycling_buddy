import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { isApiError } from '../../lib/api'
import { BottomNav } from '../../components/BottomNav'
import { useUsernameSuggestions, RefreshIcon } from '../../hooks/useUsernameSuggestions'
import './AuthPage.css'

type Tab = 'join' | 'login'

export function AuthPage() {
  const [tab, setTab] = useState<Tab>('join')
  const { username, isSpinning, isFetching, refreshError, refresh } = useUsernameSuggestions()
  const [email, setEmail] = useState('')
  const [teamCode, setTeamCode] = useState('')
  const [teamCodeError, setTeamCodeError] = useState('')
  const [loginField, setLoginField] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login, register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setTeamCodeError('')
    setIsLoading(true)
    try {
      if (tab === 'join') {
        await register(username, password, email || undefined, teamCode || undefined)
      } else {
        await login(loginField, password)
      }
      navigate('/')
    } catch (err: unknown) {
      if (isApiError(err) && err.field === 'teamCode') {
        setTeamCodeError(err.message)
      } else {
        setError(isApiError(err) ? err.message : 'Something went wrong')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__card">

        <button
          className="auth-page__close"
          aria-label="Back to home"
          onClick={() => navigate('/')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="auth-page__header">
          <div className="auth-page__title-row">
            <h1 className="auth-page__title">Join the Ride!</h1>
            <span className="auth-page__badge">Woohoo</span>
          </div>
          <p className="auth-page__subtitle">
            Help keep cyclists safe by reporting hazards on your routes
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="auth-page__tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'join'}
            className={`auth-page__tab ${tab === 'join' ? 'auth-page__tab--active' : ''}`}
            onClick={() => { setTab('join'); setError(''); setTeamCodeError('') }}
          >
            Join
          </button>
          <button
            role="tab"
            aria-selected={tab === 'login'}
            className={`auth-page__tab ${tab === 'login' ? 'auth-page__tab--active' : ''}`}
            onClick={() => { setTab('login'); setError(''); setTeamCodeError('') }}
          >
            Login
          </button>
        </div>

        {/* Google Button */}
        <button className="auth-page__google-btn" onClick={loginWithGoogle} type="button">
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="auth-page__divider">
          <span className="auth-page__divider-line" />
          <span className="auth-page__divider-text">or</span>
          <span className="auth-page__divider-line" />
        </div>

        {/* Form */}
        <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
          {tab === 'join' ? (
            <>
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
                <label className="auth-page__label" htmlFor="email">
                  Email <span className="auth-page__label-hint">(optional)</span>
                </label>
                <div className="auth-page__input-wrap">
                  <span className="auth-page__input-icon">
                    <MailIcon />
                  </span>
                  <input
                    id="email"
                    className="auth-page__input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-page__field">
                <label className="auth-page__label" htmlFor="teamCode">
                  Team Code <span className="auth-page__label-hint">(optional)</span>
                </label>
                <div className="auth-page__input-wrap">
                  <span className="auth-page__input-icon">
                    <GroupIcon />
                  </span>
                  <input
                    id="teamCode"
                    className="auth-page__input"
                    type="text"
                    placeholder="e.g. AB12CD"
                    value={teamCode}
                    onChange={(e) => {
                      setTeamCode(e.target.value.toUpperCase())
                      setTeamCodeError('')
                    }}
                    maxLength={6}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                {teamCodeError && <p className="auth-page__error">{teamCodeError}</p>}
              </div>
            </>
          ) : (
            <div className="auth-page__field">
              <label className="auth-page__label" htmlFor="loginField">
                Username or Email
              </label>
              <div className="auth-page__input-wrap">
                <span className="auth-page__input-icon">
                  <MailIcon />
                </span>
                <input
                  id="loginField"
                  className="auth-page__input"
                  type="text"
                  placeholder="coolrider42 or you@example.com"
                  value={loginField}
                  onChange={(e) => setLoginField(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>
          )}

          <div className="auth-page__field">
            <label className="auth-page__label" htmlFor="password">
              {tab === 'join' ? 'Secret Code' : 'Password'}
            </label>
            <div className="auth-page__input-wrap">
              <span className="auth-page__input-icon">
                <LockIcon />
              </span>
              <input
                id="password"
                className="auth-page__input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={tab === 'join' ? 'new-password' : 'current-password'}
              />
            </div>
          </div>

          {error && <p className="auth-page__error">{error}</p>}

          <button
            className="auth-page__submit"
            type="submit"
            disabled={isLoading || (tab === 'join' && isFetching)}
          >
            {isLoading
              ? 'Loading...'
              : tab === 'join'
                ? "Let's Ride!"
                : 'Hop Back On!'}
          </button>
        </form>

        {/* Tip */}
        {tab === 'join' && (
          <div className="auth-page__tip">
            <span className="auth-page__tip-icon">
              <BikeIcon />
            </span>
            <p className="auth-page__tip-text">
              Your username is visible to all riders on the map — tap the blue button to get a new one!
            </p>
          </div>
        )}

      </div>
      <BottomNav activeTab="report" onTabChange={(tab) => navigate('/', { state: { tab } })} />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.1c-.5 2.7-2.1 5-4.4 6.6v5.4h7.1c4.2-3.8 6.7-9.5 6.7-16z" />
      <path fill="#34A853" d="M24 46c6 0 11.1-2 14.8-5.4l-7.1-5.4c-2 1.3-4.5 2.1-7.7 2.1-5.9 0-10.9-4-12.7-9.3H4v5.6C7.7 41.5 15.3 46 24 46z" />
      <path fill="#FBBC05" d="M11.3 28c-.5-1.3-.7-2.6-.7-4s.3-2.7.7-4v-5.6H4C2.4 17.5 1.5 20.6 1.5 24s.9 6.5 2.5 9.6l7.3-5.6z" />
      <path fill="#EA4335" d="M24 10.7c3.3 0 6.3 1.1 8.6 3.4l6.4-6.4C34.9 4 29.9 2 24 2 15.3 2 7.7 6.5 4 13.4l7.3 5.6c1.8-5.3 6.8-8.3 12.7-8.3z" />
    </svg>
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

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function GroupIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

