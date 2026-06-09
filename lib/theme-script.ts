// This runs before React hydrates
// Prevents white flash on dark mode users
export const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('cluin-theme');
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        }
      }
    } catch (e) {}
  })();
`
