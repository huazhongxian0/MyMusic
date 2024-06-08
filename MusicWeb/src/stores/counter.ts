import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
// import { userInfo } from 'os'
interface rou {
  component: string
  id: number
  name: string
  path: string
  realpath: string
  routerName: string
  children: Array<rou>
}
export const useUserinfoStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token'))
  const mainHead = ref()
  const routes: Array<rou> = ref()
  const nickName = ref<string>()
  const userName = ref<string>()
  const password = ref<string>()
  const likeListId = ref<string>()
  const id = ref<number>()
  const SetUserInfo = (
    ids: number,
    nickNames: string,
    userNames: string,
    passwords: string,
    tokens: string
  ) => {
    nickName.value = nickNames
    userName.value = userNames
    password.value = passwords
    id.value = ids
    token.value = tokens
  }
  const hasAddRoutes = ref(false)
  function setToken(newToken: string) {
    token.value = newToken
  }
  function setRoutes(newRoutes: string) {
    routes.value = newRoutes
  }
  return {
    token,
    setToken,
    routes,
    setRoutes,
    hasAddRoutes,
    SetUserInfo,
    nickName,
    mainHead,
    userName,
    likeListId
  }
})
