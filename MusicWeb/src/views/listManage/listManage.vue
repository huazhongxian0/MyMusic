<script lang="ts" setup>
import tokenRequest from '@/utils/tokenRequest'
import { onMounted } from 'vue'
onMounted(async () => {
  let result = await tokenRequest.get('/getsonglists')
  console.log(result)
})
</script>
<template></template>
