import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CATEGORIES } from '../../data/categories'
import { LocationPicker } from '../../components/LocationPicker'
import './ReportPage.css'

interface Coords { lat: number; lng: number }

export function ReportPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [location, setLocation] = useState<{ address: string; coords: Coords | null }>({
    address: '',
    coords: null,
  })
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const category = CATEGORIES.find((c) => c.id === categoryId)

  function validate() {
    const next: Record<string, string> = {}
    if (!category) next.category = 'Please select a valid category.'
    if (!location.address && !location.coords) next.location = 'Please enter a location.'
    if (!description.trim() && !photo) next.descriptionOrPhoto = 'Please add a description or a photo.'
    return next
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      let photoUrl = ''
      if (photo) {
        photoUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(photo)
        })
      }

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          address: location.address,
          coords: location.coords,
          description,
          photoUrl,
        }),
      })

      if (!res.ok) throw new Error('Failed to save report')
      navigate('/success', { state: { categoryId } })
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

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
      {errors.category && <p className="form-field__error">{errors.category}</p>}

      <main className="report-form-area">
        <form className="report-form" onSubmit={handleSubmit}>

          <div className="form-field">
            <span className="form-field__label">Where is it?</span>
            <LocationPicker
              onChange={(address, coords) => setLocation({ address, coords })}
            />
            {errors.location && <p className="form-field__error">{errors.location}</p>}
          </div>

          <div className="form-field">
            <span className="form-field__label">Add a photo</span>
            <label className="photo-upload" htmlFor="photo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <circle cx="12" cy="12" r="3" />
                <path d="M3 9h2l2-3h6l2 3h2" />
              </svg>
              <span>{photo ? photo.name : 'Tap to add photo'}</span>
              <input
                id="photo"
                type="file"
                accept="image/*"
                capture="environment"
                className="photo-upload__input"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              />
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {errors.descriptionOrPhoto && (
            <p className="form-field__error">{errors.descriptionOrPhoto}</p>
          )}
          {errors.submit && (
            <p className="form-field__error">{errors.submit}</p>
          )}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send Report'}
          </button>

        </form>
      </main>

    </div>
  )
}
