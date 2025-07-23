import axios from "axios"
// const apiInstance = axios.create({
//   baseURL: "http://localhost:5000/api",
//   withCredentials: true,
// });
const apiInstance = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  withCredentials: true,
});
apiInstance.interceptors.request.use((config)=>{
    const token = localStorage.getItem("token");
    if(token){
        config.headers.Authorization=`Bearer ${token}`
    }
    return config;
});

export default apiInstance