import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from "axios";
import { API_BASE_URL } from "@/config/config";

export const useLoginStore = defineStore('login', () => {

    async function login(item: { username: string, password: string }) {
        try {
            let result = await axios.post(
                `${API_BASE_URL}/user/login`,
                item
            );
            // console.log(result.data)
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    return { login }
})