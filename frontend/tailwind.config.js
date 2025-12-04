/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'bg-lime-900',
    'bg-rose-900',
    'bg-neutral-950',
    'border-amber-600/40',
    'bg-amber-100',
    // Overlays blanco/negro con opacidades comunes
    { pattern: /bg-(white|black)\/(50|60|70|80)/ },

    // Colores típicos que sí usas (ajusta la lista a tu proyecto)
    { pattern: /(bg|text|border)-(amber|gray|neutral|lime|rose|slate|zinc|red|green|blue)-(50|100|200|300|400|500|600|700|800|900)\/(50|60|70|80)/ },

    // Gradientes (opcional, reduce escalas si no necesitas tantas)
    { pattern: /(from|via|to)-(amber|gray|red|green|blue|lime|rose)-(200|400|600)\/(50|60|70|80)/ },
  ],
  theme: { extend: {} },
  plugins: [],
};