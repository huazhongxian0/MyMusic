<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { mapRoute, generateTree } from '@/utils/router'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useUserinfoStore } from '@/stores/counter'
import { useWindowinfoStore } from '@/stores/windowInfo'
import footPlayer from '@/commponent/footPlayer.vue'
import { useSongsinfoStore } from '@/stores/songsPlay'
import tokenRequest from '@/utils/tokenRequest'
import { ElMessage } from 'element-plus'
import palyList from '@/commponent/palyList.vue'
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
    //深拷贝这个树目的是生成路由表里的标准格式数据
    let newRoutes = JSON.parse(JSON.stringify(routes))
    newRoutes = newRoutes.map((e: any) => mapRoute(e))
    newRoutes.map((e) => {
      router.addRoute(e)
    })
  })
  router.push('/main/recommend')
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
//搜索模块
const searchSongs = ref('')
const Search = async() => {
  if(searchSongs.value === ''){
    ElMessage({
      type:'warning',
      message:'你没输入任何值啊！'
    })
    return
  }
  let result = await tokenRequest.post('/search',{
      text:searchSongs.value
  })
  ElMessage(result)
  searchResultSongs.value = result.data
  searchPage.value = true
  if(result.type === 'success'){
    searchSongs.value = ''
  }
}
//搜索面板弹出
const searchPage = ref(false)
const searchResultSongs = ref([])
watch(searchPage,(newValues) => {
  if(!newValues){
    searchResultSongs.value = []
  }
})
const UpdateNickname = () => {
  ElMessageBox.prompt('请输入你要修改后的昵称', '修改昵称', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  })
    .then(({ value }) => {
      if(value.trim() === ''){
        ElMessage({
          type: 'warning',
          message: `不能为空哦！`,
        })
        return
      }else{
        tokenRequest.post('updatenickname',{nickname: value}).then(e => {
          ElMessage(e)
          if(e.type === 'success'){
            userinfo.nickName = value
          }
        })
      }
    })
    .catch(() => {})
}
const Logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<template>
  <div class="page">
    <el-container direction="vertical">
      <el-header class="ElHeader">
        <el-dropdown>
          <span class="logout">
            <i class="iconfont icon-yonghu icons"></i>
            {{userinfo.nickName}}
            <i class="iconfont icon-xiala icons"></i>
          </span> 
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="UpdateNickname">修改昵称</el-dropdown-item>
              <el-dropdown-item @click="Logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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
          <input type="text" v-model="searchSongs" class="ipt" placeholder="你可以在此搜索">
          <span class="btn" @click="Search()">
            <i class="iconfont icon-sousuo ic"></i>
          </span>
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
  <el-dialog v-model="searchPage" title="查询结果" width="800">
    <palyList :songsList="searchResultSongs"/>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="searchPage = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
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
  .logout{
    @include setWHBC(200px,70px,#242424,rgb(173, 173, 66));
    @include flexBox(row,center,center);
    padding: 0;
    .icons{
      font-size:20px;
      margin: 0;
    }

  }
  .search{
    @include flexBox(row,center,center);
    margin-left: 20px;
    .ipt{
      @include setWHBC(calc(100% - 40px),100%);
      border-end-start-radius: 50px;
      border-start-start-radius: 50px;
      border: 0px;
      position: relative;
      margin: 0;
      padding: 12px;
      box-sizing: border-box;
      &:focus{
        outline: none;
      }
    }
    .btn{
      @include setWHBC(40px,100%,red);
      @include flexBox(row,flex-start,center);
      border: 0;
      border-start-end-radius: 50px;
      border-end-end-radius: 50px;
      font-size: 50px;
      .ic{
        font-size: 20px;
      }
    }
  }
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
