import { SPREADSHEET_ID, SHEET_RANGE } from './constants.js'
import { calcTotals, formatDate } from './utils.js'

/**
 * Append one invoice record to the configured Google Sheet.
 * Requires the user to be authenticated and have provided an access token.
 *
 * Sheet columns (per SRS Section 8.1):
 * A=Timestamp, B=InvoiceNo, C=VehicleNo, D=InvoiceDate,
 * E=CustomerName, F=CustomerEmail(N/A), G=TaxableValue,
 * H=CGSTAmount, I=SGSTAmount, J=TotalAmount, K=Status, L=GeneratedBy
 *
 * @param {object} form        - Invoice form data
 * @param {Array}  items       - Line items array
 * @param {string} accessToken - Google OAuth access token
 * @param {string} userEmail   - Authenticated user email
 * @returns {Promise<boolean>}
 */
export async function appendInvoiceToSheet(form, items, accessToken, userEmail) {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID') {
    throw new Error('SPREADSHEET_ID not configured. Set VITE_SPREADSHEET_ID in .env file.')
  }

  const { totalTaxable, totalCGST, totalSGST, grandTotal } = calcTotals(items)
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })

  const rowData = [
    timestamp,
    form.invoiceNo,
    form.vehicleNo,
    formatDate(form.invoiceDate),
    form.billTo.name,
    'N/A',               // Customer email (optional in SRS)
    totalTaxable,
    totalCGST,
    totalSGST,
    grandTotal,
    'Generated',
    userEmail || 'Unknown',
  ]

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_RANGE}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: [rowData] }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || `HTTP ${res.status}`
    throw new Error(`Google Sheets API error: ${msg}`)
  }

  return true
}

/**
 * Get the URL to open the target Google Sheet
 */
export function getSheetUrl() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID') return null
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`
}
