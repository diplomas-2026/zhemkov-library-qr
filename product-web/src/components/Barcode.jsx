import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

export default function Barcode({ value }) {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !value) return;
    try {
      JsBarcode(svg, String(value), {
        format: 'CODE128',
        displayValue: false,
        margin: 0,
        height: 62
      });
    } catch {
      // ignore invalid values
    }
  }, [value]);

  return (
    <svg
      ref={svgRef}
      aria-label="Штрихкод"
      style={{ width: '100%', height: 76, background: 'rgba(255,255,255,0.55)', borderRadius: 14, border: '1px solid rgba(23,20,18,0.12)', padding: 10 }}
    />
  );
}

