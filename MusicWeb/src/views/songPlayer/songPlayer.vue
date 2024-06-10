<script lang="ts" setup>
import { useWindowinfoStore } from '@/stores/windowInfo'
import Progress from  '@/commponent/progress.vue'
import { onBeforeUnmount, onMounted, ref,watch, computed,reactive} from 'vue'
import { useRouter } from 'vue-router';
import { useSongsinfoStore } from '@/stores/songsPlay';
import randomPlayIcon from '@/assets/icon/randomPlayIcon.png'
import randomPlayActiveIcon from '@/assets/icon/randomPlayActiveIcon.png'
import singleRepeatIcon from '@/assets/icon/singleRepeatIcon.png'
import singleRepeatActiceIcon from '@/assets/icon/singleRepeatActiceIcon.png'
import cyclePlayIcon from '@/assets/icon/cyclePlayIcon.png'
import cyclePlayActiveIcon from '@/assets/icon/cyclePlayActiveIcon.png'
import tokenRequest from '@/utils/tokenRequest';
import { useUserinfoStore } from '@/stores/counter';
const userinfo = useUserinfoStore()
const songsinfo = useSongsinfoStore()
const router = useRouter()
const windowinfo = useWindowinfoStore()
const img = ref()
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
const page = ref()
const progress = ref(0)
let canvas = ref(null);
let source = null
let analyser = null
let hasDraw = ref(false)
let animationFrameId:any = null
let AudioPlay = async() => {
    let ctx = canvas.value.getContext('2d');
    let audioCtx = null
    if(!songsinfo.hasConnect){
      audioCtx = new AudioContext();
      source = audioCtx.createMediaElementSource(songsinfo.playerDom);
      analyser = audioCtx.createAnalyser();
      songsinfo.Connect = source
      songsinfo.audioContext = audioCtx
      songsinfo.analyser = analyser
      songsinfo.hasConnect = true
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
    }else{  
      source = songsinfo.Connect
      audioCtx = songsinfo.audioContext
      analyser = songsinfo.analyser
    }
    // 设置分析器的FFT大小
    analyser.fftSize = 256;
    let bufferLength = analyser.frequencyBinCount * 2;
    let dataArray = new Uint8Array(bufferLength);
    // 创建一个动画函数
    const draw = () => {
    // 请求下一帧动画
    animationFrameId = requestAnimationFrame(draw);
    if (analyser) {
      // 获取频率数据
      analyser.getByteFrequencyData(dataArray);
      // 清除画布
      ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
      // 绘制频率条
      let barWidth = (canvas.value.width / bufferLength) * 2.1;
      let barHeight;
      let x = 0;
      for(let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        ctx.fillStyle = 'rgb(' + (barHeight-100) +','+(barHeight+20) +','+(255-barHeight)+')';
        ctx.fillRect(x,canvas.value.height-barHeight/2,barWidth*2,barHeight/2);
        x += barWidth + 1;
      }
    }
    };
    draw()
} 
onMounted(() => {
  if(songsinfo.play){
    img.value.style.animationPlayState = 'running'
  }
  page.value.style.height = windowinfo.totalHeight

    AudioPlay()
})

