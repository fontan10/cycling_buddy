export function getCompressionOptions() {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  if (memory <= 1) return { maxSizeMB: 0.3, maxWidthOrHeight: 640,  useWebWorker: false, fileType: 'image/jpeg' }
  if (memory <= 2) return { maxSizeMB: 0.5, maxWidthOrHeight: 800,  useWebWorker: false, fileType: 'image/jpeg' }
  if (memory <= 4) return { maxSizeMB: 1.0, maxWidthOrHeight: 1024, useWebWorker: false, fileType: 'image/jpeg' }
  return               { maxSizeMB: 1.5, maxWidthOrHeight: 1280, useWebWorker: true,  fileType: 'image/jpeg' }
}
