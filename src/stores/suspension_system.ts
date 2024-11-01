import { ref, computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import axios from "axios";
import { API_BASE_URL } from "@/config/config"; // 导入 API_BASE_URL

export const useSuspensionSystemStore = defineStore('suspension_system', () => {

    async function getSuspensionSystemModule() {
        try {
            let result = await axios.get(
                `${API_BASE_URL}/suspension_system`, // 使用 API_BASE_URL
            );
            return result.data;
        } catch (error) {
            alert(error);
        }
    }

    async function getSuspensionSystemModuleByModuleId(item: { "module_data_id_list": number[] }) {
        try {
            let result = await axios.post(
                `${API_BASE_URL}/suspension_system/son_detail_title`, // 使用 API_BASE_URL
                item,
            );
            return result.data;
        } catch (error) {
            alert(error);
        }
    }

    async function getSuspensionSystemModuleSonParameters() {
        try {
            let result = await axios.get(
                `${API_BASE_URL}/suspension_system/detail_title`, // 使用 API_BASE_URL
            );
            return result.data;
        } catch (error) {
            alert(error);
        }
    }

    async function getSuspensionSystemData(item: { "car_id_list": number[], "coordinate_system": string }) {
        try {
            let result = await axios.post(
                `${API_BASE_URL}/suspension_system/data_all`, // 使用 API_BASE_URL
                item
            );
            return result.data;
        } catch (error) {
            alert(error);
        }
    }

    async function getSuspensionSystemDetailOnce(item: { "car_base_info_id": number }) {
        try {
            let result = await axios.post(
                `${API_BASE_URL}/suspension_system/detail_once`, // 使用 API_BASE_URL
                item
            );
            return result.data;
        } catch (error) {
            alert(error);
        }
    }

    return {
        getSuspensionSystemModule,
        getSuspensionSystemModuleSonParameters,
        getSuspensionSystemModuleByModuleId,
        getSuspensionSystemData,
        getSuspensionSystemDetailOnce
    };
});
