import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import tokenRequest from '@/utils/tokenRequest'
export const useSongsinfoStore = defineStore('song', () => {
  const BASEURL = 'http://localhost:8080/'
  const photo = ref()
  const routerUrl = ref<string>()
  const author = ref('尚未选择')
  const title = ref('尚未选择')
  const id = ref()
  const isLike = ref(false)
  const mode = ref()
  const duration = ref(0)
  const url = computed(() => {
    if (!routerUrl.value) {
      return null
    } else {
      return BASEURL + routerUrl.value
    }
  })
  const setUrl = (url: string) => {
    routerUrl.value = url
  }
  const setAll = (
    aid: number,
    atitle: string,
    aurl: string,
    aauthor: string,
    aduration: number
  ) => {
    id.value = aid
    title.value = atitle
    routerUrl.value = aurl
    author.value = aauthor
    duration.value = aduration
  }
  //监听歌曲改变来set是否是我的喜欢
  watch(id, (newValue) => {
    isLike.value = BinarySearch(likeList.value.song_ids, newValue).has
  })
  //二分查找，返回一个对象，{has:布尔值，是否有 , index:索引}
  const BinarySearch = (arrays: Array<string>, id: string) => {
    let left = 0
    let right = arrays.length
    const ids = parseInt(id)
    if (arrays[0] != '') {
      while (left <= right) {
        const center = Math.floor((left + right) / 2)
        if (ids < parseInt(arrays[center])) {
          right = center - 1
        } else if (ids > parseInt(arrays[center])) {
          left = center + 1
        } else if (ids === parseInt(arrays[center])) {
          return {
            has: true,
            index: center
          }
        } else {
          return {
            has: false,
            index: null
          }
        }
      }
    }
    console.log(left, right)
    return {
      has: false,
      index: null
    }
  }
  //播放配置
  const now = ref()
  const play = ref(false)
  const hasPlay = ref(0)
  const currentduration = ref()
  const volumeSize = ref()
  const volumeNone = ref(false)
  const durationTime = computed(() => {
    return translateto(duration.value)
  })
  const currentTime = computed(() => {
    return translateto(duration.value * hasPlay.value)
  })
  const translateto = (time: number) => {
    return addZero(Math.floor(time / 60)) + ':' + addZero(Math.floor(time % 60))
  }
  const addZero = (time: number) => {
    if (isNaN(time)) {
      time = 0
    }
    return time >= 10 ? time + '' : '0' + time
  }
  //歌单配置
  const myLists = ref([])
  //正在播放的名单
  const list = ref([])
  const likeList = ref([])
  const playerList = computed(() =>  list.value.songs)
  const playingList = ref<Array<any>>([])
  const nextUrl = computed(() => {
    return playerList.value[nextIndex.value].url
  })
  const cycleMode = ref(0)
  //建立一个boolen值，true就是单一循环播放，false就是其他播放模式
  const singleCycle = ref(false)
  //监听目前歌单，变了就变播放列表
  watch(playerList, (newValue) => {
    switch (cycleMode.value) {
      case 0:
        singleCycle.value = false
        playingList.value = randomList(JSON.parse(JSON.stringify(newValue)))
        break
      case 1:
        singleCycle.value = false
        playingList.value = JSON.parse(JSON.stringify(newValue))
        break
      case 2:
        singleCycle.value = true
        playingList.value = JSON.parse(JSON.stringify(newValue))
        break
    }
  })
  //生成随机数组
  const randomList = (array: Array<any>) => {
    let j = 0
    for (let i = array.length - 1; i >= 0; i--) {
      j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }
  //播放下一个
  const PlayNext = (e) => {
    if (singleCycle.value) {
      return
    }
    title.value = playingList.value[nextIndex.value].title
    duration.value = playingList.value[nextIndex.value].duration
    author.value = playingList.value[nextIndex.value].author
    routerUrl.value = playingList.value[nextIndex.value].url
  }
  const searchs = (array: Array<any>, url: string) => {
    let result = null
    let index = 0
    array.map((e) => {
      if (e.url === url) {
        e.index = index
        result = e
      }
      index++
    })
    return result
  }
  const playing = ref({})
  const nextIndex = ref(0)
  const last = []
  watch(routerUrl, (newVaule) => {
    if (!playing.value) {
      nextIndex.value = 0
      return
    }
    if (playing.value) last.push(playing.value)
    playing.value = searchs(playingList.value, newVaule)
    if (!playing.value) {
      tokenRequest.post('/getsongsbyurl', { url: newVaule }).then((e) => {
        playing.value = e.data
        playingList.value.push(e.data)
        playing.value.index = playerList.value.length - 1
        if (playing.value.index === playingList.value.length - 1) {
          nextIndex.value = 0
        } else {
          nextIndex.value = playing.value.index + 1
        }
      })
    } else {
      if (playing.value.index === playingList.value.length - 1) {
        playingList.value = randomList(JSON.parse(JSON.stringify(playerList.value)))
        nextIndex.value = 0
      } else {
        nextIndex.value = playing.value.index + 1
      }
    }
  })

  watch(cycleMode, (newValue) => {
    switch (newValue) {
      case 0:
        singleCycle.value = false
        playingList.value = randomList(JSON.parse(JSON.stringify(playerList.value)))
        playing.value = searchs(playingList.value, playing.value.url)
        if (playing.value.index === playingList.value.length - 1) {
          nextIndex.value = 0
        } else {
          nextIndex.value = playing.value.index + 1
        }
        break
      case 1:
        singleCycle.value = false
        playingList.value = JSON.parse(JSON.stringify(playerList.value))
        playing.value = searchs(playingList.value, playing.value.url)
        if (playing.value.index === playingList.value.length - 1) {
          nextIndex.value = 0
        } else {
          nextIndex.value = playing.value.index + 1
        }
        break
      case 2:
        singleCycle.value = true
        playingList.value = JSON.parse(JSON.stringify(playerList.value))
        break
    }
  })
  const PlayInsert = (e) => {
    title.value = e.title
    duration.value = e.duration
    author.value = e.author
    routerUrl.value = e.url
  }
  //监听playinglist防bug并且实现列表删除

  //播放列表删除
  const deletePlaying = (index: number) => {
    playingList.value.splice(index, 1)
    if (index >= playingList.value.length - 1) {
      nextIndex.value = 0
    } else {
      nextIndex.value = index + 1
    }
  }
  
  return {
    id,
    url,
    setUrl,
    setAll,
    BASEURL,
    title,
    author,
    mode,
    now,
    play,
    hasPlay,
    durationTime,
    duration,
    currentduration,
    currentTime,
    translateto,
    routerUrl,
    volumeSize,
    volumeNone,
    playerList,
    cycleMode,
    nextUrl,
    PlayNext,
    list,
    singleCycle,
    last,
    PlayInsert,
    playingList,
    deletePlaying,
    isLike,
    likeList,
    playing,
    myLists
  }
})
