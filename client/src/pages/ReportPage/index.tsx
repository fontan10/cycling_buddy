import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import imageCompression from 'browser-image-compression'
import { getCompressionOptions } from '../../lib/imageCompression'
import { CATEGORIES } from '../../data/categories'
import { LocationPicker } from '../../components/LocationPicker'
import { clearReportsCache } from '../MapPage'
import { apiFetch } from '../../lib/api'
import './ReportPage.css'

interface Coords { lat: number; lng: number }

function ReportHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="report-header">
      <button className="report-header__back" onClick={onBack} aria-label="Go back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <span className="report-header__title">Problem Details</span>
    </header>
  )
}

function ProgressDots() {
  return (
    <div className="report-progress" aria-hidden="true">
      <div className="report-progress__dot report-progress__dot--done" />
      <div className="report-progress__dot report-progress__dot--active" />
      <div className="report-progress__dot" />
    </div>
  )
}

function CategoryBanner({ category, error }: { category: typeof CATEGORIES[number] | undefined; error?: string }) {
  return (
    <>
      <div className="report-category-banner">
        <div className="report-category-banner__icon" style={{ background: category?.color }} aria-hidden="true">
          {category?.emoji}
        </div>
        <h1 className="report-category-banner__label">{category?.label}</h1>
      </div>
      {error && <p className="form-field__error">{error}</p>}
    </>
  )
}

const CameraIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

function PhotoField({ preview, onChange, onClear }: {
  preview: string | null
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
}) {
  const fileInput = (
    <input id="photo" type="file" accept="image/*" className="photo-upload__input" onChange={onChange} />
  )

  if (preview) {
    return (
      <div className="photo-preview">
        <img src={preview} alt="Photo preview" className="photo-preview__img" />
        <button type="button" className="photo-preview__delete" onClick={onClear} aria-label="Remove photo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <label htmlFor="photo" className="photo-preview__replace">
          <CameraIcon size={13} />
          Replace
          {fileInput}
        </label>
      </div>
    )
  }

  return (
    <label className="photo-upload" htmlFor="photo">
      <div className="photo-upload__icon-circle">
        <CameraIcon size={28} />
      </div>
      <span className="photo-upload__title">Add a Photo</span>
      <span className="photo-upload__subtitle">Take a picture so we can see what happened!</span>
      {fileInput}
    </label>
  )
}

export function ReportPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [location, setLocation] = useState<{ address: string; coords: Coords | null }>({
    address: '',
    coords: null,
  })
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const category = CATEGORIES.find((c) => c.id === categoryId)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhoto(file)
    setPhotoPreview(file ? URL.createObjectURL(file) : null)
    e.target.value = ''
  }

  function clearPhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhoto(null)
    setPhotoPreview(null)
  }

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
        const compressed = await imageCompression(photo, getCompressionOptions())
        photoUrl = await imageCompression.getDataUrlFromFile(compressed)
      }

      await apiFetch('/reports', {
        method: 'POST',
        body: JSON.stringify({
          categoryId,
          address: location.address,
          coords: location.coords,
          description,
          photoUrl,
        }),
      })

      clearReportsCache()
      navigate('/success', { state: { categoryId } })
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="report-page">

      <ReportHeader onBack={() => navigate('/', { state: { back: true } })} />
      <ProgressDots />
      <CategoryBanner category={category} error={errors.category} />

      <main className="report-form-area">
        <form className="report-form" onSubmit={handleSubmit}>

          <div className="form-field">
            <span className="form-field__label">
              <span className="form-field__label-icon form-field__label-icon--yellow">📍</span>
              Where is it?
            </span>
            <LocationPicker onChange={(address, coords) => setLocation({ address, coords })} />
            {errors.location && <p className="form-field__error">{errors.location}</p>}
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="description">
              <span className="form-field__label-icon form-field__label-icon--blue">💬</span>
              What's happening?
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

          <div className="form-field">
            <PhotoField preview={photoPreview} onChange={handlePhotoChange} onClear={clearPhoto} />
          </div>

          {errors.descriptionOrPhoto && <p className="form-field__error">{errors.descriptionOrPhoto}</p>}
          {errors.submit && <p className="form-field__error">{errors.submit}</p>}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send Report'}
          </button>

        </form>
      </main>

    </div>
  )
}
