// lib/utils.ts or lib/utils.js

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
