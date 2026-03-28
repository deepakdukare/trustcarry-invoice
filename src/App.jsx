import { useState, useCallback } from 'react'
import { useGoogleLogin } from '@react-oauth/google'

import { Header } from './components/Header.jsx'
import { CompanyInfoCard, BankInfoCard } from './components/CompanyInfo.jsx'
import { InvoiceDetailsForm, BillToForm } from './components/InvoiceForm.jsx'
import { LineItemsTable } from './components/LineItems.jsx'
import { SummarySidebar } from './components/SummarySidebar.jsx'
import { ToastContainer, useToast } from './components/Toast.jsx'

import { DEFAULT_FORM, DEFAULT_ITEM } from './constants.js'
import { generateInvoicePDF } from './pdfGenerator.js'
import { appendInvoiceToSheet, getCustomersFromSheet } from './sheetsService.js'

// ──────────────────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────────────────
function validateForm(form, items) {
  const errs = {}

  const required = ['invoiceNo', 'vehicleNo', 'invoiceDate', 'supplyDate', 'state', 'stateCode', 'placeOfSupply']
  required.forEach((k) => {
    if (!form[k]?.trim()) errs[k] = 'This field is required'
  })

  if (!form.billTo.name?.trim()) errs.billToName = 'Customer name is required'
  if (!form.billTo.address?.trim()) errs.billToAddress = 'Customer address is required'
  if (!form.billTo.state?.trim()) errs.billToState = 'State is required'
  if (!form.billTo.stateCode?.trim()) errs.billToStateCode = 'State code is required'

  items.forEach((item, i) => {
    const ie = {}
    if (!item.description?.trim()) ie.description = 'Required'
    if (!item.quantity || parseFloat(item.quantity) <= 0) ie.quantity = 'Must be > 0'
    if (!item.rate || parseFloat(item.rate) <= 0) ie.rate = 'Must be > 0'
    const cgst = parseFloat(item.cgstRate) || 0
    const sgst = parseFloat(item.sgstRate) || 0
    if (cgst < 0 || cgst > 100) ie.cgstRate = '0-100%'
    if (sgst < 0 || sgst > 100) ie.sgstRate = '0-100%'
    if (Object.keys(ie).length) errs[`item_${i}`] = ie
  })

  if (items.length === 0) errs.items = 'At least one line item is required'

  return errs
}

