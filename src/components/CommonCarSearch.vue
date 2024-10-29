<template>
    <div class="car-data">
        <!-- 搜索表单区域 -->
        <div class="search-form">
            <el-form :inline="true" :model="formInline" class="demo-form-inline">
                <el-form-item label="轴距">
                    <el-input v-model="formInline.wheelbase" placeholder="示例：2880 或 2880-3000" clearable />
                </el-form-item>
                <el-form-item label="前轮距">
                    <el-input v-model="formInline.front_track" placeholder="示例：2880 或 2880-3000" clearable />
                </el-form-item>
                <el-form-item label="后轮距">
                    <el-input v-model="formInline.rear_track" placeholder="示例：2880 或 2880-3000" clearable />
                </el-form-item>
                <el-form-item>
                    <el-button plain type="primary" @click="onSubmit" :loading="isLoading">查询</el-button>
                </el-form-item>
            </el-form>
        </div>
        <!-- 表格显示区域 -->
        <div>
            <el-table :data="transformedCarBaseInfoList" style="width: 100%; table-layout: auto" height="400">
                <el-table-column fixed prop="id" label="序号" min-width="50" />
                <el-table-column fixed prop="name" label="车型名称" min-width="150" />
                <el-table-column prop="wheelbase" label="轴距" min-width="80" />
                <el-table-column prop="front_track" label="前轮距" min-width="80" />
                <el-table-column prop="rear_track" label="后轮距" min-width="80" />
                <el-table-column prop="price_range" label="售价区间" min-width="80" />
                <el-table-column prop="curb_weight" label="整备质量" min-width="80" />
                <el-table-column prop="maximum_front_axle_mass" label="前轴最大质量" min-width="100" />
                <el-table-column prop="maximum_rear_axle_mass" label="后轴最大质量" min-width="100" />
                <el-table-column prop="car_type_name" label="所属型号" min-width="100" />
                <el-table-column prop="platform_name" label="所属平台" min-width="100" />
                <el-table-column prop="release_date" label="发布时间" min-width="120" />

                <el-table-column label="操作" min-width="150" align="center">
                    <template #default="scope">
                        <el-button v-if="InfoRow === scope.row.id" type="danger" size="small" @click="handleExitInfo">
                            退出
                        </el-button>
                        <el-button v-else type="info" size="small" @click="handleInfo(scope.row)"
                            :disabled="InfoRow !== null || editingRow !== null">
                            查看
                        </el-button>
                        <el-button v-if="editingRow === scope.row.id" type="danger" size="small"
                            @click="handleExitEdit">
                            退出
                        </el-button>
                        <el-button v-else type="success" size="small" @click="handleEdit(scope.row)"
                            :disabled="InfoRow !== null || editingRow !== null">
                            编辑
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <el-divider />
        <!-- 只有当有行在编辑时，显示工况详情的表单 -->
        <div class="form-container"
            v-if="(editingRow !== null || InfoRow !== null) && finalModuleResult.title.length > 0">
            <el-form-item label="模块">
                <el-select class="modulesSelect" v-model="value" placeholder="选择模块：默认为前模块" style="width: 33%">
                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>

            <!-- 外层容器，控制整个 flex 布局 -->
            <div class="form-row">
                <div v-for="(titleItem, index) in finalModuleResult.title" :key="index" class="form-column">
                    <h3>{{ titleItem.module.name }}</h3>
                    <el-form :model="finalModuleResult.data" label-width="auto">
                        <el-form-item v-for="(detail, detailIndex) in titleItem.moduleSonParameters" :key="detailIndex"
                            :label="detail.name">
                            <el-input v-model="finalModuleResult.data[value][titleItem.module.name_en][detail.name_en]"
                                :disabled="Boolean(InfoRow)" />
                        </el-form-item>
                    </el-form>
                </div>
            </div>

            <el-form-item class="btn" v-if="editingRow !== null && finalModuleResult.title.length > 0">
                <el-button :plain="true" type="primary" :loading="isLoadingSubmitWorkingConditions"
                    @click="onSubmitEdit">提交</el-button>
            </el-form-item>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, reactive, onMounted, watch, ref, nextTick } from "vue";
