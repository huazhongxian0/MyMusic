<script setup lang="ts">
import tokenRequest from '@/utils/tokenRequest'
import { onMounted, ref, watchEffect, watch,computed, onUpdated, inject } from 'vue'
const reload = inject('reload')
import { useSongsinfoStore } from '@/stores/songsPlay'
const songsinfo = useSongsinfoStore()
import { useUserinfoStore } from '@/stores/counter'
const userinfo = useUserinfoStore()
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { id } from 'element-plus/es/locales.mjs'
import { resolve } from 'path';
const router = useRouter()
const props = defineProps(['songsList', 'listId'])
const time = ref([])
// const songsList = ref([])
const convertSecondsToTimeFormat = (a) => {
  a = Math.floor(a)
  let min = Math.floor(a / 60)
  let sec = Math.floor(a % 60)
  let addZero = (num) => {
    return num < 10 ? '0' + num : num
  }
  return addZero(min) + ':' + addZero(sec)
}
watchEffect(() => {
  if (props.songsList) {
    time.value = props.songsList.map((song) => ({
      ...song,
      time: convertSecondsToTimeFormat(song.duration)
    }))
  }
})

onMounted(async () => {})
const toPlayers = (id: number, title: string, url: string, author: string, duration: number) => {
  songsinfo.hasPlay = 0
  songsinfo.setAll(id, title, url, author, duration)
}

const ChangeIsLike = async (islike: boolean, id: number, index, event) => {
  event.stopPropagation()
  //是 true 就表明是要删除
  //是 false 就表明是添加
  let result = null
  if (islike) {
    //删除操作
    result = await tokenRequest.post(`/deletelike`, { listId: userinfo.likeListId, songsId: id })
    ElMessage(result)
    if (result.type === 'success') {
      time.value[index].islike = false
      songsinfo.likeList.songs.splice(index, 1)
      songsinfo.likeList.song_ids.splice(index, 1)
    }
  } else {
    //添加操作
    result = await tokenRequest.post('/addlike', { id })
    ElMessage(result)
    if (result.type === 'success') {
      time.value[index].islike = true
    }
  }
}
const clickTwo = (fn, time) => {
  let timer = null
  let count = 0
  let ids = 0
  return function (id: number, title: string, url: string, author: string, duration: number) {
    count++
    if (count === 1) {
      timer = setTimeout(() => {
        count = 0
      }, time)
      ids = id
    }
    if (ids != id) {
      clearTimeout(timer)
      count = 1
      timer = setTimeout(() => {
        count = 0
      }, time)

      return
    }
    if (count === 2 && ids === id) {
      clearTimeout(timer)
      fn(id, title, url, author, duration)
      count = 0
      timer = null
    }
  }
}
const toPlayer = clickTwo(toPlayers, 1000)
//添加歌曲到歌单
const selectMenu = ref([])
const selectListIds = ref([])
const addSongToListValue = ref(false)
const selectSongId = ref<number>()
const AddSongToList = (item,event) => {
  selectSongId.value = item.id
  event.stopPropagation()
  //初始化可供选择的表单
  songsinfo.myLists.map(e => {
      selectMenu.value.push({value:e.id,label:e.name})
  })
  addSongToListValue.value = true
}
const SendSongToList = (listId:number,songId:number|undefined) => {
  if(!songId){
    ElMessage({
      message:'有点bug,请重试一下',
      type:'warning'
    })
    addSongToListValue.value = false
    return
  }
  
  return new Promise((resolve,reject) => {
      tokenRequest.post('/addsongstolist',{listId,songId}).then(e => {
        resolve(e)
      })
    })
}
//添加了
const AddSongs = () => {
  let promises = selectListIds.value.map(e => SendSongToList(e,selectSongId.value))
  Promise.all(promises).then(e => {
    e.map(item =>{
      ElMessage(item)
    })
    addSongToListValue.value = false
  })
}
watch(addSongToListValue , (newvalues) => {  
  if(!newvalues){
    selectListIds.value = []
    selectMenu.value = []
  }
  
})
</script>
<template>
  <div class="page">
    <table>
      <tr>
        <td style="font-size: 13px; color: rgb(81, 90, 108)">#</td>
        <td style="font-size: 13px; color: rgb(81, 90, 108)">标题</td>
        <td style="font-size: 13px; color: rgb(81, 90, 108)">歌手</td>
        <td style="font-size: 13px; color: rgb(81, 90, 108)">喜欢</td>
        <td style="font-size: 13px; color: rgb(81, 90, 108)">时长</td>
      </tr>
      <hr />
      <tr
        v-for="(item, index) in time"
        v-show="time.length != 0"
        :key="item.id"
        @click="toPlayer(item.id, item.title, item.url, item.author, item.duration)"
      >
        <td>{{ index + 1 }}</td>
        <td>{{ item.title }}</td>
        <td>{{ item.author }}</td>
        <td>
          <i
            v-show="!item.islike"
            class="iconfont icon-aixin"
            style="font-size: 20px"
            @click="ChangeIsLike(item.islike, item.id, index, $event)"
          ></i>
          <i
            v-show="item.islike"
            class="iconfont icon-aixin1"
            style="font-size: 20px"
            @click="ChangeIsLike(item.islike, item.id, index, $event)"
          ></i>
          <i class="iconfont add icon-tianjia" 
          @mouseenter="(e) =>{e.target.classList.remove('icon-tianjia');e.target.classList.add('icon-tianjia-copy')}"
          @mouseleave="(e) =>{e.target.classList.remove('icon-tianjia-copy');e.target.classList.add('icon-tianjia')}"
          @click="AddSongToList(item,$event)"
          > </i>
        </td>
        <td>{{ item.time }}</td>
      </tr>
    </table>
    <div v-if="time.length === 0">暂无歌曲哦~~~~</div>
    <el-dialog
    v-model="addSongToListValue"
    title="添加至"
    width="500"
  >
    <el-tree-select
      v-model="selectListIds"
      :data="selectMenu"
      check-strictly
      multiple
      show-checkbox
    />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="addSongToListValue = false">取消</el-button>
        <el-button type="primary" @click="AddSongs()">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
  </div>
</template>
<style lang="scss" scoped>
.page {
  @include setWHBC(100%, 100%);
}
table {
  @include setWHBC(100%, auto, rgb(241, 241, 238));
}
table > tr {
  display: flex;
  @include setWHBC(100%, 70px, rgb(247, 248, 247));
}
table > tr:hover {
  display: flex;
  @include setWHBC(100%, 70px, white);
}
table > tr:nth-child(1) {
  display: flex;
  @include setWHBC(100%, 20px, rgb(247, 247, 243), black);
}
tr > td {
  flex: 7;
  @include setWHBC(auto, auto, unset, rgb(81, 90, 108));
  @include flexBox(row, flex-start, center);
}

tr > td:nth-child(1) {
  font-size: 13px;
  flex: 1;
}
tr > td:nth-child(2) {
  font-size: 15px;
  color: rgb(40, 50, 72);
}
tr > td:nth-child(3) {
  font-size: 13px;
  
  color: rgb(40, 50, 72);
}
tr > td:nth-child(4) {
  flex: 3;
  .add{
    font-size: 20px;
    margin-left: 10%;
    display: none;
  }
}
tr > td:nth-child(5) {
  font-size: 13px;
  flex: 1;
}
td > img {
  @include setWHBC(100%, auto, white);
}
tr:hover{
   td{
    .add{
      display: flex;
    }
   }
}
</style>
