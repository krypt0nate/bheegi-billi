export const hornBlaredEvent = "horn-blared";
export const hornPressedEvent = "horn-pressed";

export function emitHornBlared() {
  window.dispatchEvent(new CustomEvent(hornBlaredEvent));
}

export function onHornBlared(listener: () => void) {
  window.addEventListener(hornBlaredEvent, listener);
  return () => window.removeEventListener(hornBlaredEvent, listener);
}

export function emitHornPressed() {
  window.dispatchEvent(new CustomEvent(hornPressedEvent));
}

export function onHornPressed(listener: () => void) {
  window.addEventListener(hornPressedEvent, listener);
  return () => window.removeEventListener(hornPressedEvent, listener);
}
