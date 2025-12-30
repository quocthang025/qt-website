import axios from "axios";
// import queryString from 'query-string';

const employerAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api",
  // paramsSerializer: params => queryString.stringify(params),
});

// ✅ Request interceptor: tự động gắn token
employerAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("employer_jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor: chuẩn hóa dữ liệu và xử lý lỗi
employerAxios.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp response.data để dễ dùng
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    // Ghi log lỗi chi tiết
    if (error.response) {
      console.error(
        `Employer API Error [${error.response.status}]:`,
        error.response.data
      );
    } else {
      console.error("Employer API Network Error:", error.message);
    }

    // ✅ Nếu gặp lỗi 401 → token sai hoặc hết hạn → xóa token và chuyển về login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("employer_jwt");
      window.location.href = "/employer/login";
    }

    return Promise.reject(error);
  }
);

export default employerAxios;
