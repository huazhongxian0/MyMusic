import axios from 'axios'
const tokenRequest = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 5000
})
//请求拦截器
tokenRequest.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
})
//响应拦截器
tokenRequest.interceptors.response.use(
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
export default tokenRequest
