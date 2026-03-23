const FLASH_KEY = 'flash_message_v1';

export function setFlash(message) {
  if (!message || !message.text) return;
  sessionStorage.setItem(FLASH_KEY, JSON.stringify({
    type: message.type || 'info',
    text: message.text
  }));
}

export function consumeFlash() {
  const raw = sessionStorage.getItem(FLASH_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(FLASH_KEY);
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

