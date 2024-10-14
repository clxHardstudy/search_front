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

    return { updateWorkingConditions }
})