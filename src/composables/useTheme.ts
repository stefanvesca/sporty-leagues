import { ref } from 'vue'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'sporty-theme'

// Dark is the brand default; module-level so every caller shares one state.
const theme = ref<Theme>('dark')

function apply(next: Theme): void {
  theme.value = next
  document.documentElement.classList.toggle('light', next === 'light')
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Storage unavailable — theme still applies for this visit.
  }
}

export function useTheme() {
  return {
    theme,
    toggleTheme: () => apply(theme.value === 'dark' ? 'light' : 'dark'),
    initTheme: () => {
      let saved: string | null = null
      try {
        saved = localStorage.getItem(STORAGE_KEY)
      } catch {
        /* ignore */
      }
      apply(saved === 'light' ? 'light' : 'dark')
    },
  }
}
