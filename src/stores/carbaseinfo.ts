import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from "axios";

interface CarBaseInfo {
    id: string;
    name: string;
    wheelbase: string,
    release_date: Date,
    create_time: number,
    update_time: number,
    car_type_id: number
}


export const useCarBaseInfoStore = defineStore('carbaseinfo', () => {

    // 定义 CarBaseInfoList 的类型为 CarBaseInfo 数组
    const carBaseInfoList = reactive<CarBaseInfo[]>([])

    // 获取 cartype 表中所有汽车数据
    async function getAllCarBaseInfo() {
        try {
            let result = await axios.get(
                "http://127.0.0.1:8000/car_base_info/all_car"
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getCarOrSUV(item: { id: string }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/car_base_info/car_or_suv",
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
                "http://127.0.0.1:8000/car_base_info/name",
                item,
            );
            console.log(result.data);
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function searchCarByWheelbase(item: { wheelbase: string }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/car_base_info/wheelbase",
                item,
            );
            console.log(result.data);
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    searchCarByNameAndWheelbase
    async function searchCarByNameAndWheelbase(item: { wheelbase: string, name: string }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/car_base_info/name_and_wheelbase",
                item,
            );
            console.log(result.data);
            return result.data
        } catch (error) {
            alert(error)
        }
    }
    return { carBaseInfoList, getAllCarBaseInfo, getCarOrSUV, searchCarOrSUV, searchCarByWheelbase, searchCarByNameAndWheelbase }
})
