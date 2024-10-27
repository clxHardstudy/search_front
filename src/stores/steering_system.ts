import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from "axios";

export const useSteeringSystemStore = defineStore('steering_system', () => {

    async function getSteeringSystemModule() {
        try {
            let result = await axios.get(
                "http://127.0.0.1:8000/steering_system",
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getSteringSystemModuleByModuleId(item: { "module_data_id_list": number[] }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/steering_system/son_detail_title",
                item,
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getSteeringSystemModuleSonParameters() {
        try {
            let result = await axios.get(
                "http://127.0.0.1:8000/steering_system/detail_title",
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getSteeringSystemData(item: { "car_id_list": number[], "coordinate_system": string }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/steering_system/data_all",
                item
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }
    async function getSteeringSystemDetailOnce(item: { "car_base_info_id": number }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/steering_system/detail_once",
                item
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }
    return {
        getSteeringSystemModule,
        getSteeringSystemModuleSonParameters,
        getSteringSystemModuleByModuleId,
        getSteeringSystemData,
        getSteeringSystemDetailOnce
    }
})
