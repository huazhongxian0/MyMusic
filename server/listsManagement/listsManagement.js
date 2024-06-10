const database = require('../databases/databaseConfig')
const express = require('express')
const { search } = require('./listsManagement')
const dayjs = require('dayjs');
const router = express.Router()
//根据用户id查找用户信息
//这部分的主要目的是，将songslists表里信息加到对象上
const selectlists = function(id){
    //根据id查询返回promise对象，参数返回的是，从list表里取出的满足条件的所有歌单
    return new Promise((resolve,reject) => {
        database.query(`select * from lists where user_id = '${id}'`,(error,result) => {
            if(error) reject(e)
                result = result.map(e => {
                e.song_ids = e.song_ids.split(',')
                return e
            })
            resolve(result)
        })
    })
}
//根据id到songslist表查值
const selectSongs = function(id){
    //这是根据歌曲的id查找歌曲信息并返回resovle
    return new Promise((resovle,reject) => {
        database.query(`select * from songlists where id = ${id}`,(error,result) => {
            if(error) reject(error)
            resovle(result[0])
        })
    })
}
//给awaitSongs遍历的子值遍历处理。
const awaitSingleSongs = function(lists){
    //把selectSongs的返回值用promise.all等待，然后返回处理好的数组给上级对象中，上级对象，是selectlists筛选出来数组的元素对象
     return new Promise((resolve,reject) => {
        Promise.all(lists.song_ids.map(e => {
           return selectSongs(e)   
        })).then(es => {
            lists.songs = es
            resolve(lists)
        })
     })
}
//selectlists的值进行遍历处理
const awaitSongs = function(Arrays){      
    if(Arrays.song_ids === 1 && Arrays.song_ids[0] === '') resovle(null) 
    //等待子项完成，返回最后结果
    return Promise.all(Arrays.map(e => {
        if(e.song_ids.length === 1 && e.song_ids[0] === ''){
            return new Promise((resovle,reject) => {
                e.songs = []
                resovle(e)
            })
        }else{
       return awaitSingleSongs(e)
        }
    }))
}
router.get('/getsonglists',(req,res) => {
    selectlists(req.auth.id).then(e => {
        awaitSongs(e).then(e => {
            res.send({
                message:'查询成功',
                type:'success',
                data:e
            })
        })

    },error =>{
        console.log(error);
        res.send({
            message:'查询失败',
            type:'error'
        })
    })
    
   
})

//添加歌曲到我的喜欢
//查找我的喜欢歌单
const selectList = (props) => {
    return new Promise((resolve,reject) => {
        database.query(`select * from lists where user_id = ${props.userid} and is_default_favorite = 1`,(error ,result) => {
            if(error) throw error
            props.list = result[0]
            resolve(props)
        })
    })
}
//数组去重
const RemoveRepeat = (array) => {
    let news =  new Set(array)
    return [...news]
 }
//更改和插入
const insertSongs = (props) => {
    return new Promise((resolve,reject) => {
        let songs = props.list.song_ids.split(',')
        if(songs.length === 1 && songs[0] === '') songs.shift()
        //开始插入
    //props.songid
        songs.unshift(0)
        let has = true
        for(let i = 0 ; i < songs.length ; i++){
            if(props.songid > songs[i]){
                if(i != 0){
                    songs[i-1] = songs[i] 
                }    
            }else{
                has = false
                songs[i-1] = props.songid
                break
            }
        }    
        if(has){
            songs[songs.length-1] = props.songid
        }
        songs = RemoveRepeat(songs)
        songs = songs.join(',')
        database.query(`update lists set song_ids = '${songs}' where user_id = ${props.userid} and is_default_favorite = 1`,(error,result) => {
            if(error) throw error
            props.result = result
            resolve(props)
        })
    })
}
router.post('/addlike',(req,res) => {
   selectList({userid:req.auth.id,songid:req.body.id}).then(e =>{ 
    return insertSongs(e)
    }).then(e => { 
        if(e.result.affectedRows != 0){
            res.send({
                message:'添加成功',
                type:'success'
            })
        }else{
            res.send({
                message:"更新失败",
                type:'error'
            })
        }    
    })
})
//获取是否喜欢，在数组后面isLike属性返回
router.post('/islike',(req,res) => {    
    if(!req.body.list[0]){
        res.send(req.body.list)
        return
    }
    selectList({userid:req.auth.id}).then(e => {
        
       let array =  e.list.song_ids.split(',')
        req.body.list.map(e => {
            if(!e){
                return
            }
            if(searchSongs(array,e.id.toString())){
                e.islike = true
            }else{
                e.islike = false
            }
        })
        res.send({type:'success',data:req.body.list})
    })  
})
//二分查找
const searchSongs = (array,id) => {
    if(array.length == 1){
        return array[0] === id
    }else if(array.length == 0){
        return false
    }
      let center = Math.floor(array.length / 2)
       if(id < array[center]){
            return searchSongs(array.slice(0,center),id)
       }else if(id > array[center]){
            return searchSongs(array.slice(center+1,array.length),id)
       }else{
            return true
       }
    }   
