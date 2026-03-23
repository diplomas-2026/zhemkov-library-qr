import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import Notice from './Notice';

export default function ScannerDialog({ open, title = 'Сканирование', hint, onClose, onDetected }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const readerRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;
    let cancelled = false;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (cancelled) return;
        if (!result) return;
        const text = result.getText?.() || '';
        if (!text) return;
        onDetected?.(text);
        onClose?.();
      })
      .then((controls) => {
        controlsRef.current = controls;
      })
      .catch((e) => {
        setError(e?.message || 'Не удалось открыть камеру. Проверьте разрешения браузера.');
      });

    return () => {
      cancelled = true;
      try {
        controlsRef.current?.stop?.();
      } catch {
        // ignore
      }
      try {
        readerRef.current?.reset?.();
      } catch {
        // ignore
      }
      controlsRef.current = null;
      readerRef.current = null;
    };
  }, [open, onClose, onDetected]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal">
        <div className="page-header" style={{ margin: 0 }}>
          <div>
            <div className="kicker">Камера</div>
            <h2 style={{ marginTop: 10 }}>{title}</h2>
            {hint && <p className="page-subtitle" style={{ marginTop: 10 }}>{hint}</p>}
          </div>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Закрыть</button>
        </div>

        {error && (
          <div style={{ marginTop: 12 }}>
            <Notice type="error" title="Ошибка камеры" onClose={() => setError('')}>
              {error}
            </Notice>
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <video ref={videoRef} className="video-preview" muted playsInline />
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'rgba(23,20,18,0.70)' }}>
            Наведите камеру на QR/штрихкод читателя.
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Ввести вручную
          </button>
        </div>
      </div>
    </div>
  );
}

