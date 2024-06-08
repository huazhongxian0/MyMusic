<script lang="ts" setup>
import tokenRequest from '@/utils/tokenRequest'
import { ref, onMounted, reactive } from 'vue'
import RandomPhotos from '@/utils/photos'
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useSongsinfoStore } from '@/stores/songsPlay';
const songsinfo = useSongsinfoStore()
const router = useRouter()
const lists = ref<Array<any>>([])
onMounted(async () => {
    //请求歌单数据
    let result = await tokenRequest.get('/getsonglists')
    lists.value = result.data
    console.log(result);
    
})
//转换日期为人能接受的
const TranslateDate = (date: Date) => {
    let dates = new Date(date)
    return dates.getFullYear() + '-' + String(dates.getMonth() + 1).padStart(2, '0') + '-' + String(dates.getDate()).padStart(2, '0')
}
//去歌单页
const To = (item) => {
    router.push({ path: '/list', query: { data: JSON.stringify(item) } })
}
//创建歌单的表格值
interface createlistform {
    name: string
}
const createlistForm = reactive<createlistform>({
    name: ''
})
//创建歌单
const CreatedList = () => {
    createPage.value = true
}
//控制歌单信息提交界面弹出
let createPage = ref(false)
const i = ref()

const submitForm = (formEl) => {
    if (!formEl) return;
    formEl.validate( async(valid:any) => {
        if (valid) {
            let result:any = await tokenRequest.post('/createlist',{name:createlistForm.name})
            ElMessage(result)
            if(result.type === 'success'){
                createlistForm.name = ''
                let result = await tokenRequest.get('/getsonglists')
                lists.value = result.data
                createPage.value = false
            }
        } else {
            ElMessage({
                message:'格式错的哦！',
                type:'warning'
            })
        }
    });
};
const DeleteList = (id:number,name:string,index:number,islike:number,event:object) => {
    event.stopPropagation() 
    if(islike === 1){
        ElMessage({
            message:'默认歌单不能删除哦',
            type:'warning'
        })
        return
    }
    ElMessageBox.confirm(`你确认要删除这个名为${name}的歌单吗？`, '确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  }).then(async() => {
      let result:any = await tokenRequest.post('/deletelist',{id,})
      ElMessage(result)
      if(result.type === 'success'){
        lists.value.splice(index,1)
        let result = await tokenRequest.get('/getsonglists')
        songsinfo.myLists = result.data
      }
    }).catch(() => {})
}
</script>

<template>
<span>
    <div class="page">
    <div class="songlist" v-for="(item, listindex) in lists" :key="item.id" @click="To(item)">
        <i v-show="item.is_default_favorite === 0" class="iconfont icon-lajixiangshanchu delete" @click="DeleteList(item.id,item.name,listindex,item.is_default_favorite,$event)"  @mouseenter="(e) => { e.target.classList.remove('icon-lajixiangshanchu');e.target.classList.add('icon-lajixiangshanchu-copy') }"  @mouseleave="(e) => { e.target.classList.remove('icon-lajixiangshanchu-copy');e.target.classList.add('icon-lajixiangshanchu') }"></i>
        <img :src="RandomPhotos()">
        <div class="content">
            <span class="title">{{item.name}}</span>
            <span class="date">创建于{{ TranslateDate(item.date_created)}}</span>
            <span class="songs">
                <span class="song" v-for="(songs,index) in item.songs.slice(0,3)" :key="songs.id"><span style="font-weight:900;">{{index+1}}</span> {{songs.title}}</span>
            </span>
            
        </div>
    </div>
    <div class="add" @click="createPage = true" @mouseenter="(e) =>{i.classList.remove('icon-tianjia'); i.classList.add('icon-tianjia-copy')}" @mouseleave="(e) =>{i.classList.remove('icon-tianjia-copy');i.classList.add('icon-tianjia')}">
        <i class="iconfont icon-tianjia" style="font-size:80px" ref="i"></i>
    </div>
    </div>
    <el-dialog
    v-model="createPage"
    title="注意"
    width="500"
    destroy-on-close
    center>
    <el-form class="createlist" :model="createlistForm" ref="createlistform">
        <el-form-item label="表单名字" prop="name" :rules="[{ required: true, message: '名字是必填项', trigger: 'blur' }]">
            <el-input v-model="createlistForm.name" autocomplete="off"/>
        </el-form-item>
        <el-form-item class="submit">
            <el-button type="primary" @click="submitForm($refs.createlistform)">添加</el-button>
            <el-button @click="createPage = false">取消 </el-button>
        </el-form-item>
    </el-form>
    </el-dialog>
