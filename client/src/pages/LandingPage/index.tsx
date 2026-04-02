import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../../components/Navbar'
import { HeroCard } from '../../components/HeroCard'
import { CategoryCard } from '../../components/CategoryCard'
import { BottomNav } from '../../components/BottomNav'
import { CATEGORIES } from '../../data/categories'
import type { Tab } from '../../types'
import './LandingPage.css'

export function LandingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('report')
  const navigate = useNavigate()

  return (
    <div className="page">

      <Navbar />

      <main className="page__main">
        <HeroCard
          title="Something wrong?"
          subtitle="Tell us what's happening and we'll help fix it!"
        />

        <section className="categories">
          <h2 className="categories__label">What's the trouble?</h2>
          <div className="categories__grid" role="list">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} role="listitem">
                <CategoryCard
                  category={cat}
                  onClick={(id) => navigate(`/report/${id}`)}
                />
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

    </div>
  )
}
