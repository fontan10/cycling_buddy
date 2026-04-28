import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { AvatarSection } from './AvatarSection'
import { NameSection } from './NameSection'
import { PasswordSection } from './PasswordSection'
import { CoachSection } from './CoachSection'
import { TeamSection } from './TeamSection'
import './ProfilePage.css'

export function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/auth', { replace: true })
  }, [user, navigate])

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

        <AvatarSection />
        <NameSection />
        <PasswordSection />
        <CoachSection />
        <TeamSection />

      </div>
    </div>
  )
}