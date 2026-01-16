/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  safelist: [
    /* =====================
     BACKGROUNDS
    ===================== */
    {
      pattern:
        /bg-(black|white|transparent|gray|neutral|red|blue|green|yellow|amber|purple|pink|rose|lime|stone|emerald)-(50|100|200|300|400|500|600|700|800|900|950)?\/?(10|20|30|40|50|60|70|80)?/,
    },

    /* =====================
     TEXT COLORS
    ===================== */
    {
      pattern:
        /text-(black|white|gray|neutral|red|blue|green|yellow|amber|purple|pink|rose|lime|stone)-(50|100|200|300|400|500|600|700|800|900)?/,
    },

    /* =====================
     BORDERS
    ===================== */
    {
      pattern:
        /border-(black|white|gray|neutral|red|blue|green|yellow|amber|purple|pink|rose|lime|stone)-(50|100|200|300|400|500|600|700|800|900)?\/?(10|20|30|40|50)?/,
    },

    'border',
    'border-2',

    /* =====================
     SHADOWS
    ===================== */
    {
      pattern:
        /shadow(-(sm|md|lg|xl|2xl))?/,
    },
    {
      pattern:
        /shadow-(black|white|gray|neutral|red|blue|green|yellow|amber|purple|pink|rose|lime|stone)-(400|600|800|900)?\/?(30|40|50)?/,
    },

    /* =====================
     BACKDROP / GLASS
    ===================== */
    'backdrop-blur-sm',
    'backdrop-blur-md',
    'backdrop-blur-lg',

    /* =====================
     RADIUS
    ===================== */
    {
      pattern: /rounded-(sm|md|lg|xl|2xl)/,
    },

    /* =====================
     TYPOGRAFÍA
    ===================== */
    {
      pattern: /text-(sm|base|lg|xl|2xl|3xl|4xl|5xl)/,
    },
    {
      pattern: /font-(light|medium|semibold|bold|extrabold)/,
    },
    'italic',
    'uppercase',

    /* =====================
     TRACKING
    ===================== */
    {
      pattern: /tracking-(tight|wide|wider|widest)/,
    },

    /* =====================
     DROPSHADOW
    ===================== */
    'drop-shadow',
    'drop-shadow-md',

    /* =====================
     FLEX UTILS USADOS INDIRECTAMENTE
    ===================== */
    'text-center',
    'text-left',
    'sm:text-left',
    'sm:text-lg',
    'sm:text-xl',
    'sm:text-2xl',
    'sm:text-3xl',
    'sm:text-4xl',
    'sm:text-5xl',
  ],

  theme: {
    extend: {},
  },

  plugins: [],
};
