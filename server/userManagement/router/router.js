const database = require('../../databases/databaseConfig');
const { route } = require('../userinfo/loginPage');
// 将数据库中的路由数据转换为树状结构
buildRoutesTree = (routes, parentId = null) => {
    return routes
      .filter(route =>{
        return route.parentId === parentId
      })
      .map(route => {
             let children = buildRoutesTree(routes, route.id)
             return { 
                    id:route.id,
                    routerName:route.routerName,
                    component:route.component,
                    path:route.path, 
                    name:route.name,
                    children:children.length === 0 ? undefined : children
                }
        });
  },
  module.exports = buildRoutesTree