import { Building2, CreditCard, Lock } from 'lucide-react'
import { COMPANY, BANK } from '../constants.js'

/**
 * Read-only Company and Bank detail cards (Section 3 of SRS)
 */
export function CompanyInfoCard() {
  const companyFields = [
    { label: 'Company Name', value: COMPANY.name },
    { label: 'Address', value: COMPANY.address },
    { label: 'City', value: COMPANY.city },
    { label: 'State', value: COMPANY.state },
    { label: 'Postal Code', value: COMPANY.postalCode },
    { label: 'Phone', value: COMPANY.phone },
    { label: 'Email', value: COMPANY.email },
    { label: 'PAN No.', value: COMPANY.pan },
  ]

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon"><Building2 size={14} /></div>
        <span className="card-title">Company Information</span>
        <div className="badge-readonly" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Lock size={8} /> Read-Only
        </div>
      </div>
      <div className="info-grid">
        {companyFields.map((f) => (
          <div key={f.label} className="info-item">
            <div className="info-label">{f.label}</div>
            <div className="info-value">{f.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BankInfoCard() {
  const bankFields = [
    { label: 'Account Holder', value: BANK.accountHolder },
    { label: 'Account No.', value: BANK.accountNo },
    { label: 'IFSC Code', value: BANK.ifscCode },
    { label: 'Bank Name', value: BANK.bankName },
    { label: 'Branch', value: BANK.branchName },
  ]

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon"><CreditCard size={14} /></div>
        <span className="card-title">Bank Details</span>
        <div className="badge-readonly" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Lock size={8} /> Read-Only
        </div>
      </div>
      <div className="info-grid">
        {bankFields.map((f) => (
          <div key={f.label} className="info-item">
            <div className="info-label">{f.label}</div>
            <div className="info-value">{f.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
