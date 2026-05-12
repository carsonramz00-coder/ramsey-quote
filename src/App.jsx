import { useState, useEffect } from 'react';
import { Printer, RotateCcw, FileText } from 'lucide-react';

export default function App() {
  // ===== STATE =====
  const todayISO = new Date().toISOString().split('T')[0];
  const defaultValidThrough = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const [form, setForm] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    vehicle: '',
    vehicleSize: 'suv',
    datePrepared: todayISO,
    validThrough: defaultValidThrough(),
    selectedPackage: 'stayNew',
    addOns: '',
    springSpecial: true,
    customDiscount: '',
  });

  // ===== PRICING =====
  const pricing = {
    sedan: { essential: 1995, stayNew: 2495, ultimate: 3695 },
    suv:   { essential: 2295, stayNew: 2795, ultimate: 3995 },
    large: { essential: 2695, stayNew: 3295, ultimate: 4495 },
  };

  const sizeLabels = {
    sedan: 'Sedan / Coupe',
    suv:   'SUV / Small Truck',
    large: 'Large SUV / Large Truck / Minivan',
  };

  const sizeExamples = {
    sedan: 'Mustang, Miata, Tesla Model 3',
    suv:   'Tucson, 4Runner, 2-row SUVs, F-150',
    large: 'Tahoe, 2500-series, minivans',
  };

  const basePrice = pricing[form.vehicleSize][form.selectedPackage];
  const springDiscount = form.springSpecial ? 300 : 0;
  const customDiscountNum = parseFloat(form.customDiscount) || 0;
  const total = Math.max(0, basePrice - springDiscount - customDiscountNum);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const reset = () => {
    if (!window.confirm('Clear all fields and start a new quote?')) return;
    setForm({
      clientName: '', clientPhone: '', clientEmail: '',
      vehicle: '', vehicleSize: 'suv',
      datePrepared: todayISO, validThrough: defaultValidThrough(),
      selectedPackage: 'stayNew', addOns: '',
      springSpecial: true, customDiscount: '',
    });
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${parseInt(m)}/${parseInt(d)}/${y}`;
  };

  const fmt = (n) => '$' + Number(n).toLocaleString('en-US');

  const is9Year = form.selectedPackage !== 'essential';

  // ===== PRINT HANDLER =====
  // Artifact sandboxes block window.print() and window.open(). The workaround:
  // build a hidden same-origin iframe, write the quote into it, and call
  // print() on the iframe's contentWindow — that's allowed because we own it.
  const handlePrint = () => {
    const quoteEl = document.getElementById('quote-document');
    if (!quoteEl) return;

    // Remove any previous print iframe
    const existing = document.getElementById('print-frame');
    if (existing) existing.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Ramsey Auto Pros Quote</title>
<style>
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0; background: #fff;
    font-family: Helvetica, Arial, sans-serif;
    color: #0a0a0a;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body { padding: 16px; }
  .page-break { page-break-before: always; break-before: page; }
  .avoid-break { page-break-inside: avoid; break-inside: avoid; }
  @page { size: letter; margin: 0.45in 0.5in; }
  @media print { body { padding: 0; } }
</style>
</head><body>${quoteEl.outerHTML}</body></html>`);
    doc.close();

    // Wait for the iframe to render, then trigger print
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (e) {
        // Fallback: download as HTML if print is fully blocked
        downloadAsHTML();
      }
    }, 500);
  };

  // Fallback: save the quote as an HTML file the user can open + print
  const downloadAsHTML = () => {
    const quoteEl = document.getElementById('quote-document');
    if (!quoteEl) return;
    const clientName = (form.clientName || 'Estimate').replace(/[^a-zA-Z0-9-_]/g, '_');
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Ramsey Auto Pros - ${clientName}</title>
<style>
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 24px; background: #fff;
    font-family: Helvetica, Arial, sans-serif;
    color: #0a0a0a;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page-break { page-break-before: always; break-before: page; }
  .avoid-break { page-break-inside: avoid; break-inside: avoid; }
  @page { size: letter; margin: 0.45in 0.5in; }
  @media print { body { padding: 0; } }
</style>
</head><body>${quoteEl.outerHTML}
<script>setTimeout(function(){window.print();},400);<\/script>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RamseyAutoPros_Quote_${clientName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ===== PACKAGES META =====
  const packages = [
    {
      key: 'essential',
      icon: '🥉',
      name: 'Essential',
      tag: 'Professional ceramic protection at a lower investment',
      warranty: '5-Year Protection',
      borderColor: '#c0c0c0',
      headerAccent: '#c0c0c0',
      features: [
        'Full exterior decontamination',
        'Paint enhancement polish',
        '5-Year Gtechniq ceramic coating',
        'Wheel face protection',
        'Trim & plastic protection',
        'Windshield coating',
      ],
      coverage: ['~70% performance of 9-yr system', 'Gtechniq 5-year warranty'],
    },
    {
      key: 'stayNew',
      icon: '🥈',
      name: 'Stay-New',
      tag: 'Our most popular long-term protection system',
      warranty: '9-Year Protection',
      borderColor: '#00ffff',
      headerAccent: '#00ffff',
      badge: '★ MOST POPULAR',
      badgeColor: '#00ffff',
      features: [
        'Full exterior decontamination',
        'Paint enhancement polish',
        'Gtechniq Crystal Serum Ultra (9-yr pro coating)',
        'Wheel face protection',
        'Trim & plastic protection',
        'Windshield coating',
      ],
      coverage: ['Maximum gloss & durability', 'Pro-only Gtechniq formula', 'Double Guarantee'],
    },
    {
      key: 'ultimate',
      icon: '🥇',
      name: 'Ultimate',
      tag: 'Total protection — inside and out',
      warranty: '9-Year • Inside & Out',
      borderColor: '#ffff00',
      headerAccent: '#ffff00',
      badge: '⭐ BEST VALUE',
      badgeColor: '#ffff00',
      features: [
        'Everything in Stay-New, plus:',
        'Full glass coating (all exterior glass)',
        'Brake caliper coating',
        'Door jamb protection',
        'Engine bay protection',
        'Leather protection',
        'Interior plastic & trim',
        'Cloth, fabric & carpet protection',
      ],
      coverage: ['Complete interior & exterior', 'Double Guarantee'],
    },
  ];

  return (
    <div style={{ background: '#e8e8e8', minHeight: '100vh', fontFamily: 'Helvetica, Arial, sans-serif' }}>

      {/* ============ TOP TOOLBAR ============ */}
      <div className="no-print" style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#0a0a0a', color: '#fff',
        padding: '12px 20px',
        borderBottom: '3px solid #00ffff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileText size={20} color="#00ffff" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 2, color: '#00ffff' }}>RAMSEY AUTO PROS</div>
            <div style={{ fontSize: 10, color: '#ffff00', letterSpacing: 1, textTransform: 'uppercase' }}>Quote Builder</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={reset} style={btnSecondary}>
            <RotateCcw size={14} /> New Quote
          </button>
          <button onClick={downloadAsHTML} style={btnSecondary} title="Download as HTML file you can open and print">
            <FileText size={14} /> Download
          </button>
          <button onClick={handlePrint} style={btnPrimary}>
            <Printer size={16} /> Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="builder-layout" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 360px) 1fr',
        gap: 0,
        maxWidth: 1400,
        margin: '0 auto',
      }}>

        {/* ============ FORM PANEL ============ */}
        <div className="no-print" style={{
          background: '#fff',
          padding: 20,
          borderRight: '1px solid #ddd',
        }}>
          <SectionHeader>Client Info</SectionHeader>
          <Field label="Client Name" value={form.clientName} onChange={v => update('clientName', v)} placeholder="John Smith" />
          <Field label="Phone" value={form.clientPhone} onChange={v => update('clientPhone', v)} placeholder="(555) 123-4567" />
          <Field label="Email" value={form.clientEmail} onChange={v => update('clientEmail', v)} placeholder="client@email.com" />

          <SectionHeader>Vehicle</SectionHeader>
          <Field label="Year / Make / Model" value={form.vehicle} onChange={v => update('vehicle', v)} placeholder="2024 BMW X5" />

          <div style={{ marginBottom: 14 }}>
            <Label>Vehicle Size</Label>
            <select value={form.vehicleSize} onChange={e => update('vehicleSize', e.target.value)} style={inputStyle}>
              {Object.entries(sizeLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <div style={{ fontSize: 10, color: '#888', marginTop: 4, fontStyle: 'italic' }}>
              e.g. {sizeExamples[form.vehicleSize]}
            </div>
          </div>

          <SectionHeader>Dates</SectionHeader>
          <Field type="date" label="Date Prepared" value={form.datePrepared} onChange={v => update('datePrepared', v)} />
          <Field type="date" label="Valid Through" value={form.validThrough} onChange={v => update('validThrough', v)} />

          <SectionHeader>Package</SectionHeader>
          <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
            {packages.map(p => {
              const price = pricing[form.vehicleSize][p.key];
              const selected = form.selectedPackage === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => update('selectedPackage', p.key)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    border: selected ? `2.5px solid ${p.borderColor}` : '2px solid #ddd',
                    background: selected ? '#0a0a0a' : '#fff',
                    color: selected ? '#fff' : '#0a0a0a',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13 }}>
                      {p.icon} {p.name}
                    </div>
                    <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{p.warranty}</div>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 14, color: selected ? '#ffff00' : '#0a0a0a' }}>
                    {fmt(price)}
                  </div>
                </button>
              );
            })}
          </div>

          <SectionHeader>Discounts</SectionHeader>
          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '10px 12px',
            background: form.springSpecial ? '#fffce6' : '#f8f8f8',
            border: `2px solid ${form.springSpecial ? '#ffff00' : '#ddd'}`,
            borderRadius: 6, cursor: 'pointer', marginBottom: 10,
          }}>
            <input
              type="checkbox"
              checked={form.springSpecial}
              onChange={e => update('springSpecial', e.target.checked)}
              style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 12 }}>🌸 Spring Stay-New Special</div>
              <div style={{ fontSize: 10, color: '#666', marginTop: 2, lineHeight: 1.4 }}>
                $300 off with deposit{is9Year ? ' + free quarterly detail for life of coating' : ''}
              </div>
            </div>
            <div style={{ fontWeight: 900, color: '#b8000d', fontSize: 13 }}>−$300</div>
          </label>

          <Field
            label="Additional Discount ($)"
            value={form.customDiscount}
            onChange={v => update('customDiscount', v.replace(/[^0-9.]/g, ''))}
            placeholder="0"
          />

          <SectionHeader>Add-Ons / Notes</SectionHeader>
          <textarea
            value={form.addOns}
            onChange={e => update('addOns', e.target.value)}
            placeholder="PPF, tint, additional services..."
            style={{ ...inputStyle, minHeight: 60, resize: 'vertical', fontFamily: 'inherit' }}
          />

          {/* LIVE TOTAL */}
          <div style={{
            marginTop: 20,
            background: '#0a0a0a', color: '#fff',
            borderRadius: 6, padding: 16,
            borderTop: '4px solid #00ffff',
          }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: '#00ffff', fontWeight: 800, textTransform: 'uppercase' }}>
              Live Total
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#ffff00', marginTop: 4 }}>
              {fmt(total)}
            </div>
            <div style={{ fontSize: 9, color: '#aaa', marginTop: 6, lineHeight: 1.5 }}>
              Base: {fmt(basePrice)}
              {springDiscount > 0 && <> · Spring: −$300</>}
              {customDiscountNum > 0 && <> · Custom: −{fmt(customDiscountNum)}</>}
            </div>
          </div>

          <div style={{
            marginTop: 14, fontSize: 9, color: '#888',
            padding: 10, background: '#f8f8f8', borderRadius: 4,
            lineHeight: 1.5,
          }}>
            💡 <strong>Tip:</strong> When printing, set destination to "Save as PDF" and uncheck "Headers and footers" for the cleanest output.
          </div>
        </div>

        {/* ============ QUOTE PREVIEW ============ */}
        <div style={{ padding: '20px 16px', overflowX: 'auto' }}>
          <QuoteDocument
            form={form}
            packages={packages}
            pricing={pricing}
            basePrice={basePrice}
            springDiscount={springDiscount}
            customDiscountNum={customDiscountNum}
            total={total}
            formatDate={formatDate}
            fmt={fmt}
            is9Year={is9Year}
            sizeLabel={sizeLabels[form.vehicleSize]}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .builder-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ===== INPUT STYLES =====
