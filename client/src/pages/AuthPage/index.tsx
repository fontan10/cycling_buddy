import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { isApiError } from '../../lib/api'
import { BottomNav } from '../../components/BottomNav'
import { useUsernameSuggestions } from '../../hooks/useUsernameSuggestions'
import { BikeIcon, CloseIcon, GoogleIcon, GroupIcon, LockIcon, MailIcon, RefreshIcon } from '../../components/Icons'
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
          <CloseIcon />
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



