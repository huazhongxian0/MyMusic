const express = require('express')
const router = express.Router()
const database = require('../../databases/databaseConfig')
const TOKEN = require('../../tokenSetting/tokenHandler')
const getRoute = require('../router/router')
// const { type } = require('express/lib/response')
//注册
router.post('/register',(req,res) => {
try {
    database.query(`select * from users where username='${req.body.username}'`,(err0,result0) => {
        if(err0){ res.send({code:101,message:'注册失败,请联系管理员',type:'error',data:err0}); return}
        if(result0.length !== 0){res.send({code:102,message:'账号已被注册',type:'error'});return}
            database.query(`INSERT INTO users (username, password, roleid) VALUES ("${req.body.username}", "${req.body.password}", '6');`,(err,results) => {
            if(err){
                res.send({code:3,message:'注册失败,请联系管理员',type:'error',data:err})
            }else{
                database.query(`INSERT INTO lists (user_id, song_ids, name,date_created,is_default_favorite) VALUES (${results.insertId}, "", '我喜欢的音乐','${new Date().toISOString().slice(0,19).replace('T',' ')}','1');`,(error,result) => {
                    console.log(error,result);
                    if(result.affectedRows === 1){
                        res.send({
                            code:200,
                            message:'注册成功',
                            type:'success',
                        })
                        return
                    }
                    res.send({
                        message:'注册失败',
                        type:'error',
                        code:100
                    })    
                })
            }
        })

    })
} catch (error) {
    res.send({error})
}
})
//登录接口
router.post('/login',async(req,res) => {
    //登录，去下一节
    let loginProcess = new Promise((resolve , reject) => {
        database.query(`select * from users where username = '${req.body.username}'`,(err,results) => {
            if(err) reject(err)
            //空账号没有注册
            if(results.length === 0){
                res.send({
                    code:101    ,
                    type:'error',
                    message:'这个账号并没有注册哦！',
                    data:{
                        username:req.body.username,
                        password:req.body.password
                    }
                })
                return 
            }
            //密码错误
            if(results[0].password !== req.body.password){
                res.send({
                    type:'error',
                    message:'密码错误,请检查你的密码',
                })
                return
            }
            let props = {
                    loginCondition:true,
                    token:TOKEN.generateToken({username:req.body.username,password:req.body.password,id:results[0].id,roleid:results[0].roleid}),
                    id:results[0].id,
                    userinfo:results[0],
                    roleid:results[0].roleid
                }
            resolve(props)
        })
    })
    //生成路由表
    let createHash = (props) => { 
        return new Promise((resolve,reject) => {
            database.query(`select * from roles where id = ${props.roleid}`,(errs,results) => {
                if(errs) throw new Error(errs)
                let permmissionids = results[0].permmissionid.split(',')
                props.permmissionids = permmissionids
                resolve(props)
            })
        })  
    }
    //promiseall内部准备进行route获取
    let createSelectRoutes = (props) => {
        let routes = []
        let promises = props.permmissionids.map(e => {
            return new Promise((resolve,reject) => {
                database.query(`select * from routes where id = ${e}`,(errs,results) => {
                    if(errs) throw new Error(errs)
                    routes.push(results[0])
                    resolve(results[0])
                })
            })
        })
        let result = Promise.all(promises).then(e => {
            props.routes = buildRoutesTree(e)  
            return new Promise((resolve,reject) => {
                resolve(props)
            })
        })
        return result
    }
    //调用链返回结果
    loginProcess.then(props => {
        return createHash(props)
    }).then(props => {
        return createSelectRoutes(props)
    }).then(props => {
        res.send({
            type:'success',
            message:'登录成功',
            data:props.token,
            routes:props.routes,
            userInfo:props.userinfo,
            code:200
        })
    })
})
router.get('/getroutes',async(req,res) => {
let props = {
    roleid:req.auth.roleid
}
   //生成路由表
let createHash = (props) => { 
    return new Promise((resolve,reject) => {
        database.query(`select * from roles where id = ${props.roleid}`,(errs,results) => {
            if(errs) throw new Error(errs)
            let permmissionids = results[0].permmissionid.split(',')
            props.permmissionids = permmissionids
            resolve(props)
        })
    })  
}
//promiseall内部准备进行route获取
let createSelectRoutes = (props) => {
    let routes = []
    let promises = props.permmissionids.map(e => {
        return new Promise((resolve,reject) => {
            database.query(`select * from routes where id = ${e}`,(errs,results) => {
                if(errs) throw new Error(errs)
                routes.push(results[0])
                resolve(results[0])
            })
        })
    })
    let result = Promise.all(promises).then(e => {
        props.routes = buildRoutesTree(e)  
        return new Promise((resolve,reject) => {
            resolve(props)
        })
    })
    return result
} 

createHash(props).then(e => {
    return createSelectRoutes(e)
}).then(e => {
    res.send({
        type:'success',
        message:'查询成功',
        data:e.routes
    })
})
})
module.exports = router