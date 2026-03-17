// ============================================================
// Calculation Utilities
// All formulas from SRS Section 9 / Calculation Formulas
// ============================================================

/**
 * Calculate taxable value for a line item: Qty × Rate
 */
export function calcTaxableValue(qty, rate) {
  const q = parseFloat(qty) || 0
  const r = parseFloat(rate) || 0
  return round2(q * r)
}

/**
 * Calculate CGST amount: (Taxable × CGST%) / 100
 */
export function calcCGST(taxableValue, cgstRate) {
  return round2((taxableValue * (parseFloat(cgstRate) || 0)) / 100)
}

/**
 * Calculate SGST amount: (Taxable × SGST%) / 100
 */
export function calcSGST(taxableValue, sgstRate) {
  return round2((taxableValue * (parseFloat(sgstRate) || 0)) / 100)
}

/**
 * Calculate item total: Taxable + CGST + SGST
 */
export function calcItemTotal(taxable, cgst, sgst) {
  return round2(taxable + cgst + sgst)
}

/**
 * Calculate all totals from an array of items
 */
export function calcTotals(items) {
  let totalQty = 0
  let totalTaxable = 0
  let totalCGST = 0
  let totalSGST = 0

  items.forEach((item) => {
    const taxable = calcTaxableValue(item.quantity, item.rate)
    const cgst = calcCGST(taxable, item.cgstRate)
    const sgst = calcSGST(taxable, item.sgstRate)
    totalQty += parseFloat(item.quantity) || 0
    totalTaxable += taxable
    totalCGST += cgst
    totalSGST += sgst
  })

  return {
    totalQty: round2(totalQty),
    totalTaxable: round2(totalTaxable),
    totalCGST: round2(totalCGST),
    totalSGST: round2(totalSGST),
    grandTotal: round2(totalTaxable + totalCGST + totalSGST),
  }
}

/**
 * Round to 2 decimal places
 */
function round2(val) {
  return Math.round(val * 100) / 100
}

/**
 * Format as Indian currency string
 */
export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0)
}

/**
 * Convert number to Indian Rupees in words
 */
export function numberToWords(amount) {
  if (!amount || amount === 0) return 'Zero Rupees Only'

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen',
    'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function convertHundreds(n) {
    let words = ''
    if (n >= 100) {
      words += ones[Math.floor(n / 100)] + ' Hundred '
      n %= 100
    }
    if (n >= 20) {
      words += tens[Math.floor(n / 10)] + ' '
      n %= 10
    }
    if (n > 0) words += ones[n] + ' '
    return words
  }

  const paise = Math.round((amount % 1) * 100)
  let rupees = Math.floor(amount)
  let words = ''

  if (rupees >= 10000000) {
    words += convertHundreds(Math.floor(rupees / 10000000)) + 'Crore '
    rupees %= 10000000
  }
  if (rupees >= 100000) {
    words += convertHundreds(Math.floor(rupees / 100000)) + 'Lakh '
    rupees %= 100000
  }
  if (rupees >= 1000) {
    words += convertHundreds(Math.floor(rupees / 1000)) + 'Thousand '
    rupees %= 1000
  }
  if (rupees > 0) {
    words += convertHundreds(rupees)
  }

  let result = words.trim() + ' Rupees'
  if (paise > 0) result += ' and ' + convertHundreds(paise).trim() + ' Paise'
  return result + ' Only'
}

/**
 * Format date string YYYY-MM-DD → DD-MM-YYYY for display/PDF
 */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}-${m}-${y}`
}

/**
 * Generate PDF filename
 */
export function getPdfFilename(invoiceNo, dateStr) {
  const safeInvoiceNo = (invoiceNo || 'DRAFT').replace(/[/\\:*?"<>|]/g, '-')
  const date = formatDate(dateStr) || new Date().toLocaleDateString('en-IN')
  return `invoice_${safeInvoiceNo}_${date}.pdf`
}
