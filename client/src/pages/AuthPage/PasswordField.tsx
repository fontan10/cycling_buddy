import { LockIcon } from '../../components/Icons'

interface Props {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: 'new-password' | 'current-password'
}

export function PasswordField({ id, label, value, onChange, autoComplete }: Props) {
  return (
    <div className="auth-page__field">
      <label className="auth-page__label" htmlFor={id}>
        {label}
      </label>
      <div className="auth-page__input-wrap">
        <span className="auth-page__input-icon">
          <LockIcon />
        </span>
        <input
          id={id}
          className="auth-page__input"
          type="password"
          placeholder="••••••••"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          autoComplete={autoComplete}
        />
      </div>
    </div>
  )
}
