const express = require('express')
const router = express()
const database = require('../databases/databaseConfig')
router.get('/getallroles',(req,res) => {
    let begin = req.query.begin ? req.query.begin : 0
    let num = req.query.num ? req.query.num : 50
    database.query(`SELECT * FROM roles ORDER BY id LIMIT ${num} OFFSET ${begin}`,(err,result) => {
        if(err) return err
        res.send({
            type:'success',
            data:result
        })
    })
})
//删除角色
router.get('/deleteroles',(req,res) => {
    console.log(req.query);
    if(req.query.id === '1'){
        res.send({
            type:'error',
            message:'小子，你这是,反了？嗯？'
        })
        return
    }
    if(req.auth.id === 1){
        database.query(`delete from roles where id = ${req.query.id}`,(error,result) => {
            if(error) throw error
            if(result.affectedRows === 1){
                res.send({
                    type:'success',
                    message:'删除成功!'
                })
                
            }else{
                res.send({
                    type:'error',
                    message:'删除失败,原因不明'
                })
            }
        })
    }else{
        res.send({
            type:'error',
            message:'嘿，给你删除权限你还真删是吧？'
        })
    }
    
})
//增加角色
router.post('/addroles',(req,res) => {
    if(req.body.routes.length === 0){
        res.send({
            type:'error',
            message:'权限值为空，拒绝添加',
        })
        return
    }
    let permmissionid = req.body.routes.join(',')
    database.query(`INSERT INTO roles (name,permmissionid) VALUES ('${req.body.name}','${permmissionid}')`,(error,result) => {
        if(error) throw error
        if(result.affectedRows === 1){
            res.send({
                message:'增加成功',
                type:'success'
            })
        }else{
            res.send({
                message:'增加失败，原因不明',
                type:'error'
            })
        }
    })
})
//修改角色权限
router.post('/updateroleroutes',(req,res) => {
    if(req.body.roleid === 1){
        res.send({
            message:'你还给我改上权限了？想啥呢？',
            type:'error'
        })
        return
    }
    if(req.body.permmissions.length === 0){
        res.send({
            type:'error',
            message:"权限为空，拒绝更改！"
        })
        return
    }
    let ids = req.body.permmissions.join(',')
    console.log(ids,req.body.name,req.body.roleid);
    database.query(`UPDATE roles SET permmissionid = '${ids}',name='${req.body.name}' WHERE id = ${req.body.roleid};`,(error,result) => {
        if(error) throw error
        if(result.affectedRows === 1){
            res.send({
                message:'更改成功',
                type:'success'
            })
        }else{
            res.send({
                message:'更改失败，原因不明',
                type:'error'
            })
        }
    })
})
module.exports = router