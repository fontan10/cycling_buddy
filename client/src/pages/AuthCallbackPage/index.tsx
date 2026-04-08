import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function AuthCallbackPage() {
  const [params] = useSearchParams()
  const { handleOAuthCallback } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      navigate('/', { replace: true })
      return
    }
    handleOAuthCallback(token).then(() => navigate('/', { replace: true }))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
