import axios from 'axios'
import { baseURL } from './constance'

const instance = axios.create({
  baseURL: baseURL,
  // timeout: 1000
})

// Khai báo biến để lưu số lượng yêu cầu đã gửi
let requestCount = 0;

// Khai báo giới hạn số lượng yêu cầu được gửi
const MAX_REQUESTS = 100; // Số lượng yêu cầu tối đa bạn muốn cho phép trong một khoảng thời gian

// Thêm interceptor cho yêu cầu
instance.interceptors.request.use(
  function (config) {
    // Kiểm tra xem số lượng yêu cầu đã gửi đã đạt đến giới hạn chưa
    if (requestCount >= MAX_REQUESTS) {
      // Nếu đã đạt đến giới hạn, hủy yêu cầu và trả về một promise bị từ chối
      return Promise.reject('Quá nhiều yêu cầu được gửi.');
    }
    requestCount++;


    // Trước khi gửi request, kiểm tra xem có token trong sessionStorage không
    const token = sessionStorage.getItem('token')
    // console.log(token)

    // Nếu có token, thêm nó vào header của request
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

// Thêm interceptor cho phản hồi
instance.interceptors.response.use(
  function (response) {
    requestCount--

    // Xử lý dữ liệu phản hồi nếu cần
    return response
  },
  function (error) {
    requestCount--
    
    // Xử lý lỗi phản hồi nếu có
    return Promise.reject(error)
  }
)

export default instance