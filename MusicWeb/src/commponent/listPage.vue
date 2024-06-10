<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {useRouter,useRoute} from 'vue-router'
const router = useRouter()
const route = useRoute()
import { useWindowinfoStore } from '@/stores/windowInfo'
const windowInfo = useWindowinfoStore()
import { useUserinfoStore } from '@/stores/counter'
const userinfo = useUserinfoStore()
import tokenRequest from '@/utils/tokenRequest'
import palyList from '@/commponent/palyList.vue'
import { useSongsinfoStore } from '@/stores/songsPlay'
const songsinfo = useSongsinfoStore()       
interface songs {
  id: number
  title: string
  like: boolean
  author: string
  url: string
}
interface list {
  id: number
  name: string
  date_created: string
  is_default_favorite: 1
  song_ids: Array<number>
  songs: Array<songs>
  user_id: number
}
const props = ref([])
let listInfo = ref<list>({})
let tableData = ref<Array<songs>>([])
const page = ref()
const date = ref()
onMounted(async () => {
  listInfo.value = JSON.parse(route.query.data);
  let result = await tokenRequest.post('/islike', { list: listInfo.value.songs })
  listInfo.value.songs = result.data
  date.value = new Date(listInfo.value.date_created)
  date.value = date.value.toLocaleDateString()
})
const PlayAll = () => {
  songsinfo.list = listInfo.value
  if (songsinfo.list.songs.length != 0) {
    songsinfo.playing = songsinfo.list.songs[0]
    songsinfo.setAll(
      songsinfo.list.songs[0].id,
      songsinfo.list.songs[0].title,
      songsinfo.list.songs[0].url,
      songsinfo.list.songs[0].author,
      songsinfo.list.songs[0].duration
    )
    songsinfo.play = true
  } else {
    ElMessage({
      type: waring,
      message: '您的歌单为空哦'
    })
  }
}
</script>
<template>
  <div class="page" ref="page" :style="{ height: windowInfo.mainHeight }">
    <div class="top">
      <div class="image">
        <i
          class="iconfont icon-aixin1"
          style="font-size: 200px; position: absolute; opacity: 0.2"
        ></i>
        <img class="image" src="../../assets/photos/day16-retro-cassette.png" alt="" />
      </div>
      <div class="topright">
        <div class="listName">{{ listInfo.name }}</div>
        <div class="nickName">{{ userinfo.nickName }} 创建于 {{ date }}</div>
        <div class="btns">
          <el-button color="red" @click="PlayAll()">播放全部</el-button>
          <el-button color="" border="1">批量操作</el-button>
        </div>
      </div>
    </div>
    <div class="list">
      <palyList :songsList="listInfo.songs"/>
    </div>
  </div>
</template>
<style scoped lang="scss">
.page {
  @include setWHBC(100%, 100%);
  .top {
    @include setWHBC(96%, 200px);
    position: relative;
    left: 2%;
    display: flex;
    flex-wrap: wrap;

    .image {
      @include setWHBC(200px, 200px);
      border-radius: 10px;
      display: inline-block;
    }
    .topright {
      @include setWHBC(calc(100% - 200px), 100px);
      @include flexBox(row wrap, center, center);
      .listName {
        @include setWHBC(100%, 40px, unset, rgb(40, 50, 72));
        margin-top: 10px;
        margin-left: 20px;
        font-size: 19px;
        font-weight: 600;
      }
      .nickName {
        @include setWHBC(100%, 40px, unset, rgb(82, 89, 105));
        margin-left: 20px;
        font-size: 10px;
      }
      .btns {
        margin-top: 50px;
        margin-left: 50px;
        @include setWHBC(100%, 50px);
      }
    }
  }
  .list {
    margin-left: 24px;
    padding: 0;
  }
}
.playList {
  @include setWHBC(100%, 100%);
}
</style>
