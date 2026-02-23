export function animateThemeChange(callback: () => void) {
  if (!document.startViewTransition) {
    callback();
    return;
  }

  document.startViewTransition(callback);
}