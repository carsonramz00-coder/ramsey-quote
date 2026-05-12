import { useState, useEffect } from ‘react’;
import { Printer, RotateCcw, FileText } from ‘lucide-react’;

export default function App() {
// ===== STATE =====
const todayISO = new Date().toISOString().split(‘T’)[0];
const defaultValidThrough = () => {
const d = new Date();
d.setDate(d.getDate() + 7);
return d.toISOString().split(‘T’)[0];
};

const [form, setForm] = useState({
clientName: ‘’,
clientPhone: ‘’,
clientEmail: ‘’,
vehicle: ‘’,
vehicleSize: ‘suv’,
datePrepared: todayISO,
validThrough: defaultValidThrough(),
selectedPackage: ‘stayNew’,
addOns: ‘’,
springSpecial: true,
customDiscount: ‘’,
});

// ===== PRICING =====
const pricing = {
sedan: { essential: 1995, stayNew: 2495, ultimate: 3695 },
suv:   { essential: 2295, stayNew: 2795, ultimate: 3995 },
large: { essential: 2695, stayNew: 3295, ultimate: 4495 },
};

const sizeLabels = {
sedan: ‘Sedan / Coupe’,
suv:   ‘SUV / Small Truck’,
large: ‘Large SUV / Large Truck / Minivan’,
};

const sizeExamples = {
sedan: ‘Mustang, Miata, Tesla Model 3’,
suv:   ‘Tucson, 4Runner, 2-row SUVs, F-150’,
large: ‘Tahoe, 2500-series, minivans’,
};

const basePrice = pricing[form.vehicleSize][form.selectedPackage];
const springDiscount = form.springSpecial ? 300 : 0;
const customDiscountNum = parseFloat(form.customDiscount) || 0;
const total = Math.max(0, basePrice - springDiscount - customDiscountNum);

const update = (k, v) => setForm(f => ({ …f, [k]: v }));

const reset = () => {
if (!window.confirm(‘Clear all fields and start a new quote?’)) return;
setForm({
clientName: ‘’, clientPhone: ‘’, clientEmail: ‘’,
vehicle: ‘’, vehicleSize: ‘suv’,
datePrepared: todayISO, validThrough: defaultValidThrough(),
selectedPackage: ‘stayNew’, addOns: ‘’,
springSpecial: true, customDiscount: ‘’,
});
};

const formatDate = (iso) => {
if (!iso) return ‘’;
const [y, m, d] = iso.split(’-’);
return `${parseInt(m)}/${parseInt(d)}/${y}`;
};

const fmt = (n) => ‘$’ + Number(n).toLocaleString(‘en-US’);

const is9Year = form.selectedPackage !== ‘essential’;

// ===== PRINT HANDLER =====
// Artifact sandboxes block window.print() and window.open(). The workaround:
// build a hidden same-origin iframe, write the quote into it, and call
// print() on the iframe’s contentWindow — that’s allowed because we own it.
const handlePrint = () => {
const quoteEl = document.getElementById(‘quote-document’);
if (!quoteEl) return;

```
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
```

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

```
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
```

};

// Fallback: save the quote as an HTML file the user can open + print
const downloadAsHTML = () => {
const quoteEl = document.getElementById(‘quote-document’);
if (!quoteEl) return;
const clientName = (form.clientName || ‘Estimate’).replace(/[^a-zA-Z0-9-*]/g, ’*’);
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
key: ‘essential’,
icon: ‘🥉’,
name: ‘Essential’,
tag: ‘Professional ceramic protection at a lower investment’,
warranty: ‘5-Year Protection’,
borderColor: ‘#c0c0c0’,
headerAccent: ‘#c0c0c0’,
features: [
‘Full exterior decontamination’,
‘Paint enhancement polish’,
‘5-Year Gtechniq ceramic coating’,
‘Wheel face protection’,
‘Trim & plastic protection’,
‘Windshield coating’,
],
coverage: [‘~70% performance of 9-yr system’, ‘Gtechniq 5-year warranty’],
},
{
key: ‘stayNew’,
icon: ‘🥈’,
name: ‘Stay-New’,
tag: ‘Our most popular long-term protection system’,
warranty: ‘9-Year Protection’,
borderColor: ‘#00ffff’,
headerAccent: ‘#00ffff’,
badge: ‘★ MOST POPULAR’,
badgeColor: ‘#00ffff’,
features: [
‘Full exterior decontamination’,
‘Paint enhancement polish’,
‘Gtechniq Crystal Serum Ultra (9-yr pro coating)’,
‘Wheel face protection’,
‘Trim & plastic protection’,
‘Windshield coating’,
],
coverage: [‘Maximum gloss & durability’, ‘Pro-only Gtechniq formula’, ‘Double Guarantee’],
},
{
key: ‘ultimate’,
icon: ‘🥇’,
name: ‘Ultimate’,
tag: ‘Total protection — inside and out’,
warranty: ‘9-Year • Inside & Out’,
borderColor: ‘#ffff00’,
headerAccent: ‘#ffff00’,
badge: ‘⭐ BEST VALUE’,
badgeColor: ‘#ffff00’,
features: [
‘Everything in Stay-New, plus:’,
‘Full glass coating (all exterior glass)’,
‘Brake caliper coating’,
‘Door jamb protection’,
‘Engine bay protection’,
‘Leather protection’,
‘Interior plastic & trim’,
‘Cloth, fabric & carpet protection’,
],
coverage: [‘Complete interior & exterior’, ‘Double Guarantee’],
},
];

