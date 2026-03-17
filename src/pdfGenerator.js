import jsPDF from 'jspdf'
import { COMPANY, BANK, TERMS } from './constants.js'
import {
  calcTaxableValue, calcCGST, calcSGST,
  calcTotals, formatINR, numberToWords, formatDate, getPdfFilename,
} from './utils.js'

// Colors representing the target image style
const BLUE_LIGHT = [204, 230, 255]
const GRAY_BORDER = [0, 0, 0] // Sharp black lines like in the image
const WHITE = [255, 255, 255]
const TEXT_DARK = [0, 0, 0]

/**
 * Helper to load image from URL as a promise
 */
function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = url
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
  })
}

/**
 * Generate and download a GST-compliant Tax Invoice PDF
 * Matches the reference image layout provided by the user exactly.
 */
export async function generateInvoicePDF(form, items) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 5 // Narrower margins for high density
  const usable = W - (margin * 2)
  let y = margin

  // Pre-load the logo from the public folder
  const logoImg = await loadImage('/logo.jpeg')

  // ── Helpers ──────────────────────────────────────────────
  function setFont(size, style = 'normal', color = TEXT_DARK) {
    doc.setFontSize(size)
    doc.setFont('helvetica', style)
    doc.setTextColor(...color)
  }

  function rect(x, yPos, w, h, fill = null) {
    doc.setDrawColor(...GRAY_BORDER)
    doc.setLineWidth(0.3)
    if (fill) {
      doc.setFillColor(...fill)
      doc.rect(x, yPos, w, h, 'FD')
    } else {
      doc.rect(x, yPos, w, h, 'D')
    }
  }

  function line(x1, y1, x2, y2) {
    doc.setDrawColor(...GRAY_BORDER)
    doc.setLineWidth(0.3)
    doc.line(x1, y1, x2, y2)
  }

  // ── 1. HEADER (Logo + Company info) ──────────────────────
  rect(margin, y, usable, 30)
  
  // Logo Box on the left
  rect(margin + 2, y + 3, 40, 24)
  if (logoImg) {
    // scale to fit roughly in the 40x24 box with padding
    doc.addImage(logoImg, 'JPEG', margin + 4, y + 5, 36, 20)
  } else {
    setFont(9, 'bold')
    doc.text('TRUSTCARRY', margin + 22, y + 14, { align: 'center' }) 
    setFont(5, 'normal')
    doc.text('"BUILD TO MOVE. DRIVEN BY TRUST."', margin + 22, y + 18, { align: 'center' })
  }

  // Company Info centered bold
  setFont(12, 'bold')
  doc.text(COMPANY.name, margin + (usable / 2) + 15, y + 8, { align: 'center' })
  
  setFont(8, 'bold')
  const addr1 = "1057, Bima Complex, Near Steel Market, Kalamboli Navi Mumbai-410218,";
  doc.text(addr1, margin + (usable / 2) + 15, y + 13, { align: 'center' })
  doc.text("Navi Mumbai, Maharashtra, 410218,", margin + (usable / 2) + 15, y + 17, { align: 'center' })
  
  setFont(8, 'bold')
  doc.text("9075950416,", margin + (usable / 2) + 15, y + 21, { align: 'center' })
  doc.text(COMPANY.email, margin + (usable / 2) + 15, y + 25, { align: 'center' })
  doc.text(`PAN No: ${COMPANY.pan}`, margin + (usable / 2) + 15, y + 29, { align: 'center' })

  y += 30

  // ── 2. TAX INVOICE BAR ──────────────────────────────────
  rect(margin, y, usable, 8, BLUE_LIGHT)
  setFont(11, 'bold')
  doc.text('TAX INVOICE', margin + (usable / 2), y + 6, { align: 'center' })
  
  // Recipient Box on TOP RIGHT of this bar
  rect(W - margin - 35, y, 35, 4, [230, 245, 255])
  setFont(5.5, 'normal')
  doc.text('✔ Original for Recipient', W - margin - 33, y + 3)
  
  y += 8

  // ── 3. INVOICE DETAILS GRID ──────────────────────────────
  const rowH = 6
  rect(margin, y, usable, rowH * 3)
  line(margin + (usable / 2) - 10, y, margin + (usable / 2) - 10, y + (rowH * 3))

  const gridData = [
    { l1: 'Invoice No.', v1: `: ${form.invoiceNo}`, l2: 'Vehicle No.', v2: `: ${form.vehicleNo}` },
    { l1: 'Invoice Date', v1: `: ${formatDate(form.invoiceDate)}`, l2: 'Date of Supply', v2: `: ${formatDate(form.supplyDate)}` },
    { l1: 'State', v1: `: ${form.state}`, l2: 'Place of Supply', v2: `: ${form.placeOfSupply}` }
  ]

  gridData.forEach((row, i) => {
    const ry = y + (i * rowH)
    setFont(8, 'normal')
    doc.text(row.l1, margin + 2, ry + 4.5)
    setFont(8, 'bold')
    doc.text(row.v1, margin + 45, ry + 4.5)
    
    setFont(8, 'normal')
    doc.text(row.l2, margin + (usable/2) - 8, ry + 4.5)
    setFont(8, 'bold')
    doc.text(row.v2, margin + (usable/2) + 45, ry + 4.5)
    
    if (i === 2) {
      // Small box for State Code
      rect(margin + 75, ry + 0.5, 12, 5)
      setFont(5, 'bold')
      doc.text("State", margin + 76, ry + 2.5)
      doc.text("Code :27", margin + 76, ry + 4.5)
    }
  })

  y += (rowH * 3)

  // ── 4. BILLED TO BAR ────────────────────────────────────
  rect(margin, y, usable, 5, BLUE_LIGHT)
  setFont(8, 'bold')
  doc.text('Details of Receiver  |  Billed to:', margin + (usable / 2), y + 3.8, { align: 'center' })
  y += 5

  // Billed To area
  const billH = 22
  rect(margin, y, usable, billH)
  setFont(9, 'normal')
  doc.text('Name', margin + 2, y + 6)
  doc.text(':', margin + 35, y + 6)
  setFont(9, 'bold')
  doc.text(form.billTo.name, margin + 40, y + 6)

  setFont(9, 'normal')
  doc.text('Address', margin + 2, y + 12)
  doc.text(':', margin + 35, y + 12)
  const billLines = doc.splitTextToSize(form.billTo.address, usable - 50)
  doc.text(billLines, margin + 40, y + 12)

  setFont(9, 'normal')
  doc.text('State', margin + 2, y + 20)
  doc.text(':', margin + 35, y + 20)
  setFont(9, 'bold')
  doc.text(form.billTo.state, margin + 40, y + 20)
  
  // State code box for customer
  rect(W - margin - 30, y + 15, 30, 7)
  setFont(7)
  doc.text("State", W - margin - 28, y + 18.5)
  doc.text("Code", W - margin - 28, y + 21)
  setFont(10, 'bold')
  doc.text(String(form.billTo.stateCode), W - margin - 10, y + 20, { align: 'center' })

  y += billH

  // ── 5. ITEMS TABLE (Precision Grid) ─────────────────────
  // Usable width is 200mm (210 - 5 - 5)
  const colX = {
    sr: margin,          // 5
    name: margin + 8,      // 13
    qty: margin + 63,     // 68
    unit: margin + 76,    // 81
    rate: margin + 89,    // 94
    taxable: margin + 107, // 112
    cgst: margin + 131,   // 136
    sgst: margin + 161,   // 166
    total: margin + 191   // 196
  }
  const endX = margin + usable // 205
  
  // Header Row 1
  const headerH = 12
  rect(margin, y, usable, headerH, BLUE_LIGHT)
  setFont(8, 'bold')
  doc.text('Sr.', colX.sr + 4, y + 5, { align: 'center' })
  doc.text('No.', colX.sr + 4, y + 9, { align: 'center' })
  doc.text('Name of product', colX.name + (colX.qty - colX.name)/2, y + 7, { align: 'center' })
  doc.text('QTY', colX.qty + (colX.unit - colX.qty)/2, y + 7, { align: 'center' })
  doc.text('Unit', colX.unit + (colX.rate - colX.unit)/2, y + 7, { align: 'center' })
  doc.text('Rate', colX.rate + (colX.taxable - colX.rate)/2, y + 7, { align: 'center' })
  doc.text('Taxable', colX.taxable + (colX.cgst - colX.taxable)/2, y + 5, { align: 'center' })
  doc.text('Value', colX.taxable + (colX.cgst - colX.taxable)/2, y + 9, { align: 'center' })
  
  doc.text('CGST', colX.cgst + 15, y + 4, { align: 'center' })
  doc.text('SGST', colX.sgst + 15, y + 4, { align: 'center' })
  doc.text('Total', colX.total + (endX - colX.total)/2, y + 7, { align: 'center' })
  
  // Sub-header Rate/Amount division line
  line(colX.cgst, y + 6, colX.cgst + 30, y + 6)
  line(colX.sgst, y + 6, colX.sgst + 30, y + 6)
  
  doc.text('Rate', colX.cgst + 7.5, y + 10, { align: 'center' })
  doc.text('Amount', colX.cgst + 22.5, y + 10, { align: 'center' })
  doc.text('Rate', colX.sgst + 7.5, y + 10, { align: 'center' })
  doc.text('Amount', colX.sgst + 22.5, y + 10, { align: 'center' })
  
  // Sub-lines for Rate/Amount columns
  line(colX.cgst + 15, y + 6, colX.cgst + 15, y + headerH)
  line(colX.sgst + 15, y + 6, colX.sgst + 15, y + headerH)

  y += headerH

  // Table Body Rows
  const tableStart = y
  const minBodyH = 80
  
  items.forEach((item, idx) => {
    const taxable = calcTaxableValue(item.quantity, item.rate)
    const cgst = calcCGST(taxable, item.cgstRate)
    const sgst = calcSGST(taxable, item.sgstRate)
    const total = taxable + cgst + sgst

    setFont(9, 'normal')
    doc.text(`${idx + 1}`, colX.sr + 4, y + 6, { align: 'center' })
    doc.text(item.description, colX.name + 2, y + 6)
    doc.text(`${item.quantity}`, colX.qty + (colX.unit - colX.qty)/2, y + 6, { align: 'center' })
    doc.text(item.unit, colX.unit + (colX.rate - colX.unit)/2, y + 6, { align: 'center' })
    doc.text(Number(item.rate).toFixed(2), colX.taxable - 2, y + 6, { align: 'right' })
    doc.text(formatINR(taxable), colX.cgst - 2, y + 6, { align: 'right' })
    doc.text(`${item.cgstRate}%`, colX.cgst + 7.5, y + 6, { align: 'center' })
    doc.text(formatINR(cgst), colX.cgst + 28, y + 6, { align: 'right' })
    doc.text(`${item.sgstRate}%`, colX.sgst + 7.5, y + 6, { align: 'center' })
    doc.text(formatINR(sgst), colX.sgst + 28, y + 6, { align: 'right' })
    setFont(9, 'bold')
    doc.text(formatINR(total), endX - 2, y + 6, { align: 'right' })
    
    line(margin, y + 9, margin + usable, y + 9)
    y += 9
  })

  // Fill empty table space 
  const tableEnd = Math.max(y, tableStart + minBodyH)
  rect(margin, tableStart, usable, tableEnd - tableStart)
  
  // Draw all vertical lines for the grid
  const vLines = [colX.name, colX.qty, colX.unit, colX.rate, colX.taxable, colX.cgst, colX.cgst + 15, colX.sgst, colX.sgst + 15, colX.total]
  vLines.forEach(x => {
    line(x, tableStart - headerH, x, tableEnd)
  })
  
  y = tableEnd

  // ── 6. TOTAL QUANTITY ROW (Precision Aligned) ───────────
  const { totalQty, totalTaxable, totalCGST, totalSGST, grandTotal } = calcTotals(items)
  rect(margin, y, usable, 8, BLUE_LIGHT)
  setFont(9, 'bold')
  doc.text('Total Quantity', colX.name + (colX.qty - colX.name)/2, y + 5.5, { align: 'center' })
  doc.text(`${totalQty}`, colX.qty + (colX.unit - colX.qty)/2, y + 5.5, { align: 'center' })
  doc.text(`${formatINR(totalTaxable)}`, colX.cgst - 2, y + 5.5, { align: 'right' })
  doc.text(`${formatINR(totalCGST)}`, colX.cgst + 28, y + 5.5, { align: 'right' })
  doc.text(`${formatINR(totalSGST)}`, colX.sgst + 28, y + 5.5, { align: 'right' })
  doc.text(`${formatINR(grandTotal)}`, endX - 2, y + 5.5, { align: 'right' })
  y += 8

  // ── 7. SUMMARY & BANK DETAILS SECTION ──────────────────
  const sumW = usable / 2 + 10
  const bankW = usable - sumW
  
  // Box for Words & Bank on the Left
  rect(margin, y, bankW, 60)
  setFont(8, 'bold')
  doc.text('Total Invoice Amount in words', margin + 3, y + 5)
  setFont(9, 'bold')
  const words = numberToWords(grandTotal)
  const wordLines = doc.splitTextToSize(words, bankW - 6)
  doc.text(wordLines, margin + 3, y + 12)
  
  line(margin, y + 20, margin + bankW, y + 20) // Divider
  setFont(10, 'bold')
  doc.text('Bank Details', margin + (bankW / 2), y + 26, { align: 'center' })
  
  const bankRows = [
    ['Account Holder Name:', BANK.accountHolder],
    ['Bank Account Number:', BANK.accountNo],
    ['Bank IFSC Code:', BANK.ifscCode],
    ['Bank Name:', BANK.bankName],
    ['Bank Branch Name:', BANK.branchName]
  ]

  setFont(8, 'normal')
  bankRows.forEach((r, i) => {
    const ry = y + 33 + (i * 5)
    doc.text(r[0], margin + 3, ry)
    setFont(8, 'bold')
    doc.text(r[1], margin + bankW - 3, ry, { align: 'right' })
    setFont(8, 'normal')
  })

  // Box for Totals on the Right
  rect(margin + bankW, y, sumW, 28)
  const sumLabels = [
    { l: 'Total Amount Before Tax', v: formatINR(totalTaxable) },
    { l: 'Add : CGST', v: formatINR(totalCGST) },
    { l: 'Add : SGST', v: formatINR(totalSGST) },
    { l: 'Total Amount', v: formatINR(grandTotal) }
  ]
  
  sumLabels.forEach((item, i) => {
    const sy = y + (i * 7)
    setFont(8, i === 3 ? 'bold' : 'normal')
    doc.text(item.l, margin + bankW + 4, sy + 5.5)
    doc.text(':', margin + usable - 42, sy + 5.5)
    setFont(9, 'bold')
    doc.text(item.v, margin + usable - 4, sy + 5.5, { align: 'right' })
    if (i < 3) line(margin + bankW, sy + 7, margin + usable, sy + 7)
  })

  // Signatory & Certification part on the Right
  rect(margin + bankW, y + 28, sumW, 52) 
  setFont(8, 'normal')
  doc.text('Certified that the particular given above are true', margin + usable - 3, y + 36, { align: 'right' })
  doc.text('and correct', margin + usable - 3, y + 41, { align: 'right' })
  
  setFont(11, 'bold')
  doc.text(`For, ${COMPANY.name}`, margin + usable - 3, y + 55, { align: 'right' })
  
  setFont(9, 'normal')
  doc.text('Authorised Signatory', margin + usable - 3, y + 75, { align: 'right' })

  // Terms lower left
  rect(margin, y + 60, bankW, 20)
  setFont(9, 'bold')
  doc.text('Terms And Conditions', margin + 2, y + 65)
  setFont(7, 'normal')
  TERMS.forEach((t, i) => {
    doc.text(`${i + 1}. ${t}`, margin + 2, y + 70 + (i * 4))
  })

  // outer border for entire lower section
  rect(margin, y, usable, 80)

  // ── SAVE ─────────────────────────────────────────────────
  const filename = getPdfFilename(form.invoiceNo, form.invoiceDate)
  doc.save(filename)
  return filename
}
