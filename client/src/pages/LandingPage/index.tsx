import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar } from '../../components/Navbar'
import { BottomNav } from '../../components/BottomNav'
import { MapPage } from '../MapPage'
import { LeaderboardPage } from '../LeaderboardPage'
import { ReportPage } from '../ReportPage'
import type { Tab } from '../../types'
import './LandingPage.css'

const TAB_CONTENT: Record<Tab, React.ComponentType> = {
  report: ReportPage,
  map: MapPage,
  rankings: LeaderboardPage,
}

export function LandingPage() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<Tab>(location.state?.tab ?? 'report')

  const Content = TAB_CONTENT[activeTab]

  return (
    <div className={`page${activeTab === 'map' ? ' page--map' : ''}`}>
      <Navbar />
      <Content />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