import { useCarBaseInfoStore } from "../stores/carbaseinfo";
import { useWorkingConditionsStore } from "../stores/workingconditions";
import { useSuspensionSystemStore } from "@/stores/suspension_system";
import { useBrakingSystemStore } from "@/stores/braking_system";
import { useSteeringSystemStore } from "@/stores/steering_system";
import { useTraditionalFourWheelDriveSystemStore } from "@/stores/traditional_four_wheel_drive_system";
import { useCarSearchStore } from "@/stores/carsearch";
import { storeToRefs } from "pinia";
import { ElNotification } from 'element-plus'
import { da, de } from "element-plus/es/locales.mjs";
import { SCOPE } from "element-plus";

// 从 carBaseInfoStore 中获取汽车基本信息相关的函数和状态
const carBaseInfoStore = useCarBaseInfoStore();
const { carBaseInfoSelectIdList } = storeToRefs(carBaseInfoStore)
const { carBaseInfoList, searchCarByMultipleConditionQuery, searchNewCarByMultipleConditionQuery } = carBaseInfoStore;

// 从 workingConditionsStore 中获取工况相关的状态
const workingConditionsStore = useWorkingConditionsStore();
const SuspensionSystemStore = useSuspensionSystemStore();
const brakingSystemStore = useBrakingSystemStore();
const steeringSystemStore = useSteeringSystemStore();
const traditionalFourWheelDriveSystemStore = useTraditionalFourWheelDriveSystemStore();

const { getSuspensionSystemDetailOnce } = SuspensionSystemStore
const { getBrakingSystemDetailOnce } = brakingSystemStore
const { getSteeringSystemDetailOnce } = steeringSystemStore
const { getTraditionalFourWheelDriveSystemDetailOnce } = traditionalFourWheelDriveSystemStore

const { workingConditionsList } = storeToRefs(workingConditionsStore); // 工况列表
const { getWorkingConditionDetailOnce, getWorkingConditionDetailTitle } = workingConditionsStore
const { selectedCarTypeId_ts, selectedPlatformList_ts, selectedModuleId_ts } = storeToRefs(carBaseInfoStore); // 选中的车型类型 ID

const carSearchStore = useCarSearchStore()
const { updateWorkingConditions, updateBrakingSystem, updateSteeringSystem, updateSuspensionSystem, updateTraditionalFourWheelDriveSystem } = carSearchStore

// 定义表单相关的状态
const formInline = reactive({
    wheelbase: "",
    front_track: "",
    rear_track: "",
});

// 加载状态
const isLoading = ref(false); // 查询按钮的加载状态
const isLoadingSubmitWorkingConditions = ref(false)

// 转换后的汽车基本信息列表，计算汽车类型名称和平台名称
const transformedCarBaseInfoList = computed(() => {
    const platformMap: { [key: number]: string } = {
        1: "T1X",
        2: "T2X",
        3: "E0X",
        4: "M1X",
        5: "Benchmark",
    };
    const CarTypeMap: { [key: number]: string } = {
        1: "SD",
        2: "SUV",
        3: "MPV",
    };
    return carBaseInfoList.map((item) => ({
        ...item,
        car_type_name: CarTypeMap[item.car_type_id as keyof typeof CarTypeMap] || "未知",
        platform_name: platformMap[item.platform_id as keyof typeof platformMap] || "未知", // 显式转换 platform_id 的类型
    }));
});
// 车型查询按钮点击事件
const onSubmit = async () => {
    try {
        isLoading.value = true; // 设置加载状态
        const data = await searchNewCarByMultipleConditionQuery({
            car_type_id: Number(selectedCarTypeId_ts.value),
            platform_id_list: selectedPlatformList_ts.value,
            wheelbase: formInline.wheelbase,
            front_track: formInline.front_track,
            rear_track: formInline.rear_track,
            car_base_info_id_list: carBaseInfoSelectIdList.value
        });
        carBaseInfoStore.carBaseInfoList.splice(0, carBaseInfoStore.carBaseInfoList.length, ...data); // 更新表格数据
    } finally {
        isLoading.value = false; // 查询完成后，取消加载状态
        ElNotification({
            title: '状态：查询成功！',
            message: `共查询到 ${carBaseInfoStore.carBaseInfoList.length} 条数据。`,  // 显示查询到的数量
            type: 'success',
        })

    }
};


