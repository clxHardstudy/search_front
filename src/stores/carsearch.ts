import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from "axios";


export const useCarSearchStore = defineStore('carsearch', () => {

    async function updateWorkingConditions(item: { car_base_info_id: number, coordinate_system: number, data: {} }) {
        try {
            console.log(item)
            let result = await axios.post(
                "http://127.0.0.1:8000/working_conditions/update_detail_once",
                item
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function updateSuspensionSystem(item: { car_base_info_id: number, coordinate_system: number, data: {} }) {
        try {
            console.log(item)
            let result = await axios.post(
                "http://127.0.0.1:8000/suspension_system/update_detail_once",
                item
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }

    async function updateBrakingSystem(item: { car_base_info_id: number, coordinate_system: number, data: {} }) {
        try {
            console.log(item)
            let result = await axios.post(
                "http://127.0.0.1:8000/braking_system/update_detail_once",
                item
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }
    async function updateSteeringSystem(item: { car_base_info_id: number, coordinate_system: number, data: {} }) {
        try {
            console.log(item)
            let result = await axios.post(
                "http://127.0.0.1:8000/steering_system/update_detail_once",
                item
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }
    async function updateTraditionalFourWheelDriveSystem(item: { car_base_info_id: number, coordinate_system: number, data: {} }) {
        try {
            console.log(item)
            let result = await axios.post(
                "http://127.0.0.1:8000/traditional_four_wheel_drive_system/update_detail_once",
                item
            );
            return result.data
        } catch (error) {
            alert(error)
        }
    }
    return {
        updateWorkingConditions, updateBrakingSystem,
        updateSteeringSystem, updateSuspensionSystem,
        updateTraditionalFourWheelDriveSystem
    }
})