<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useSongsinfoStore } from '@/stores/songsPlay'
const songsinfo = useSongsinfoStore()
import tokenRequest from '@/utils/tokenRequest'
import SparkMD5 from "spark-md5";
interface formdata {
  title: string
  author: string
  audio: any
}
interface messages {
  message: string
  type: string
  url: string
  id: string
}
onMounted(() => {})
//歌曲长度
const routerUrl = ref()
let audio = ref<any>()
const url = computed(() => {
  return songsinfo.BASEURL + routerUrl.value
})
//DOM库
//load
const load = ref()
//表单
const form = reactive<formdata>({
  title: '',
  author: '',
  audio: null
})
//超出限制时调用的钩子
const handleExceed = (e) => {
  ElMessage({
    message: '超出限制了哦！',
    type: 'error'
  })
}
//成功上传的钩子
const handleSuccess = () => {
  ElMessage({
    message: '上传成功',
    type: 'success'
  })
}
//切换时就把他放在form.audio中
const uploadFile = (e) => {
  form.audio = e.raw
}
//提交
const onSubmit = async (e) => {
  const formData = new FormData()
  formData.append('title', form.title)
  formData.append('author', form.author)
  formData.append('file', form.audio)
  uploadTest(form.title,form.author)
}
//获取时长
const getTime = async () => {
  audio.value.src = url.value
  return new Promise((resovle, reject) => {
    audio.value.onloadedmetadata = function () {
      resovle(audio.value.duration.toString())
    }
  })
}
//分片上传入口函数
const uploadTest = (title:string,author:string) => {
  if(!form.audio){
    ElMessage({
      type:'warning',
      message:'您还没有选择文件哦!'
    })
    return
  }
  let nameArray = form.audio.name.split('.')
  //获取到后缀。最后合并的时候发给服务端
  let suffix =  nameArray[nameArray.length - 1]
  const reader = new FileReader();
  reader.onload = function(event) {
    const arrayBuffer = event.target.result;
    const spark = new SparkMD5.ArrayBuffer();
    spark.append(arrayBuffer);
    let md5 = spark.end();
    let slices = FileSlice(form.audio, 5 * 1024 * 1024);
    return sendAllSlice(slices, md5);
  };
  reader.readAsArrayBuffer(form.audio);
//切片函数
  //定义一个切片的泛型
  interface sliceType{
  flag:number,
  blob:Blob
}
//后面验证用的，和sendAllSlice里的SendSlicesFns是一个东西，写外面一个供验证完整性的时候用
let sliceSendfn:Array<any> = [] 
const FileSlice = (file:File,chunkSize:number) => {
  let size = Math.ceil(file.size / chunkSize)
  let result :Array<sliceType>= []
  for(let i = 0 ; i < size ; i++){
    result.push({
      flag:i,
      blob:file.slice(i*chunkSize,(i+1)*chunkSize)
    })
  }
  return result
}
//发送函数，返回函数，下面并发用
const sendFileSlice = (slice:sliceType,md5:string) =>{
    const formData = new FormData();
    formData.append('md5',md5)
    formData.append('file',slice.blob)
    formData.append('index',String(slice.flag))
    return () => tokenRequest.post('/fileuploadtest',formData)
}
//上传所有切片
const sendAllSlice = (slices:Array<sliceType>,md5:string) => {
  //这里获取所有待执行函数并存入数组  
   let SendSlicesFns = slices.map(e => {
      return sendFileSlice(e,md5)
   })
   sliceSendfn = SendSlicesFns
    return PromisePoolSend(SendSlicesFns,10,md5)
}
//发送合并请求
const sendmerge = async(md5:string,length:number) => {
      tokenRequest.post('/checkfileintegrity',{md5,length}).then(async(result) => {
        let slices = result.data
        if(slices.length != 0){
          let news = slices.map(e => sliceSendfn[parseInt(e)])
          PromisePoolSend(news,5,md5)
        }else{
         let result = await tokenRequest.post('/filemerge',{md5,suffix,title,author})
         if (result.type === 'success') {
          routerUrl.value = md5+'.'+suffix
          await getTime().then(async (e) => {
            result = await tokenRequest.post('/settime', { duration: e, id: result.id })
            ElMessage(result)
            form.title = ''
            form.author = ''
            form.audio = null
            load.value.clearFiles()
            return
          })
         }
        }
      })
}
//并发池优化
const PromisePoolSend = (taskList:Array<T> ,max:number,md5:string) => {
  const all = taskList.length
  let index = 0
  let hasSend = 0
  const run = (task:() => Promise<T>) => {
    task().then(e => {
      hasSend++
      if(index != all){
       return run(taskList[index++])
      }else{
        if(hasSend === all){
          index = 0;
          hasSend = 0
          return sendmerge(md5,all)
        }
      }    
    })
  }
  let result = null
  for(let i = 0 ; i < max ; i++){
    if(index === all){
      index = 0
      break;
    }
    result = run(taskList[index++])
  }
  return result
}
}  

</script>
<template>
  <div class="page">
    <span class="card">
      <span class="title">上传内容</span>
      <el-form v-model="form" label-width="auto" style="max-width: 400px">
        <el-form-item label="歌名：">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="作者：">
          <el-input v-model="form.author" />
        </el-form-item>
        <el-form-item label="文件上传:">
          <el-upload
            drag
            class="upload"
            action="none"
            :http-request="onSubmit"
            :on-exceed="handleExceed"
            :on-success="handleSuccess"
            :on-change="uploadFile"
            :auto-upload="false"
            :limit="1"
            ref="load"
          >
            <tip style="color: rgb(211, 211, 211)">拖拽或选择您要添加的歌</tip>
          </el-upload>
        </el-form-item>
        <el-form-item style="transform: translateX(45%)">
          <el-button type="primary" @click="onSubmit">上传</el-button>
        </el-form-item>
      </el-form>
    </span>
    <audio id="myaudio" ref="audio"></audio>
   
  </div>
</template>
<style lang="scss" scoped>
.page {
  @include setWHBC(100%, 100%, white, black);
  @include flexBox(column wrap, flex-start, center);
}
.card {
  @include setWHBC(50%, 70%, white, black);
  @include flexBox(column nowrap, flex-start, center);
  border: 1px solid rgb(211, 211, 211);
  position: relative;
  top: 5%;
}
.title {
  margin-top: 10%;
  margin-bottom: 3%;
}
.upload {
  @include setWHBC(400px, 10%, white, black);
  position: relative;
  bottom: 40%;
}
</style>
