<script setup lang="ts">
import { useTheme } from '../composables/useTheme'
import logoWhite from '../assets/logo-white.svg'
import logoRed from '../assets/logo-red.svg'

const { theme, toggleTheme } = useTheme()
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
    <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
      <div class="flex items-baseline gap-3">
        <img
          :src="theme === 'light' ? logoRed : logoWhite"
          alt="Sporty"
          class="h-5 w-auto sm:h-6"
        >
        <span
          class="type-display border-l-2 border-brand pl-3 text-sm font-semibold uppercase tracking-wide text-ink-muted"
        >
          Leagues
        </span>
      </div>

      <button
        type="button"
        class="rounded-full border border-line bg-surface-raised px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-ink-muted hover:text-ink"
        :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
        @click="toggleTheme"
      >
        <span aria-hidden="true">{{ theme === 'dark' ? '☀' : '☾' }}</span>
      </button>
    </div>
  </header>
</template>
