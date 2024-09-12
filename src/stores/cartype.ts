import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from "axios";

// 定义 CarType 的类型
interface CarType {
    id: string;
    cartype: string;
}

export const useCarTypeStore = defineStore('cartype', () => {
    // 使用 CarType 类型定义 carTypeList
    const carTypeList = reactive<CarType[]>([
        { id: "0", cartype: '轿车' },
        { id: "1", cartype: 'SUV' },
    ])

    // 定义 carTypeInfoList 的类型为 CarType 数组
    const carTypeInfoList = reactive<CarType[]>([])

    // 获取 cartype 表中所有汽车数据
    async function getAllCarType() {
        try {
            let result = await axios.get(
                "http://127.0.0.1:8000/cartype/all_car"
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getCarOrSUV(item: { id: string }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/cartype/car_or_suv",
                item,
            );
            console.log(result.data);
            return result.data
        } catch (error) {
            alert(error)
        }
    }
    
    async function searchCarOrSUV(item: { name: string }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/cartype/name",
                item,
            );
            console.log(result.data);
            return result.data
        } catch (error) {
            alert(error)
        }
    }


    return { carTypeList, carTypeInfoList, getAllCarType, getCarOrSUV,searchCarOrSUV }
})
