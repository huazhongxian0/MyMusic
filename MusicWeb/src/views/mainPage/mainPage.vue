<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { mapRoute, generateTree } from '@/utils/router'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useUserinfoStore } from '@/stores/counter'
import { useWindowinfoStore } from '@/stores/windowInfo'
import footPlayer from '@/commponent/footPlayer.vue'
import { useSongsinfoStore } from '@/stores/songsPlay'
import tokenRequest from '@/utils/tokenRequest'
const router = useRouter()
const userinfo = useUserinfoStore()
const windowInfo = useWindowinfoStore()
const songsinfo = useSongsinfoStore()
const player = ref()
const main = ref()
let test: any = null
let test0 = null
let headNav = ref<Array<any>>([])

onMounted(async () => {
  await tokenRequest.get('/getroutes').then((result) => {
    //里面作前端部分对数据需求的处理，用其添加一个realname属性去给导航栏做导航
    const routes = generateTree(result.data, '')
    //存入pinia里
    userinfo.setRoutes(routes)
    //获取headNav
    headNav.value = routes.filter((e) => {
      return e.id === 1
    })[0].children
    console.log(headNav.value)
    //深拷贝这个树目的是生成路由表里的标准格式数据
    let newRoutes = JSON.parse(JSON.stringify(routes))
    newRoutes = newRoutes.map((e: any) => mapRoute(e))
    newRoutes.map((e) => {
      router.addRoute(e)
    })
  })
  await tokenRequest.get('/getuserinfo').then((result) => {
    userinfo.SetUserInfo(
      result.data.id,
      result.data.nickname,
      result.data.username,
      result.data.password,
      userinfo.token
    )
  })
  main.value.$el.style.top = 75 + 'px'
  //获取歌单
  let result = await tokenRequest.get('/getsonglists')
  result = result.data
  songsinfo.myLists = result
  result = result.filter((e) => {
    return e.is_default_favorite === 1
  })[0]
  userinfo.likeListId = result.id
  //请求喜欢列表
  songsinfo.list = result
  songsinfo.likeList = result
})
//控制导航栏
let selectId = ref<number>(parseInt(localStorage.getItem('page') || '0'))
const handNav = (id: number) => {
  selectId.value = id
  localStorage.setItem('page', id)
}
</script>

<template>
  <div class="page">
    <el-container direction="vertical">
      <el-header class="ElHeader">
        <img />
        <nav>
          <span v-for="item in headNav" :key="item.id" style="width: auto; height: 100%">
            <RouterLink
              :to="item.realpath"
              :class="{ active: selectId === item.id }"
              @click="handNav(item.id)"
              >{{ item.name }}<span class="cors" v-if="selectId === item.id"></span>
            </RouterLink>
          </span>
        </nav>
        <div class="search">
          <div></div>
        </div>
      </el-header>
      <div class="line"></div>
      <el-main
        :style="{ width: '100%', position: 'relative', height: windowInfo.mainHeight }"
        ref="main"
      >
        <RouterView />
      </el-main>
      <el-footer class="footPlayer">
        <footPlayer />
      </el-footer>
    </el-container>
  <audio ref="player" :src="songsinfo.url" />
  </div>
</template>
<style scoped lang="scss">
* {
  margin: 0 auto;
  padding: 0;
}
.ElHeader {
  @include setWHBC(100%, 70px, $headerNavColor, white);
  @include flexBox(column wrap, center, center);
  align-content: center;
  font-size: 14px;
  position: fixed;
  z-index: 100;
}
.ElHeader > img {
  @include setWHBC(200px, 100%, $headerNavColor, white);
  margin: 0;
}
.ElHeader > nav {
  @include setWHBC(auto, 100%, $headerNavColor, white);
  @include flexBox(row, flex-start, center);
  margin: 0;
}
.ElHeader > nav > span > a:nth-child(n) {
  @include setWHBC(auto, 100%, $headerNavColor, rgb(193, 204, 204));
  @include flexBox(row, center, center);
  padding-left: 18px;
  padding-right: 18px;
  margin: 0;
  text-decoration: none;
}
.ElHeader > nav a:nth-child(n):hover {
  background-color: black;
  color: white;
}
.active {
  background-color: black !important;
  color: rgb(249, 247, 247) !important;
}
.line {
  height: 5px;
  width: 100%;
  z-index: 100;
  top: 70px;
  position: relative;
  background-color: rgb(194, 12, 12);
}
.cors {
  height: 1px;
  width: 1px;
  position: absolute;
  top: 59px;
  border-bottom: 5px solid red;
  border-top: 5px solid rgba(0, 0, 0, 0);
  border-left: 5px solid rgba(241, 227, 227, 0);
  border-right: 5px solid rgba(0, 0, 0, 0);
  background-color: rgb(14, 0, 0);
}
.search {
  @include setWHBC(200px, 40%, white, black);
  border-radius: 50px;
}
.footPlayer {
  @include setWHBC(100%, 70px, unset, black);
  display: inline-block;
  position: fixed;
  bottom: 0;
  z-index: 100;
}
</style>
