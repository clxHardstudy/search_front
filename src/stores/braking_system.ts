import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from "axios";

export const useBrakingSystemStore = defineStore('braking_system', () => {

    async function getBrakingSystemModule() {
        try {
            let result = await axios.get(
                "http://127.0.0.1:8000/braking_system",
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getBrakingSystemModuleByModuleId(item: { "module_data_id_list": number[] }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/braking_system/son_detail_title",
                item,
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getBrakingSystemModuleSonParameters() {
        try {
            let result = await axios.get(
                "http://127.0.0.1:8000/braking_system/detail_title",
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getBrakingSystemData(item: { "car_id_list": number[], "coordinate_system": string }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/braking_system/data_all",
                item
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getBrakingSystemDetailOnce(item: { "car_base_info_id": number }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/braking_system/detail_once",
                item
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }
    return {
        getBrakingSystemModule,
        getBrakingSystemModuleSonParameters,
        getBrakingSystemModuleByModuleId,
        getBrakingSystemData,
        getBrakingSystemDetailOnce
    }
})