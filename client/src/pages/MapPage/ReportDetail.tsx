import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { apiFetch } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { Category, Report } from '../../types'
import './ReportDetail.css'

interface Comment {
  _id: string
  text: string
  createdAt: string
}

interface Props {
  report: Report
  category: Category
  onClose: () => void
  onLikeChange?: (reportId: string, likeCount: number) => void
}

export function ReportDetail({ report, category, onClose, onLikeChange }: Props) {
  const { user } = useAuth()

  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(true)

  const [likeCount, setLikeCount] = useState(report.likeCount)
  const [hasLiked, setHasLiked] = useState(false)
  const [liking, setLiking] = useState(false)

  const [commentLikes, setCommentLikes] = useState<Record<string, { count: number; liked: boolean }>>({})

  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    apiFetch<Comment[]>(`/reports/${report._id}/comments`)
      .then((data) => {
        setComments(data)
        const init: Record<string, { count: number; liked: boolean }> = {}
        data.forEach((c) => { init[c._id] = { count: 0, liked: false } })
        setCommentLikes(init)
      })
      .catch(() => {})
      .finally(() => setCommentsLoading(false))
  }, [report._id])

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

  async function toggleCommentLike(commentId: string) {
    if (!user) return
    const current = commentLikes[commentId] ?? { count: 0, liked: false }
    try {
      if (!current.liked) {
        const res = await apiFetch<{ likeCount: number }>(`/comments/${commentId}/likes`, { method: 'POST' })
        setCommentLikes((prev) => ({ ...prev, [commentId]: { count: res.likeCount, liked: true } }))
      } else {
        const res = await apiFetch<{ likeCount: number }>(`/comments/${commentId}/likes`, { method: 'DELETE' })
        setCommentLikes((prev) => ({ ...prev, [commentId]: { count: res.likeCount, liked: false } }))
      }
    } catch {}
  }

  async function submitComment() {
    if (!user || !commentText.trim() || submitting) return
    setSubmitting(true)
    try {
      const comment = await apiFetch<Comment>(`/reports/${report._id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text: commentText.trim() }),
      })
      setComments((prev) => [comment, ...prev])
      setCommentLikes((prev) => ({ ...prev, [comment._id]: { count: 0, liked: false } }))
      setCommentText('')
    } catch {
    } finally {
      setSubmitting(false)
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

        <p className="report-detail__date">
          {new Date(report.createdAt).toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>

        {/* ── Like button ── */}
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
            <span>{comments.length}</span>
          </span>
        </div>

        {/* ── Comments ── */}
        <section className="report-detail__comments">
          <h3 className="report-detail__comments-title">Comments</h3>

          {user ? (
            <div className="report-detail__add-comment">
              <textarea
                ref={textareaRef}
                className="report-detail__input"
                placeholder="Add a comment…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
              />
              <button
                className="report-detail__submit"
                onClick={submitComment}
                disabled={!commentText.trim() || submitting}
              >
                {submitting ? '…' : 'Post'}
              </button>
            </div>
          ) : (
            <p className="report-detail__login-hint">Log in to comment or like.</p>
          )}

          {commentsLoading ? (
            <p className="report-detail__empty">Loading…</p>
          ) : comments.length === 0 ? (
            <p className="report-detail__empty">No comments yet — be the first!</p>
          ) : (
            <ul className="report-detail__comment-list">
              {comments.map((c) => {
                const cl = commentLikes[c._id] ?? { count: 0, liked: false }
                return (
                  <li key={c._id} className="report-detail__comment">
                    <p className="report-detail__comment-text">{c.text}</p>
                    <div className="report-detail__comment-footer">
                      <span className="report-detail__comment-date">
                        {new Date(c.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <button
                        className={`report-detail__comment-like${cl.liked ? ' report-detail__comment-like--active' : ''}`}
                        onClick={() => toggleCommentLike(c._id)}
                        disabled={!user}
                        title={!user ? 'Log in to like' : undefined}
                      >
                        👍 {cl.count}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </motion.div>
  )
}
