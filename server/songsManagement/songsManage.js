const express = require('express')
const fs = require('fs')
const fsExtra = require('fs-extra');
const path = require('path')
const { v4: uuidv4 } = require('uuid');
const router = express.Router()
const multer = require('multer')
const database = require('../databases/databaseConfig');
const { rejects } = require('assert');
const { type } = require('os');
const dir = './databases/songsList'
fs.mkdirSync(dir, { recursive: true }) 
//保存歌曲
const storage = multer.diskStorage({
    // 要保存的目录
    destination: function (req, file, cb) {
      if(!file) req.pending = 1
      cb(null, dir)  
    },
     // 保存的文件名
    filename: function (req, file, cb) {
      req.body.url = uuidv4() + path.extname(file.originalname)
      cb(null, req.body.url) 
    }
  })
const upload = multer({storage:storage})
let set = (title,author,url) =>{
 //保存歌到表
  return new Promise((resolve,rejects) => {
    if(!url){
      rejects(null)
      return
    }  
    database.query(`INSERT INTO songlists (url, title, author) VALUES ('${url}', '${title}', '${author}');`,(error,result) => {
      if(error) rejects(error)
      resolve(result)
    })
  })
}
router.post('/uploadsongs', upload.single('file'),(req,res) => {
  if(req.pending === 1){
    res.send({
      message:'上传失败',
      type:'error'
    })
    return
  }
  set(req.body.title,req.body.author,req.body.url).then(e => {
    
    if(!e){
      res.send({
        message:'上传失败',
        type:'error'
      })
    }
    res.send({
      message:'上传成功',
      type:'success',
      url:req.body.url,
      id:e.insertId
    })
  },error =>{
    if(error){
      if(error.code){
        if(error.code === 'ER_DUP_ENTRY'){
          res.send({
            message:'已经有这个歌手的这首歌了哦，你可以联系管理员去修改它',
            type:"error"
          })
          return
        }
      }
      res.send({
        message:'插入失败,理由不明，可联系管理员',
        type:"error"
    })
      return
    }
    res.send({
      message:'插入失败,你传了个空值',
      type:"error"
    })
    return
  })
})
//查歌的时长
router.post('/settime',(req,res)=>{
  database.query(`UPDATE songlists SET duration = '${req.body.duration}' WHERE id = '${req.body.id}';`,(error,result) => {
      if(error) {
        res.send({
          type:'error',
          message:'上传失败'
        })
        throw new Error(error)
        return
      }
      res.send({
        type:'success',
        message:'上传成功'
      })
  })
  
})
//获取所有歌
let getsongs = () =>{
  return new Promise((resolve,rejects) => {
    database.query('select * from songlists',(error,results) => {
      if(error) rejects(error)
      resolve(results)
    })
  })
}
router.get('/getsongs',(req,res)=>{
   getsongs().then(re => {
    res.send({
      data:re,
      type:'success',
      message:'获取成功'
    })
   },er => {
    res.send({
      data:er,
      type:'error',
      message:'获取失败'
    })
   })
})
//删除歌
//根据id查询
let select = (id) => {
    return new Promise((resolve,rejects) => {
      database.query(`select * from songlists where id = ${id}`,(error,result) => {
        if(error) console.log(error)
        resolve(result[0])
      })
    })
}
//删除文件操作
let deleteFileSongs = (url) => {
return new Promise((resolve,rejects) => {
  fs.unlink(`./databases/songsList/${url}`,(error) => {
    if(error) throw error
    resolve(200)
  })
})
}
//删除表信息操作
let deleteTableSongs = (id) => {
  return new Promise((resolve,rejects) => {
    database.query(`delete from songlists WHERE id = ${id}`,(error,results) => {
      if(error) rejects(error)
      resolve(200)
    })
  })
}
router.delete('/deletesong/:id',(req,res) => {
  select(req.params.id).then(result => {
     Promise.all([deleteFileSongs(result.url),deleteTableSongs(result.id)]).then(result => {
        if(result[0] === 200&&result[1] === 200){
          res.send({
            message:'删除成功',
            type:'success',
            code:200
          })
          return
        }
        res.send({
          message:'删除失败',
          type:'error',
          code:101
        })
     })
  })
})
module.exports = router