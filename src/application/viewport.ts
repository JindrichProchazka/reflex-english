// Use the visual viewport reported by the browser when its software keyboard
// changes the visible area. No user-agent detection or fixed keyboard heights.
export function keepFocusedInputVisible() {
  const element = document.activeElement;
  if (!(
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ))
    return;
  if (
    element instanceof HTMLInputElement &&
    ['checkbox', 'radio', 'file', 'button', 'submit'].includes(element.type)
  )
    return;
  const viewport = window.visualViewport;
  const top = (viewport?.offsetTop ?? 0) + 16,
    bottom =
      (viewport?.offsetTop ?? 0) +
      (viewport?.height ?? window.innerHeight) -
      16;
  const bounds = element.getBoundingClientRect();
  if (
    typeof element.scrollIntoView === 'function' &&
    (bounds.bottom > bottom || bounds.top < top)
  )
    element.scrollIntoView({ block: 'center', behavior: 'instant' });
}
