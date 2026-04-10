import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { LatLng } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { DEFAULT_CENTER } from '../../data/map'
import { setCachedUserLocation } from '../../data/userLocation'
import { UserLocationMarker } from '../UserLocationMarker'
import './LocationPicker.css'

// ── Custom pin icon (avoids Leaflet's broken default in Vite) ──
const PIN_ICON = L.divIcon({
  className: '',
  html: '<div class="map-pin"></div>',
  iconSize: [22, 22],
  // Anchor at bottom-centre so the teardrop tip sits on the coordinate
  iconAnchor: [11, 22],
})

// ── Types ──────────────────────────────────────────────────────
interface Coords { lat: number; lng: number }

interface DisplayAddress { primary: string; secondary: string }

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

interface NominatimReverseData {
  display_name: string
  address: {
    house_number?: string
    road?: string; pedestrian?: string; path?: string; footway?: string; cycleway?: string
    suburb?: string; neighbourhood?: string; hamlet?: string
    city?: string; town?: string; village?: string; municipality?: string
    state?: string
  }
}

// Converts Nominatim's verbose display_name into a two-line human address
function parseAddress(data: NominatimReverseData): DisplayAddress {
  const a = data.address
  const road = a.road ?? a.pedestrian ?? a.path ?? a.footway ?? a.cycleway
  const primary = (
    [a.house_number, road].filter(Boolean).join(' ')
    || (a.suburb ?? a.neighbourhood ?? a.hamlet)
    || data.display_name.split(',')[0].trim()
  )
  const secondary = [
    (a.suburb ?? a.neighbourhood ?? a.hamlet),
    (a.city ?? a.town ?? a.village ?? a.municipality),
    a.state,
  ].filter(Boolean).join(', ')
  return { primary: primary.trim(), secondary: secondary.trim() }
}

export interface LocationPickerProps {
  onChange: (address: string, coords: Coords) => void
}

// ── Inner: drops a pin where the user taps ─────────────────────
function TapHandler({ onTap }: { onTap: (latlng: LatLng) => void }) {
  useMapEvents({ click: (e) => onTap(e.latlng) })
  return null
}

// ── Inner: flies the map to new coordinates ────────────────────
function FlyTo({ coords }: { coords: Coords | null }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], 16, { duration: 0.8 })
  }, [coords, map])
  return null
}

// ── Main component ─────────────────────────────────────────────
export function LocationPicker({ onChange }: LocationPickerProps) {
  const [pin, setPin] = useState<Coords | null>(null)
  const [flyTarget, setFlyTarget] = useState<Coords | null>(null)
  const [userGpsCoords, setUserGpsCoords] = useState<[number, number] | null>(null)
  const [address, setAddress] = useState<DisplayAddress | null>(null)
  const [resolving, setResolving] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Centre on device GPS when the map first loads
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      setCachedUserLocation(coords)
      setFlyTarget(coords)
      setUserGpsCoords([pos.coords.latitude, pos.coords.longitude])
    })
  }, [])

  const reverseGeocode = async (coords: Coords) => {
    setResolving(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${coords.lat}&lon=${coords.lng}`,
        { headers: { 'Accept-Language': 'en' } },
      )
      const data: NominatimReverseData = await res.json()
      setAddress(parseAddress(data))
      onChange(data.display_name, coords)
    } catch {
      const fallback = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
      setAddress({ primary: fallback, secondary: '' })
      onChange(fallback, coords)
    } finally {
      setResolving(false)
    }
  }

  const handleTap = (latlng: LatLng) => {
    const coords = { lat: latlng.lat, lng: latlng.lng }
    setPin(coords)
    reverseGeocode(coords)
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (searchTimer.current !== null) {
      clearTimeout(searchTimer.current);
    }
    if (value.length < 3) { setResults([]); return }
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`,
          { headers: { 'Accept-Language': 'en' } },
        )
        setResults(await res.json())
      } catch {
        setResults([])
      }
    }, 500)
  }

  const handleResultSelect = (result: NominatimResult) => {
    const coords = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) }
    const parts = result.display_name.split(',')
    setPin(coords)
    setFlyTarget(coords)
    setAddress({ primary: parts[0].trim(), secondary: parts.slice(1, 3).join(',').trim() })
    setQuery('')
    setResults([])
    onChange(result.display_name, coords)
  }

  return (
    <div className="location-picker">

      {/* Search bar */}
      <div className="location-picker__search-wrap">
        <input
          className="location-picker__search"
          type="search"
          placeholder="Search for a place…"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onBlur={() => setTimeout(() => setResults([]), 150)}
          autoComplete="off"
        />
        {results.length > 0 && (
          <ul className="location-picker__results" role="listbox" aria-label="Search results">
            {results.map((r) => (
              <li key={r.place_id} role="option">
                <button
                  className="location-picker__result-btn"
                  onClick={() => handleResultSelect(r)}
                >
                  {r.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={13}
        className="location-picker__map"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <TapHandler onTap={handleTap} />
        <FlyTo coords={flyTarget} />
        {pin && <Marker position={[pin.lat, pin.lng]} icon={PIN_ICON} />}
        <UserLocationMarker coords={userGpsCoords} />
      </MapContainer>

      {/* Resolved address / hint */}
      <div className="location-picker__status">
        {resolving && (
          <div className="status-row status-row--loading">
            <span className="status-spinner" aria-hidden="true" />
            <span>Finding address…</span>
          </div>
        )}
        {!resolving && address && (
          <div className="status-row">
            <span className="status-pin" aria-hidden="true">📍</span>
            <div className="status-address">
              <span className="status-address__primary">{address.primary}</span>
              {address.secondary && (
                <span className="status-address__secondary">{address.secondary}</span>
              )}
            </div>
          </div>
        )}
        {!resolving && !address && (
          <div className="status-row status-row--hint">
            <span aria-hidden="true">👆</span>
            <span>Tap the map to drop a pin</span>
          </div>
        )}
      </div>

    </div>
  )
}