const moduleSystemList = ref();
const moduleData = ref<any>({ front: {}, rear: {} });
const car_base_info_id = ref("")


// 这里是查看和编辑按钮逻辑
// 定义当前正在查看的行的 ID
const InfoRow = ref<number | null>(null); // 当前查看的行 ID，默认为 null
// 定义当前正在编辑的行的 ID
const editingRow = ref<number | null>(null); // 当前编辑的行 ID，默认为 null

// 编辑按钮点击事件
const handleEdit = async (row: any) => {
    try {
        editingRow.value = row.id; // 设置当前正在编辑的行 ID
        car_base_info_id.value = row.id
        await fetchData(row);
        console.log("开始编辑行：", row.id);
        await fetchModuleData();
    } catch (error) {
        console.error("编辑过程中出现错误", error);
    }
};
// 退出编辑按钮点击事件
const handleExitEdit = () => {
    editingRow.value = null; // 退出编辑，将编辑行重置为 null
    finalModuleResult.title = []; // 清空工况详情内容
    value.value = "front"
};


// 查看按钮点击事件
const handleInfo = async (row: any) => {
    try {
        InfoRow.value = row.id; // 设置当前正在编辑的行 ID
        car_base_info_id.value = row.id
        await fetchData(row);
        console.log("开始查看行：", row.id);
        console.log("moduleData.value: ", moduleData.value)
        await fetchModuleData();
    } catch (error) {
        console.error("查看过程中出现错误", error);
    }
};
// 退出查看按钮点击事件
const handleExitInfo = () => {
    InfoRow.value = null; // 退出编辑，将编辑行重置为 null
    finalModuleResult.title = []
    value.value = "front"
};


// 定义一个异步函数来获取数据
const fetchData = async (row: any) => {
    if (selectedModuleId_ts.value == "1") {
        try {
            // 等待异步操作完成，并将结果赋值给 data.value
            moduleData.value = await getWorkingConditionDetailOnce({ "car_base_info_id": row.id });
            console.log(moduleData.value)
        } catch (error) {
            console.error('获取数据失败', error);
        }
    } else if (selectedModuleId_ts.value == "2") {
        try {
            console.log("11111111")
            moduleData.value = await getSuspensionSystemDetailOnce({ "car_base_info_id": row.id });
            console.log("moduleSonData: ", moduleData.value)
        } catch (error) {
            console.error('获取数据失败', error);
        }
    } else if (selectedModuleId_ts.value == "3") {
        try {
            moduleData.value = await getBrakingSystemDetailOnce({ "car_base_info_id": row.id });
            console.log("moduleSonData: ", moduleData.value)
        } catch (error) {
            console.error('获取数据失败', error);
        }
    } else if (selectedModuleId_ts.value == "4") {
        try {
            moduleData.value = await getSteeringSystemDetailOnce({ "car_base_info_id": row.id });
        } catch (error) {
            console.error('获取数据失败', error);
        }
    } else if (selectedModuleId_ts.value == "5") {
        try {
            moduleData.value = await getTraditionalFourWheelDriveSystemDetailOnce({ "car_base_info_id": row.id });
        } catch (error) {
            console.error('获取数据失败', error);
        }
    }
};

// 组件挂载时，初始化数据
onMounted(async () => {
    const data = await workingConditionsStore.getWorkingConditions(); // 获取工况列表数据
    console.log(data);
    // moduleSystemList 替换 workingConditionsList
    moduleSystemList.value = data.sort((x: any, y: any) => x.id - y.id); // 根据工况 ID 对工况列表排序
    console.log(moduleSystemList.value)
    await nextTick(); // 等待 DOM 更新
    carBaseInfoSelectIdList.value.length = 0; // 清空数组
    selectedCarTypeId_ts.value = ""
    selectedPlatformList_ts.value = []
});

