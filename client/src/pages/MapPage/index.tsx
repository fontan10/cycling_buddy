import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import MarkerClusterGroup from 'react-leaflet-markercluster'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import 'react-leaflet-markercluster/styles'
import type { Report } from '../../types'
import { CATEGORIES } from '../../data/categories'
import { DEFAULT_CENTER } from '../../data/map'
import { ReportSheet } from './ReportSheet'
import './MapPage.css'


let cachedReports: Report[] | null = null

export function clearReportsCache() {
  cachedReports = null
}

function makeMarkerIcon(color: string, active = false) {
  return L.divIcon({
    className: '',
    html: `<div class="report-marker${active ? ' report-marker--active' : ''}" style="background:${color}"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  })
}

export function MapPage() {
  const [reports, setReports] = useState<Report[]>(cachedReports ?? [])
  const [loading, setLoading] = useState(cachedReports === null)
  const [error, setError] = useState(false)
  const [selected, setSelected] = useState<Report | null>(null)

  useEffect(() => {
    if (cachedReports !== null) return
    fetch('/api/reports')
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((data) => {
        cachedReports = data
        setReports(data)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const selectedCat = selected
    ? CATEGORIES.find((c) => c.id === selected.categoryId)
    : null

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

        <MarkerClusterGroup
          iconCreateFunction={(cluster: { getChildCount: () => number }) =>
            L.divIcon({
              className: '',
              html: `<div class="cluster-marker">${cluster.getChildCount()}</div>`,
              iconSize: [44, 44],
              iconAnchor: [22, 22],
            })
          }
          showCoverageOnHover={false}
          maxClusterRadius={60}
        >
          {reports.map((report) => {
            const cat = CATEGORIES.find((c) => c.id === report.categoryId)
            if (!cat || !report.coords) return null
            const isActive = selected?._id === report._id
            return (
              <Marker
                key={report._id}
                position={[report.coords.lat, report.coords.lng]}
                icon={makeMarkerIcon(cat.color, isActive)}
                eventHandlers={{
                  click: () => setSelected(isActive ? null : report),
                }}
              />
            )
          })}
        </MarkerClusterGroup>
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

      <AnimatePresence>
        {selected && selectedCat && (
          <ReportSheet
            key={selected._id}
            report={selected}
            category={selectedCat}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
