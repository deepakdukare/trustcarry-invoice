import { PlusCircle, Trash2, Package } from 'lucide-react'
import { UNITS, DEFAULT_ITEM } from '../constants.js'
import { calcTaxableValue, calcCGST, calcSGST, calcItemTotal, formatINR } from '../utils.js'

/**
 * Line Items management table
 * SRS Section 4.3 – dynamic multi-item table with real-time calculations
 */
export function LineItemsTable({ items, errors, onItemChange, onAddItem, onRemoveItem }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon"><Package size={14} /></div>
        <span className="card-title">Line Items</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {items.length} / 50 items
        </span>
        <span className="section-label">Section 3</span>
      </div>

      <div className="items-table-wrap">
        <table className="items-table" aria-label="Invoice line items">
          <thead>
            <tr>
              <th className="col-sr">#</th>
              <th className="col-desc">Description</th>
              <th className="col-qty">Qty</th>
              <th className="col-unit">Unit</th>
              <th className="col-rate">Rate (₹)</th>
              <th className="col-tax">CGST %</th>
              <th className="col-tax">SGST %</th>
              <th className="col-value">Taxable (₹)</th>
              <th className="col-value">CGST (₹)</th>
              <th className="col-value">SGST (₹)</th>
              <th className="col-value">Total (₹)</th>
              <th className="col-action"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const taxable = calcTaxableValue(item.quantity, item.rate)
              const cgstAmt = calcCGST(taxable, item.cgstRate)
              const sgstAmt = calcSGST(taxable, item.sgstRate)
              const total = calcItemTotal(taxable, cgstAmt, sgstAmt)
              const itemErr = errors[`item_${idx}`] || {}

              return (
                <tr key={item.id}>
                  <td className="col-sr" data-label="#"><span className="sr-number">{idx + 1}</span></td>

                  <td className="col-desc" data-label="Description">
                    <input
                      className={`form-input${itemErr.description ? ' error' : ''}`}
                      type="text"
                      placeholder="Service description..."
                      value={item.description}
                      onChange={(e) => onItemChange(idx, 'description', e.target.value)}
                      aria-label={`Item ${idx + 1} description`}
                      maxLength={200}
                      required
                    />
                    {itemErr.description && <div className="field-error" style={{ marginTop: 2 }}>{itemErr.description}</div>}
                  </td>

                  <td className="col-qty" data-label="Qty">
                    <input
                      className={`form-input${itemErr.quantity ? ' error' : ''}`}
                      type="number"
                      placeholder="1"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => onItemChange(idx, 'quantity', e.target.value)}
                      aria-label={`Item ${idx + 1} quantity`}
                      required
                    />
                  </td>

                  <td className="col-unit" data-label="Unit">
                    <select
                      className="form-select"
                      value={item.unit}
                      onChange={(e) => onItemChange(idx, 'unit', e.target.value)}
                      aria-label={`Item ${idx + 1} unit`}
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </td>

                  <td className="col-rate" data-label="Rate (₹)">
                    <input
                      className={`form-input${itemErr.rate ? ' error' : ''}`}
                      type="number"
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => onItemChange(idx, 'rate', e.target.value)}
                      aria-label={`Item ${idx + 1} rate`}
                      required
                    />
                  </td>

                  <td className="col-tax" data-label="CGST %">
                    <input
                      className="form-input"
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.cgstRate}
                      onChange={(e) => onItemChange(idx, 'cgstRate', e.target.value)}
                      aria-label={`Item ${idx + 1} CGST rate`}
                    />
                  </td>

                  <td className="col-tax" data-label="SGST %">
                    <input
                      className="form-input"
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.sgstRate}
                      onChange={(e) => onItemChange(idx, 'sgstRate', e.target.value)}
                      aria-label={`Item ${idx + 1} SGST rate`}
                    />
                  </td>

                  {/* Computed columns – read only */}
                  <td className="col-value" data-label="Taxable">
                    <span className="calc-value">₹{formatINR(taxable)}</span>
                  </td>
                  <td className="col-value" data-label="CGST">
                    <span className="calc-value">₹{formatINR(cgstAmt)}</span>
                  </td>
                  <td className="col-value" data-label="SGST">
                    <span className="calc-value">₹{formatINR(sgstAmt)}</span>
                  </td>
                  <td className="col-value" data-label="Total">
                    <span className="calc-value" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                      ₹{formatINR(total)}
                    </span>
                  </td>

                  <td className="col-action" data-label="Action">
                    <button
                      className="btn btn-ghost"
                      onClick={() => onRemoveItem(idx)}
                      disabled={items.length === 1}
                      title="Remove item"
                      aria-label={`Remove item ${idx + 1}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="items-header" style={{ marginTop: 0 }}>
        <button
          className="btn btn-add"
          onClick={onAddItem}
          disabled={items.length >= 50}
          aria-label="Add new line item"
        >
          <PlusCircle size={14} />
          Add Item
        </button>
        {errors.items && (
          <span className="field-error" role="alert">{errors.items}</span>
        )}
      </div>
    </div>
  )
}
