import { useState, useCallback } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

let toastId = 0

/**
 * useToast hook - manages toast notifications
 */
export function useToast() {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }, [])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = (msg, dur) => show(msg, 'success', dur)
  const error = (msg, dur) => show(msg, 'error', dur)
  const loading = (msg) => show(msg, 'loading', 0)

  return { toasts, show, remove, success, error, loading }
}

/**
 * Toast container renderer
 */
export function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null

  const icons = {
    success: <CheckCircle size={15} />,
    error: <XCircle size={15} />,
    loading: <Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} />,
  }

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => onRemove(t.id)} style={{ cursor: 'pointer' }}>
          {icons[t.type]}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
