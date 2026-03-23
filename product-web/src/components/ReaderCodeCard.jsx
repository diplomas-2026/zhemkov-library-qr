import Barcode from './Barcode';

export default function ReaderCodeCard({ code }) {
  const value = String(code || '');

  return (
    <div className="panel" style={{ display: 'grid', gap: 12 }}>
      <div className="page-header" style={{ margin: 0 }}>
        <div>
          <div className="kicker">Код читателя</div>
          <h2 style={{ marginTop: 10 }}>Штрихкод</h2>
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

      <div style={{ display: 'grid', gap: 10 }}>
        <Barcode value={value} />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span className="badge">Штрихкод (Code 128): {value}</span>
        </div>
      </div>
    </div>
  );
}
