import axios from "axios";

export const bounceAxiosClient = axios.create({
    baseURL: "https://fullstack-challenge-api.usebounce.io",
    headers: {
        accept: "application/json",
        "Content-Type": "application/json"
    }
});
