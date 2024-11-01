import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from "axios";
import { API_BASE_URL } from "@/config/config";

// 定义 CarType 的类型
interface CarType {
    id: string;
    name: string;
}

export const useCarTypeStore = defineStore('cartype', () => {
    // 使用 CarType 类型定义 carTypeList
    const carTypeList = ref<CarType[]>([]);

    async function getCarType() {
        try {
            let result = await axios.get(
                `${API_BASE_URL}/car_type`
            );
            // console.log(result.data)
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    return { carTypeList, getCarType }
})