import axios from "axios";

const api = axios.create({
    baseURL: "https://jsonplaceholder.typicode.com"
})

export const getAllPosts = async () => {
    return await api.get("/posts");
}