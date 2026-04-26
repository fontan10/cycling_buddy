import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import MarkerClusterGroup from 'react-leaflet-markercluster'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import 'react-leaflet-markercluster/styles'
import type { Report } from '../../types'
import { apiFetch } from '../../lib/api'
import { CATEGORIES } from '../../data/categories'
import { DEFAULT_CENTER } from '../../data/map'
import { getUserLocation } from '../../data/userLocation'
import { UserLocationMarker } from '../../components/UserLocationMarker'
import { CenterOnUserButton } from '../../components/CenterOnUserButton'
import { ReportSheet } from './ReportSheet'
import { ReportDetail } from './ReportDetail'
import './MapPage.css'


// ReportDetail covers the bottom 62% of the map (top: 38%).
// To center the marker in the visible 38%, offset the flyTo target downward
// in world-pixel space by half the hidden panel height.
const PANEL_FRACTION = 0.62

function MapController({ active, coords }: { active: boolean; coords: { lat: number; lng: number } | null }) {
  const map = useMap()
  const savedView = useRef<{ center: L.LatLng; zoom: number } | null>(null)

  useEffect(() => {
    if (active && coords) {
      if (!savedView.current) {
        savedView.current = { center: map.getCenter(), zoom: map.getZoom() }
      }
      const zoom = Math.max(map.getZoom(), 15)
      const yOffset = (map.getSize().y * PANEL_FRACTION) / 2
      const targetPx = map.project([coords.lat, coords.lng], zoom)
      const adjustedLatLng = map.unproject(L.point(targetPx.x, targetPx.y + yOffset), zoom)
      map.flyTo(adjustedLatLng, zoom, { duration: 0.8 })
    } else if (!active && savedView.current) {
      map.flyTo(savedView.current.center, savedView.current.zoom, { duration: 0.8 })
      savedView.current = null
    }
  }, [active, coords, map])

  return null
}

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

function UserLocationFly({ coords }: { coords: [number, number] | null }) {
  const map = useMap()
  const flown = useRef(false)
  useEffect(() => {
    if (coords && !flown.current) {
      flown.current = true
      map.flyTo(coords, 15, { duration: 1 })
    }
  }, [coords, map])
  return null
}

// TODO: do not zoom in sooo much on the map page
export function MapPage() {
  const [reports, setReports] = useState<Report[]>(cachedReports ?? [])
  const [loading, setLoading] = useState(cachedReports === null)
  const [error, setError] = useState(false)
  const [selected, setSelected] = useState<Report | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  useEffect(() => {
    getUserLocation().then((coords) => {
      if (coords) setUserLocation([coords.lat, coords.lng])
    })
  }, [])

  useEffect(() => {
    if (cachedReports !== null) return
    apiFetch<Report[]>('/reports')
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

        <MapController active={detailOpen} coords={selected?.coords ?? null} />
        <UserLocationFly coords={userLocation} />
        <UserLocationMarker coords={userLocation} />
        <CenterOnUserButton onLocate={(coords) => setUserLocation(coords)} />
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

      <AnimatePresence>
        {selected && selectedCat && !detailOpen && (
          <ReportSheet
            key={selected._id}
            report={selected}
            category={selectedCat}
            onClose={() => { setSelected(null); setDetailOpen(false) }}
            onOpen={() => setDetailOpen(true)}
            onLikeChange={(id, likeCount) => {
              setReports((prev) => prev.map((r) => r._id === id ? { ...r, likeCount } : r))
              setSelected((prev) => prev?._id === id ? { ...prev, likeCount } : prev)
              if (cachedReports) cachedReports = cachedReports.map((r) => r._id === id ? { ...r, likeCount } : r)
            }}
          />
        )}
        {selected && selectedCat && detailOpen && (
          <ReportDetail
            key={`detail-${selected._id}`}
            report={selected}
            category={selectedCat}
            onClose={() => setDetailOpen(false)}
            onLikeChange={(id, likeCount) => {
              setReports((prev) => prev.map((r) => r._id === id ? { ...r, likeCount } : r))
              setSelected((prev) => prev?._id === id ? { ...prev, likeCount } : prev)
              if (cachedReports) cachedReports = cachedReports.map((r) => r._id === id ? { ...r, likeCount } : r)
            }}
            onCommentCountChange={(id, commentCount) => {
              setReports((prev) => prev.map((r) => r._id === id ? { ...r, commentCount } : r))
              setSelected((prev) => prev?._id === id ? { ...prev, commentCount } : prev)
              if (cachedReports) cachedReports = cachedReports.map((r) => r._id === id ? { ...r, commentCount } : r)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
