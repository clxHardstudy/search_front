import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from "axios";
import { API_BASE_URL } from "@/config/config";

interface Platform {
    id: string;
    name: string;
}
export const usePlatformStore = defineStore('platform', () => {
    const platformList = ref<Platform[]>([])

    async function getPlatform() {
        try {
            let result = await axios.get(
                `${API_BASE_URL}/platform`
            );
            // console.log(result.data)
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    return { platformList, getPlatform }
})
