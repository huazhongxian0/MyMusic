<script setup lang="ts">
import { onMounted, ref, defineEmits, computed } from 'vue'
import tokenRequest from '@/utils/tokenRequest'
import { useSongsinfoStore } from '@/stores/songsPlay'
import { ElMessage } from 'element-plus'
const songsinfo = useSongsinfoStore()
const emit = defineEmits(['delete-parents'])
const props = defineProps(['songsList'])
const showsurl = ref()
const times = computed(() => {
  return function (time) {
    return songsinfo.translateto(time)
  }
})
//删除操作
const deleteSong = async (id, index) => {
  let result = await tokenRequest.delete(`/deletesong/${id}`)
  ElMessage(result)
  if (result.code === 200) {
    emit('delete-parents', index)
  }
}

//展示
const showSong = (item) => {
  console.log(item)
  time.value.push(item)
  switchToShow.value = true
  showsurl.value = songsinfo.BASEURL + item.url
}
const switchToShow = ref(false)
const time = ref([])
const cancel = () => {
  switchToShow.value = false
  time.value.splice(0, 1)
  showsurl.value = null
}
const insertSong = () => {}
</script>
<template>
  <div class="page">
    <table class="table">
      <tr>
        <td>#</td>
        <td>标题</td>
        <td>作者</td>
        <td>时长</td>
        <td>操作</td>
      </tr>
      <tr v-for="(item, index) in songsList" :key="item.id">
        <td>{{ index + 1 }}</td>
        <td>{{ item.title }}</td>
        <td>{{ item.author }}</td>
        <td>{{ times(item.duration) }}</td>
        <td>
          <el-button @click="showSong(item)" size="small">查看</el-button>
          <el-button @click="insertSong(item.id)" size="small">更改</el-button>
          <el-button @click="deleteSong(item.id, index)" size="small">删除</el-button>
        </td>
      </tr>
    </table>
  </div>
  <el-dialog
    v-model="switchToShow"
    title="歌曲信息如下"
    width="1000"
    :before-close="handleClose"
    @close="cancel"
  >
    <el-table :data="time" stripe style="width: 100%">
      <el-table-column prop="title" label="歌名" width="180" />
      <el-table-column prop="author" label="歌手" width="180" />
      <el-table-column prop="duration" label="总时长" />
      <el-table-column prop="address" label="上传者" />
      <el-table-column prop="address" label="上传时间" />
    </el-table>
    <audio :src="showsurl" controls style="width: 100%"></audio>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel">Cancel</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<style lang="scss" scoped>
.page {
  @include setWHBC(100%, auto, white, black);
}
.table {
  @include setWHBC(100%, auto, rgb(232, 242, 251), rgb(114, 125, 141));
  font-size: 12px;
  font-weight: 100;
}
.table tr {
  display: flex;
}
.table tr td {
  @include setWHBC(100%, 30px, white, black);
  @include flexBox(row, center, center);
  flex: 3;
}
.table tr td:nth-child(1) {
  @include setWHBC(100%, 30px, white, rgb(114, 125, 141));
  @include flexBox(row, center, center);
  flex: 1;
}
.table tr:nth-child(1) td {
  @include setWHBC(100%, 30px, rgb(232, 242, 251), rgb(114, 125, 141));
  @include flexBox(row, center, center);
  flex: 3;
}
.table tr:nth-child(1) td:nth-child(1) {
  @include setWHBC(100%, 30px, rgb(232, 242, 251), rgb(114, 125, 141));
  @include flexBox(row, center, center);
  flex: 1;
}
</style>
