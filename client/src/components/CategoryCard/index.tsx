import type { Category } from '../../types'
import './CategoryCard.css'

interface CategoryCardProps {
  category: Category
  onClick: (id: string) => void
}

export function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <button
      className="category-card"
      aria-label={category.label}
      onClick={() => onClick(category.id)}
    >
      <div
        className="category-card__icon"
        style={{ background: category.color }}
        aria-hidden="true"
      >
        {category.emoji}
      </div>
      <span className="category-card__label">{category.label}</span>
    </button>
  )
}
