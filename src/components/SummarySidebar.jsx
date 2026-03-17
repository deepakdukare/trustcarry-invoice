import { Download, Sheet, Loader2, ExternalLink, LogIn, CheckCircle } from 'lucide-react'
import { calcTotals, formatINR, numberToWords } from '../utils.js'
import { getSheetUrl } from '../sheetsService.js'

/**
 * Summary Sidebar – real-time totals, PDF and Sheets action buttons
 * SRS Section 6.1 – Summary Sidebar + PDF Download + Save to Sheets
 */
export function SummarySidebar({
  items,
  isPdfLoading,
  isSheetsLoading,
  googleUser,
  onDownloadPdf,
  onSaveToSheets,
  onGoogleLogin,
  lastSavedAt,
}) {
  const { totalQty, totalTaxable, totalCGST, totalSGST, grandTotal } = calcTotals(items)
  const sheetUrl = getSheetUrl()
  const itemCount = items.filter((i) => i.description || i.quantity || i.rate).length

  return (
    <div className="sidebar">
      {/* Summary Card */}
      <div className="summary-card">
        <div className="summary-title">
          <span>Invoice Summary</span>
          {itemCount > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--accent)' }}>
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="summary-row">
          <span className="summary-label">Total Qty</span>
          <span className="summary-value">{totalQty}</span>
        </div>

        <div className="divider" />

        <div className="summary-row">
          <span className="summary-label">Taxable Value</span>
          <span className="summary-value">₹{formatINR(totalTaxable)}</span>
        </div>

        <div className="summary-row">
          <span className="summary-label">CGST</span>
          <span className="summary-value">₹{formatINR(totalCGST)}</span>
        </div>

        <div className="summary-row">
          <span className="summary-label">SGST</span>
          <span className="summary-value">₹{formatINR(totalSGST)}</span>
        </div>

        <div className="summary-total">
          <span className="label">Grand Total</span>
          <span className="value">₹{formatINR(grandTotal)}</span>
        </div>

        {grandTotal > 0 && (
          <div className="amount-words" aria-live="polite" aria-label="Amount in words">
            {numberToWords(grandTotal)}
          </div>
        )}
      </div>

      {/* PDF Download */}
      <button
        className="btn btn-primary btn-lg"
        onClick={onDownloadPdf}
        disabled={isPdfLoading || isSheetsLoading}
        aria-label="Download invoice as PDF"
        id="download-pdf-btn"
      >
        {isPdfLoading ? (
          <>
            <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
            Generating PDF...
          </>
        ) : (
          <>
            <Download size={16} />
            Download PDF
          </>
        )}
      </button>

      {/* Google Sheets Section */}
      <div className="summary-card">
        <div className="summary-title">
          <Sheet size={12} />
          <span>Google Sheets</span>
        </div>

        {googleUser ? (
          <>
            <div className="google-user" style={{ marginBottom: '0.75rem' }}>
              <div className="google-avatar">
                {(googleUser.name || googleUser.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <div className="google-name">{googleUser.name || 'Google User'}</div>
                <div className="google-email">{googleUser.email}</div>
              </div>
            </div>

            {lastSavedAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', color: 'var(--success)', marginBottom: '0.625rem' }}>
                <CheckCircle size={11} />
                Saved at {lastSavedAt}
              </div>
            )}

            <button
              className="btn btn-accent btn-lg"
              onClick={onSaveToSheets}
              disabled={isSheetsLoading || isPdfLoading}
              aria-label="Save invoice record to Google Sheets"
              id="save-to-sheets-btn"
            >
              {isSheetsLoading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <Sheet size={16} />
                  Save to Sheets
                </>
              )}
            </button>

            {sheetUrl && (
              <a
                href={sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-lg"
                style={{ marginTop: '0.5rem', textDecoration: 'none' }}
                aria-label="Open Google Sheet"
              >
                <ExternalLink size={14} />
                Open Sheet
              </a>
            )}
          </>
        ) : (
          <>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
              Connect your Google account to automatically save invoice records to Google Sheets for team access and reporting.
            </p>
            <button
              className="google-login-btn"
              onClick={onGoogleLogin}
              aria-label="Sign in with Google to enable Sheets integration"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
          </>
        )}
      </div>

      {/* Info note */}
      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.5, padding: '0 0.25rem' }}>
        PDF is generated entirely in your browser. No data is sent to any server during PDF generation.
      </p>
    </div>
  )
}
