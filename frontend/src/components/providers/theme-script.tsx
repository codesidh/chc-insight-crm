export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              var root = document.documentElement;
              
              if (theme === 'dark') {
                root.classList.add('dark');
                root.style.colorScheme = 'dark';
              } else if (theme === 'light') {
                root.classList.remove('dark');
                root.style.colorScheme = 'light';
              } else {
                // Default to light theme if no preference is stored
                root.classList.remove('dark');
                root.style.colorScheme = 'light';
              }
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