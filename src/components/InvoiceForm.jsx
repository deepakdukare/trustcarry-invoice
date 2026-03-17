import { FileText, Users } from 'lucide-react'
import { PRESET_CUSTOMERS } from '../constants.js'

/**
 * Invoice Details and Customer/Bill-To Form Sections
 * SRS Section 4.1 and 4.2
 */
export function InvoiceDetailsForm({ form, errors, onChange }) {
  const fields = [
    { id: 'invoiceNo', label: 'Invoice No.', placeholder: 'TCS-130-25/26', required: true, type: 'text' },
    { id: 'vehicleNo', label: 'Vehicle No.', placeholder: 'MH-43-BX-1097', required: true, type: 'text' },
    { id: 'invoiceDate', label: 'Invoice Date', required: true, type: 'date' },
    { id: 'supplyDate', label: 'Date of Supply', required: true, type: 'date' },
    { id: 'state', label: 'State', placeholder: 'Maharashtra', required: true, type: 'text' },
    { id: 'stateCode', label: 'State Code', placeholder: '27', required: true, type: 'text' },
    { id: 'placeOfSupply', label: 'Place of Supply', placeholder: 'Mumbai Local', required: true, type: 'text' },
  ]

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon"><FileText size={14} /></div>
        <span className="card-title">Invoice Details</span>
        <span className="section-label">Section 1</span>
      </div>
      <div className="form-grid">
        {fields.map((f) => (
          <div key={f.id} className="form-group">
            <label className="form-label" htmlFor={f.id}>
              {f.label}
              {f.required && <span className="required" aria-hidden="true">*</span>}
            </label>
            <input
              id={f.id}
              className={`form-input${errors[f.id] ? ' error' : ''}`}
              type={f.type}
              placeholder={f.placeholder}
              value={form[f.id] ?? ''}
              onChange={(e) => onChange(f.id, e.target.value)}
              aria-invalid={!!errors[f.id]}
              aria-describedby={errors[f.id] ? `${f.id}-error` : undefined}
              required={f.required}
            />
            {errors[f.id] && (
              <span id={`${f.id}-error`} className="field-error" role="alert">
                {errors[f.id]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Customer / Bill To form (SRS Section 4.2)
 */
export function BillToForm({ billTo, errors, onChange }) {
  const handlePresetSelect = (e) => {
    const selected = PRESET_CUSTOMERS.find(c => c.name === e.target.value)
    if (selected) {
      onChange({
        ...billTo,
        name: selected.name,
        address: selected.address,
        state: selected.state,
        stateCode: selected.stateCode
      })
    }
  }

  const handleChange = (key, val) => onChange({ ...billTo, [key]: val })

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon"><Users size={14} /></div>
        <span className="card-title">Bill To (Customer Details)</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="form-label" style={{ marginBottom: 0, textTransform: 'none', fontSize: '0.65rem' }}>Presets:</span>
          <select 
            className="form-select" 
            style={{ width: 'auto', padding: '0.2rem 0.5rem', height: '28px', fontSize: '0.7rem' }}
            onChange={handlePresetSelect}
            value=""
          >
            <option value="" disabled>Select a customer...</option>
            {PRESET_CUSTOMERS.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <span className="section-label" style={{ marginLeft: '0.5rem' }}>Section 2</span>
      </div>
      <div className="form-grid">
        <div className="form-group full">
          <label className="form-label" htmlFor="billToName">
            Customer Name<span className="required" aria-hidden="true">*</span>
          </label>
          <input
            id="billToName"
            className={`form-input${errors.billToName ? ' error' : ''}`}
            type="text"
            placeholder="Search or enter customer name..."
            value={billTo.name}
            onChange={(e) => handleChange('name', e.target.value)}
            aria-invalid={!!errors.billToName}
            required
          />
          {errors.billToName && <span className="field-error" role="alert">{errors.billToName}</span>}
        </div>

        <div className="form-group full">
          <label className="form-label" htmlFor="billToAddress">
            Customer Address<span className="required" aria-hidden="true">*</span>
          </label>
          <textarea
            id="billToAddress"
            className={`form-textarea${errors.billToAddress ? ' error' : ''}`}
            placeholder="Full address content..."
            value={billTo.address}
            onChange={(e) => handleChange('address', e.target.value)}
            aria-invalid={!!errors.billToAddress}
            required
            style={{ minHeight: '100px' }}
          />
          {errors.billToAddress && <span className="field-error" role="alert">{errors.billToAddress}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="billToState">
            State<span className="required" aria-hidden="true">*</span>
          </label>
          <input
            id="billToState"
            className={`form-input${errors.billToState ? ' error' : ''}`}
            type="text"
            placeholder="Maharashtra"
            value={billTo.state}
            onChange={(e) => handleChange('state', e.target.value)}
            required
          />
          {errors.billToState && <span className="field-error" role="alert">{errors.billToState}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="billToStateCode">
            State Code<span className="required" aria-hidden="true">*</span>
          </label>
          <input
            id="billToStateCode"
            className={`form-input${errors.billToStateCode ? ' error' : ''}`}
            type="text"
            placeholder="27"
            value={billTo.stateCode}
            onChange={(e) => handleChange('stateCode', e.target.value)}
            required
          />
          {errors.billToStateCode && <span className="field-error" role="alert">{errors.billToStateCode}</span>}
        </div>
      </div>
    </div>
  )
}