watch(
    selectedModuleId_ts,
    async (newVal) => {
        if (newVal == "1") {
            const data = await workingConditionsStore.getWorkingConditions(); // 获取工况列表数据
            moduleSystemList.value = data.sort((x: any, y: any) => x.id - y.id); // 根据工况 ID 对工况列表排序
        }
        else if (newVal == "2") {
            const data = await SuspensionSystemStore.getSuspensionSystemModule();
            moduleSystemList.value = data.sort((x: any, y: any) => x.id - y.id);
        }
        else if (newVal == "3") {
            const data = await brakingSystemStore.getBrakingSystemModule();
            moduleSystemList.value = data.sort((x: any, y: any) => x.id - y.id);
        }
        else if (newVal == "4") {
            const data = await steeringSystemStore.getSteeringSystemModule();
            moduleSystemList.value = data.sort((x: any, y: any) => x.id - y.id);
        }
        else if (newVal == "5") {
            const data = await traditionalFourWheelDriveSystemStore.getTraditionalFourWheelDriveSystemModule();
            moduleSystemList.value = data.sort((x: any, y: any) => x.id - y.id);
        }
        await nextTick(); // 等待 DOM 更新
        // carBaseInfoSelectIdList.value.length = 0; // 清空数组
        // selectedCarTypeId_ts.value = ""
        // selectedPlatformList_ts.value = []
    }
);

// 定义 value 为 'front' | 'rear'
const value = ref<'front' | 'rear'>('front');
const options = [
    {
        value: 'front',
        label: '前模块',
    },
    {
        value: 'rear',
        label: '后模块',
    },
];


// 定义接口类型，表示每个 detailList 项的结构
interface DetailItem {
    id: number;
    name: string;
    name_en: string;
}

// 定义工况详情的数据结构
interface ConditionDetails {
    name: string;
    details: string[];
}

interface ConditionDetailsEn {
    name_en: string;
    details: string[];
}

// 定义工况详细数据的结构，允许用字符串作为索引
interface WorkingConditionData {
    front: Record<string, any>;
    rear: Record<string, any>;
}

// 定义 `finalResult` 的类型
const finalResult = reactive({
    name: [] as ConditionDetails[],  // 存储工况的 name
    name_en: [] as ConditionDetailsEn[],  // 存储工况的 name_en
    data: {
        front: {} as Record<string, any>,  // front 的数据是以 name_en 作为键的对象
        rear: {} as Record<string, any>    // rear 的数据也是以 name_en 作为键的对象
    },
    title: [] as {
        workingCondition: { id: number, name: string, name_en: string };  // 每个工况的名称和英文名称
        workingConditionsDetails: { id: number, name: string, name_en: string }[];  // 工况的详细信息
    }[]
});

const fetchWorkingConditionsData = async () => {
    // 清空 finalResult.title 防止数据重复
    finalResult.title = [];
    // 遍历工况列表
    for (const condition of moduleSystemList.value) {
        const id = condition.id;
        const dataKey = condition.name_en; // 工况的英文名作为键
        try {
            // 请求接口获取详细数据
            const response = await workingConditionsStore.getWorkingConditionDetailTitle({ working_conditions_list: [id] });
            // console.log("response: ",response)
            const detailList: DetailItem[] = response[id]; // 接口返回的工况详细信息
            // 构建 finalResult.title
            finalResult.title.push({
                workingCondition: {
                    id: condition.id,
                    name: condition.name,
                    name_en: condition.name_en
                },
                workingConditionsDetails: detailList.map((detail) => ({
                    id: detail.id,
                    name: detail.name,
                    name_en: detail.name_en
                }))
            });
            // 初始化 front 和 rear 两个部分的数据
            ['front', 'rear'].forEach((levelKey) => {
                // 如果外层 front 或 rear 对象不存在，初始化
                if (!finalResult.data[levelKey as 'front' | 'rear']) {
                    finalResult.data[levelKey as 'front' | 'rear'] = {};
                }
                // 如果 detail 存在于 workingConditionsData 中，初始化相应的键值
                const conditionData = moduleData.value[levelKey]?.[dataKey]?.[0] || {};
                finalResult.data[levelKey as 'front' | 'rear'][dataKey] = {};

                detailList.forEach((detail) => {
                    const detailKey = detail.name_en;
                    finalResult.data[levelKey as 'front' | 'rear'][dataKey][detailKey] = conditionData[detailKey] || "";
                });
            });
        } catch (error) {
            console.error(`获取ID为${id}的工况详细信息失败`, error);
        }
    }
};

