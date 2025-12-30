import axios from "axios";
// import queryString from 'query-string';

const candidateAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api",
  // Nếu cần serialize query params phức tạp thì bật lại dòng dưới
  // paramsSerializer: params => queryString.stringify(params),
});

// ✅ Request interceptor: tự động gắn token
candidateAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("candidate_jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor: chuẩn hóa dữ liệu trả về
candidateAxios.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp response.data để dễ dùng
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    // Log lỗi chi tiết để debug
    if (error.response) {
      console.error(
        `API Error [${error.response.status}]:`,
        error.response.data
      );
    } else {
      console.error("Network/Config Error:", error.message);
    }

    // Nếu gặp 401 → token hết hạn → xoá token và chuyển về login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("candidate_jwt");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default candidateAxios;
