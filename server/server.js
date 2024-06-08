const express = require('express')
const cors = require('cors')
const app = express()
const database = require('./databases/databaseConfig.js')
const TOKEN = require('./tokenSetting/tokenHandler.js')
const loginPage = require('./userManagement/userinfo/loginPage.js')
const songsManage = require('./songsManagement/songsManage.js')
const listsManage = require('./listsManagement/listsManagement.js')
const userinfo = require('./userManagement/userinfo/userinfo.js')
const roleManage = require('./userManagement/rolesManagement.js')
const Test = require("./utils/fileManage.js")
app.use(cors())
//定义一个拦token的中间件
function authenticateToken(req, res, next) {  
	// 从请求头、查询参数、cookie 等地方获取 token  
	const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];   
	if (!token) {  
	  // 如果没有 token，返回错误或重定向到登录页面  
	  return res.status(401).send('Unauthorized: No token provided.');  
	}  
	jwt.verify(token, secret, (err, decoded) => {  
	  if (err) {  
		// 如果 token 无效或已过期，返回错误  
		return res.status(403).send('Forbidden: Invalid or expired token.');  
	  }  
	  // 将验证通过的用户信息（可选）附加到请求上  
	  req.user = decoded;  
	  // 继续执行下一个中间件或路由处理器  
	  next();  
	});  
  }
app.use(express.static('./databases/songsList'))
//使用expressjwt去解析请求头中的token
app.use(TOKEN.expressjwt);
app.use(function (err, req, res, next) {
	if (err.name === 'UnauthorizedError') {
	  // 此处处理无效的Token，比如发送401响应
	  res.status(401).send('Invalid token.');
	} else {
	  next(err);
	}
  });

app.use(express.json())
app.use(loginPage)
app.use(songsManage)
app.use(listsManage)
app.use(Test)
app.use(userinfo)
app.use(roleManage)
app.listen(8080,()=>{
    console.log('跑起来了');
})

database.query('SELECT 1',(err,results)=>{
	if (err) return console.log(err.message)
	console.log('数据库正常',results)
})