// ──────────────────────────────────────────────────────────
// App
// ──────────────────────────────────────────────────────────
export default function App() {
  const { toasts, remove, success, error, loading } = useToast()

  // ── Form state ──────────────────────────────────────────
  const [form, setForm] = useState(DEFAULT_FORM)
  const [items, setItems] = useState([DEFAULT_ITEM()])
  const [errors, setErrors] = useState({})

  // ── Loading states ──────────────────────────────────────
  const [isPdfLoading, setIsPdfLoading] = useState(false)
  const [isSheetsLoading, setIsSheetsLoading] = useState(false)

  // ── Google Auth state ───────────────────────────────────
  const [googleUser, setGoogleUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [lastSavedAt, setLastSavedAt] = useState(null)
  const [sheetCustomers, setSheetCustomers] = useState([])

  // ── Google Login ────────────────────────────────────────
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setAccessToken(tokenResponse.access_token)
      // Fetch user profile
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        const profile = await res.json()
        setGoogleUser({ name: profile.name, email: profile.email })
        success(`Signed in as ${profile.email}`)
      } catch {
        setGoogleUser({ name: '', email: '' })
        success('Google account connected')
      }
      
      // Load customers from Sheet2
      try {
        const custs = await getCustomersFromSheet(tokenResponse.access_token)
        setSheetCustomers(custs)
        if (custs.length > 0) {
          success(`Loaded ${custs.length} customers from Sheet2`)
        }
      } catch (err) {
        console.error('Failed to load Sheet2 customers', err)
      }
    },
    onError: () => error('Google sign-in failed. Please try again.'),
    scope: 'https://www.googleapis.com/auth/spreadsheets',
  })

  const handleGoogleLogin = (tokenRes) => {
    // Called from Header (non-hook path) – re-trigger via login hook
    // Header uses its own useGoogleLogin hook
  }

  const handleGoogleLogout = () => {
    setGoogleUser(null)
    setAccessToken(null)
    setLastSavedAt(null)
    success('Signed out of Google')
  }

  // ── Form handlers ───────────────────────────────────────
  const handleFormChange = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }, [])

  const handleBillToChange = useCallback((updated) => {
    setForm((prev) => ({ ...prev, billTo: updated }))
  }, [])

  const handleItemChange = useCallback((idx, key, value) => {
    setItems((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [key]: value }
      return next
    })
    setErrors((prev) => {
      const next = { ...prev }
      if (next[`item_${idx}`]) {
        next[`item_${idx}`] = { ...next[`item_${idx}`], [key]: undefined }
      }
      return next
    })
  }, [])

  const handleAddItem = useCallback(() => {
    if (items.length >= 50) return
    setItems((prev) => [...prev, DEFAULT_ITEM()])
  }, [items.length])

  const handleRemoveItem = useCallback((idx) => {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }, [items.length])

  // ── Validate ────────────────────────────────────────────
  const validate = () => {
    const errs = validateForm(form, items)
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      error('Please fix the highlighted errors before proceeding.')
      // Scroll to first error
      const firstKey = Object.keys(errs)[0]
      const el = document.getElementById(firstKey) || document.querySelector('.form-input.error')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return false
    }
    return true
  }

  // ── Download PDF ─────────────────────────────────────────
  const handleDownloadPdf = async () => {
    if (!validate()) return
    setIsPdfLoading(true)
    const tid = loading('Generating PDF...')
    try {
      const filename = await generateInvoicePDF(form, items)
      remove(tid)
      success(`Downloaded: ${filename}`)
      
      // Auto-trigger Google Sheets save right after downloading invoice!
      if (googleUser && accessToken) {
        handleSaveToSheets()
      }
      
    } catch (err) {
      remove(tid)
      error(`PDF generation failed: ${err.message}`)
      console.error(err)
    } finally {
      setIsPdfLoading(false)
    }
  }

  // ── Save to Sheets ───────────────────────────────────────
  const handleSaveToSheets = async () => {
    if (!googleUser || !accessToken) {
      googleLogin()
      return
    }
    if (!validate()) return

    setIsSheetsLoading(true)
    const tid = loading('Saving to Google Sheets...')
    try {
      await appendInvoiceToSheet(form, items, accessToken, googleUser.email)
      remove(tid)
      const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      setLastSavedAt(time)
      success('Invoice record saved to Google Sheets!')
    } catch (err) {
      remove(tid)
      if (err.message.includes('SPREADSHEET_ID not configured')) {
        error('Google Sheets not configured. Set VITE_SPREADSHEET_ID in .env file.', 6000)
      } else {
        error(`Sheets error: ${err.message}`, 5000)
      }
      console.error(err)
    } finally {
      setIsSheetsLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="app-wrapper">
      <Header
        googleUser={googleUser}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={handleGoogleLogout}
      />

      <div className="page-hero">
        <h1 className="page-title">
          Tax Invoice <span>Generator</span>
        </h1>
        <p className="page-subtitle">
          GST-compliant invoices for TRUSTCARRY TRANSPORT SERVICES · Client-side PDF · Google Sheets integration
        </p>
      </div>

      <main className="main-content" id="main">
        <div className="form-area">
          <InvoiceDetailsForm form={form} errors={errors} onChange={handleFormChange} />
          <BillToForm billTo={form.billTo} errors={errors} onChange={handleBillToChange} sheetCustomers={sheetCustomers} />
          <LineItemsTable
            items={items}
            errors={errors}
            onItemChange={handleItemChange}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
          />
          <CompanyInfoCard />
          <BankInfoCard />
        </div>

        <SummarySidebar
          items={items}
          isPdfLoading={isPdfLoading}
          isSheetsLoading={isSheetsLoading}
          googleUser={googleUser}
          onDownloadPdf={handleDownloadPdf}
          onSaveToSheets={handleSaveToSheets}
          onGoogleLogin={() => googleLogin()}
          lastSavedAt={lastSavedAt}
        />
      </main>

      <ToastContainer toasts={toasts} onRemove={remove} />
    </div>
  )
}
