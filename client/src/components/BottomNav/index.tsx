import type { Tab } from '../../types'
import { PlusIcon } from '../Icons'
import './BottomNav.css'

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const NAV_TABS: { id: Tab; label: string; iconPath: React.ReactNode }[] = [
  {
    id: 'map',
    label: 'Map',
    iconPath: <>
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </>,
  },
  {
    id: 'rankings',
    label: 'Rankings',
    iconPath: <>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </>,
  },
]

interface NavItemProps {
  tab: (typeof NAV_TABS)[number]
  active: boolean
  onTabChange: (tab: Tab) => void
}

function NavItem({ tab, active, onTabChange }: NavItemProps) {
  return (
    <button
      className={`bottom-nav__item${active ? ' bottom-nav__item--active' : ''}`}
      onClick={() => onTabChange(tab.id)}
      aria-current={active ? 'page' : undefined}
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
        {tab.iconPath}
      </svg>
      <span className="bottom-nav__label">{tab.label}</span>
    </button>
  )
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">

      <NavItem tab={NAV_TABS[0]} active={activeTab === 'map'} onTabChange={onTabChange} />

      <button
        className={`bottom-nav__item bottom-nav__item--report${activeTab === 'report' ? ' bottom-nav__item--report-active' : ''}`}
        onClick={() => onTabChange('report')}
        aria-current={activeTab === 'report' ? 'page' : undefined}
      >
        <div className="bottom-nav__report-bubble">
          <div className="bottom-nav__report-icon">
            <PlusIcon />
          </div>
        </div>
        <span className="bottom-nav__label">Report</span>
      </button>

      <NavItem tab={NAV_TABS[1]} active={activeTab === 'rankings'} onTabChange={onTabChange} />

    </nav>
  )
}
