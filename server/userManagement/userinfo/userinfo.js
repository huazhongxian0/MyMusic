const express = require('express')
const database = require('../../databases/databaseConfig')
const router = express.Router()
router.get('/getuserinfo',(req,res) => {
    database.query(`select * from users where id = ${req.auth.id}`,(err,result) => {
        if(err) res.send({ code:'501',type:'error', message:'查询失败，数据库错误'})
        res.send({
            code:200,
            type:'success',
            message:"查询成功",
            data:result[0]
        })
        })
})
router.get('/getalluserinfo',(req,res) => {
    let begin = req.query.begin ? req.query.begin : 0
    let num = req.query.num ? req.query.num : 50
    database.query(`SELECT * FROM users ORDER BY id LIMIT ${num} OFFSET ${begin}`,(err,result) => {
        if(err) return err
        res.send({
            type:'success',
            data:result
        })
    })
})
//根据id删除用户
router.get('/removeusers',(req,res) => {
    database.query(`delete from users where id = ${req.query.id}`,(error,result) => {
        if(error) throw error
        if(result.affectedRows === 1){
            res.send({
                message:'删除成功',
                type:'success'
            })
        }else if(result.affectedRows === 0){
            res.send({
                message:'这一用户已经删除了哦！',
                type:'warning'
            })
        }else{
            res.send({
                message:'未知错误哦！',
                type:'error'
            })
        }
    })
})
//获取角色信息
router.get('/getroleinfo',(req,res) => {
    database.query(`select * from roles`,(error, result) => {
        if(error) return error
        res.send({
            type:'success',
            data:result,
            message:'查询成功'
        })
    })
})
//根据id修改用户信息
router.post('/updateuserinfo',(req,res) => {
    
    database.query(`UPDATE users SET nickname='${req.body.nickname}',username = '${req.body.username}', password = '${req.body.password}' ,roleid = '${req.body.roleid}' WHERE id = ${req.body.id};`,(error,result) => {
        if(error) throw error
        if(result.affectedRows === 1){
            res.send({
                message:'更改成功',
                type:'success'
            })
        }
    })
})
//请求所有的用户权限
router.get('/getallroutes',(req,res) => {
    database.query(`select * from routes`,(error,result) => {
        if(error) throw error
        res.send({
            type:'success',
            message:"查询成功",
            data:result
        })
    })
})
module.exports = router