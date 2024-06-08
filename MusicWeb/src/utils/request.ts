import axios from 'axios'
const request = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 5000
})
//请求拦截器
request.interceptors.request.use((request) => {
  return request
})
//响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    ElMessage({
      type: 'error',
      message: error
    })
  }
)
export default request
