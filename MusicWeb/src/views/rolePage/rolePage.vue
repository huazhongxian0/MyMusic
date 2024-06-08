<script lang="ts" setup>
import {ref,onMounted, reactive, computed} from 'vue'
import tokenRequest from '@/utils/tokenRequest'
import { ElMessage } from 'element-plus';
let hasRequest = ref(0)
const num = 50
const rolesInfoData = ref<Array<any>>([])
const routeTree = computed(() => {
    return buildTree(routes.value)
})
const buildTree = (array:Array<any>,parentid=null) => {
    if(!array || array.length === 0){
        return undefined
    }
    
    if(!parentid){  
        let news = []
        array.map(e => {
        if(e.parentId === null){
            news.push(e)
        }          
        })
        news = news.map(e => {
            e.value = e.id
            e.label = e.name
            e.children = buildTree(array,e.id)
            
            return e
        })
        return news
    }else{
        return array.filter(e => e.parentId === parentid).map(e => {
            e.value = e.id
            e.label = e.name
            e.children = buildTree(array,e.id)
            return e
        })
    }
}
const routes = ref([])
onMounted(async() => {
    //加载第一次页面
    await Load()
    //请求目前拥有的所有权限
    await LoadRoutes()
})
const LoadRoutes = async() => {
    let result = await tokenRequest.get('/getallroutes')
    routes.value = result.data
}
const Load = async() => {
    let result = await tokenRequest.get('/getallroles',{params:{begin:hasRequest.value,num}})
    if(result.type==='success'){
        rolesInfoData.value = [...rolesInfoData.value ,...result.data]
        hasRequest.value += num
    }
}
//展示面板
const showInfoValue = ref(false)
const roleName = ref<string>()
const roleid = ref<number>()
const permissions = ref<Array<any>>([])
//打开展示面板
const ShowInfo = async(scope:any) => {
    roleid.value = scope.row.id
    roleName.value = scope.row.name
    permissions.value = scope.row.permmissionid.split(',')
    addForm.name = scope.row.name
    addForm.roleids = permissions.value 
    showInfoValue.value = true   
}
//更改
const Update = async() => {
    let result = await tokenRequest.post('/updateroleroutes',{name:addForm.name,permmissions:addForm.roleids,roleid:roleid.value})
    ElMessage(result)
    if(result.type === 'success'){
        showInfoValue.value = false
    }
}
//删除角色
const Remove =async(scope) => {
   let result =await tokenRequest.get('/deleteroles',{params:{id:scope.row.id}})
    ElMessage(result)
    if(result.type === 'success'){
        rolesInfoData.value.splice(scope.$index,1)
    }
}
//添加角色
const addRoleValue = ref(false)
const AddRole = () => {
    addForm.name = ''
    addForm.roleids = []
    addRoleValue.value = true
}
interface addform {
    name:string
    roleids:Array<number>
}
interface message{
    message:string
    type:string
    VNode:any
}
const addForm = reactive<addform>({name:'',roleids:[]})
const Submit = async() => {
    let result:message = await tokenRequest.post('/addroles',{routes:addForm.roleids,name:addForm.name})
    ElMessage(result)
    if(result.type === 'success'){
        addForm.roleids = []
        addForm.name = ''
        addRoleValue.value = false
    }
}
</script> 
<template>
    <span class="page">  
        <el-table :data="rolesInfoData" class="tables" v-infinite-scroll="Load" infinite-scroll-immediate="false" v-loading="loading">
              <el-table-column fixed prop="id" label="id"  />
              <el-table-column prop="name" label="角色名称" />
              <el-table-column fixed="right" label="操作" >
                <template #default="scope">
                  <el-button link type="primary" size="small" @click="ShowInfo(scope)">
                    查看
                  </el-button>
                  <el-button link type="danger" size="small" @click="Remove(scope)">
                    删除  
                  </el-button>
                </template>
              </el-table-column>
        </el-table> 
            <el-dialog v-model="showInfoValue" :title="roleName" width="500"    >
                    <el-form :inline="true" v-model="addForm"  class="demo-form-inline">
                        <el-form-item label="名字">
                          <el-input v-model="addForm.name" placeholder="名字" clearable />
                        </el-form-item>
                        <el-form-item label="权限">
                            <el-tree-select
                                v-model="addForm.roleids"
                                :data="routeTree"
                                multiple
                                :render-after-expand="false"
                                show-checkbox
                                check-strictly
                                style="width: 240px"
                                />
                        </el-form-item>
                      </el-form>
                <template #footer>
                      <div class="dialog-footer">
                        <el-button @click="showInfoValue = false">取消</el-button>
                        <el-button type="primary" @click="Update()">更改</el-button>
                    </div>
                </template>
            </el-dialog>
        <div class="btnpage">
            <el-button @click="AddRole()">添加</el-button>
        </div>
            <el-dialog v-model="addRoleValue" title="添加角色" width="500">
                <div class="addrolepage">
                    <el-form :inline="true" v-model="addForm"  class="demo-form-inline">
                        <el-form-item label="名字">
                          <el-input v-model="addForm.name" placeholder="名字" clearable />
                        </el-form-item>
                        <el-form-item label="权限">
                            <el-tree-select
                                v-model="addForm.roleids"
                                :data="routeTree"
                                multiple
                                :render-after-expand="false"
                                show-checkbox
                                check-strictly
                                style="width: 240px"
                                />
                        </el-form-item>
                      </el-form>
                </div>
                <template #footer>
                <div class="dialog-footer">
                    <el-button @click="addRoleValue = false">取消</el-button>
                    <el-button type="primary" @click="Submit()">确认</el-button>
                </div>
            </template>
            </el-dialog>
    </span>
</template>
<style lang="scss">
.dialog-footer{
    @include flexBox(row,center,center)
}
</style>
<style lang="scss" scoped>
.page{
    .tables{
        @include setWHBC(100%,90%);
        font-size:small;
    }
    .btnpage{
        @include setWHBC(100%,10%);
        @include flexBox(row,center,center)
    }
    .demo-form-inline{
        @include setWHBC(50%,auto);
        @include flexBox(column,center,flex-start);
        align-items:flex-start;
    }
    .addrolepage{
        @include setWHBC(100%,auto);
        @include flexBox(row,center,center);
        .demo-form-inline{
            @include setWHBC(50%,auto);
            @include flexBox(column,center,flex-start);
            align-items:flex-start;
        }
    }
}
</style>