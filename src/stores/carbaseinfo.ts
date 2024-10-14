import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from "axios";

interface CarBaseInfo {
    id: number;
    name: string;
    wheelbase: string,
    front_track: string,
    rear_track: string,
    release_date: Date,
    create_time: number,
    update_time: number,
    car_type_id: number,
    platform_id: number,
}


export const useCarBaseInfoStore = defineStore('carbaseinfo', () => {

    // 定义 CarBaseInfoList 的类型为 CarBaseInfo 数组
    const carBaseInfoList = reactive<CarBaseInfo[]>([])

    // 这是单独选择车辆的时候使用的，如果这个对象不为空，则在页面中显示的是这个对象中的数据
    const carBaseInfoSelectIdList = reactive<number[]>([]);


    // 车型选择时的 选择车型的id 响应式更新
    const selectedCarTypeId_ts = ref<string | null>(null);  // 添加 selectedCarTypeId
    const selectedPlatformList_ts = ref<Array<number>>([]); // 定义为数字数组类型

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

    async function getCarBaseInfoList(item: { car_base_info_id_list: Array<number> }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/car_base_info/car_list",
                item
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
            console.log("请求接口：获取id为", item.id, "的所有汽车数据");
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getCarByCarTypeAndPlatform(item: { car_type_id: number, platform_id_list: Array<number> }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/car_base_info/car_type_and_platform",
                item,
            );
            console.log("请求接口：", "的所有汽车数据");
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function searchCarByName(item: { car_type_id: number, platform_id_list: Array<number>, name: string }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/car_base_info/name",
                item,
            );
            console.log("请求接口：查询名称中携带 ", item.name, " 的所有汽车数据");
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function searchCarByWheelbase(item: { car_type_id: number, platform_id_list: Array<number>, wheelbase: string }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/car_base_info/wheelbase",
                item,
            );
            console.log("请求接口：根据 轮距 进行搜索所有的汽车数据");
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function searchCarByNameAndWheelbase(item: { car_type_id: number, platform_id_list: Array<number>, wheelbase: string, name: string }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/car_base_info/name_and_wheelbase",
                item,
            );
            console.log("请求接口：根据 车型名称 和 轮距 进行搜索所有的汽车数据");
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function searchCarByMultipleConditionQuery(item: {
        car_type_id: number,
        platform_id_list: Array<number>,
        wheelbase: string,
        name: string,
        front_track: string,
        rear_track: string,
    }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/car_base_info/multiple_condition_query",
                item,
            );
            console.log("请求接口：根据多条件查询所有的汽车数据");
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function searchNewCarByMultipleConditionQuery(item: {
        car_type_id: number,
        platform_id_list: Array<number>,
        wheelbase: string,
        name: string,
        front_track: string,
        rear_track: string,
        car_base_info_id_list: Array<number>
    }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/car_base_info/new_multiple_condition_query",
                item,
            );
            console.log("请求接口：根据多条件查询所有的汽车数据");
            return result.data
        } catch (error) {
            alert(error)
        }
    }


    return {
        carBaseInfoList, carBaseInfoSelectIdList, selectedCarTypeId_ts, selectedPlatformList_ts,
        getAllCarBaseInfo, getCarBaseInfoList, getCarOrSUV, searchCarByName, getCarByCarTypeAndPlatform,
        searchCarByWheelbase, searchCarByNameAndWheelbase, searchCarByMultipleConditionQuery, searchNewCarByMultipleConditionQuery
    }
})
