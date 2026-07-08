import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // For multipart uploads (FormData), let the browser set
    // `Content-Type: multipart/form-data` with the correct boundary.
    // The instance-level JSON default would otherwise clobber it and
    // multer would fail to parse the file (req.file === undefined -> 400).
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      config.headers.delete("Content-Type");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized");
      // Later we can clear auth state or redirect to login
    }

    return Promise.reject(error);
  }
);

export default api;