import { ref, computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import axios from "axios";
import { API_BASE_URL } from "@/config/config"; // 导入 API_BASE_URL

// 定义 WorkingConditions 的类型
interface WorkingConditions {
    id: number;
    name: string;
    name_en: string;
    kc_parameters_id_list: Array<any>; // 可以根据你的具体需求替换 `any` 为更具体的类型
}

export const useWorkingConditionsStore = defineStore('workingconditions', () => {
    // 使用 WorkingConditions 类型定义 workingConditionsList
    const workingConditionsList = ref<WorkingConditions[]>([]);

    async function getWorkingConditions() {
        try {
            let result = await axios.get(
                `${API_BASE_URL}/working_conditions` // 使用 API_BASE_URL
            );
            return result.data;
        } catch (error) {
            alert(error);
        }
    }

    async function getWorkingConditionDetail(item: { "car_id_list": number[], "coordinate_system": string, "working_conditions_list": number[] }) {
        try {
            let result = await axios.post(
                `${API_BASE_URL}/working_conditions/detail`, // 使用 API_BASE_URL
                item
            );
            return result.data;
        } catch (error) {
            alert(error);
        }
    }

    async function getWorkingConditionDetailOnce(item: { "car_base_info_id": number }) {
        try {
            let result = await axios.post(
                `${API_BASE_URL}/working_conditions/detail_once`, // 使用 API_BASE_URL
                item
            );
            return result.data;
        } catch (error) {
            alert(error);
        }
    }

    async function getWorkingConditionDetailTitle(item: { "working_conditions_list": number[] }) {
        try {
            let result = await axios.post(
                `${API_BASE_URL}/working_conditions/detail_title`, // 使用 API_BASE_URL
                item
            );
            return result.data;
        } catch (error) {
            alert(error);
        }
    }

    return {
        workingConditionsList,
        getWorkingConditions,
        getWorkingConditionDetail,
        getWorkingConditionDetailOnce,
        getWorkingConditionDetailTitle
    };
});
