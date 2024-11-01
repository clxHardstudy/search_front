import { ref, computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import axios from "axios";
import { API_BASE_URL } from "@/config/config";

export const useCarSearchStore = defineStore('carsearch', () => {

    async function updateWorkingConditions(item: { car_base_info_id: number, coordinate_system: number, data: {}, token: string }) {
        try {
            console.log(item);
            let result = await axios.post(
                `${API_BASE_URL}/working_conditions/update_detail_once`, // 使用 API_BASE_URL
                item
            );
            return result.data;
        } catch (error) {
            alert(error);
        }
    }

    async function updateSuspensionSystem(item: { car_base_info_id: number, coordinate_system: number, data: {}, token: string }) {
        try {
            console.log(item);
            let result = await axios.post(
                `${API_BASE_URL}/suspension_system/update_detail_once`, // 使用 API_BASE_URL
                item
            );
            return result.data;
        } catch (error) {
            alert(error);
        }
    }

    async function updateBrakingSystem(item: { car_base_info_id: number, coordinate_system: number, data: {}, token: string }) {
        try {
            console.log(item);
            let result = await axios.post(
                `${API_BASE_URL}/braking_system/update_detail_once`, // 使用 API_BASE_URL
                item
            );
            return result.data;
        } catch (error) {
            alert(error);
        }
    }

    async function updateSteeringSystem(item: { car_base_info_id: number, coordinate_system: number, data: {}, token: string }) {
        try {
            console.log(item);
            let result = await axios.post(
                `${API_BASE_URL}/steering_system/update_detail_once`, // 使用 API_BASE_URL
                item
            );
            return result.data;
        } catch (error) {
            alert(error);
        }
    }

    async function updateTraditionalFourWheelDriveSystem(item: { car_base_info_id: number, coordinate_system: number, data: {}, token: string }) {
        try {
            console.log(item);
            let result = await axios.post(
                `${API_BASE_URL}/traditional_four_wheel_drive_system/update_detail_once`, // 使用 API_BASE_URL
                item
            );
            return result.data;
        } catch (error) {
            alert(error);
        }
    }

    return {
        updateWorkingConditions,
        updateBrakingSystem,
        updateSteeringSystem,
        updateSuspensionSystem,
        updateTraditionalFourWheelDriveSystem
    };
});
