const jsonwebtoken = require('jsonwebtoken') 
const SECRET_KEY = 'MyMusicItem'
const {expressjwt} = require('express-jwt')
TOKEN = {
    generateToken:(Obj, time='noTime') => {    
        return time === 'noTime' ? jsonwebtoken.sign(Obj,SECRET_KEY) : jsonwebtoken.sign(Obj,SECRET_KEY,{ expiresIn:time })
    },
}
TOKEN.SECRET_KEY = SECRET_KEY
TOKEN.expressjwt = expressjwt({
    secret: TOKEN.SECRET_KEY, 
    algorithms: ['HS256'] // 确保这一行被添加到配置中
  }).unless({path:['/login','/register']})
module.exports = TOKEN