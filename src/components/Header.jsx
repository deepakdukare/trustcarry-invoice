import { Truck, ExternalLink, LogOut } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'
import { getSheetUrl } from '../sheetsService.js'

/**
 * Application Header
 */
export function Header({ googleUser, onGoogleLogin, onGoogleLogout }) {
  const sheetUrl = getSheetUrl()

  const login = useGoogleLogin({
    onSuccess: onGoogleLogin,
    onError: () => console.warn('Google login failed'),
    scope: 'https://www.googleapis.com/auth/spreadsheets',
  })

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <a className="logo" href="/" aria-label="TrustCarry Invoice Generator">
          <div className="logo-icon">
            <Truck size={20} />
          </div>
          <div className="logo-text">
            <span className="logo-name">TrustCarry</span>
            <span className="logo-sub">Invoice Generator</span>
          </div>
        </a>

        {/* Actions */}
        <div className="header-actions">
          {sheetUrl && (
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              aria-label="Open Google Sheet"
            >
              <ExternalLink size={13} />
              View Sheet
            </a>
          )}

          {googleUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="google-avatar">
                {(googleUser.name || googleUser.email || 'U')[0].toUpperCase()}
              </div>
              <span className="google-email" style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {googleUser.email}
              </span>
              <button
                className="btn btn-ghost"
                onClick={onGoogleLogout}
                title="Sign out"
                aria-label="Sign out of Google"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-secondary btn-sm google-login-btn"
              onClick={() => login()}
              aria-label="Sign in with Google to save invoices"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Connect Google
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
