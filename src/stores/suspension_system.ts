import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from "axios";

export const useSuspensionSystemStore = defineStore('suspension_system', () => {

    async function getSuspensionSystemModule() {
        try {
            let result = await axios.get(
                "http://127.0.0.1:8000/suspension_system",
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getSuspensionSystemModuleByModuleId(item: { "module_data_id_list": number[] }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/suspension_system/son_detail_title",
                item,
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getSuspensionSystemModuleSonParameters() {
        try {
            let result = await axios.get(
                "http://127.0.0.1:8000/suspension_system/detail_title",
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }


    async function getSuspensionSystemData(item: { "car_id_list": number[], "coordinate_system": string }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/suspension_system/data_all",
                item
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getSuspensionSystemDetailOnce(item: { "car_base_info_id": number }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/suspension_system/detail_once",
                item
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }
    return {
        getSuspensionSystemModule,
        getSuspensionSystemModuleSonParameters,
        getSuspensionSystemModuleByModuleId,
        getSuspensionSystemData,
        getSuspensionSystemDetailOnce
    }
})