const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  border: '1.5px solid #ccc',
  borderRadius: 4,
  fontSize: 13,
  fontFamily: 'Helvetica, Arial, sans-serif',
  background: '#fff',
  color: '#0a0a0a',
  boxSizing: 'border-box',
};

const btnPrimary = {
  display: 'flex', alignItems: 'center', gap: 6,
  background: '#00ffff', color: '#0a0a0a',
  border: 'none', padding: '8px 16px',
  fontWeight: 800, fontSize: 13, letterSpacing: 1,
  textTransform: 'uppercase',
  borderRadius: 4, cursor: 'pointer',
};

const btnSecondary = {
  display: 'flex', alignItems: 'center', gap: 6,
  background: 'transparent', color: '#fff',
  border: '1.5px solid #555', padding: '7px 12px',
  fontWeight: 700, fontSize: 12, letterSpacing: 0.5,
  borderRadius: 4, cursor: 'pointer',
};

const Label = ({ children }) => (
  <div style={{
    fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase',
    color: '#666', fontWeight: 700, marginBottom: 4,
  }}>
    {children}
  </div>
);

const Field = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div style={{ marginBottom: 12 }}>
    <Label>{label}</Label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
    />
  </div>
);

const SectionHeader = ({ children }) => (
  <div style={{
    fontSize: 11, fontWeight: 900, letterSpacing: 2,
    textTransform: 'uppercase', color: '#0a0a0a',
    marginTop: 18, marginBottom: 10,
    paddingBottom: 6,
    borderBottom: '2px solid #00ffff',
  }}>
    {children}
  </div>
);

