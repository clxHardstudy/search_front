import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from "axios";

export const useLoginStore = defineStore('login', () => {

    async function login(item: { username: string, password: string}) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/user/login",
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