import request from '@/utils/request'
import { mapRoute, generateTree } from '@/utils/router'

//登录
const login = async (username: string, password: string, userinfo: any, router: any) => {
  const result: any = await request.post('/login', { username, password })
  if (result.code === 200) {
    //里面作前端部分对数据需求的处理，用其添加一个realname属性去给导航栏做导航
    const routes = generateTree(result.routes, '')
    //存入pinia里
    userinfo.setRoutes(routes)
    //深拷贝这个树目的是生成路由表里的标准格式数据
    let newRoutes = JSON.parse(JSON.stringify(routes))
    newRoutes = newRoutes.map((e: any) => mapRoute(e))
    newRoutes.map((e) => {
      router.addRoute(e)
    })
    console.log(result)
    userinfo.SetUserInfo(
      result.userInfo.id,
      result.userInfo.nickName,
      result.userInfo.userNames,
      result.userInfo.password,
      result.data
    )
    localStorage.setItem('token', result.data)
  }
  return {
    message: result.message,
    type: result.type,
    code: result.code,
    data: result.data
  }
}
//注册
const register = async (username: string, password: string) => {
  const result: any = await request.post('/register', {
    username,
    password
  })
  return {
    message: result.message,
    type: result.type,
    code: result.code
  }
}
export { login, register }