// ===== LOGO SVG (recreated from the brand mark) =====
function LogoSVG() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <circle cx="100" cy="100" r="98" fill="#fff" stroke="#0a0a0a" strokeWidth="2"/>
      <circle cx="100" cy="100" r="72" fill="#00ffff"/>
      <circle cx="100" cy="100" r="72" fill="none" stroke="#0a0a0a" strokeWidth="2"/>
      {/* sun */}
      <circle cx="92" cy="92" r="26" fill="#ffff00"/>
      {/* car silhouette - simplified */}
      <path d="M 35,135 Q 55,115 85,112 L 130,108 Q 150,108 160,118 L 168,128 L 168,140 L 32,140 Z" fill="#0a0a0a"/>
      <circle cx="65" cy="142" r="9" fill="#0a0a0a" stroke="#fff" strokeWidth="1.5"/>
      <circle cx="140" cy="142" r="9" fill="#0a0a0a" stroke="#fff" strokeWidth="1.5"/>
      {/* text ring */}
      <defs>
        <path id="logo-top" d="M 100,8 A 92,92 0 0 1 100,8" fill="none"/>
        <path id="logo-arc-top" d="M 20,100 A 80,80 0 0 1 180,100" fill="none"/>
        <path id="logo-arc-bottom" d="M 25,115 A 80,80 0 0 0 175,115" fill="none"/>
      </defs>
      <text fontFamily="Arial Black, Arial" fontWeight="900" fontSize="20" fill="#0a0a0a" letterSpacing="3">
        <textPath href="#logo-arc-top" startOffset="50%" textAnchor="middle">RAMSEY</textPath>
      </text>
      <text fontFamily="Arial Black, Arial" fontWeight="900" fontSize="14" fill="#0a0a0a" letterSpacing="3">
        <textPath href="#logo-arc-bottom" startOffset="50%" textAnchor="middle">AUTO PROS</textPath>
      </text>
    </svg>
  );
}

