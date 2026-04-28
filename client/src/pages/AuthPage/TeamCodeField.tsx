import { GroupIcon } from '../../components/Icons'

interface Props {
  value: string
  onChange: (value: string) => void
  error: string
}

export function TeamCodeField({ value, onChange, error }: Props) {
  return (
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
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          maxLength={6}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      {error && <p className="auth-page__error">{error}</p>}
    </div>
  )
}
