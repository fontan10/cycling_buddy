import './HeroCard.css'

interface HeroCardProps {
  title: string
  subtitle: string
  watermark?: string
}

export function HeroCard({ title, subtitle, watermark = '🔧' }: HeroCardProps) {
  return (
    <div className="hero-card">
      <div className="hero-card__content">
        <h1 className="hero-card__title">{title}</h1>
        <p className="hero-card__subtitle">{subtitle}</p>
      </div>
      <span className="hero-card__watermark" aria-hidden="true">{watermark}</span>
    </div>
  )
}
