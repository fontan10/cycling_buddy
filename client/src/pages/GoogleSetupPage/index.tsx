import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiFetch, isApiError } from '../../lib/api'
import { useUsernameSuggestions } from '../../hooks/useUsernameSuggestions'
import { BikeIcon } from '../../components/Icons'
import { UsernameField } from '../AuthPage/UsernameField'
import { TeamCodeField } from '../AuthPage/TeamCodeField'
import '../AuthPage/AuthPage.css'

export function GoogleSetupPage() {
  const [params] = useSearchParams()
  const { handleOAuthCallback } = useAuth()
  const navigate = useNavigate()

  const { username, isSpinning, isFetching, refreshError, refresh } = useUsernameSuggestions()
  const [firstName, setFirstName] = useState(params.get('firstName') ?? '')
  const [lastName, setLastName] = useState(params.get('lastName') ?? '')
  const [teamCode, setTeamCode] = useState('')
  const [teamCodeError, setTeamCodeError] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const pendingToken = params.get('token')

  useEffect(() => {
    if (!pendingToken) navigate('/', { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setTeamCodeError('')
    setIsLoading(true)
    try {
      const { token } = await apiFetch<{ token: string }>('/auth/google/complete', {
        method: 'POST',
        body: JSON.stringify({ pendingToken, username, firstName, lastName, teamCode: teamCode || undefined }),
      })
      await handleOAuthCallback(token)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      if (isApiError(err) && err.field === 'teamCode') {
        setTeamCodeError(err.message)
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
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
          <UsernameField
            username={username}
            isSpinning={isSpinning}
            isFetching={isFetching}
            refresh={refresh}
            refreshError={refreshError}
          />

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

          <TeamCodeField
            value={teamCode}
            onChange={(v) => { setTeamCode(v); setTeamCodeError('') }}
            error={teamCodeError}
          />

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



