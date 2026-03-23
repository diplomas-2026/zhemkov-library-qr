import { QRCodeSVG } from 'qrcode.react';
import Barcode from './Barcode';

export default function ReaderCodeCard({ code }) {
  const value = String(code || '');

  return (
    <div className="panel" style={{ display: 'grid', gap: 12 }}>
      <div className="page-header" style={{ margin: 0 }}>
        <div>
          <div className="kicker">Код читателя</div>
          <h2 style={{ marginTop: 10 }}>QR и штрихкод</h2>
          <p className="page-subtitle" style={{ marginTop: 10 }}>
            Можно отсканировать камерой или ввести вручную.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigator.clipboard?.writeText(value)}
          title="Скопировать"
        >
          Скопировать код
        </button>
      </div>

      <div className="code-grid">
        <div className="code-qr">
          <div style={{ display: 'grid', placeItems: 'center', padding: 12, borderRadius: 16, border: '1px solid rgba(23,20,18,0.12)', background: 'rgba(255,255,255,0.55)' }}>
            <QRCodeSVG
              value={value}
              size={176}
              includeMargin={true}
              fgColor="#171412"
              bgColor="transparent"
            />
          </div>
          <div style={{ marginTop: 10, textAlign: 'center' }}>
            <span className="badge">QR: {value}</span>
          </div>
        </div>
        <div className="code-bar">
          <Barcode value={value} />
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
            <span className="badge">Штрихкод (Code 128)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

