import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { apiFetch } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

interface Comment {
  _id: string
  userId: string
  text: string
  createdAt: string
}

interface Props {
  reportId: string
  onCountChange?: (count: number) => void
}

export function ReportComments({ reportId, onCountChange }: Props) {
  const { user } = useAuth()

  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentLikes, setCommentLikes] = useState<Record<string, { count: number; liked: boolean }>>({})

  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [posted, setPosted] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    apiFetch<Comment[]>(`/reports/${reportId}/comments`)
      .then((data) => {
        setComments(data)
        const init: Record<string, { count: number; liked: boolean }> = {}
        data.forEach((c) => { init[c._id] = { count: 0, liked: false } })
        setCommentLikes(init)
        onCountChange?.(data.length)
      })
      .catch(() => {})
      .finally(() => setCommentsLoading(false))
  }, [reportId])

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

  async function deleteComment(commentId: string) {
    setConfirmDeleteId(null)
    setDeletingId(commentId)
    try {
      await apiFetch(`/comments/${commentId}`, { method: 'DELETE' })
      setComments((prev) => {
        const next = prev.filter((c) => c._id !== commentId)
        onCountChange?.(next.length)
        return next
      })
      setCommentLikes((prev) => {
        const next = { ...prev }
        delete next[commentId]
        return next
      })
    } catch {
    } finally {
      setDeletingId(null)
    }
  }

  async function submitComment() {
    if (!user || !commentText.trim() || submitting) return
    setSubmitting(true)
    try {
      const comment = await apiFetch<Comment>(`/reports/${reportId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text: commentText.trim() }),
      })
      setComments((prev) => {
        const next = [comment, ...prev]
        onCountChange?.(next.length)
        return next
      })
      setCommentLikes((prev) => ({ ...prev, [comment._id]: { count: 0, liked: false } }))
      setCommentText('')
      setPosted(true)
      setTimeout(() => setPosted(false), 2500)
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  return (
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
          <div className="report-detail__submit-row">
            <AnimatePresence>
              {posted && (
                <motion.span
                  className="report-detail__posted"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Comment posted!
                </motion.span>
              )}
            </AnimatePresence>
            <button
              className="report-detail__submit"
              onClick={submitComment}
              disabled={!commentText.trim() || submitting}
            >
              {submitting ? '…' : 'Post'}
            </button>
          </div>
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
                  <div className="report-detail__comment-actions">
                    <button
                      className={`report-detail__comment-like${cl.liked ? ' report-detail__comment-like--active' : ''}`}
                      onClick={() => toggleCommentLike(c._id)}
                      disabled={!user}
                      title={!user ? 'Log in to like' : undefined}
                    >
                      👍 {cl.count}
                    </button>
                    {user && user._id === c.userId && (
                      confirmDeleteId === c._id ? (
                        <span className="report-detail__confirm-delete">
                          <span className="report-detail__confirm-label">Delete?</span>
                          <button
                            className="report-detail__confirm-yes"
                            onClick={() => deleteComment(c._id)}
                            disabled={deletingId === c._id}
                          >
                            Yes
                          </button>
                          <button
                            className="report-detail__confirm-no"
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            No
                          </button>
                        </span>
                      ) : (
                        <button
                          className="report-detail__comment-delete"
                          onClick={() => setConfirmDeleteId(c._id)}
                          disabled={deletingId === c._id}
                          title="Delete comment"
                        >
                          {deletingId === c._id ? 'Deleting…' : 'Delete'}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
