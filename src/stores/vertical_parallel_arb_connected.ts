import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from "axios";

// 定义 CarType 的类型
interface verticalParallelARBConnected {
    id: number;
    wheel_rate: string;
    vertical_force_hysteresis: string;
    ride_frequency_no_tyre: string;
    ride_rate: string;
    ride_frequency_with_tyre: string;
    tyre_radial_rate: string;
    toe_angle_change: string;
    camber_change: string;
    spin_angle_change: string;
    kinematic_oll_centre_height: string;
    fore_aft_displacement_wc: string;
    fore_aft_displacement_tcp: string;
    car_type_id: number;
    coordinate_system: number;
    car_base_info_id: number;
}

export const useVerticalParallelARBConnectedStore = defineStore('verticalParallelARBConnected', () => {
    // 使用 CarType 类型定义 carTypeList
    const verticalParallelARBConnectedList = reactive<verticalParallelARBConnected[]>([]);

    async function getVerticalParallelARBConnected(item_id: number) {
        try {
            // 使用反引号包裹字符串并插入 item_id
            let result = await axios.get(
                `http://127.0.0.1:8000/vertical_parallel_arb_connected/car_type/${item_id}`
            );
            // console.log(result.data);
            return result.data;
        } catch (error) {
            console.error("Error fetching data:", error); // 使用 console.error 记录错误详情
            alert("An error occurred while fetching data. Please try again."); // 提示用户错误发生
        }
    }

    return { verticalParallelARBConnectedList, getVerticalParallelARBConnected }
})