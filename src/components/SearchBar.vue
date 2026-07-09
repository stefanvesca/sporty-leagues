<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const model = defineModel<string>({ required: true })

const DEBOUNCE_MS = 250

// Local echo of the input so typing stays instant while the bound
// store value (and the filtering it drives) updates debounced.
const draft = ref(model.value)
let timer: ReturnType<typeof setTimeout> | undefined

watch(draft, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    model.value = value
  }, DEBOUNCE_MS)
})

watch(model, (value) => {
  if (value !== draft.value) draft.value = value
})

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="relative flex-1">
    <svg
      class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <circle
        cx="9"
        cy="9"
        r="6"
      />
      <path
        d="m14 14 4 4"
        stroke-linecap="round"
      />
    </svg>
    <input
      v-model="draft"
      type="search"
      placeholder="Search leagues by name"
      aria-label="Search leagues by name"
      class="w-full rounded-lg border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted transition-colors focus:border-brand-hover"
    >
  </div>
</template>
