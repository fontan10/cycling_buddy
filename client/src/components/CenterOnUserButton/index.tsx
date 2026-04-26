import L from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import { useMap } from 'react-leaflet'
import { getUserLocation } from '../../data/userLocation'
import './CenterOnUserButton.css'

interface Props {
  /** Called with the resolved coords after a successful locate */
  onLocate?: (coords: [number, number]) => void
}

// TODO: make the location unavaiable error message appear nicer
export function CenterOnUserButton({ onLocate }: Props) {
  const map = useMap()
  const [loading, setLoading] = useState(false)
  const [denied, setDenied] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (wrapRef.current) L.DomEvent.disableClickPropagation(wrapRef.current)
  }, [])

  async function handleClick() {
    if (loading) return
    setLoading(true)
    setDenied(false)
    const coords = await getUserLocation()
    setLoading(false)
    if (coords) {
      const latlng: [number, number] = [coords.lat, coords.lng]
      const targetZoom = Math.max(map.getZoom(), 15)
      const alreadyCentered =
        map.getCenter().distanceTo(latlng) < 5 && map.getZoom() === targetZoom
      if (!alreadyCentered) map.flyTo(latlng, targetZoom, { duration: 1 })
      onLocate?.(latlng)
    } else {
      setDenied(true)
      setTimeout(() => setDenied(false), 3000)
    }
  }

  return (
    <div className="locate-btn-wrap" ref={wrapRef}>
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
