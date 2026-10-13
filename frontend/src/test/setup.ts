import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "scrollTo", { value: () => {}, writable: true });
Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
  value: () => {},
  writable: true,
});
