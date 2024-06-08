<script setup lang="ts">
import { onMounted, ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useSongsinfoStore } from '@/stores/songsPlay'
import { translate } from 'element-plus'
const props = defineProps(['color', 'backimage', 'bgcColor'])

const songsinfo = useSongsinfoStore()
const cor = ref(false)
const corDom = ref()
const page = ref()
const pages = ref()
const hasPlay = ref()
let width: any = null
let left: any = null
//点击函数
const dropTo = (e) => {
  e.stopPropagation()
  //计算点击后期待的百分比
  let point = (e.clientX - left) / width
  //播放器组件监听到hasPlay变化后会自动跳转
  songsinfo.hasPlay = point
}
onMounted(() => {
  //页面总宽度，及进度条总长度
  width = page.value.offsetWidth
  //页面总长度，进度条到最左侧的距离
  left = page.value.getBoundingClientRect().left
  //设置外部传进来的期待颜色，没有就默认黄色
  hasPlay.value.style.backgroundColor = !props.color ? 'yellow' : props.color
  hasPlay.value.style.width = songsinfo.hasPlay * width + 'px'
  if (props.bgcColor) {
    pages.value.style.backgroundColor = props.bgcColor
  }
  if (props.backimage) {
    hasPlay.value.style.backgroundImage = props.backimage
  }
})

watch(
  () => songsinfo.hasPlay,
  async (n, o) => {
    await nextTick()
    hasPlay.value.style.width = n * width + 'px'
  }
)
watch(
  () => songsinfo.url,
  (n, o) => {
    hasPlay.value.style.width = 0 + 'px'
  }
)
</script>
<template>
  <div class="pag" ref="page" @mouseenter="cor = true" @mouseleave="cor = false" @click="dropTo">
    <div class="pages" ref="pages">
      <div class="hasPlay" ref="hasPlay">
        <div class="cor" v-show="cor" ref="corDom"></div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.pag {
  @include setWHBC(100%, 100%);
  @include flexBox(row, center, flex-start);
  cursor: pointer;
  .pages {
    border-radius: 5px;
    @include setWHBC(100%, 5px, #dadcdf);
    .hasPlay {
      border-radius: 5px;
      @include setWHBC(0, 100%, #fc3d4f);
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .cor {
        flex-shrink: 0;
        display: inline-block;
        @include setWHBC(13px, 13px, white);
        border-radius: 50%;
        box-shadow: 0 0px 1px 1px rgb(239, 211, 211);
      }
    }
  }
}
</style>