const onSubmitEdit = async () => {
    try {
        isLoadingSubmitWorkingConditions.value = true;
        await updateModuleSystemData();
    } finally {
        isLoadingSubmitWorkingConditions.value = false;
        ElNotification({
            title: '状态：数据提交成功！',
            message: `成功修改 车型名称:${car_base_info_id.value} 的K&C数据。`,  // 显示查询到的数量
            type: 'success',
        })
    }
};

async function updateModuleSystemData() {
    const coordinate_system = value.value === 'front' ? 0 : 1; // 根据选中的模块确定 coordinate_system 的值
    if (selectedModuleId_ts.value == '1') {
        updateWorkingConditions({
            car_base_info_id: Number(car_base_info_id.value),
            coordinate_system: coordinate_system, // 动态设置 coordinate_system
            data: finalModuleResult.data[value.value]
        });
        console.log('更新K&C模块')
    } else if (selectedModuleId_ts.value == '2') {
        updateSuspensionSystem({
            car_base_info_id: Number(car_base_info_id.value),
            coordinate_system: coordinate_system, // 动态设置 coordinate_system
            data: finalModuleResult.data[value.value]
        });
        console.log('更新悬架模块')
    } else if (selectedModuleId_ts.value == '3') {
        updateBrakingSystem({
            car_base_info_id: Number(car_base_info_id.value),
            coordinate_system: coordinate_system, // 动态设置 coordinate_system
            data: finalModuleResult.data[value.value]
        });
        console.log('更新制动模块')
    }
    else if (selectedModuleId_ts.value == '4') {
        updateSteeringSystem({
            car_base_info_id: Number(car_base_info_id.value),
            coordinate_system: coordinate_system, // 动态设置 coordinate_system
            data: finalModuleResult.data[value.value]
        });
        console.log('更新转向模块')
    } else if (selectedModuleId_ts.value == '5') {
        updateTraditionalFourWheelDriveSystem({
            car_base_info_id: Number(car_base_info_id.value),
            coordinate_system: coordinate_system, // 动态设置 coordinate_system
            data: finalModuleResult.data[value.value]
        });
        console.log('更新传动四驱模块')
    }
}

// 定义 `finalModuleResult` 的类型
const finalModuleResult = reactive({
    data: {
        front: {} as Record<string, any>,  // front 的数据是以 name_en 作为键的对象
        rear: {} as Record<string, any>    // rear 的数据也是以 name_en 作为键的对象
    },
    title: [] as {
        module: { id: number, name: string, name_en: string };
        moduleSonParameters: { id: number, name: string, name_en: string }[];
    }[]
});

