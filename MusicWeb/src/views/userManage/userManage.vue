<script lang="ts" setup>
import { onMounted,reactive,ref } from "vue";
import tokenRequest from '@/utils/tokenRequest'
import { ElMessage } from "element-plus";
const userInfoData = ref<Array<any>>([])
const hasRequest = ref(0)
//角色信息
const roleInfo = ref<Array<any>>([])
//根据角色id获取角色name
const getRoleName = (id:number) => {
  return roleInfo.value.filter(e => e.id === id)[0].name
}
//初始化和数据准备
onMounted(async() => {
      //请求角色信息
    let result = await tokenRequest.get('/getroleinfo')
    roleInfo.value = result.data
    //请求第一波主页面信息
    RequestDatas(hasRequest.value++)
})
const loading = ref(false)
const RequestDatas = async(i) => {
    loading.value = true
    let {data : result} = await tokenRequest.get('/getalluserinfo',{ params:{
            num:20,
            begin:i * 20
        }})
    //对数据处理，加上roleName
    result = result.map(e =>{e.roleName = getRoleName(e.roleid);return e})
    userInfoData.value = [...userInfoData.value,...result]
    loading.value = false
  }
const Load = () => {
    RequestDatas(hasRequest.value++)
}
//删除用户
const remove = async(scope:any) => {
  if(scope.row.id === 1){
    ElMessage({
      message:'反了？',
      type:'error'
    })
    return
  }
    ElMessageBox.confirm(
    `你确定要删除用户名为${scope.row.username}的${scope.row.nickname}吗`,
    '请确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
    ).then(async() => {
      let result = await tokenRequest.get('/removeusers',{
        params:{
          id:scope.row.id
        }
       })
      ElMessage(result)
      if(result.type === 'success'){
        userInfoData.value.splice(scope.$index,1)
      } 
    }).catch(()=>{})
    
}
//更改用户信息
interface updateformdata {
    nickname:string
    username:string
    password:string
    roleid:string
    id:number
}
const updateInfoPage = ref(false)
const updateForm = reactive<updateformdata>({
  nickname:'',
  username:'',
  password:'',
  roleid:'',
  id:-1
})
//存个角色管理的placeholder
let rolePlaceholder = ref('')
let selectIndex = ref<number>()
//打开更新面板
const update = async(scope:any) => {
  //打开更改面板并初始化内容
  updateForm.nickname = scope.row.nickname
  updateForm.username = scope.row.username
  updateForm.password = scope.row.password
  updateForm.roleid = scope.row.roleid
  updateForm.id = scope.row.id
  selectIndex.value = scope.$index
  rolePlaceholder.value = roleInfo.value.filter(e => e.id === scope.row.roleid)[0].name
  updateInfoPage.value = true
}
  //提交信息
const submitUpdate =async () => {
  let result = await tokenRequest.post('/updateuserinfo',{
    id:updateForm.id,
    nickname:updateForm.nickname,
    username:updateForm.username,
    password:updateForm.password,
    roleid:updateForm.roleid
  })
  ElMessage(result)
  if(result.type === 'success'){
    userInfoData.value[selectIndex.value].nickname = updateForm.nickname
    userInfoData.value[selectIndex.value].username = updateForm.username
    userInfoData.value[selectIndex.value].password = updateForm.password
    userInfoData.value[selectIndex.value].roleid = updateForm.roleid
    updateInfoPage.value = false
  }
}

</script>
<template>
  <span>  
  <el-table :data="userInfoData" style="width: 100%;font-size:small" v-infinite-scroll="Load" infinite-scroll-immediate="false" v-loading="loading">
        <el-table-column fixed prop="id" label="id" width="50" />
        <el-table-column prop="nickname" label="昵称" width="150" />
        <el-table-column prop="username" label="账号" width="220" />      
        <el-table-column prop="password" label="密码" width="220" />
        <el-table-column prop="roleName" label="权限角色" width="100" />
        <el-table-column fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="update(scope)">
              更改
            </el-button>
            <el-button link type="danger" size="small" @click="remove(scope)">
              删除  
            </el-button>
          </template>
        </el-table-column>
  </el-table>
  <el-dialog v-model="updateInfoPage" title="信息修改" width="800" destroy-on-close center> 
      <div class="page">
        <el-form :label-position="'right'" label-width="auto" :model="formLabelAlign" style="max-width: 600px">
          <el-form-item label="昵称">
            <el-input v-model="updateForm.nickname" />
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="updateForm.username" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="updateForm.password" />
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="updateForm.roleid" :placeholder="rolePlaceholder">
              <el-option v-for="item in roleInfo" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div>
          <el-button @click="updateInfoPage = false">取消</el-button>
          <el-button type="primary" @click="submitUpdate()">确认</el-button>
        </div>
      </template>
  </el-dialog>
</span>
</template>
<style lang="scss" scoped>
.page{
  width: 100%;
  height: 200px;
  @include flexBox(row,center,center)
}
</style>