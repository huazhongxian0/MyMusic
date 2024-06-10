<script lang="ts" setup>
import { useSongsinfoStore } from '@/stores/songsPlay'
const songsinfo = useSongsinfoStore()
import { useUserinfoStore } from '@/stores/counter'
const userinfo = useUserinfoStore()
import { useRouter } from 'vue-router'
const router = useRouter()
import { computed, onMounted, ref, watch } from 'vue'
import randomPlayIcon from '@/assets/icon/randomPlayIcon.png'
import randomPlayActiveIcon from '@/assets/icon/randomPlayActiveIcon.png'
import singleRepeatIcon from '@/assets/icon/singleRepeatIcon.png'
import singleRepeatActiceIcon from '@/assets/icon/singleRepeatActiceIcon.png'
import cyclePlayIcon from '@/assets/icon/cyclePlayIcon.png'
import cyclePlayActiveIcon from '@/assets/icon/cyclePlayActiveIcon.png'
import src from '@/assets/photos/day16-retro-cassette.png'
import process from './progress.vue'
import tokenRequest from '@/utils/tokenRequest'
import { ElMessage, messageConfig } from 'element-plus'
const cycle = ref(null)
const img = ref()
let srcs = src
let cycleMode = [
  {
    id: 1,
    url: randomPlayIcon,
    activeurl: randomPlayActiveIcon
  },
  {
    id: 2,
    url: cyclePlayIcon,
    activeurl: cyclePlayActiveIcon
  },
  {
    id: 3,
    url: singleRepeatIcon,
    activeurl: singleRepeatActiceIcon
  }
]
onMounted(() => {
  if (songsinfo.play) {
    img.value.style.animationPlayState = 'running'
  }
})
const modeIcon = ref(0)
watch(modeIcon, (newValue) => {
  songsinfo.mode = newValue
})
watch(
  () => songsinfo.play,
  (newValue, oldValue) => {
    if (newValue) {
      img.value.style.animationPlayState = 'running'
    } else {
      img.value.style.animationPlayState = 'paused'
    }
  }
)
const cycleStyle = computed(() => {
  return {
    'background-image': `url(${timeIcon.value})`
  }
})
const iconUrl = computed(() => {
  return cycleMode[modeIcon.value].url
})
const iconActiveUrl = computed(() => {
  return cycleMode[modeIcon.value].activeurl
})
const timeIcon = ref(cycleMode[modeIcon.value].url)
const updateCycle = (e) => {
  e.stopPropagation()
  if (modeIcon.value === cycleMode.length - 1) {
    modeIcon.value = 0
  } else {
    modeIcon.value++
  }
  songsinfo.cycleMode = modeIcon.value
  timeIcon.value = iconActiveUrl.value
}
const enter = (e) => {
  e.stopPropagation()
  timeIcon.value = iconActiveUrl.value
}
const leave = (e) => {
  e.stopPropagation()
  timeIcon.value = iconUrl.value
}
const pause = (e) => {
  e.stopPropagation()
  if (!songsinfo.play && !songsinfo.url) {
    ElMessage({
      message: '您还没有选择播放哪首歌哦！',
      type: 'warning'
    })
    return
  }
  songsinfo.play = !songsinfo.play
}
const pausePosition = computed(() => {
  return songsinfo.play ? 'iconfont icon-zanting' : 'iconfont icon-bofang'
})
const time = (e) => {
  e.stopPropagation()
}
let setTime = 0
let timer = null
let noneVolume = ref(false)
const VolumeClick = (e) => {
  e.stopPropagation()
  if (noneVolume.value) {
    noneVolume.value = false
    songsinfo.volumeNone = false
    return
  }
  setTime++
  timer = setTimeout(() => {
    setTime = 0
  }, 500)
  if (setTime <= 1) {
    volumeAdjustment.value = !volumeAdjustment.value
    if (volumeAdjustment.value === false) {
      setTime = 0
    }
  } else {
    volumeAdjustment.value = false
    noneVolume.value = true
    songsinfo.volumeNone = true
  }
}
let processColor = '#fc3d4f'
const volumeAdjustment = ref(false)
const volumeSize = ref(50)
watch(volumeSize, (newValue) => {
  songsinfo.volumeSize = newValue
})
//播放下一首
const PlayNext = (e) => {
  e.stopPropagation()
  songsinfo.PlayNext(e)
}
//播放上一首
const PlayBefore = (e) => {
  e.stopPropagation()
  if (songsinfo.last.length === 0) {
    ElMessage({
      type: 'warning',
      message: '您还没有播放歌哦！快去播放吧！'
    })
    return
  }
  let a = songsinfo.last.pop()
  songsinfo.PlayInsert(a)
}
//图层
const drawer = ref(false)
const drawerDom = ref()
const ClickListManage = (e) => {
  e.stopPropagation()
  drawer.value = true
}
const translateTo = (time) => {
  let minu = Math.floor(time / 60) >= 10 ? Math.floor(time / 60) : '0' + Math.floor(time / 60)
  let sec = Math.floor(time % 60) >= 10 ? Math.floor(time % 60) : '0' + Math.floor(time % 60)
  return minu + ':' + sec
}
//删除
const deletePlaying = (index, event) => {
  event.stopPropagation()
  songsinfo.deletePlaying(index)
}
//添加或删除
const ClickLove = async (isLike: boolean, id: number, event: any) => {
  event.stopPropagation()
  //是 true 就表明是要删除
  //是 false 就表明是添加
  let result = null
  if (!songsinfo.id) {
    ElMessage({
      message: '你还没选中歌曲哦！',
      type: 'warning'
    })
    return
  }
  if (isLike) {
    //删除操作
    result = await tokenRequest.post(`/deletelike`, { listId: userinfo.likeListId, songsId: id })
    ElMessage(result)
    if (result.type === 'success') {
      songsinfo.isLike = false
    }
  } else {
    //添加操作
    result = await tokenRequest.post('/addlike', { id })
    ElMessage(result)
    if (result.type === 'success') {
      songsinfo.isLike = true
    }
  }
}
//播放指定歌曲
const Play = (item:Object) => {
songsinfo.routerUrl = item.url
songsinfo.title = item.title
songsinfo.author = item.author
}
</script>
<template>
  <div class="page" @click="router.push('/play')">
    <div class="left">
      <img :src="srcs" class="img" alt="" ref="img" />
      <div>
        <div class="title">
          <span class="songsname">{{ songsinfo.title }} - </span>
          <span class="author">{{ songsinfo.author }}</span>
        </div>
        <div class="setting">
          <span class="icon"></span>
        </div>
      </div>
    </div>
    <div class="center">
      <div class="top">
        <span class="love" @click="ClickLove(songsinfo.isLike, songsinfo.id, $event)">
          <i class="iconfont icon-aixin" style="font-size: 25px" v-show="!songsinfo.isLike"></i>
          <i class="iconfont icon-aixin1" style="font-size: 25px" v-show="songsinfo.isLike"></i>
        </span>
        <span class="before" @click="PlayBefore">
          <i
            class="iconfont icon-ai10"
            style="font-size: 25px"
            @mouseenter="
              (e) => {
                e.target.classList.add('icon-ai10-active')
              }
            "
            @mouseleave="
              (e) => {
                e.target.classList.remove('icon-ai10-active')
              }
            "
          ></i>
        </span>
        <span class="pause" @click="pause">
          <i :class="pausePosition" style="font-size: 40px"></i>
        </span>
        <span class="next" @click="PlayNext"><i
            class="iconfont icon-ai09"
            style="font-size: 25px"
            @mouseenter="
              (e) => {
                e.target.classList.add('icon-ai09-active')
              }
            "
            @mouseleave="
              (e) => {
                e.target.classList.remove('icon-ai09-active')
              }
            "
          ></i>
        </span>
        <span
          class="cycle"
          @click="updateCycle"
          @mouseenter="enter"
          @mouseleave="leave"
          :style="cycleStyle"
        ></span>
      </div>
      <div class="bottom">
        <div class="time" @click="time">{{ songsinfo.currentTime }}</div>
        <process style="height: 80%; width: 80%" :color="processColor"></process>
        <div class="time" @click="time">{{ songsinfo.durationTime }}</div>
      </div>
    </div>
    <div class="right">
      <i class="iconfont icon-24gl-playlist listManage" @click="ClickListManage"> </i>
      <el-popover
        popper-class="el-popover-self"
        :visible="volumeAdjustment"
        placement="top"
        :width="40"
      >
        <el-slider vertical height="150px" style="width: 50px" v-model="volumeSize" />
        <template #reference>
          <i
            class="iconfont icon-volumeMiddle volume"
            @mouseenter="
              (e) => {
                e.target.classList.remove('icon-volumeMiddle')
                e.target.classList.add('icon-volumeMiddle-active')
              }
            "
            @mouseleave="
              (e) => {
                e.target.classList.remove('icon-volumeMiddle-active')
                e.target.classList.add('icon-volumeMiddle')
              }
            "
            v-show="!noneVolume"
            @click="VolumeClick"
          ></i>
        </template>
      </el-popover>
      <i
        class="iconfont icon-volumeCross volume"
        v-show="noneVolume"
        @mouseenter="
          (e) => {
            e.target.classList.remove('icon-volumeCross')
            e.target.classList.add('icon-volumeCross-active')
          }
        "
        @mouseleave="
          (e) => {
            e.target.classList.remove('icon-volumeCross-active')
            e.target.classList.add('icon-volumeCross')
          }
        "
        @click="VolumeClick"
      ></i>
    </div>
  </div>
  <div class="box">
    <el-drawer
      v-model="drawer"
      :modal="true"
      modal-class="my-custom-modal"
      size="30%"
      :with-header="false"
      class="pages"
      :show-close="true"
    >
      <div class="title">
        播放列表 <span>{{ songsinfo.playingList.length }}</span>
      </div>
      <ul>
        <li
          v-for="(item, index) in songsinfo.playingList"
          :key="item.id"
          @click="Play(item)"
        >
          <img src="../assets/photos/day16-retro-cassette.png" />
          <span>
            <div class="title">{{ item.title }}</div>
            <div class="author">{{ item.author }}</div>
          </span>
          <div class="setting">
           
            <i
              class="iconfont icon-lajixiangshanchu"
              style="font-size: 20px"
              @click="deletePlaying(index, $event)"
            ></i>
          </div>
          <div class="time">
            {{ translateTo(item.duration) }}
          </div>
        </li>
      </ul>
    </el-drawer>
  </div>
