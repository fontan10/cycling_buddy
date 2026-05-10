import { useNavigate } from 'react-router-dom'
import { HeroCard } from '../../components/HeroCard'
import { CategoryCard } from '../../components/CategoryCard'
import { CATEGORIES } from '../../data/categories'
import './ReportPage.css'

export function ReportPage() {
  const navigate = useNavigate()

  return (
    <main className="report-page">
      <div className="rp-hero-wrap">
        <HeroCard
          title="Something wrong?"
          subtitle="Tell us what's happening and we'll help fix it!"
        />
        <div className="rp-deco" aria-hidden="true">
          <span className="rp-deco--a">⭐</span>
          <span className="rp-deco--b">✨</span>
          <span className="rp-deco--c">💫</span>
        </div>
      </div>

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
  )
}