// ===== GUARANTEE SEAL =====
function GuaranteeSeal() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <defs>
        <path id="seal-top" d="M 30,100 A 70,70 0 0 1 170,100" fill="none"/>
        <path id="seal-bottom" d="M 30,140 A 70,70 0 0 0 170,140" fill="none"/>
      </defs>
      <circle cx="100" cy="100" r="95" fill="#0a0a0a"/>
      <circle cx="100" cy="100" r="95" fill="none" stroke="#00ffff" strokeWidth="3"/>
      <circle cx="100" cy="100" r="85" fill="none" stroke="#ffff00" strokeWidth="2"/>
      <g stroke="#00ffff" strokeWidth="1.5" opacity="0.5">
        <line x1="100" y1="15" x2="100" y2="25"/>
        <line x1="100" y1="175" x2="100" y2="185"/>
        <line x1="15" y1="100" x2="25" y2="100"/>
        <line x1="175" y1="100" x2="185" y2="100"/>
        <line x1="40" y1="40" x2="47" y2="47"/>
        <line x1="160" y1="40" x2="153" y2="47"/>
        <line x1="40" y1="160" x2="47" y2="153"/>
        <line x1="160" y1="160" x2="153" y2="153"/>
      </g>
      <text fontFamily="Arial, Helvetica" fontWeight="900" fontSize="13" fill="#00ffff" letterSpacing="2">
        <textPath href="#seal-top" startOffset="50%" textAnchor="middle">RAMSEY AUTO PROS</textPath>
      </text>
      <text fontFamily="Arial, Helvetica" fontWeight="900" fontSize="9" fill="#ffff00" letterSpacing="3">
        <textPath href="#seal-bottom" startOffset="50%" textAnchor="middle">DOUBLE GUARANTEE</textPath>
      </text>
      <text x="100" y="82" fontFamily="Arial, Helvetica" fontWeight="900" fontSize="38" fill="#ffff00" textAnchor="middle">9</text>
      <text x="100" y="100" fontFamily="Arial, Helvetica" fontWeight="700" fontSize="10" fill="#fff" textAnchor="middle" letterSpacing="2">YEAR</text>
      <line x1="60" y1="107" x2="140" y2="107" stroke="#00ffff" strokeWidth="1.5"/>
      <text x="100" y="121" fontFamily="Arial, Helvetica" fontWeight="800" fontSize="9" fill="#00ffff" textAnchor="middle" letterSpacing="1.5">PERFORMANCE</text>
      <text x="100" y="133" fontFamily="Arial, Helvetica" fontWeight="800" fontSize="9" fill="#00ffff" textAnchor="middle" letterSpacing="1.5">GUARANTEE</text>
    </svg>
  );
}

