<script setup>
import palyList from '@/commponent/palyList.vue'
import { onMounted, ref } from 'vue'
import tokenRequest from '@/utils/tokenRequest'
const value = ref([])
onMounted(async () => {
  let result = await tokenRequest.get('/getsongs')
  result = await tokenRequest.post('/islike', { list: result.data })
  value.value = result.data
})
</script>
<template>
  <div class="page">
    <palyList :songsList="value" :listId="value"></palyList>
  </div>
</template>
<style lang="scss" scoped>
.page {
  @include setWHBC(100%, auto, white, black);
}
.aside {
  @include setWHBC(20%, 500px, red, black);
  position: absolute;
  margin-left: 10%;
  margin-top: 50px;
}
</style>
