import { useState } from 'react'
import { useMap } from 'react-leaflet'
import { getUserLocation } from '../../data/userLocation'
import './CenterOnUserButton.css'

interface Props {
  /** Called with the resolved coords after a successful locate */
  onLocate?: (coords: [number, number]) => void
}

// BUG: when clicking on the button it still registers on a click on the map beneath it
// TODO: choose another colour for the user's location and correspondingly update the button as well
// TODO: make the location unavaiable error message appear nicer
export function CenterOnUserButton({ onLocate }: Props) {
  const map = useMap()
  const [loading, setLoading] = useState(false)
  const [denied, setDenied] = useState(false)

  async function handleClick() {
    if (loading) return
    setLoading(true)
    setDenied(false)
    const coords = await getUserLocation()
    setLoading(false)
    if (coords) {
      const latlng: [number, number] = [coords.lat, coords.lng]
      map.flyTo(latlng, Math.max(map.getZoom(), 15), { duration: 1 })
      onLocate?.(latlng)
    } else {
      setDenied(true)
      setTimeout(() => setDenied(false), 3000)
    }
  }

  return (
    <div className="locate-btn-wrap">
      <button
        className={`locate-btn${loading ? ' locate-btn--loading' : ''}`}
        onClick={handleClick}
        aria-label="Center map on my location"
        type="button"
      >
        {loading ? (
          <span className="locate-btn__spinner" aria-hidden="true" />
        ) : (
          <svg
            className="locate-btn__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        )}
      </button>
      {denied && (
        <div className="locate-denied" role="alert">
          Location unavailable
        </div>
      )}
    </div>
  )
}
