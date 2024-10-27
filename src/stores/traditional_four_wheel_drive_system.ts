import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from "axios";

export const useTraditionalFourWheelDriveSystemStore = defineStore('traditional_four_wheel_drive_system', () => {

    async function getTraditionalFourWheelDriveSystemModule() {
        try {
            let result = await axios.get(
                "http://127.0.0.1:8000/traditional_four_wheel_drive_system",
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getTraditionalFourWheelDriveSystemModuleByModuleId(item: { "module_data_id_list": number[] }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/traditional_four_wheel_drive_system/son_detail_title",
                item,
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getTraditionalFourWheelDriveSystemModuleSonParameters() {
        try {
            let result = await axios.get(
                "http://127.0.0.1:8000/traditional_four_wheel_drive_system/detail_title",
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getTraditionalFourWheelDriveSystemData(item: { "car_id_list": number[], "coordinate_system": string }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/traditional_four_wheel_drive_system/data_all",
                item
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function getTraditionalFourWheelDriveSystemDetailOnce(item: { "car_base_info_id": number }) {
        try {
            let result = await axios.post(
                "http://127.0.0.1:8000/traditional_four_wheel_drive_system/detail_once",
                item
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }
    return {
        getTraditionalFourWheelDriveSystemModule,
        getTraditionalFourWheelDriveSystemModuleSonParameters,
        getTraditionalFourWheelDriveSystemModuleByModuleId,
        getTraditionalFourWheelDriveSystemData,
        getTraditionalFourWheelDriveSystemDetailOnce
    }
})
