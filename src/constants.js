// ============================================================
// COMPANY CONSTANTS - TRUSTCARRY TRANSPORT SERVICES
// These are hardcoded per SRS and cannot be modified at runtime
// ============================================================

export const COMPANY = {
  name: 'TRUSTCARRY TRANSPORT SERVICES',
  address: '1057, Bima Complex, Near Steel Market, Kalamboli',
  city: 'Navi Mumbai',
  state: 'Maharashtra',
  postalCode: '410218',
  phone: '9075950416',
  email: 'trustcarry.serve@gmail.com',
  pan: 'GNAPD6508P',
  fullAddress: '1057, Bima Complex, Near Steel Market, Kalamboli, Navi Mumbai, Maharashtra - 410218',
}

export const BANK = {
  accountHolder: 'Gajanan Pandurang Dukare',
  accountNo: '924010064303804',
  ifscCode: 'UTIB0000072',
  bankName: 'Axis Bank',
  branchName: 'Vashi Mumbai (MH) Navi Mumbai 400705',
}

export const TERMS = [
  'This is an electronically generated document.',
  'All disputes are subject to Navi Mumbai jurisdiction',
]

export const CERTIFICATION = `Certified that the particulars given above are true and correct\n\nFor, TRUSTCARRY TRANSPORT SERVICES\n\nAuthorised Signatory`

// Available units for line items
export const UNITS = ['EA', 'KG', 'L', 'MT', 'KM', 'HRS', 'TRIP', 'TON', 'PCS', 'BOX']

// Preset Customers for Quick Selection
export const PRESET_CUSTOMERS = [
  {
    name: 'ANUSAYA FRESH INDIA PVT LTD.',
    address: 'Anusaya Fresh India Pvt Ltd, Office: Niryat Bhavna, Masjid Rd, Sector 19F, Vashi, Navi Mumbai, Maharashtra 400703, Mumbai , Maharashtra',
    state: 'Maharashtra',
    stateCode: '27',
  },
]

// Section 5: Google Sheets Configuration
export const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID || ''
export const SHEET_RANGE = 'Sheet1!A:L'

// Section 6: Default States
export const DEFAULT_ITEM = () => ({
  id: Date.now(),
  description: '',
  quantity: '',
  unit: 'EA',
  rate: '',
  cgstRate: 0,
  sgstRate: 0,
})

export const DEFAULT_FORM = {
  invoiceNo: '',
  vehicleNo: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  supplyDate: new Date().toISOString().split('T')[0],
  state: 'Maharashtra',
  stateCode: '27',
  placeOfSupply: '',
  billTo: {
    name: '',
    address: '',
    state: 'Maharashtra',
    stateCode: '27',
  },
}
