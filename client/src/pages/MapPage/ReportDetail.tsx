import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { apiFetch } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { ReportComments } from './ReportComments'
import type { Category, Report } from '../../types'
import './ReportDetail.css'

interface Props {
  report: Report
  category: Category
  onClose: () => void
  onLikeChange?: (reportId: string, likeCount: number) => void
  onCommentCountChange?: (reportId: string, commentCount: number) => void
}

export function ReportDetail({ report, category, onClose, onLikeChange, onCommentCountChange }: Props) {
  const { user } = useAuth()

  const [likeCount, setLikeCount] = useState(report.likeCount)
  const [hasLiked, setHasLiked] = useState(false)
  const [liking, setLiking] = useState(false)
  const [commentCount, setCommentCount] = useState(report.commentCount)

  useEffect(() => {
    if (!user) return
    apiFetch<{ liked: boolean }>(`/reports/${report._id}/likes/me`)
      .then((data) => setHasLiked(data.liked))
      .catch(() => {})
  }, [report._id, user])

  async function toggleReportLike() {
    if (!user || liking) return
    setLiking(true)
    try {
      if (!hasLiked) {
        try {
          const res = await apiFetch<{ likeCount: number }>(`/reports/${report._id}/likes`, { method: 'POST' })
          setLikeCount(res.likeCount)
          setHasLiked(true)
          onLikeChange?.(report._id, res.likeCount)
        } catch (e: unknown) {
          if (e instanceof Error && e.message === 'Already liked') setHasLiked(true)
        }
      } else {
        const res = await apiFetch<{ likeCount: number }>(`/reports/${report._id}/likes`, { method: 'DELETE' })
        setLikeCount(res.likeCount)
        setHasLiked(false)
        onLikeChange?.(report._id, res.likeCount)
      }
    } finally {
      setLiking(false)
    }
  }

  return (
    <motion.div
      className="report-detail"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
    >
      {/* ── Header ── */}
      <div
        className="report-detail__header"
        style={{ '--category-color': category.color, '--category-tint': `${category.color}22` } as React.CSSProperties}
      >
        <button className="report-detail__back" onClick={onClose} aria-label="Back">
          ←
        </button>
        <span className="report-detail__emoji-wrap" aria-hidden="true">{category.emoji}</span>
        <div className="report-detail__title-group">
          <p className="report-detail__category" style={{ color: category.color }}>
            {category.label}
          </p>
          {report.address && (
            <p className="report-detail__address">
              {report.address.split(',').slice(0, 2).join(',')}
            </p>
          )}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="report-detail__body">
        {report.photoUrl && (
          <img className="report-detail__photo" src={report.photoUrl} alt="Report" />
        )}

        {report.description && (
          <p className="report-detail__desc">{report.description}</p>
        )}

        {/* ── Date + stats row ── */}
        <div className="report-detail__meta">
          <span className="report-detail__date">
            {new Date(report.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <div className="report-detail__actions">
            <button
              className={`report-detail__like-btn${hasLiked ? ' report-detail__like-btn--active' : ''}`}
              onClick={toggleReportLike}
              disabled={!user || liking}
              title={!user ? 'Log in to like' : undefined}
            >
              <span>👍</span>
              <span>{likeCount}</span>
            </button>
            <span className="report-detail__comment-stat">
              <span>💬</span>
              <span>{commentCount}</span>
            </span>
          </div>
        </div>

        {/* ── Comments ── */}
        <ReportComments
          reportId={report._id}
          onCountChange={(count) => {
            setCommentCount(count)
            onCommentCountChange?.(report._id, count)
          }}
        />
      </div>
    </motion.div>
  )
}
