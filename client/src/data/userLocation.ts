interface Coords { lat: number; lng: number }

let cached: Coords | null = null

export function setCachedUserLocation(coords: Coords) {
  cached = coords
}

export function getUserLocation(): Promise<Coords | null> {
  if (cached) return Promise.resolve(cached)
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        cached = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        resolve(cached)
      },
      () => resolve(null),
      { timeout: 10000 },
    )
  })
}
