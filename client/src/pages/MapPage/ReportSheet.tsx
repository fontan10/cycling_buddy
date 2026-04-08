import { motion } from 'framer-motion'
import type { Category } from '../../types'

interface Report {
  _id: string
  address: string
  description: string
  photoUrl: string
  createdAt: string
}

interface Props {
  report: Report
  category: Category
  onClose: () => void
}

const spring = { type: 'spring', stiffness: 380, damping: 28 } as const

export function ReportSheet({ report, category, onClose }: Props) {
  return (
    <motion.div
      className="report-sheet"
      initial={{ y: 48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 48, opacity: 0 }}
      transition={spring}
    >
      <button
        className="report-sheet__close"
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>

      <div className="report-sheet__header">
        <span className="report-sheet__emoji" aria-hidden="true">{category.emoji}</span>
        <div>
          <p className="report-sheet__category" style={{ color: category.color }}>
            {category.label}
          </p>
          {report.address && (
            <p className="report-sheet__address">
              {report.address.split(',').slice(0, 2).join(',')}
            </p>
          )}
        </div>
      </div>

      {report.description && (
        <p className="report-sheet__desc">{report.description}</p>
      )}

      {report.photoUrl && (
        <img
          className="report-sheet__photo"
          src={report.photoUrl}
          alt="Report photo"
        />
      )}

      <p className="report-sheet__date">
        {new Date(report.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </p>
    </motion.div>
  )
}