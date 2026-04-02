import type { Tab } from '../../types'
import './BottomNav.css'

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">

      <button
        className={`bottom-nav__item${activeTab === 'map' ? ' bottom-nav__item--active' : ''}`}
        onClick={() => onTabChange('map')}
        aria-current={activeTab === 'map' ? 'page' : undefined}
      >
        <svg
          className="bottom-nav__icon"
          width="26" height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
          <line x1="9" y1="3" x2="9" y2="18" />
          <line x1="15" y1="6" x2="15" y2="21" />
        </svg>
        <span className="bottom-nav__label">Map</span>
      </button>

      <button
        className="bottom-nav__item bottom-nav__item--report"
        onClick={() => onTabChange('report')}
        aria-current={activeTab === 'report' ? 'page' : undefined}
      >
        <div className="bottom-nav__report-bubble">
          <div className="bottom-nav__report-icon">
            <svg
              width="22" height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
        </div>
        <span className="bottom-nav__label bottom-nav__label--report">Report</span>
      </button>

      <button
        className={`bottom-nav__item${activeTab === 'badges' ? ' bottom-nav__item--active' : ''}`}
        onClick={() => onTabChange('badges')}
        aria-current={activeTab === 'badges' ? 'page' : undefined}
      >
        <svg
          className="bottom-nav__icon"
          width="26" height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span className="bottom-nav__label">Badges</span>
      </button>

    </nav>
  )
}