return (
<div style={{ background: ‘#e8e8e8’, minHeight: ‘100vh’, fontFamily: ‘Helvetica, Arial, sans-serif’ }}>

```
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
```

);
}

// ===== INPUT STYLES =====
const inputStyle = {
width: ‘100%’,
padding: ‘8px 10px’,
border: ‘1.5px solid #ccc’,
borderRadius: 4,
fontSize: 13,
fontFamily: ‘Helvetica, Arial, sans-serif’,
background: ‘#fff’,
color: ‘#0a0a0a’,
boxSizing: ‘border-box’,
};

const btnPrimary = {
display: ‘flex’, alignItems: ‘center’, gap: 6,
background: ‘#00ffff’, color: ‘#0a0a0a’,
border: ‘none’, padding: ‘8px 16px’,
fontWeight: 800, fontSize: 13, letterSpacing: 1,
textTransform: ‘uppercase’,
borderRadius: 4, cursor: ‘pointer’,
};

const btnSecondary = {
display: ‘flex’, alignItems: ‘center’, gap: 6,
background: ‘transparent’, color: ‘#fff’,
border: ‘1.5px solid #555’, padding: ‘7px 12px’,
fontWeight: 700, fontSize: 12, letterSpacing: 0.5,
borderRadius: 4, cursor: ‘pointer’,
};

const Label = ({ children }) => (

  <div style={{
    fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase',
    color: '#666', fontWeight: 700, marginBottom: 4,
  }}>
    {children}
  </div>
);

const Field = ({ label, value, onChange, placeholder, type = ‘text’ }) => (

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

// ===== LOGO (real brand mark embedded as data URL) =====
const LOGO_DATA_URL = “data:image/png;base64,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o2nTptHNmzerZDY7cOCASXJDmUxG69evr5drqgoiIyOpV69exibu1O7du48DmhMFGw02btwIIuL69es3xc7OLhNGfDY3b94022BRqVSGeupVgUajoUWLFplUHn5+fjWOLCmPc+fOGVZ8wcHBtGHDhjpPsDSGTq+nhNRU+vPvv2nqzJnUKiio1PEuEBC8vQljxzLalIsXGR14swO+6qLXsz67cIGwahXry5YtDTsNoUhErQID6Znnn6fN27dTYkpKnYW1m0JWVhZ99NFH5O7uXmlC4K+//lqtManVaumNN96o9HhRUVH1dn2V4datW9SnTx9Du6ytrTM6deo0mYi4zz//3NLTYjOqg9WrV4OIBL17955uTHnSu3dvs5KiVQe7d+82mbQkFovNVgY3OzubHn300TLHt7Kyov/9738GHqD6hEarpZiEBPr9r7/o2ZkzKSgkpGypYLmcVa+bO5eweTMhKopQWNisUIxFrycUFBBu3WIRb6++SujRg1CSV4ASP0LrNm3ofzNm0O9//UUx8fH1YqIqj6ioKHrsscdMsirY2NjQzJkza8xom5SUZLLqIAB6/vnn68VkWxlu3bpFffv2LUNR0r59+2eJSNBcz7yRooTyRNizZ88Ztra2OSi5ub169aKIiIh6HWDJyclltrbG8tRTT1GeGUwLer2ePv300wq1oQFGfW9p57xWq6WE5GT6e88emrdgAXXr1YscjBWqQEDw8CAMHEhYsIDZ8W/cIGRn/7cSF7VaQlYW4do1wu+/E157jfDII6xvjCZmB7mcuvfqRXMXLqQde/ZQQnKy2epz1wR3794tswI3lg4dOtCWLVuqtWM3hX/++ceQkGcs1tbW9Oeff1rkum/evFnmuq2srLLbtWv3nE6nEyxZssTS02AzagNeifTu3XuWsRLp3r27WR3rD8PKlStNRpL4+/ubrR2nT582UDQYi0AgoI8//riMrZlnI60vmpTy0Ov1lKNQ0LlLl+ir776jCZMnU3BISNna0xxHcHYmdOnCHMKffUbYvZsQGckm2MbulNfrWVGmzExWX2PXLsLy5YTJkwmdOrGoKaMxY21tTcGhoTRxyhT6+vvv6fylS5STm2uxe2gMnU5HL730UoWx5+DgQK+++qrZijBpNBqaN2+eSSXVsWNHio+Pr9frvnHjRpldUcnO4/nc3FxhM79VE8E333zD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”;

function LogoSVG() {
return (
<img
src={LOGO_DATA_URL}
alt=“Ramsey Auto Pros”
style={{ width: ‘100%’, height: ‘100%’, objectFit: ‘contain’, borderRadius: ‘50%’ }}
/>
);
}

// ===== GUARANTEE SEAL =====
function GuaranteeSeal() {
return (
<svg viewBox="0 0 200 200" width="100%" height="100%">
<defs>
{/* Top arc — text follows curve along top inside the rings */}
<path id="seal-top-arc" d="M 30,100 A 70,70 0 0 1 170,100" fill="none"/>
{/* Bottom arc — drawn left-to-right so text reads correctly along the bottom inside the rings.
Radius 70 keeps it inside the yellow ring (which is at r=85). */}
<path id="seal-bottom-arc" d="M 30,100 A 70,70 0 0 0 170,100" fill="none"/>
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
<text fontFamily="Arial, Helvetica" fontWeight="900" fontSize="12" fill="#00ffff" letterSpacing="2">
<textPath href="#seal-top-arc" startOffset="50%" textAnchor="middle">RAMSEY AUTO PROS</textPath>
</text>
<text fontFamily="Arial, Helvetica" fontWeight="900" fontSize="10" fill="#ffff00" letterSpacing="2">
<textPath href="#seal-bottom-arc" startOffset="50%" textAnchor="middle">★ DOUBLE GUARANTEE ★</textPath>
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
border: ‘1.5px solid #ddd’,
borderLeft: ‘4px solid #00ffff’,
borderRadius: 4,
padding: ‘10px 14px’,
background: ‘#fafafa’,
}}>
<div style={{ fontSize: 8, textTransform: ‘uppercase’, letterSpacing: 1.5, color: ‘#888’, fontWeight: 700, marginBottom: 4 }}>
{label}
</div>
<div style={{ borderBottom: ‘1.5px solid #0a0a0a’, minHeight: 22, padding: ‘2px 4px’, fontSize: 11, fontWeight: 700 }}>
{value}
</div>
<div style={{ display: ‘flex’, gap: 10, marginTop: 6 }}>
<div style={{ flex: 1 }}>
<div style={{ fontSize: 7.5, color: ‘#888’, textTransform: ‘uppercase’, letterSpacing: 1, marginBottom: 2 }}>{row1Label}</div>
<div style={{ borderBottom: ‘1.5px solid #0a0a0a’, minHeight: 18, padding: ‘1px 4px’, fontSize: 10 }}>{row1Value || ‘\u00A0’}</div>
</div>
<div style={{ flex: 1 }}>
<div style={{ fontSize: 7.5, color: ‘#888’, textTransform: ‘uppercase’, letterSpacing: 1, marginBottom: 2 }}>{row2Label}</div>
<div style={{ borderBottom: ‘1.5px solid #0a0a0a’, minHeight: 18, padding: ‘1px 4px’, fontSize: 10 }}>{row2Value || ‘\u00A0’}</div>
</div>
</div>
</div>
);
}

// ===== QUOTE DOCUMENT (the printable part) =====
function QuoteDocument({ form, packages, pricing, basePrice, springDiscount, customDiscountNum, total, formatDate, fmt, is9Year, sizeLabel }) {
return (
<div id=“quote-document” className=“quote-page” style={{
background: ‘#fff’,
maxWidth: 820,
margin: ‘0 auto’,
padding: ‘32px 36px’,
boxShadow: ‘0 4px 20px rgba(0,0,0,0.1)’,
fontSize: 10.5,
color: ‘#0a0a0a’,
lineHeight: 1.45,
}}>

```
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
```

);
}

const sectionHeading = {
background: ‘#0a0a0a’,
color: ‘#fff’,
padding: ‘8px 14px’,
fontSize: 11,
letterSpacing: 1.5,
textTransform: ‘uppercase’,
margin: ‘18px 0 10px 0’,
borderLeft: ‘5px solid #00ffff’,
borderRadius: 3,
fontWeight: 800,
};

const totalRow = {
display: ‘flex’,
justifyContent: ‘space-between’,
alignItems: ‘center’,
padding: ‘10px 14px’,
fontSize: 10,
borderBottom: ‘1px solid #e5e5e5’,
};