// ===== CLIENT CARD =====
function ClientCard({ label, value, row1Label, row1Value, row2Label, row2Value }) {
  return (
    <div style={{
      flex: 1,
      border: '1.5px solid #ddd',
      borderLeft: '4px solid #00ffff',
      borderRadius: 4,
      padding: '10px 14px',
      background: '#fafafa',
    }}>
      <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: 1.5, color: '#888', fontWeight: 700, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ borderBottom: '1.5px solid #0a0a0a', minHeight: 22, padding: '2px 4px', fontSize: 11, fontWeight: 700 }}>
        {value}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 7.5, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{row1Label}</div>
          <div style={{ borderBottom: '1.5px solid #0a0a0a', minHeight: 18, padding: '1px 4px', fontSize: 10 }}>{row1Value || '\u00A0'}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 7.5, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{row2Label}</div>
          <div style={{ borderBottom: '1.5px solid #0a0a0a', minHeight: 18, padding: '1px 4px', fontSize: 10 }}>{row2Value || '\u00A0'}</div>
        </div>
      </div>
    </div>
  );
}

// ===== QUOTE DOCUMENT (the printable part) =====
function QuoteDocument({ form, packages, pricing, basePrice, springDiscount, customDiscountNum, total, formatDate, fmt, is9Year, sizeLabel }) {
  return (
    <div id="quote-document" className="quote-page" style={{
      background: '#fff',
      maxWidth: 820,
      margin: '0 auto',
      padding: '32px 36px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      fontSize: 10.5,
      color: '#0a0a0a',
      lineHeight: 1.45,
    }}>

      {/* HEADER */}
      <div style={{
        background: '#0a0a0a', color: '#fff',
        padding: '20px 24px', marginBottom: 16,
        borderRadius: 6, borderBottom: '6px solid #00ffff',
        display: 'flex', alignItems: 'center', gap: 18,
      }}>
        <div style={{
          width: 90, height: 90,
          background: '#fff', borderRadius: '50%',
          padding: 4, flexShrink: 0,
          boxShadow: '0 0 0 3px #00ffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LogoSVG />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#00ffff', letterSpacing: 4, fontWeight: 700, textTransform: 'uppercase' }}>
            Ramsey Auto Pros
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: 1, color: '#fff' }}>
            CERAMIC COATING ESTIMATE
          </h1>
          <div style={{ marginTop: 4, fontSize: 9, color: '#ffff00', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>
            ⚡ {sizeLabel} ⚡ Gtechniq Accredited Installer
          </div>
        </div>
      </div>

      {/* CREDENTIALS */}
      <div className="avoid-break" style={{
        display: 'flex', gap: 6, marginBottom: 16,
        padding: '10px 12px',
        background: '#f4f4f4',
        border: '1.5px solid #ddd',
        borderRadius: 6,
        borderTop: '4px solid #ffff00',
      }}>
        {[
          { icon: '⭐', stat: <><span style={{ color: '#008c91' }}>4.9</span>-Star</>, desc: 'From 1,200+ Coated Vehicles' },
          { icon: '🏆', stat: 'The Gtechniq Installer', desc: 'South Alabama (Below Birmingham)' },
          { icon: '🎖️', stat: 'Also Certified', desc: 'System X • Stek • Ceramic Pro' },
          { icon: '📅', stat: <><span style={{ color: '#008c91' }}>6 Years</span> Strong</>, desc: 'Protecting Gulf Coast Daily Drivers' },
        ].map((c, i, arr) => (
          <div key={i} style={{
            flex: 1, textAlign: 'center', padding: '4px 6px',
            borderRight: i < arr.length - 1 ? '1px dashed #ccc' : 'none',
          }}>
            <div style={{ fontSize: 13, lineHeight: 1, marginBottom: 4 }}>{c.icon}</div>
            <div style={{ fontWeight: 900, fontSize: 9.5, lineHeight: 1.1, marginBottom: 2 }}>{c.stat}</div>
            <div style={{ fontSize: 7, color: '#555', lineHeight: 1.25, textTransform: 'uppercase', letterSpacing: 0.3 }}>{c.desc}</div>
          </div>
        ))}
      </div>

      {/* CLIENT BLOCK */}
      <div className="avoid-break" style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <ClientCard
          label="Prepared For"
          value={form.clientName || '\u00A0'}
          row1Label="Phone" row1Value={form.clientPhone}
          row2Label="Email" row2Value={form.clientEmail}
        />
        <ClientCard
          label="Vehicle"
          value={form.vehicle || '\u00A0'}
          row1Label="Date Prepared" row1Value={formatDate(form.datePrepared)}
          row2Label="Valid Through" row2Value={formatDate(form.validThrough)}
        />
      </div>

      {/* WHY COAT */}
      <div className="avoid-break" style={{
        background: '#0a0a0a', color: '#fff',
        borderRadius: 6, padding: '14px 18px', marginBottom: 14,
        borderLeft: '6px solid #00ffff',
      }}>
        <h3 style={{ margin: '0 0 6px 0', color: '#ffff00', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
          💎 Why Ceramic Coat Your Vehicle?
        </h3>
        <p style={{ margin: '4px 0', fontSize: 9, lineHeight: 1.5, color: '#e5e5e5' }}>
          You just bought a vehicle that looks <span style={{ color: '#00ffff', fontWeight: 700 }}>incredible right now</span>. Deep gloss, sharp trim, spotless wheels. That's the feeling you paid for.
        </p>
        <p style={{ margin: '4px 0', fontSize: 9, lineHeight: 1.5, color: '#e5e5e5' }}>
          Without protection, UV rays fade and oxidize paint, water spots etch into the surface, brake dust bakes onto wheels, and plastic trim turns chalky gray.
        </p>
        <p style={{ color: '#00ffff', fontWeight: 700, marginTop: 6, fontSize: 9, lineHeight: 1.5 }}>
          In just 24 hours, your vehicle comes back glossier than factory, dramatically easier to clean, and protected for years.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {[
            { h: '🛡️ Protect', items: ['UV & oxidation', 'Water spot etching', 'Chemical staining', 'Bird droppings & sap'] },
            { h: '✨ Enhance', items: ['Deeper, richer gloss', 'Mirror-like clarity', 'Color depth', 'Showroom finish'] },
            { h: '⏱️ Save Time', items: ['Washes 2× faster', 'Dirt slides off', 'No more waxing', 'Stays cleaner longer'] },
          ].map((col, i) => (
            <div key={i} style={{
              flex: 1, background: '#1f1f1f',
              padding: '8px 10px', borderRadius: 4,
              borderTop: '3px solid #ffff00',
            }}>
              <div style={{ color: '#ffff00', fontWeight: 800, fontSize: 8.5, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 1 }}>
                {col.h}
              </div>
              <ul style={{ margin: 0, paddingLeft: 12, fontSize: 8, color: '#d9d9d9' }}>
                {col.items.map((it, j) => <li key={j} style={{ marginBottom: 2 }}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* SPRING SPECIAL */}
      {form.springSpecial && (
        <div className="avoid-break" style={{
          background: 'linear-gradient(135deg, #ffff00 0%, #00ffff 100%)',
          padding: 3, borderRadius: 8, marginBottom: 16,
        }}>
          <div style={{
            background: '#0a0a0a', color: '#fff',
            borderRadius: 5, padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              flexShrink: 0, width: 80, height: 80,
              background: '#ffff00', color: '#0a0a0a',
              borderRadius: '50%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              border: '3px solid #00ffff', lineHeight: 1,
            }}>
              <div style={{ fontSize: 18, fontWeight: 900 }}>$300</div>
              <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: 1.5, marginTop: 2 }}>OFF</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#ffff00', fontSize: 8, letterSpacing: 3, fontWeight: 800, textTransform: 'uppercase' }}>
                🌸 Limited-Time Offer
              </div>
              <h3 style={{ margin: '2px 0 6px 0', fontSize: 14, fontWeight: 900, color: '#fff' }}>
                Spring <span style={{ color: '#00ffff' }}>Stay-New</span> Protection Special
              </h3>
              <div style={{
                background: 'rgba(255,255,0,0.12)',
                borderLeft: '3px solid #ffff00',
                padding: '5px 8px', margin: '4px 0',
                fontSize: 9, lineHeight: 1.4, borderRadius: '0 3px 3px 0',
              }}>
                ✅ <strong style={{ color: '#ffff00' }}>$300 OFF</strong> with deposit
              </div>
              {is9Year && (
                <div style={{
                  background: 'rgba(255,255,0,0.12)',
                  borderLeft: '3px solid #ffff00',
                  padding: '5px 8px', margin: '4px 0',
                  fontSize: 9, lineHeight: 1.4, borderRadius: '0 3px 3px 0',
                }}>
                  ✅ <span style={{ color: '#00ffff', fontWeight: 800 }}>9-Year Bonus:</span> <strong style={{ color: '#ffff00' }}>FREE quarterly exterior detail</strong> for life of coating
                </div>
              )}
              <div style={{
                textAlign: 'center', marginTop: 6,
                fontSize: 8.5, color: '#fff',
                padding: '5px 8px', background: '#1a1a1a',
                border: '1px dashed #00ffff', borderRadius: 3,
              }}>
                ⏰ Lock in by <strong style={{ color: '#ffff00' }}>{formatDate(form.validThrough) || '___'}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE BREAK */}
      <div className="page-break"></div>

      {/* PACKAGE COMPARISON */}
      <h2 style={sectionHeading}>Choose Your Protection Package</h2>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {packages.map(p => {
          const selected = form.selectedPackage === p.key;
          const price = pricing[form.vehicleSize][p.key];
          return (
            <div key={p.key} className="avoid-break" style={{
              flex: 1,
              border: `${selected ? 3 : 2}px solid ${selected ? p.borderColor : '#ddd'}`,
              borderRadius: 6,
              overflow: 'hidden',
              background: '#fff',
              position: 'relative',
              boxShadow: selected ? `0 0 0 2px ${p.borderColor}33` : 'none',
            }}>
              {p.badge && (
                <div style={{
                  position: 'absolute', top: -1, right: 6,
                  background: p.badgeColor, color: '#0a0a0a',
                  fontSize: 7, fontWeight: 900, padding: '3px 7px',
                  letterSpacing: 1, borderRadius: '0 0 3px 3px', zIndex: 3,
                }}>
                  {p.badge}
                </div>
              )}
              <div style={{
                padding: '12px 10px',
                color: '#fff', textAlign: 'center',
                background: '#0a0a0a',
                borderBottom: `3px solid ${p.headerAccent}`,
              }}>
                <div style={{ fontSize: 16, lineHeight: 1, marginBottom: 3 }}>{p.icon}</div>
                <div style={{
                  fontSize: 10.5, fontWeight: 800,
                  letterSpacing: 1.5, textTransform: 'uppercase',
                  color: selected ? p.headerAccent : '#fff',
                }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 7.5, marginTop: 2, color: '#d9d9d9', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {p.warranty}
                </div>
              </div>
              <div style={{
                background: '#1a1a1a', color: '#fff',
                textAlign: 'center', padding: '10px 6px',
                fontSize: 17, fontWeight: 900,
                borderBottom: `2px solid ${p.headerAccent}`,
              }}>
                {fmt(price)}
                <div style={{ fontSize: 7, fontWeight: 600, color: '#888', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {sizeLabel}
                </div>
              </div>
              <div style={{ padding: '10px 12px', fontSize: 8 }}>
                <div style={{
                  fontStyle: 'italic', color: '#555',
                  textAlign: 'center', marginBottom: 8,
                  paddingBottom: 6, borderBottom: '1px dashed #ddd',
                }}>
                  {p.tag}
                </div>
                <div style={{ fontWeight: 800, fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  What's Included
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {p.features.map((f, i) => (
                    <li key={i} style={{
                      marginBottom: 3, lineHeight: 1.35,
                      paddingLeft: 12, position: 'relative',
                    }}>
                      <span style={{ position: 'absolute', left: 0, color: p.headerAccent === '#ffff00' ? '#b8a000' : '#008c91', fontWeight: 900 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              {selected && (
                <div style={{
                  background: p.borderColor, color: '#0a0a0a',
                  padding: '6px 10px', textAlign: 'center',
                  fontWeight: 900, fontSize: 9, letterSpacing: 1,
                  textTransform: 'uppercase',
                }}>
                  ✓ Selected
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* GUARANTEE */}
      <div className="avoid-break" style={{
        display: 'flex', gap: 14, alignItems: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 100%)',
        color: '#fff', borderRadius: 8,
        padding: '14px 18px', marginBottom: 16,
        border: '2px solid #ffff00',
      }}>
        <div style={{ width: 110, height: 110, flexShrink: 0 }}>
          <GuaranteeSeal />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 6px 0', color: '#ffff00', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            🔒 Our Double Guarantee
          </h3>
          <div style={{ marginBottom: 6, fontSize: 8.5, lineHeight: 1.4 }}>
            <div style={{ color: '#00ffff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, fontSize: 8, marginBottom: 2 }}>
              Ramsey Guarantee — 30 Days
            </div>
            <div style={{ color: '#e5e5e5' }}>
              If within 30 days you don't absolutely love how your vehicle looks, feels, and maintains, we'll make it right or refund the coating portion.
            </div>
          </div>
          <div style={{ marginBottom: 4, fontSize: 8.5, lineHeight: 1.4 }}>
            <div style={{ color: '#00ffff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, fontSize: 8, marginBottom: 2 }}>
              9-Year Performance Guarantee
            </div>
            <div style={{ color: '#e5e5e5' }}>
              If within 9 years the coating fails to perform under normal conditions, we repair or re-coat affected areas at no cost. Backed by Gtechniq's manufacturer warranty.
            </div>
          </div>
          <div style={{ fontSize: 7.5, color: '#888', marginTop: 4, fontStyle: 'italic' }}>
            *Double Guarantee applies to 9-Year Stay-New & Ultimate. Essential backed by Gtechniq's 5-year warranty.
          </div>
        </div>
      </div>

      {/* TOTALS */}
      <h2 style={sectionHeading}>Your Investment</h2>
      <div className="avoid-break" style={{
        border: '3px solid #0a0a0a',
        borderRadius: 6, overflow: 'hidden', marginBottom: 16,
      }}>
        <div style={totalRow}>
          <span>Selected Package: <strong>{packages.find(p => p.key === form.selectedPackage)?.name}</strong> ({sizeLabel})</span>
          <span style={{ fontWeight: 700 }}>{fmt(basePrice)}</span>
        </div>
        {form.addOns && (
          <div style={totalRow}>
            <span>Add-Ons / Notes:</span>
            <span style={{ fontSize: 9, color: '#555', textAlign: 'right', maxWidth: '50%' }}>{form.addOns}</span>
          </div>
        )}
        {springDiscount > 0 && (
          <div style={{ ...totalRow, background: '#fffce6', fontWeight: 700 }}>
            <span>🌸 Spring Stay-New Special (with deposit)</span>
            <span style={{ color: '#b8000d' }}>−{fmt(springDiscount)}</span>
          </div>
        )}
        {customDiscountNum > 0 && (
          <div style={{ ...totalRow, background: '#fffce6', fontWeight: 700 }}>
            <span>Additional Discount</span>
            <span style={{ color: '#b8000d' }}>−{fmt(customDiscountNum)}</span>
          </div>
        )}
        <div style={{
          background: '#0a0a0a', color: '#fff',
          fontSize: 14, fontWeight: 800,
          padding: 16, borderTop: '4px solid #00ffff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ color: '#00ffff', letterSpacing: 1 }}>TOTAL INVESTMENT</span>
          <span style={{ color: '#ffff00', fontSize: 18 }}>{fmt(total)}</span>
        </div>
      </div>

      {/* SIGNATURES */}
      <div className="avoid-break" style={{ display: 'flex', gap: 24, marginTop: 18 }}>
        {['Client Signature', 'Date', 'Ramsey Auto Pros Rep'].map((lbl, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{ borderBottom: '2px solid #0a0a0a', height: 28, marginBottom: 4 }}></div>
            <div style={{ fontSize: 7.5, textTransform: 'uppercase', letterSpacing: 1, color: '#555', fontWeight: 700 }}>
              {lbl}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{
        marginTop: 20, textAlign: 'center',
        fontSize: 8.5, color: '#555',
        paddingTop: 10, borderTop: '4px solid #ffff00',
      }}>
        <div style={{ fontWeight: 800, color: '#0a0a0a', letterSpacing: 2, fontSize: 10, marginBottom: 2 }}>
          RAMSEY AUTO PROS
        </div>
        <div>Gtechniq Accredited • System X • Stek • Ceramic Pro</div>
        <div style={{ marginTop: 3 }}>
          <span style={{ color: '#008c91', fontWeight: 700 }}>ramseyautopros.com</span> • Spanish Fort, AL
        </div>
      </div>
    </div>
  );
}

const sectionHeading = {
  background: '#0a0a0a',
  color: '#fff',
  padding: '8px 14px',
  fontSize: 11,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
  margin: '18px 0 10px 0',
  borderLeft: '5px solid #00ffff',
  borderRadius: 3,
  fontWeight: 800,
};

const totalRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 14px',
  fontSize: 10,
  borderBottom: '1px solid #e5e5e5',
};
