import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import imageCompression from 'browser-image-compression'
import { useAuth } from '../../context/AuthContext'
import type { User } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import type { Team } from '../../types'
import './ProfilePage.css'

function getCompressionOptions() {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  if (memory <= 1) return { maxSizeMB: 0.3, maxWidthOrHeight: 640,  useWebWorker: false, fileType: 'image/jpeg' }
  if (memory <= 2) return { maxSizeMB: 0.5, maxWidthOrHeight: 800,  useWebWorker: false, fileType: 'image/jpeg' }
  if (memory <= 4) return { maxSizeMB: 1.0, maxWidthOrHeight: 1024, useWebWorker: false, fileType: 'image/jpeg' }
  return               { maxSizeMB: 1.5, maxWidthOrHeight: 1280, useWebWorker: true,  fileType: 'image/jpeg' }
}

const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

const PersonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
)

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

export function ProfilePage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/auth', { replace: true })
  }, [user, navigate])

  // ── Profile section ──────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSaved, setProfileSaved] = useState(false)

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileError('')
    setProfileLoading(true)
    try {
      await apiFetch('/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ firstName, lastName }),
      })
      updateUser({ firstName, lastName })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2500)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setProfileLoading(false)
    }
  }

  // ── Avatar section ───────────────────────────────────────────────────────
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [avatarSaved, setAvatarSaved] = useState(false)

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    setAvatarFile(file)
    setAvatarPreview(file ? URL.createObjectURL(file) : null)
    e.target.value = ''
  }

  async function handleSaveAvatar(e: React.FormEvent) {
    e.preventDefault()
    if (!avatarFile) return
    setAvatarError('')
    setAvatarLoading(true)
    try {
      const compressed = await imageCompression(avatarFile, getCompressionOptions())
      const avatarUrl = await imageCompression.getDataUrlFromFile(compressed)
      const { user: updated } = await apiFetch<{ user: User }>('/user/avatar', {
        method: 'PUT',
        body: JSON.stringify({ avatarUrl }),
      })
      updateUser({ avatarUrl: updated?.avatarUrl ?? avatarUrl })
      URL.revokeObjectURL(avatarPreview!)
      setAvatarPreview(null)
      setAvatarFile(null)
      setAvatarSaved(true)
      setTimeout(() => setAvatarSaved(false), 2500)
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setAvatarLoading(false)
    }
  }

  // ── Team section ─────────────────────────────────────────────────────────
  const [team, setTeam] = useState<Team | null | undefined>(undefined)
  const [teamLoading, setTeamLoading] = useState(false)
  const [teamError, setTeamError] = useState('')
  const [teamName, setTeamName] = useState('')
  const [teamPhotoFile, setTeamPhotoFile] = useState<File | null>(null)
  const [teamPhotoPreview, setTeamPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.isCoach) return
    apiFetch<{ team: Team | null }>('/teams/mine')
      .then(({ team: t }) => setTeam(t))
      .catch(() => setTeam(null))
  }, [user?.isCoach])

  function handleTeamPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (teamPhotoPreview) URL.revokeObjectURL(teamPhotoPreview)
    setTeamPhotoFile(file)
    setTeamPhotoPreview(file ? URL.createObjectURL(file) : null)
    e.target.value = ''
  }

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault()
    if (!teamName.trim()) return
    setTeamError('')
    setTeamLoading(true)
    try {
      let photoUrl = ''
      if (teamPhotoFile) {
        const compressed = await imageCompression(teamPhotoFile, getCompressionOptions())
        photoUrl = await imageCompression.getDataUrlFromFile(compressed)
      }
      const { team: created } = await apiFetch<{ team: Team }>('/teams', {
        method: 'POST',
        body: JSON.stringify({ name: teamName.trim(), photoUrl }),
      })
      setTeam(created)
      setTeamName('')
      if (teamPhotoPreview) URL.revokeObjectURL(teamPhotoPreview)
      setTeamPhotoFile(null)
      setTeamPhotoPreview(null)
    } catch (err) {
      setTeamError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setTeamLoading(false)
    }
  }

  // ── Coach section ────────────────────────────────────────────────────────
  const [coachLoading, setCoachLoading] = useState(false)
  const [coachError, setCoachError] = useState('')

  async function handleBecomeCoach() {
    setCoachError('')
    setCoachLoading(true)
    try {
      const { user: updated } = await apiFetch<{ user: User }>('/user/become-coach', { method: 'POST' })
      updateUser({ isCoach: updated.isCoach })
    } catch (err) {
      setCoachError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setCoachLoading(false)
    }
  }

  async function handleResignCoach() {
    setCoachError('')
    setCoachLoading(true)
    try {
      const { user: updated } = await apiFetch<{ user: User }>('/user/resign-coach', { method: 'POST' })
      updateUser({ isCoach: updated.isCoach })
    } catch (err) {
      setCoachError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setCoachLoading(false)
    }
  }

  // ── Password section ─────────────────────────────────────────────────────
  const isGoogleOnly = !!user?.googleId && !user?.email
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    setPasswordLoading(true)
    try {
      await apiFetch('/user/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSaved(true)
      setTimeout(() => setPasswordSaved(false), 2500)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setPasswordLoading(false)
    }
  }

  const currentAvatar = avatarPreview ?? user?.avatarUrl ?? null

  return (
    <div className="profile-page">
      <div className="profile-page__inner">

        <header className="profile-page__header">
          <button
            className="profile-page__back"
            aria-label="Back to home"
            onClick={() => navigate('/')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="profile-page__header-text">
            <p className="profile-page__greeting">🚴 Keep it rolling, {user?.username}!</p>
            <h1 className="profile-page__title">Edit Profile</h1>
          </div>
        </header>

        {/* ── Avatar ── */}
        <section className="profile-page__card">
          <h2 className="profile-page__section-title">Profile Picture</h2>
          <form onSubmit={handleSaveAvatar} className="profile-page__avatar-form">
            <div className="profile-page__avatar-wrap">
              {currentAvatar ? (
                <img
                  className="profile-page__avatar-img"
                  src={currentAvatar}
                  alt="Profile"
                />
              ) : (
                <div className="profile-page__avatar-placeholder">
                  <PersonIcon />
                </div>
              )}
              <label className="profile-page__avatar-overlay" aria-label="Change profile picture">
                <CameraIcon />
                <input
                  type="file"
                  accept="image/*"
                  className="profile-page__file-input"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>

            {avatarPreview && (
              <p className="profile-page__avatar-hint">New photo selected — tap Save to apply</p>
            )}

            {avatarError && <p className="profile-page__error">{avatarError}</p>}

            <button
              type="submit"
              className="profile-page__save-btn"
              disabled={!avatarFile || avatarLoading}
            >
              {avatarSaved ? <><CheckIcon /> Saved!</> : avatarLoading ? 'Saving…' : 'Save Photo'}
            </button>
          </form>
        </section>

        {/* ── Name ── */}
        <section className="profile-page__card">
          <h2 className="profile-page__section-title">Change Name</h2>
          <form onSubmit={handleSaveProfile} className="profile-page__form">
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

            {profileError && <p className="profile-page__error">{profileError}</p>}

            <button
              type="submit"
              className="profile-page__save-btn"
              disabled={profileLoading || (firstName === (user?.firstName ?? '') && lastName === (user?.lastName ?? ''))}
            >
              {profileSaved ? <><CheckIcon /> Saved!</> : profileLoading ? 'Saving…' : 'Save Name'}
            </button>
          </form>
        </section>

        {/* ── Password (hidden for Google-only accounts) ── */}
        {!isGoogleOnly && (
          <section className="profile-page__card">
            <h2 className="profile-page__section-title">Change Password</h2>
            <form onSubmit={handleSavePassword} className="profile-page__form">
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

              {passwordError && <p className="profile-page__error">{passwordError}</p>}

              <button
                type="submit"
                className="profile-page__save-btn"
                disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
              >
                {passwordSaved ? <><CheckIcon /> Saved!</> : passwordLoading ? 'Saving…' : 'Change Password'}
              </button>
            </form>
          </section>
        )}

        {/* ── Coach Role ── */}
        <section className="profile-page__card">
          <h2 className="profile-page__section-title">Coach Role</h2>
          {user?.isCoach ? (
            <>
              <div className="profile-page__coach-badge">
                <ShieldIcon /> You are a coach
              </div>
              {coachError && <p className="profile-page__error">{coachError}</p>}
              <button
                className="profile-page__save-btn profile-page__save-btn--full profile-page__save-btn--danger"
                disabled={coachLoading}
                onClick={handleResignCoach}
              >
                {coachLoading ? 'Saving…' : 'Resign as Coach'}
              </button>
            </>
          ) : (
            <>
              <p className="profile-page__coach-desc">
                Coaches can create and manage a team. You can still submit reports as normal.
              </p>
              {coachError && <p className="profile-page__error">{coachError}</p>}
              <button
                className="profile-page__save-btn profile-page__save-btn--full"
                disabled={coachLoading}
                onClick={handleBecomeCoach}
              >
                {coachLoading ? 'Saving…' : 'Become a Coach'}
              </button>
            </>
          )}
        </section>

        {/* ── My Team (coach only) ── */}
        {user?.isCoach && (
          <section className="profile-page__card">
            <h2 className="profile-page__section-title">My Team</h2>

            {team === undefined && (
              <p className="profile-page__coach-desc">Loading…</p>
            )}

            {team === null && (
              <form onSubmit={handleCreateTeam} className="profile-page__form">
                <div className="profile-page__field">
                  <label className="profile-page__label" htmlFor="teamName">Team Name</label>
                  <div className="profile-page__input-wrap">
                    <input
                      id="teamName"
                      className="profile-page__input"
                      type="text"
                      placeholder="e.g. Weekend Warriors"
                      value={teamName}
                      onChange={e => setTeamName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="profile-page__field">
                  <label className="profile-page__label">Team Photo</label>
                  <div className="profile-page__team-photo-row">
                    <div className="profile-page__avatar-wrap">
                      {teamPhotoPreview ? (
                        <img className="profile-page__avatar-img" src={teamPhotoPreview} alt="Team photo preview" />
                      ) : (
                        <div className="profile-page__avatar-placeholder"><CameraIcon /></div>
                      )}
                      <label className="profile-page__avatar-overlay" aria-label="Choose team photo">
                        <CameraIcon />
                        <input type="file" accept="image/*" className="profile-page__file-input" onChange={handleTeamPhotoChange} />
                      </label>
                    </div>
                    <p className="profile-page__coach-desc">Optional — tap the circle to add a team photo.</p>
                  </div>
                </div>

                {teamError && <p className="profile-page__error">{teamError}</p>}

                <button
                  type="submit"
                  className="profile-page__save-btn profile-page__save-btn--full"
                  disabled={teamLoading || !teamName.trim()}
                >
                  {teamLoading ? 'Creating…' : 'Create Team'}
                </button>
              </form>
            )}

            {team && (
              <div className="profile-page__team-display">
                {team.photoUrl && (
                  <img className="profile-page__avatar-img" src={team.photoUrl} alt={team.name} />
                )}
                <p className="profile-page__team-name">{team.name}</p>
                <div className="profile-page__team-code-block">
                  <span className="profile-page__label">Team Code</span>
                  <span className="profile-page__team-code">{team.teamCode}</span>
                </div>
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  )
}
