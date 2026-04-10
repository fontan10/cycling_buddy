import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { apiFetch } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { Report, Category } from '../../types'

interface Props {
  report: Report
  category: Category
  onClose: () => void
  onOpen: () => void
  onLikeChange?: (reportId: string, likeCount: number) => void
}

const spring = { type: 'spring', stiffness: 380, damping: 28 } as const

export function ReportSheet({ report, category, onClose, onOpen, onLikeChange }: Props) {
  const { user } = useAuth()

  const [likeCount, setLikeCount] = useState(report.likeCount)
  const [hasLiked, setHasLiked] = useState(false)
  const [liking, setLiking] = useState(false)

  useEffect(() => {
    if (!user) return
    apiFetch<{ liked: boolean }>(`/reports/${report._id}/likes/me`)
      .then((data) => setHasLiked(data.liked))
      .catch(() => {})
  }, [report._id, user])

  async function toggleLike() {
    if (!user || liking) return
    setLiking(true)
    try {
      const method = hasLiked ? 'DELETE' : 'POST'
      const res = await apiFetch<{ likeCount: number }>(`/reports/${report._id}/likes`, { method })
      setLikeCount(res.likeCount)
      setHasLiked(!hasLiked)
      onLikeChange?.(report._id, res.likeCount)
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'Already liked') setHasLiked(true)
    } finally {
      setLiking(false)
    }
  }

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

      <div className="report-sheet__footer">
        <p className="report-sheet__date">
          {new Date(report.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        <div className="report-sheet__stats">
          <button
            className={`report-sheet__like-btn${hasLiked ? ' report-sheet__like-btn--active' : ''}`}
            onClick={toggleLike}
            disabled={!user || liking}
            title={!user ? 'Log in to like' : undefined}
          >
            👍 {likeCount}
          </button>
          <span>💬 {report.commentCount}</span>
        </div>
        <button className="report-sheet__open-btn" onClick={onOpen}>
          View details →
        </button>
      </div>
    </motion.div>
  )
}
