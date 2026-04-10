import L from 'leaflet'
import { Marker } from 'react-leaflet'

const USER_LOCATION_ICON = L.divIcon({
  className: '',
  html: '<div class="user-location-marker"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

interface Props {
  coords: [number, number] | null
}

export function UserLocationMarker({ coords }: Props) {
  if (!coords) return null
  return (
    <Marker
      position={coords}
      icon={USER_LOCATION_ICON}
      interactive={false}
      zIndexOffset={1000}
    />
  )
}
