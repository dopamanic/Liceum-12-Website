// Завантажується синхронно одразу після Tailwind CDN, до першого рендеру.
// Тут два завдання: тема, яку треба поставити ДО малювання сторінки (інакше
// буде спалах світлої), і токени дизайн-системи для Tailwind.

// Тему відновлюємо першою і окремо: вона не має залежати від того, чи
// піднявся CDN. Якщо мережа недоступна, сторінка втратить стилі, але
// принаймні не блимне чужою темою.
(function restoreTheme() {
  try {
    if (localStorage.getItem('stemlab_theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    /* приватний режим або заблоковані куки – лишаємо світлу тему */
  }
})();

// Якщо CDN не завантажився, глобального `tailwind` немає. Без перевірки тут
// був би ReferenceError, який обірвав би решту файлу.
if (typeof tailwind !== 'undefined') {
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          display: ['Manrope', 'system-ui', 'sans-serif'],
          sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        },
        colors: {
          ink:    { DEFAULT: '#0A1413', 800: '#10201E', 700: '#16302C' },
          night:  { DEFAULT: '#070F0E', 900: '#0C1716', 800: '#11201E' },
          paper:  '#F3F6F0',
          brand:  { DEFAULT: '#0F5F55', 700: '#0B4A42', 400: '#2F9183', 300: '#5FB8A8', 200: '#9ED9CE' },
          signal: '#C6F24E',
          fg:     { DEFAULT: '#101817', muted: '#4F605D' },
          fgd:    { DEFAULT: '#F2F5F4', muted: '#9DADAA' },
          line:   { DEFAULT: '#E4E2DC', dark: '#1C2B28' },
        },
        maxWidth: { shell: '1180px', prose: '64ch' },
      },
    },
  };
}
