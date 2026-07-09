import { ref } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'sporty-theme'

// Light is the SportyTV product default; module-level so every caller shares one state.
const theme = ref<Theme>('light')

function apply(next: Theme): void {
  theme.value = next
  document.documentElement.classList.toggle('dark', next === 'dark')
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Storage unavailable — theme still applies for this visit.
  }
}

export function useTheme() {
  return {
    theme,
    toggleTheme: () => apply(theme.value === 'light' ? 'dark' : 'light'),
    initTheme: () => {
      let saved: string | null = null
      try {
        saved = localStorage.getItem(STORAGE_KEY)
      } catch {
        /* ignore */
      }
      apply(saved === 'dark' ? 'dark' : 'light')
    },
  }
}