onBeforeUnmount(() => {
  if (animationFrameId != null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
});
let processbackImage = 'linear-gradient(to right, #1e1d1c, #87503a, #e4825b)'
//暂停的逻辑
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
  return songsinfo.play ? 'iconfont icon-zanting-active-copy' : 'iconfont icon-bofang-active-copy-copy'
})
watch(()=>songsinfo.routerUrl,(newValue)=>{
  songsinfo.hasConnect = false
})
//是否开启音频谱
let isVolume = ref(false)
//音量调节
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
//循环播放
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
const modeIcon = ref(0)
watch(modeIcon, (newValue) => {
  songsinfo.mode = newValue
})
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
const Play = (item:Object) => {
songsinfo.routerUrl = item.url
songsinfo.title = item.title
songsinfo.author = item.author
}
</script>
<template>
  <div class="page" ref="page" :style="{ height: windowinfo.totalHeight }">
    <div class="addvolumebtn">
      <div class="btnpage">
          
      </div>
    </div>
    <button class="back" @click="router.back()">
        <img src="../../assets/photos/left.png" style="width:100%;height:100%; position:absolute;right:2px"></img>
    </button>
    
    <canvas ref="canvas" class="canvas" v-show="isVolume"></canvas> 
    <img class="image" src="@/assets/photos/day16-retro-cassette.png" ref="img"/>    
    <div class="songsinfo">
      <div class="now">
        <div class="title">{{songsinfo.title}}</div>
        <div class="author"><span>歌手:&nbsp; {{songsinfo.author}}</span>&nbsp;&nbsp;&nbsp;<span>来源:&nbsp; {{songsinfo.list.name}}</span></div>
      </div>
    </div>
    <div class="audio">
      <Progress class="progress"  :backimage="processbackImage" :bgcColor="'rgba(0,0,0,0)'" ></Progress>
      <div class="settings">
        <div class="left">
          <div class="hasplay">{{songsinfo.currentTime}}</div>&nbsp;
          /&nbsp;&nbsp;
          <div class="all">{{songsinfo.durationTime}}</div>
        </div>
        <div class="center">
          <div class="top">
            <span class="love" @click="ClickLove(songsinfo.isLike, songsinfo.id, $event)">
              <i class="iconfont icon-aixin" style="font-size: 25px" v-show="!songsinfo.isLike"></i>
              <i class="iconfont icon-aixin1" style="font-size: 25px" v-show="songsinfo.isLike"></i>
            </span>
            <span class="before" @click="PlayBefore">
              <i
                class="iconfont icon-ai10-copy"
                style="font-size: 25px"
                @mouseenter="
                  (e) => {
                    e.target.classList.add('icon-ai10-copy-copy')
                  }
                "
                @mouseleave="
                  (e) => {
                    e.target.classList.remove('icon-ai10-copy-copy')
                  }
                "
              ></i>
            </span>
            <span class="pause" @click="pause">
              <i :class="pausePosition" style="font-size: 50px"></i>
            </span>
            <span class="next" @click="PlayNext"
              ><i
                class="iconfont icon-ai09-copy"
                style="font-size: 25px"
                @mouseenter="
                  (e) => {
                    e.target.classList.add('icon-ai09-copy-copy')
                  }
                "
                @mouseleave="
                  (e) => {
                    e.target.classList.remove('icon-ai09-copy-copy')
                  }
                "
              ></i
            ></span>
            <span
              class="cycle"
              @click="updateCycle"
              @mouseenter="enter"
              @mouseleave="leave"
              :style="cycleStyle"
            ></span>
          </div>
          
        </div>
        <div class="right">
          <el-switch v-model="isVolume" style="margin-right: 30px;"/>
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
          <img src="@/assets/photos/day16-retro-cassette.png" />
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
* {
  padding: 0 auto;
  margin: 0;
}
.page {
  @include setWHBC(100%, auto, white);
  background-image: linear-gradient(to right top, rgb(41, 52, 57), rgb(94, 11, 11));
  @include flexBox(row wrap, center, flex-start);
  z-index: 1;
  align-content: center;
  position: fixed;
  .addvolumebtn{
    @include setWHBC(100%,auto);
    @include flexBox(row,center,center);
    position: absolute;
    top: 30px;
    .btnpage{
      .btn1{
        @include setWHBC(100px,30px) 
      }
      .btn2{
        @include setWHBC(100px,30px)
      }
    }
  }
}
.image {
  border-radius: 50%;
  opacity: 0.9;
  border: 20px solid rgba(11, 8, 8, 0.9);
  box-sizing: border-box;
  margin-right: 100px;
  background-image: linear-gradient(to right top, rgb(58, 89, 106), rgb(45, 25, 25)); 
  @include setWHBC(400px, 400px, white, white);
  @include anm;
}
.canvas{
  @include setWHBC(100%,100%);
  position: absolute;
  z-index: 0;
}
.songsinfo{
  @include setWHBC(400px,400px);
  @include flexBox(row,center,center);
  margin-left:50px; 
  margin-bottom: 100px;
  z-index: 100;
  .now{
    @include setWHBC(100%,125px,rgba(73, 27, 29,0),white);
    z-index: 100;
    @include flexBox(column,space-between,center);
    padding: 15px;
    border-radius: 5px;
    .title{
      @include setWHBC(100%,30px,unset,white);
      margin-left: 10px;
      margin-top:10px;
      font-size: 25px;
    }
    .author{
      margin-left: 10px;  
      margin-bottom: 10px;
      @include setWHBC(100%,20px,unset,rgb(242, 223, 217))
    }
  }
}
.light{
    border: 1px  solid white;
    z-index: 100;
}
@keyframes rote {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.audio {
  @include setWHBC(100%, 10%,rgba(22, 21, 58, 0.7));
  @include flexBox(row wrap,center,flex-start);
  box-shadow: 0 0 5px 1px rgb(59, 46, 46);
  align-self: flex-end;
  position: fixed;
  bottom: 0;
  .progress{
    @include setWHBC(100%,30%,rgb(158, 133, 133,0));
    transform: translateY(-5px)
  }
  .settings {
  @include setWHBC(100%, 100%);
    @include flexBox(row nowrap, space-between, flex-start);
    .left {
      flex: 2;
      @include setWHBC(300px, 50%,unset,#7c7c7c);
      padding-left: 20px;
      @include flexBox(row, flex-start, flex-start);
      i{
        margin-left: 20px;
      }
    }
    .center {
      flex: 3;
      @include setWHBC(500px, 100%,unset);
      @include flexBox(row wrap, center, flex-start);
      .top {
        @include setWHBC(60%,50px,unset);
        @include flexBox(row, space-evenly, center);
        transform: translateY(-10px);
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
          @include setWHBC(50px, 50px);
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
      
    }
    .right {
      flex: 2;
      @include setWHBC(250px, 50%);
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
}
.back {
  position: absolute;
  z-index: 100;
  left: 5%;
  top: 5%;
  border: 0;
  @include setWHBC(50px, 50px, rgba(86, 98, 81, 0.1), white);
  box-shadow: 0 0 5px 1px #aba19780;
  border-radius: 50%;
  @include flexBox(row,center,center);
}
.back:hover{
    box-shadow: 0 0 5px 1px #e7e4e180;
}
.back:active{
    box-shadow: none;
}
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

</style>
