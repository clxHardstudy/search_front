import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from "axios";

interface Platform {
    id: string;
    name: string;
}
export const usePlatformStore = defineStore('platform', () => {
    const platformList = ref<Platform[]>([])

    async function getPlatform() {
        try {
            let result = await axios.get(
                "http://127.0.0.1:8000/platform"
            );
            // console.log(result.data)
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    return { platformList, getPlatform }
})
