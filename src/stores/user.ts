import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from "axios";

export const useUserStore = defineStore('user', () => {

    async function getUserOne(item: { token: string }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/user/one",
                item
            );
            // console.log(result.data)
            return result.data
        } catch (error) {
            alert(error)
        }
    }
    return { getUserOne }
})