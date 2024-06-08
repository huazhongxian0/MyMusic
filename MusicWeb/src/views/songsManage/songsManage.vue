<script setup lang="ts">
import { onMounted, ref } from 'vue'
import tokenRequest from '@/utils/tokenRequest'
import deletePlayList from '@/commponent/deletePlayList.vue'
import { useWindowinfoStore } from '@/stores/windowInfo'
//外部库
const windowinfo = useWindowinfoStore()
//DOM
const page = ref()
interface message {
  data: any
  message: string
  type: string
}
const songsList = ref([])
const switchToShow = ref(false)
onMounted(async () => {
  page.value.style.height = windowinfo.mainHeight
  let result = await tokenRequest.get('/getsongs')
  songsList.value = result.data
})
const deletesongs = (i) => {
  songsList.value.splice(i, 1)
}
</script>
<template>
  <div class="page" ref="page">
    <deletePlayList @delete-parents="deletesongs" :songsList="songsList"></deletePlayList>
  </div>
</template>
<style lang="scss" scoped>
.page {
  @include setWHBC(100%, auto, rgb(254, 246, 246), black);
}
</style>