</template>
<style lang="scss">
.el-popover-self {
  min-width: 30px !important;
  width: 30px !important;
  padding: 0;
  @include flexBox(row, center, center);
}
.my-custom-modal {
  /* 你的自定义样式 */
  background-color: rgba(0, 0, 0, 0); /* 假设你想改变遮罩层的背景色和透明度 */
  /* 其他你想要的样式 */
}
</style>
<style lang="scss" scoped>
.modal {
  background-color: red;
}
.pages {
  .title {
    padding: 10px;
    font-weight: 700;
    font-size: large;
    @include flexBox(wrap, flex-start, flex-start);
    span {
      font-weight: 400;
      font-size: smaller;
      margin-left: 5px;
      @include setWHBC(auto, auto, unset, rgb(138, 143, 154));
    }
  }
  ul {
    li {
      @include setWHBC(100%, 50px, rgb(250, 250, 250));
      @include flexBox(wrap, flex-start, flex-start);
      padding: 10px;
      img {
        @include setWHBC(50px, 50px);
      }
      span {
        @include setWHBC(calc(100% - 200px), 50px);
        padding-left: 10px;
        .title {
          font-size: 15px;
          font-weight: 400;
          padding: 5px 0 2px 0;
        }
        .author {
          font-size: 13px;
          padding-top: 0px;
          @include setWHBC(100%, auto, unset, rgb(138, 143, 154));
        }
      }
      .setting {
        @include setWHBC(auto, 100%);
        @include flexBox(row, center, center);
        display: none;
        align-self: flex-end;
        i {
          margin-left: 10px;
        }
      }

      .time {
        @include setWHBC(50px, 50px, unset, rgb(138, 143, 154));
        @include flexBox(nowrap, center, center);
        font-size: 15px;
        margin-left: auto;
      }
    }
    li:hover {
      .setting {
        display: flex;
      }
      background: rgba(242, 243, 244);
    }
  }
}
.page {
  border-top: 1px solid #e5e6e8;
  @include setWHBC(100%, 100%, rgb(250, 250, 250));
  @include flexBox(row, space-between, center);
  .left {
    flex: 2;
    @include setWHBC(300px, 100%);
    @include flexBox(row, flex-start, center);
    .img {
      margin-left: 20px;
      margin-right: 10px;
      @include setWHBC(40px, 40px);
      border-radius: 50%;
      border: 10px solid;
      @include anm;
    }
    div {
      @include setWHBC(260px, 70px);
      .title {
        @include setWHBC(100%, 30px, unset, black);
        margin-top: 10px;
        .songsname {
          @include setWHBC(auto, 30px);
          font-size: 15px;
        }
        .author {
          @include setWHBC(auto, 30px, unset, rgb(124, 130, 143));
          font-size: 13px;
          font-weight: 100;
        }
      }
      .setting {
        @include setWHBC(160px, 30px, unset, black);
        .icon {
          @include setWHBC(22px, 22px, unset, black);
          position: relative;
          bottom: 5px;
          display: inline-block;
          background-image: url('../assets/icon/下载.png');
          background-repeat: no-repeat;
          background-size: cover;
        }
        .icon:hover {
          background-image: url('../assets/icon/下载 (1).png');
        }
      }
    }
  }
  .center {
    flex: 3;
    @include setWHBC(500px, 100%, unset);
    @include flexBox(row wrap, center, center);
    .top {
      @include setWHBC(60%, 70%, unset);
      @include flexBox(row, space-evenly, center);
      position: relative;
      top: 5px;
      .love {
        @include setWHBC(25px, 25px);
        display: inline-block;
      }
      .before {
        @include setWHBC(25px, 25px);
        display: inline-block;
        background-size: cover;
      }
      .pause {
        @include setWHBC(40px, 40px);
        display: inline-block;
      }

      .next {
        @include setWHBC(25px, 25px);
      }
      .cycle {
        @include setWHBC(22px, 20px);
        display: inline-block;
        background-size: cover;
      }
      .cycle:hover {
        background-image: url(v-bind(iconActiveUrl));
      }
    }
    .bottom {
      @include setWHBC(100%, 30%, unset);
      @include flexBox(row, center, flex-start);
      margin-top: 1%;
      & > .time:nth-child(1) {
        @include setWHBC(10%, 100%, unset, #a6aab3);
        @include flexBox(row, flex-end, flex-start);
        font-size: 10%;
        margin-right: 3%;
        position: relative;
        bottom: 25%;
      }
      & > .time:nth-child(3) {
        @include setWHBC(10%, 100%, unset, #a6aab3);
        @include flexBox(row, flex-start, flex-start);
        font-size: 10%;
        margin-left: 3%;
        position: relative;
        bottom: 25%;
      }
    }
  }
  .right {
    flex: 2;
    @include setWHBC(250px, 100%, unset);
    @include flexBox(wrap, flex-end, center);
    margin-right: 10px;
    .volume {
      font-size: 25px;
      margin-right: 25px;
    }
    .listManage {
      margin-right: 25px;
      font-size: 25px;
    }
  }
}
</style>
