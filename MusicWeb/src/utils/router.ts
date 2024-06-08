interface Route {
  path: string
  realpath?: string
  children?: Route[]
}
const generateTree = (list: Array<Route>, parentsRouter: string) => {
  return list.map((e) => {
    e.realpath = !parentsRouter ? e.path : parentsRouter + '/' + e.path
    if (e.children) e.children = generateTree(e.children, e.realpath)
    return e
  })
}
const mapRoute = (route: any) => {
  if (route.component) {
    const componentPath = `../views/${route.component}/${route.component}.vue`
    route.component = () => import(`${componentPath}`)
  }
  if (route.children) route.children.map((e: any) => mapRoute(e))
  delete route.id
  delete route.name
  delete route.realpath
  delete route.routerName
  return route
}
export { generateTree, mapRoute }
