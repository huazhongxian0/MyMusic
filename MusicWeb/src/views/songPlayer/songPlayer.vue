<script lang="ts" setup>
import { useWindowinfoStore } from '@/stores/windowInfo'
import Progress from  '@/commponent/progress.vue'
import { onBeforeUnmount, onMounted, ref,watch, computed} from 'vue'
import { useRouter } from 'vue-router';
import { useSongsinfoStore } from '@/stores/songsPlay';

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
onMounted(() => {
  if(songsinfo.play){
    img.value.style.animationPlayState = 'running'
  }
  page.value.style.height = windowinfo.totalHeight

})
onBeforeUnmount(() => {})
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
</script>
<template>
  <div class="page" ref="page" :style="{ height: windowinfo.totalHeight }">
    <button class="back" @click="router.back()">
        <img src="../../assets/photos/left.png" style="width:100%;height:100%; position:absolute;right:2px"></img>
    </button>
    <img class="image" src="@/assets/photos/day16-retro-cassette.png" ref="img"/>    
    <div class="songsinfo">
      <div>1</div>
      <div class="light">2</div>
      <div>3</div>     
    </div>
    <div class="audio">
      <Progress class="progress"  :backimage="processbackImage" :bgcColor="'rgba(0,0,0,0)'" ></Progress>
      <div class="settings">
        <div class="left">
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
              @mouseenter="
                (e) => {
                  e
                }
              "
            >
              <img src="../assets/photos/day16-retro-cassette.png" />
              <span>
                <div class="title">{{ item.title }}</div>
                <div class="author">{{ item.author }}</div>
              </span>
              <div class="setting">
                <i class="iconfont icon-aixin" style="font-size: 20px"></i>
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
    </div>
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
}
.image {
  border-radius: 50%;
  border: 20px solid rgba(145, 138, 138, 0);
  box-sizing: border-box;
  background-image: linear-gradient(to right top, rgb(1, 10, 15), rgb(45, 25, 25)); 
  @include setWHBC(400px, 400px, white, white);
  @include anm;
}
.songsinfo{
  @include setWHBC(400px,400px,rgba(0,0,0,0));
  margin-left:50px; 
  @include flexBox(row,center,center);
  div{
    box-sizing: border-box;
    @include setWHBC(400px,200px,blue);    
    position: absolute;
    transform-origin: 400px 100px;  
  }
  &>div:nth-child(1){
    background-color: red;
    transform: rotate(20deg);
  }
  &>div:nth-child(3){
    background-color: red;
    transform: rotate(-20deg);
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
  @include setWHBC(100%, 10%);
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
      @include setWHBC(300px, 50%);
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
      @include setWHBC(250px, 50%,blue, unset);
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
