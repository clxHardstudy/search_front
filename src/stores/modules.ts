import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from "axios";

// 定义 CarType 的类型
interface Modules {
    id: string;
    name: string;
    name_en: string;
}

export const useModulesStore = defineStore('Modules', () => {
    // 使用 CarType 类型定义 carTypeList
    const ModulesList = ref<Modules[]>([]);

    async function getModules() {
        try {
            let result = await axios.get(
                "http://127.0.0.1:8000/modules"
            );
            // console.log(result.data)
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    return { ModulesList, getModules }
})