</span>    
</template>

<style lang="scss" scoped>
@keyframes move {
    0%{
        transform: translateY(0px);
        height: 50px;
    }
    100%{
        transform: translateY(-100px);
        height: 150px
    }
}
.page {
    z-index: 10;
    position: relative;
    @include setWHBC(100%, 101%, unset);
    @include flexBox(row wrap, space-evenly, flex-start);
    .songlist {
        @include setWHBC(200px, 250px);
        border: 1px solid rgb(234, 217, 215);
        margin-right: 50px;
        margin-left: 50px;
        margin-top: 20px;
        border-radius: 10px;
        position: relative; // 确保伪元素定位相对于 .songlist
        &:hover {
            box-shadow: 0 0 5px 1px rgb(221, 194, 194);
            .delete{           
                display:flex
            }
            .content {
                @include setWHBC(200px, 50px, rgb(88, 117, 147), white);
                @include flexBox(column nowrap, flex-start, center);
                position: relative;
                text-align: center;
                animation-name: move;
                animation-duration: 100ms;
                animation-timing-function: linear;
                animation-iteration-count: 1;
                animation-fill-mode: forwards;
                .title {
                    margin-top: 5px;
                }

                .date {
                    margin-top: 5px;
                    font-size: 10px;
                }

                .songs {
                    @include setWHBC(70px, auto, unset);
                    @include flexBox(column, flex-start, flex-start);

                    .song {
                        font-size: 13px;
                        margin-top: 10px;
                        z-index: 1;
                    }
                }

                &::before {
                    content: '';
                    position: absolute;
                    top: -5px; // 控制阴影距离顶部的距离
                    left: 0;
                    right: 0;
                    height: 5px; // 控制阴影的高度
                    box-shadow: 0 -5px 10px -5px rgba(88, 117, 147, 1); // 只在顶部添加阴影
                    z-index: -1; // 确保阴影在背景下
                }
            }
        }
            .delete{           
                position: absolute;
                z-index: 100;
                font-size: 20px;
                left:180px;
                display:none
            }
        img {
            @include setWHBC(200px, 200px);
            border: 2px solid rgb(247, 239, 239);
            box-sizing: border-box;
            position: relative;
        }
        .content {
            @include setWHBC(200px, 50px, rgb(88, 117, 147), rgb(255, 255, 255));
            @include flexBox(column wrap, space-evenly, center);
            border-end-start-radius: 10px;
            border-end-end-radius: 10px;
            text-align: center;
            .date {
                font-size: 10px;
            }

            .songs {
                display: none;

                .song {
                    z-index: 1;
                }
            }
        }
    }
    .add{
        @include setWHBC(200px, 250px);
        @include flexBox(row,center,center);
        border: 1px solid rgb(234, 217, 215);
        margin-right: 50px;
        margin-left: 50px;
        margin-top: 20px;
        border-radius: 10px;
        .icon{
            @include setWHBC(100%,100%)
        }
    }
}
.createlist{
    @include setWHBC(100%,auto);
    @include flexBox(column wrap,center,center);
    .submit{
        @include setWHBC(100%,auto);
        @include flexBox(column,center,center)
    }
}
</style>