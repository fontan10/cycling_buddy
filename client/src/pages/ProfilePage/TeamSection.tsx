import { useState, useEffect } from 'react'
import imageCompression from 'browser-image-compression'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import { getCompressionOptions } from '../../lib/imageCompression'
import { CameraIcon } from '../../components/Icons'
import type { Team } from '../../types'

export function TeamSection() {
  const { user } = useAuth()

  const [team, setTeam] = useState<Team | null | undefined>(undefined)
  const [teamLoading, setTeamLoading] = useState(false)
  const [teamError, setTeamError] = useState('')
  const [teamName, setTeamName] = useState('')
  const [teamPhotoFile, setTeamPhotoFile] = useState<File | null>(null)
  const [teamPhotoPreview, setTeamPhotoPreview] = useState<string | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState('')

  useEffect(() => {
    if (!user) return
    apiFetch<{ team: Team | null }>('/teams/mine')
      .then(({ team: t }) => setTeam(t))
      .catch(() => setTeam(null))
  }, [user?._id])

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

  async function handleJoinTeam(e: React.FormEvent) {
    e.preventDefault()
    setJoinError('')
    setJoinLoading(true)
    try {
      const { team: joined } = await apiFetch<{ team: Team }>('/teams/join', {
        method: 'POST',
        body: JSON.stringify({ teamCode: joinCode.trim() }),
      })
      setTeam(joined)
      setJoinCode('')
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setJoinLoading(false)
    }
  }

  return (
    <section className="profile-page__card">
      <h2 className="profile-page__section-title">My Team</h2>

      {team === undefined && (
        <p className="profile-page__coach-desc">Loading…</p>
      )}

      {team === null && user?.isCoach && (
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

      {team === null && !user?.isCoach && (
        <form onSubmit={handleJoinTeam} className="profile-page__form">
          <p className="profile-page__coach-desc">
            Enter a team code from your coach to join their team.
          </p>
          <div className="profile-page__field">
            <label className="profile-page__label" htmlFor="joinCode">Team Code</label>
            <div className="profile-page__input-wrap">
              <input
                id="joinCode"
                className="profile-page__input profile-page__input--code"
                type="text"
                placeholder="e.g. W4KR2N"
                value={joinCode}
                maxLength={6}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
              />
            </div>
          </div>
          {joinError && <p className="profile-page__error">{joinError}</p>}
          <button
            type="submit"
            className="profile-page__save-btn profile-page__save-btn--full"
            disabled={joinLoading || joinCode.trim().length < 6}
          >
            {joinLoading ? 'Joining…' : 'Join Team'}
          </button>
        </form>
      )}

      {team && (
        <div className="profile-page__team-display">
          {team.photoUrl && (
            <img className="profile-page__avatar-img" src={team.photoUrl} alt={team.name} />
          )}
          <p className="profile-page__team-name">{team.name}</p>
          {user?.isCoach && (
            <div className="profile-page__team-code-block">
              <span className="profile-page__label">Team Code</span>
              <span className="profile-page__team-code">{team.teamCode}</span>
            </div>
          )}
        </div>
      )}
    </section>
  )
}