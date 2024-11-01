import { ref, computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import axios from "axios";
import { API_BASE_URL } from "@/config/config"; // 导入 API_BASE_URL

export const useSteeringSystemStore = defineStore('steering_system', () => {

    async function getSteeringSystemModule() {
        try {
            let result = await axios.get(
                `${API_BASE_URL}/steering_system`, // 使用 API_BASE_URL
            );
            return result.data;
        } catch (error) {
            alert(error);
        }
    }

    async function getSteringSystemModuleByModuleId(item: { "module_data_id_list": number[] }) {
        try {
            let result = await axios.post(
                `${API_BASE_URL}/steering_system/son_detail_title`, // 使用 API_BASE_URL
                item,
            );
            return result.data;
        } catch (error) {
            alert(error);
        }
    }

    async function getSteeringSystemModuleSonParameters() {
        try {
            let result = await axios.get(
                `${API_BASE_URL}/steering_system/detail_title`, // 使用 API_BASE_URL
            );
            return result.data;
        } catch (error) {
            alert(error);
        }
    }

    async function getSteeringSystemData(item: { "car_id_list": number[], "coordinate_system": string }) {
        try {
            let result = await axios.post(
                `${API_BASE_URL}/steering_system/data_all`, // 使用 API_BASE_URL
                item
            );
            return result.data;
        } catch (error) {
            alert(error);
        }
    }

    async function getSteeringSystemDetailOnce(item: { "car_base_info_id": number }) {
        try {
            let result = await axios.post(
                `${API_BASE_URL}/steering_system/detail_once`, // 使用 API_BASE_URL
                item
            );
            return result.data;
        } catch (error) {
            alert(error);
        }
    }

    return {
        getSteeringSystemModule,
        getSteeringSystemModuleSonParameters,
        getSteringSystemModuleByModuleId,
        getSteeringSystemData,
        getSteeringSystemDetailOnce
    };
});
