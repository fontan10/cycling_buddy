import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { useAuth } from '../../context/AuthContext'
import type { User } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import { getCompressionOptions } from '../../lib/imageCompression'
import { CameraIcon, PersonIcon, CheckIcon } from '../../components/Icons'

export function AvatarSection() {
  const { user, updateUser } = useAuth()

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

  const currentAvatar = avatarPreview ?? user?.avatarUrl ?? null

  return (
    <section className="profile-page__card">
      <h2 className="profile-page__section-title">Profile Picture</h2>
      <form onSubmit={handleSaveAvatar} className="profile-page__avatar-form">
        <div className="profile-page__avatar-wrap">
          {currentAvatar ? (
            <img className="profile-page__avatar-img" src={currentAvatar} alt="Profile" />
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
  )
}