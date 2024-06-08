<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useUserinfoStore } from '@/stores/counter'
import { useWindowinfoStore } from '@/stores/windowInfo'
const windowInfo = useWindowinfoStore()
const userinfo = useUserinfoStore()
let main = ref()
let aside = ref()
const page = ref()
let asideNav: any = ref([])
let height = window.innerHeight + 'px'
onMounted(async () => {
  //设置高度
  aside.value.style.height = windowInfo.mainHeight
  main.value.style.height = windowInfo.mainHeight
  asideNav.value = userinfo.routes
    .filter((e) => e.id === 1)[0]
    .children.filter((e) => e.id === 5)[0].children
})
</script>
<template>
  <div class="page" ref="page" :style="{ height: windowInfo.mainHeight }">
    <aside class="aside" ref="aside" :style="{ height: windowInfo.mainHeight }">
      <nav>
        <RouterLink class="nav" v-for="item in asideNav" :key="item.id" :to="item.realpath">{{
          item.name
        }}</RouterLink>
      </nav>
    </aside>
    <main class="main" ref="main" :style="{ height: windowInfo.mainHeight }">
      <RouterView></RouterView>
    </main>
  </div>
</template>
<style lang="scss" scoped>
.page {
  @include setWHBC(100%, auto, rgb(245, 245, 245), black);
}
.main {
  border-right: 1px solid rgb(217, 217, 217);
  border-left: 1px solid rgb(217, 217, 217);
  @include setWHBC(67%, auto, unset, unset);
  position: absolute;
  left: 23%;
  top: 0;
  padding: 0;
  display: inline-block;
}
.aside {
  @include setWHBC(13%, 100%, white, black);
  position: absolute;
  left: 10%;
  border-left: 1px solid rgb(217, 217, 217);
  border-right: 1px solid rgb(217, 217, 217);
  box-sizing: border-box;
}
.aside > nav {
  position: absolute;
  @include setWHBC(100%, auto, white, black);
}
.nav {
  @include setWHBC(100%, 100px, white, black);
  @include flexBox(row wrap, center, center);
  text-decoration: none;
}
.nav:hover {
  @include setWHBC(100%, 100px, rgb(244, 242, 242), black);
}
</style>
