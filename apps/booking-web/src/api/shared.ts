import axios from "axios";

export const axiosClient = axios.create({
    baseURL: "/api/v1",
    // Any HTTP request made through this axios instance
    // that doesn't receive a response within 90 seconds
    // will be aborted.
    timeout: 90000,
});
