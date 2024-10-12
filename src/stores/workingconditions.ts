import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from "axios";

// 定义 CarType 的类型
interface WorkingConditions {
    id: number;
    name: string;
    name_en: string
    kc_parameters_id_list: Array<any>; // 可以根据你的具体需求替换 `any` 为更具体的类型
}

export const useWorkingConditionsStore = defineStore('workingconditions', () => {
    // 使用 CarType 类型定义 carTypeList
    const workingConditionsList = ref<WorkingConditions[]>([]);

    async function getWorkingConditions() {
        try {
            let result = await axios.get(
                "http://127.0.0.1:8000/working_conditions"
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getWorkingConditionDetail(item: { "car_id_list": number[], "coordinate_system": string, "working_conditions_list": number[] }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/working_conditions/detail",
                item
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getWorkingConditionDetailOnce(item: { "car_base_info_id": number }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/working_conditions/detail_once",
                item
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getWorkingConditionDetailTitle(item: { "working_conditions_list": number[] }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/working_conditions/detail_title",
                item
            );
            // console.log("kcTitle: ",result.data)
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    return {
        workingConditionsList,
        getWorkingConditions, getWorkingConditionDetail, getWorkingConditionDetailOnce, getWorkingConditionDetailTitle
    }
})