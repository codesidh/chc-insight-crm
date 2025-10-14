/**
 * Theme Script for CHC Insight CRM
 * 
 * Prevents flash of unstyled content (FOUC) by applying the correct theme
 * before React hydration. Supports system theme detection and user preferences.
 */
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var storageKey = 'chc-insight-theme';
              var theme = localStorage.getItem(storageKey);
              var root = document.documentElement;
              
              function applyTheme(themeValue) {
                if (themeValue === 'dark') {
                  root.classList.add('dark');
                  root.style.colorScheme = 'dark';
                } else {
                  root.classList.remove('dark');
                  root.style.colorScheme = 'light';
                }
              }
              
              if (theme === 'dark' || theme === 'light') {
                // Apply stored theme preference
                applyTheme(theme);
              } else if (theme === 'system' || !theme) {
                // Use system preference
                var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                applyTheme(systemTheme);
              }
              
              // Add smooth transition class after initial load
              setTimeout(function() {
                root.classList.add('theme-transition');
              }, 100);
              
            } catch (e) {
              // Fallback to light theme if localStorage is not available
              document.documentElement.classList.remove('dark');
              document.documentElement.style.colorScheme = 'light';
            }
          })();
        `,
      }}
    />
  )
}