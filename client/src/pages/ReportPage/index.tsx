import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CATEGORIES } from '../../data/categories'
import { LocationPicker } from '../../components/LocationPicker'
import './ReportPage.css'

interface Coords { lat: number; lng: number }

export function ReportPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [_location, setLocation] = useState<{ address: string; coords: Coords | null }>({
    address: '',
    coords: null,
  })
  const category = CATEGORIES.find((c) => c.id === categoryId)

  return (
    <div className="report-page">

      <header className="report-header">
        <button
          className="report-header__back"
          onClick={() => navigate('/', { state: { back: true } })}
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="report-header__title">New Report</span>
      </header>

      <div className="report-category-banner">
        <div className="report-category-banner__icon" style={{ background: category?.color }} aria-hidden="true">
          {category?.emoji}
        </div>
        <h1 className="report-category-banner__label">{category?.label}</h1>
      </div>

      <main className="report-form-area">
        <form className="report-form" onSubmit={(e) => e.preventDefault()}>

          <div className="form-field">
            <span className="form-field__label">Where is it?</span>
            <LocationPicker
              onChange={(address, coords) => setLocation({ address, coords })}
            />
          </div>

          <div className="form-field">
            <span className="form-field__label">Add a photo</span>
            <label className="photo-upload" htmlFor="photo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <circle cx="12" cy="12" r="3" />
                <path d="M3 9h2l2-3h6l2 3h2" />
              </svg>
              <span>Tap to add photo</span>
              <input id="photo" type="file" accept="image/*" capture="environment" className="photo-upload__input" />
            </label>
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="description">
              What's wrong?
            </label>
            <textarea
              id="description"
              className="form-field__input form-field__input--textarea"
              placeholder="Tell us more about the problem…"
              rows={4}
            />
          </div>

          <button type="submit" className="submit-btn">
            Send Report
          </button>

        </form>
      </main>

    </div>
  )
}
