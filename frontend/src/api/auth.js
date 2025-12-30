import candidateAxios from "./candidateAxios";
import commonAxios from "./commonAxios";
import employerAxios from "./employerAxios";
import adminAxios from "./adminAxios";

const authApi = {
  login: (params) => {
    return commonAxios.post("/login", params);
  },
  register: (params) => {
    return commonAxios.post("/register", params);
  },
  logout: (role) => {
    if (role === 0) return adminAxios.post("/logout");      // ✅ POST
    if (role === 1) return candidateAxios.post("/logout");  // ✅ POST
    if (role === 2) return employerAxios.post("/logout");   // ✅ POST
  },
  refresh: (role) => {
    if (role === 0) return adminAxios.post("/refresh");      // ✅ POST
    if (role === 1) return candidateAxios.post("/refresh");  // ✅ POST
    if (role === 2) return employerAxios.post("/refresh");   // ✅ POST
  },
  getMe: (role) => {
    if (role === 0) return adminAxios.get("/getMe");
    if (role === 1) return candidateAxios.get("/getMe");
    if (role === 2) return employerAxios.get("/getMe");
  },
};

export default authApi;
