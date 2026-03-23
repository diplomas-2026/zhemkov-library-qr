import { useEffect, useState } from 'react';
import { consumeFlash } from '../lib/flash';
import Notice from './Notice';

export default function FlashHost() {
  const [flash, setFlashState] = useState(null);

  useEffect(() => {
    const msg = consumeFlash();
    if (!msg) return;
    setFlashState(msg);
    const t = setTimeout(() => setFlashState(null), 4500);
    return () => clearTimeout(t);
  }, []);

  if (!flash) return null;
  return (
    <div style={{ maxWidth: 1120, margin: '0 auto 12px' }}>
      <Notice type={flash.type} title={flash.type === 'success' ? 'Готово' : flash.type === 'error' ? 'Ошибка' : 'Сообщение'} onClose={() => setFlashState(null)}>
        {flash.text}
      </Notice>
    </div>
  );
}

