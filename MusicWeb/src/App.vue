<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, ref, watch, nextTick, onBeforeUnmount, provide } from 'vue'

import { useRouter } from 'vue-router'
const router = useRouter()
import { useWindowinfoStore } from './stores/windowInfo'
import { useSongsinfoStore } from './stores/songsPlay'
const windowinfo = useWindowinfoStore()
const songsinfo = useSongsinfoStore()
const player = ref()
const plays = windowinfo.play
onMounted(async () => {
  console.log('监听')
  //token有效或无效
  if (!localStorage.getItem('token')) {
    router.push('/login')
  } else {
    router.push('/main')
  }
})
//监听暂停和播放
watch(
  () => songsinfo.play,
  (n, o) => {
    if (n) {
      player.value.play()
    } else {
      player.value.pause()
    }
  }
)
//监听url变化换歌
watch(
  () => songsinfo.url,
  async () => {
    player.value.load()
    player.value.preload = 'auto'
    player.value.currentTime = 0
    if (songsinfo.play) {
      setTimeout(() => {
        player.value.play()
      }, 0)
    }
  }
)
//监听进度实时更新
watch(
  () => songsinfo.hasPlay,
  (n, o) => {
    if (Math.abs((n - o) * 1000) > 2) {
      player.value.currentTime = n * player.value.duration
    }
    //如果播放到了最后一刻，那就换歌
    if (n >= 1) {
      songsinfo.PlayNext(player.value)
    }
  }
)
//进度条
const update = (e) => {
  songsinfo.hasPlay = player.value.currentTime / player.value.duration
}
//音量大小调节
watch(
  () => songsinfo.volumeSize,
  (newValue, oldValue) => {
    player.value.volume = newValue / 100
  }
)
watch(
  () => songsinfo.volumeNone,
  (newValue, oldValue) => {
    if (newValue) {
      player.value.volume = 0
    } else {
      player.value.volume = songsinfo.volumeSize / 100
    }
  }
)
//监听是否单一循环
watch(
  () => songsinfo.singleCycle,
  (newValue) => {
    player.value.loop = newValue
  }
)
window.onresize = () => {
  windowinfo.height = window.innerHeight
}
const isRouterActive = ref(true)
provide('reload', () => {
  isRouterActive.value = false
  nextTick(() => {
    isRouterActive.value = true
  })
})
</script>

<template>
  <div class="page" :style="{ height: windowinfo.height + 'px' }">
    <RouterView v-if="isRouterActive" />
    <audio ref="player" :src="songsinfo.url" @timeupdate="update" preload />
  </div>
</template>

<style scoped lang="scss">
* {
  margin: 0 auto;
  padding: 0;
}
.page {
  @include setWHBC(100%, 100%, rgb(247, 247, 243), black);
}
</style>
