<script setup lang="ts">
defineProps<{
  options: string[]
  allLabel: string
  label: string
}>()

const model = defineModel<string>({ required: true })
</script>

<template>
  <label class="flex items-center gap-2">
    <span class="sr-only">{{ label }}</span>
    <select
      v-model="model"
      class="w-full cursor-pointer appearance-none rounded-lg border border-line bg-surface py-2.5 pl-3 pr-8 text-sm text-ink transition-colors focus:border-brand-hover sm:w-44"
      :style="{
        backgroundImage: `url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='%239ca0ab' stroke-width='1.5'%3E%3Cpath d='m3 5 3 3 3-3'/%3E%3C/svg%3E&quot;)`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.6rem center',
        backgroundSize: '0.85rem',
      }"
    >
      <option value="">{{ allLabel }}</option>
      <option
        v-for="option in options"
        :key="option"
        :value="option"
      >
        {{ option }}
      </option>
    </select>
  </label>
</template>
