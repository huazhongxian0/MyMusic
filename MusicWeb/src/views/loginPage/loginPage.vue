<script lang="ts" setup>
import request from '@/utils/request'
import { log } from 'console'
import { ElMessage } from 'element-plus';
import { computed, reactive,ref } from 'vue'
import { useRouter } from 'vue-router';
import { useUserinfoStore } from '../../stores/counter'
import {generateTree,mapRoute }from '../../utils/router'
import {login,register} from '@/utils/usermanage'
  const router = useRouter()
  const userinfo = useUserinfoStore() 
  //校验规则
  interface RuleForm {
    username: string
    password: string
  }
  const ruleFormRef = ref<FormInstance>()
  const validatePass = (rule: any, value: any, callback: any) => {
    if (value === '') {
      callback(new Error('请输入密码'))
    } else {
      callback()
    }
  }
  const rules = reactive<FormRules<typeof ruleForm>>({
    password: [{ validator: validatePass, trigger: 'blur' }],
  })
  //表单处理
  const form = reactive<RuleForm>({
    username: '',
    password: ''
  })
  const registerPageSwitch = ref(false)
  const registerData:Array<object> = reactive([{
      username:'',
      password:''
  }])
  const tableData:any = reactive([])
  const returnUsername:any = ref(null)
  const returnPassword:any = ref(null)
  //登录操作
  const submit = async () => {
    let result =await login(form.username,form.password,userinfo,router)
    ElMessage({
      type:result.type,
      message:result.message
    })
    //code为101，意为没有账号并打开注册页
    if(result.code === 101){
      returnUsername.value = result.data.username
      returnPassword.value = result.data.password
      tableData.pop()
      tableData.push({
      username:result.data.username,
      password:result.data.password
      })
      registerPageSwitch.value = true
    }
    //code为200，意为成功登录
    if(result.code === 200){        
      router.push('/main') 
    }
  }
  //注册操作
    const registerSubmit = async () => {
          let result:any = await register(returnUsername.value,returnPassword.value)
          ElMessage({message:result.message,type:result.type})
          if(result.code === 200){
            let result0 =await login(form.username,form.password,userinfo,router)
            ElMessage({message:result0.message,type:result.type})
            registerPageSwitch.value = false
            router.push('/main')
        }
    }
</script>
<template>
  <div class="page">
    <div class="shadow">
      <img class="img0" src="../../assets/photos/day16-retro-cassette.png"></img>
      <el-form ref="ruleFormRef" class="form" :model="form" label-width="auto" :rules="rules">
        <span class="title">登录</span>
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" placeholder="请输入密码" type="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">登录/注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
  <el-dialog v-model="registerPageSwitch" title="这个账号没有注册，账户内容如下:" width="800" class="dialog">
      <el-table :data="tableData" border style="width: 600px;">
          <el-table-column prop="username" label="username" width="300px" />
          <el-table-column prop="password" label="password" width="300px" />
      </el-table>
      <div class="text">请检查是否输错用户名，并选择是否注册</div>
      <div class="foot">
      <el-button plain @click="registerSubmit">
        注册
      </el-button>
      <el-button plain @click="registerPageSwitch = false">
        取消
      </el-button>
      </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.foot{
  @include setWHBC(100px,100%,white,black);
  @include flexBox(nowrap,flex-end,center);
}
.text{
  @include flexBox(row nowrap,center,center);
  color: #9c5959;
}
tr>td{
  @include setWHBC(200px, 20px,white,black)
}
.title{
  margin-bottom:20px;
  font-size: 20px;
  display: inline-block; 
}
.page {
  @include setWHBC(100%, 1000px, white, black);
  @include flexBox(row nowrap, flex-start, flex-start);
}
.form {
  @include setWHBC(50%, 300px, white, black);
  @include flexBox(column wrap, center, center);
}
.img0 {
  @include setWHBC(50%, 100%, white, black);
}
.shadow {
  @include setWHBC(600px, 300px, white, black);
  @include flexBox(row wrap, flex-start, center);
  box-shadow: 0px 0px 10px 1px rgb(242, 177, 177);
  margin-top: 100px;
}
</style>
