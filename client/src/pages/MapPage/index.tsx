import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CATEGORIES } from '../../data/categories'
import { DEFAULT_CENTER } from '../../data/map'
import './MapPage.css'

interface Report {
  _id: string
  categoryId: string
  address: string
  coords: { lat: number; lng: number }
  description: string
  photoUrl: string
  createdAt: string
}


function makeMarkerIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div class="report-marker" style="background:${color}"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -26],
  })
}

export function MapPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/reports')
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((data) => setReports(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="map-page">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={13}
        className="map-page__map"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {reports.map((report) => {
          const cat = CATEGORIES.find((c) => c.id === report.categoryId)
          if (!cat || !report.coords) return null
          return (
            <Marker
              key={report._id}
              position={[report.coords.lat, report.coords.lng]}
              icon={makeMarkerIcon(cat.color)}
            >
              <Popup className="report-popup">
                <div className="report-popup__header">
                  <span className="report-popup__emoji" aria-hidden="true">{cat.emoji}</span>
                  <span className="report-popup__category">{cat.label}</span>
                </div>
                {report.address && (
                  <p className="report-popup__address">
                    {report.address.split(',').slice(0, 2).join(',')}
                  </p>
                )}
                {report.description && (
                  <p className="report-popup__desc">{report.description}</p>
                )}
                {report.photoUrl && (
                  <img
                    className="report-popup__photo"
                    src={report.photoUrl}
                    alt="Report photo"
                  />
                )}
                <p className="report-popup__date">
                  {new Date(report.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {loading && (
        <div className="map-page__overlay map-page__overlay--loading">
          <span className="map-page__spinner" aria-hidden="true" />
          <span>Loading reports…</span>
        </div>
      )}

      {!loading && error && (
        <div className="map-page__overlay map-page__overlay--error">
          Could not load reports.
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="map-page__overlay map-page__overlay--empty">
          No reports yet — be the first!
        </div>
      )}

      <div className="map-page__badge">
        {loading ? '…' : reports.length} report{reports.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
