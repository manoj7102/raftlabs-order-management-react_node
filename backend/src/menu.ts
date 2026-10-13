import type { MenuItem } from "./types";

function foodImage(emoji: string, background: string, accent: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" role="img" aria-label="Food illustration">
    <defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="${background}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs>
    <rect width="640" height="400" fill="url(#bg)"/>
    <circle cx="78" cy="82" r="68" fill="#fff" opacity=".13"/>
    <circle cx="566" cy="336" r="96" fill="#fff" opacity=".13"/>
    <ellipse cx="320" cy="219" rx="191" ry="150" fill="#594536" opacity=".12"/>
    <ellipse cx="320" cy="201" rx="183" ry="146" fill="#fffaf1"/>
    <ellipse cx="320" cy="201" rx="153" ry="119" fill="#f5ecde"/>
    <text x="320" y="275" text-anchor="middle" font-size="180" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${emoji}</text>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const MENU: readonly MenuItem[] = [
  {
    id: "margherita-pizza",
    name: "Margherita Pizza",
    description:
      "Stone-baked crust, tomato sauce, mozzarella, and fresh basil.",
    price: 349,
    image: foodImage("🍕", "#f9cba0", "#e98b70"),
  },
  {
    id: "classic-cheeseburger",
    name: "Classic Cheeseburger",
    description:
      "A juicy patty with cheddar, lettuce, tomato, and house sauce.",
    price: 299,
    image: foodImage("🍔", "#f4d99b", "#deaa66"),
  },
  {
    id: "garden-pasta",
    name: "Garden Pasta",
    description:
      "Pasta tossed with seasonal vegetables and a light herb sauce.",
    price: 329,
    image: foodImage("🍝", "#cfe5b1", "#99c690"),
  },
  {
    id: "crispy-tacos",
    name: "Crispy Tacos",
    description: "Three crunchy tacos with seasoned filling, salsa, and lime.",
    price: 279,
    image: foodImage("🌮", "#f8d89a", "#e9ae72"),
  },
  {
    id: "fresh-salad",
    name: "Fresh Garden Salad",
    description: "Mixed greens, cherry tomatoes, cucumber, and lemon dressing.",
    price: 229,
    image: foodImage("🥗", "#d9edbb", "#a8d39d"),
  },
  {
    id: "chocolate-brownie",
    name: "Chocolate Brownie",
    description: "Warm chocolate brownie with a rich, fudgy center.",
    price: 149,
    image: foodImage("🍫", "#e2b8a6", "#c4897b"),
  },
];
