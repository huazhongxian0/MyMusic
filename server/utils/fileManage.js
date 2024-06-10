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
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
let i = 0
//写入文件，路径不存在就创建路径
const writeFile = (filePath,buffer) => {
    return new Promise((resolve,reject) => {
        try{
            const directory = path.dirname(filePath)
            fs.mkdir(directory,{recursive:true},(err)=>{
                if(err){
                    reject(err)
                }else{
                    fs.writeFile(filePath,buffer,(err) => {
                        if(err){
                            reject(err)
                        }else{
                            resolve(filePath)
                        }
                    })
                }
            })
        }catch(error){
            reject(error)
        }
    })
}
//删除文件
const deleteFile = (filePath) => {
    return new Promise((resolve,reject) =>{
        try{
            fs.unlink(filePath,(err) => {
                if(err) reject(err)
                else resolve()
            })
        }catch(error){
            reject(error)
        }
    })
}
//删除指定文件夹下所有文件
const deleteFolderRecursive = (folderPath) => {
    if(fs.existsSync(folderPath)){
        fs.readdirSync(folderPath).forEach(file => {
            let currentPath = `${folderPath}/${file}`;
            if(fs.lstatSync(currentPath).isDirectory()){
                deleteFolderRecursive(currentPath)
            }else{
                fs.unlinkSync(currentPath)
            }
        })
        fs.rmdirSync(folderPath)
    }
}
//获得路径文件夹下所有文件
const getDir = (directoryPath) => {
    return new Promise((resolve,reject) => {
        try{
            fs.readdir(directoryPath,{withFileTypes:true},(err,files) => {
                if(err){
                    reject(err)
                    return
                }
                resolve(files)
            })
        }catch(error){
            reject(error)
        }
    })
}
//判断文件是否存在
const fileExists = (filePath) => {
    return fs.existsSync(filePath)
}
//在文件末尾添加，后面合成文件用的
const appendToFile = (text,filePath) => {
    return new Promise((resolve,reject) => {
        try{   
            const directory = path.dirname(filePath)
            fs.mkdir(directory,{recursive:true},err => {
                if(err){
                    reject(err)
                    return
                }
                fs.appendFile(filePath,text,(err) => {
                    if(err){
                        reject(err)
                    }else{
                        resolve()
                    }
                })
            })
        }catch(error){
            reject(error)
        }
    })
}
//目标目录
const dir = './databases/test'
//提交接口
router.post('/fileuploadtest',upload.single('file'),async(req,res) => {
    console.log('发了个文件',req.body.index);
  const a = req.body
  writeFile(dir+`/${req.body.md5}/${req.body.index}`,req.file.buffer).then(e => {
    res.send({
        type:'success',
        message:'发送成功'
    })
  })
})
//完整性验证接口
router.post('/checkfileintegrity',async(req,res) => {
    const md5 = req.body.md5
    const length = req.body.length
    const files = await getDir(dir+`/${req.body.md5}`)
    const judgeSet = new Set(Array.from({length:length},(k,i) => i))
    files.map(e => {
        judgeSet.delete(parseInt(e.name))
    })
    console.log('完整性接口',judgeSet);
    res.send({
        type:'success',
        data:[...judgeSet],
        message:'校验成功'
    })
})  
//合并接口并存入信息
router.post('/filemerge',async(req,res) => {
    const files = await getDir(dir+`/${req.body.md5}/`)
    files.sort((a,b) => parseInt(a.name)-parseInt(b.name))
    for(let i = 0 ; i < files.length ; i++){    
        let file = files[i]
        let content = fs.readFileSync(dir + `/${req.body.md5}/${file.name}`)
        await appendToFile(content,`./databases/songsList/${req.body.md5}.${req.body.suffix}`)
    }
    deleteFolderRecursive(dir+`/${req.body.md5}`)
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
       set(req.body.title,req.body.author,`${req.body.md5}.${req.body.suffix}`).then(e => {
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
module.exports = router