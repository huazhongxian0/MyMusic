import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
export const useWindowinfoStore = defineStore('window', () => {
  const height = ref(window.innerHeight)
  const mainHeight = computed(() => {
    return height.value - 70 - 70 - 5 + 'px'
  })
  const totalHeight = computed(() => {
    return height.value + 'px'
  })

  return { height, mainHeight, totalHeight }
})