//从表中删除
const selectSingleList = (userid,listid) => {
    return new Promise((resolve,reject) => {
        database.query(`select * from lists where user_id = '${userid}' and id = '${listid}'`,(error,result) => {
            if(error) reject(error)
            if(result.length === 0){
                resolve(null)
            }else{
                resolve(result[0])
            }
        })
    })
}
const UpdateList = (songs,listid)=>{
    return new Promise((resolve,reject) => {
        database.query(`update lists set song_ids = '${songs}' where id = ${listid}`,(error,result) => {
            if(error) reject(error)
            if(result.changedRows === 1){
                resolve({
                    message:'删除成功',
                    type:'success'
                })
            }
        })
    })
}
router.post('/deletelike',(req,res) => {
    selectSingleList(req.auth.id,req.body.listId).then(e => {
     let result = e.song_ids.split(',')
     let index = searchSongsIndex(result,req.body.songsId.toString())
     if(index != null){
        result.splice(index,1)  
        result.join(',')
        UpdateList(result,req.body.listId).then((e) => {
            res.send(e)
        })
    }else{
        res.send({
            message:'你的喜欢列表没这首歌哦！',
            type:'error'
        }) 
     } 
    })
    
})
//二分查找返回index 
const searchSongsIndex = (array,id) => {
    let left = 0
    let right = array.length - 1
    let center = Math.floor((left + array.length) / 2)
    let index = null
    while(left <= right) {
        center = Math.floor((left + right) / 2)
        if(id < array[center]){
            right = center - 1
        }else if(id > array[center]){
            left = center + 1
        }else{
            index = center
            break
        }
    }
    return index
}
//根据url返回歌曲信息
router.post('/getsongsbyurl',(req,res) => {
    database.query(`select * from songlists where url = '${req.body.url}'`,(error,result) => {
        if(error) throw  error
        res.send({
           data: result[0]
        })
    })  
})
//添加歌单
router.post('/createlist' , (req,res) => {
    let time = dayjs().format('YYYY-MM-DD HH:mm:ss')
    database.query(`INSERT INTO lists (user_id, song_ids, name, date_created, is_default_favorite)
VALUES (${req.auth.id}, '', '${req.body.name}', '${time}', 0);`,(error,result) => {
    if(error) throw error
    if(result.affectedRows === 1){
        res.send({
            type:'success',
            message:'创建成功'
        })
    }else{
        res.send({
            type:'error',
            message:'创建失败,原因不明'
        })
    }
})
})
//删除歌单
router.post('/deletelist',(req,res) => {
    database.query(`DELETE FROM lists WHERE id = ${req.body.id};`,(error,result) => {
        if(error) return error
        if(result.affectedRows == 1){
            res.send({
                message:'删除成功',
                type:'success'
            })
        }else{
            res.send({
                message:'删除失败，原因不明',
                type:'error'
            })
        }
    })
})
//添加指定歌曲到指定歌单
const SelectList = (props) => {
    //这部分。props必须带listid(歌单的id)
    return new Promise((resolve,reject) => {
        database.query(`select * from lists where id = '${props.listId}'`,(error,result) => {
            if(error) reject(error)
            if(!result){
                props.errMessage = '没找到这个歌单。你可以去刷新确认下这歌单是否存在'
            }else{
                props.listinfo = result[0]
            }
            resolve(props)
        })
    })
}
const InsertToList = (props) => {
    let songsList = props.listinfo.song_ids.split(',')
    if(songsList[0] == ''){
        songsList.shift()
    }
    let norepeat = true
    songsList.map(e => {
        if(props.songId == e){
            norepeat = false
        }
    })
    if(norepeat){
        songsList.push(props.songId)
    }
    songsList = songsList.join(',')
    return new Promise((resolve,reject) => {
        database.query(`UPDATE lists SET song_ids='${songsList}' WHERE id = ${props.listId};`,(error,result) => {
            if(error) reject(error)
            if(result.affectedRows === 1){
                resolve('success')
            }else{
                resolve('error')
            }
        })
    })
}
router.post('/addsongstolist',(req,res) => {
    SelectList({listId:req.body.listId,songId:req.body.songId}).then(e => {
        if(e.errMessage){
            res.send({
                message:errMessage,
                type:'error'
            })
            return 
        }else{
            InsertToList(e).then(e => {
                if(e === 'success'){
                    res.send({
                        message:'添加成功',
                        type:'success',
                    })
                }else{
                    res.send({
                        message:'添加失败',
                        type:'success',
                    })
                }
            })
        }
    })
})
module.exports = router 