const fetchModuleData = async () => {
    // 清空 finalModuleResult.title 防止数据重复
    finalModuleResult.title = [];
    finalModuleResult.data = { "front": {}, "rear": {} };
    // 遍历工况列表
    for (const moduleDataOne of moduleSystemList.value) {
        const id = moduleDataOne.id;
        const dataKey = moduleDataOne.name_en; // 工况的英文名作为键
        let response;
        try {
            // 请求接口获取详细数据
            if (selectedModuleId_ts.value == "1") {
                response = await workingConditionsStore.getWorkingConditionDetailTitle({ working_conditions_list: [id] });
            } else if (selectedModuleId_ts.value == "2") {
                response = await SuspensionSystemStore.getSuspensionSystemModuleByModuleId({ module_data_id_list: [id] })
            } else if (selectedModuleId_ts.value == "3") {
                response = await brakingSystemStore.getBrakingSystemModuleByModuleId({ module_data_id_list: [id] })
            } else if (selectedModuleId_ts.value == "4") {
                response = await steeringSystemStore.getSteringSystemModuleByModuleId({ module_data_id_list: [id] })
            } else if (selectedModuleId_ts.value == "5") {
                response = await traditionalFourWheelDriveSystemStore.getTraditionalFourWheelDriveSystemModuleByModuleId({ module_data_id_list: [id] })
            }
            // console.log("response: ",response)
            const detailList: DetailItem[] = response[id]; // 接口返回的工况详细信息
            // 构建 finalResult.title
            finalModuleResult.title.push({
                module: {
                    id: moduleDataOne.id,
                    name: moduleDataOne.name,
                    name_en: moduleDataOne.name_en
                },
                moduleSonParameters: detailList.map((detail) => ({
                    id: detail.id,
                    name: detail.name,
                    name_en: detail.name_en
                }))
            });
            // 初始化 front 和 rear 两个部分的数据
            ['front', 'rear'].forEach((levelKey) => {
                // 如果外层 front 或 rear 对象不存在，初始化
                if (!finalModuleResult.data[levelKey as 'front' | 'rear']) {
                    finalModuleResult.data[levelKey as 'front' | 'rear'] = {};
                }
                const moduleDataOne = moduleData.value[levelKey]?.[dataKey]?.[0] || {};
                finalModuleResult.data[levelKey as 'front' | 'rear'][dataKey] = {};

                detailList.forEach((detail) => {
                    const detailKey = detail.name_en;
                    finalModuleResult.data[levelKey as 'front' | 'rear'][dataKey][detailKey] = moduleDataOne[detailKey] || "";
                });
            });
        } catch (error) {
            console.error(`获取ID为${id}的工况详细信息失败`, error);
        }
    }
    console.log("finalModuleResult: ", finalModuleResult)
};
</script>


<style scoped>
/* Flex 布局 */
.car-data {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow-y: auto;
}

/* 表格 */
.el-table {
    border: 1px solid #dcdfe6;
    /* 设置表格的边框 */
    border-radius: 4px;
    /* 设置圆角边框 */
}

.el-table th,
.el-table td {
    border: 1px solid #dcdfe6;
    /* 设置表头和单元格的边框 */
}

.el-table thead {
    background-color: #f5f7f9;
    /* 设置表头背景色 */
}

/* search-form表单 */
.demo-form-inline .el-input {
    --el-input-width: 220px;
}

.demo-form-inline .el-select {
    --el-select-width: 220px;
}

.table-container {
    flex: 1;
    overflow-y: auto;
}

.form-container {
    padding: 16px;
    min-height: 1500px;
}

.edit-form {
    background-color: #fff;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.form-container {
    padding: 16px;
}

/* 控制每三个元素换一行 */
.form-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    /* 设置元素之间的间距 */
}

.form-column {
    flex: 1 1 calc(33.33% - 16px);
    /* 每列占 33.33% 的宽度，减去间距 */
    max-width: calc(33.33% - 16px);
    /* 设置最大宽度 */
    box-sizing: border-box;
    /* 包括内边距和边框在内 */
    height: 300px;
    /* 设置固定高度 */
    overflow-y: auto;
    /* 溢出时显示滚动条 */
    background-color: #f9f9f9;
    /* 可选：设置背景色以区分盒子 */
    border: 1px solid #ddd;
    /* 可选：设置边框以区分盒子 */
    border-radius: 4px;
    /* 可选：设置圆角 */
    padding: 16px;
    /* 可选：设置内边距 */
}

@media (max-width: 768px) {

    /* 针对小屏幕做自适应布局，每行显示两个元素 */
    .form-column {
        flex: 1 1 calc(50% - 16px);
        /* 每列占 50% 的宽度 */
        max-width: calc(50% - 16px);
        /* 设置最大宽度 */
    }
}

@media (max-width: 480px) {

    /* 针对更小的屏幕，每行显示一个元素 */
    .form-column {
        flex: 1 1 100%;
        /* 每列占 100% 的宽度 */
        max-width: 100%;
        /* 设置最大宽度 */
    }
}

.btn {
    margin-top: 20px;
}

.modulesSelect {
    margin-bottom: 20px;
}
</style>