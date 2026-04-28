import { BikeIcon, RefreshIcon } from '../../components/Icons'

interface Props {
  username: string
  isSpinning: boolean
  isFetching: boolean
  refresh: () => void
  refreshError: boolean
}

export function UsernameField({ username, isSpinning, isFetching, refresh, refreshError }: Props) {
  return (
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
  )
}
