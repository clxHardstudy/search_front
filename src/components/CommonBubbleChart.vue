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
            <el-table :data="transformedCarBaseInfoList" style="width: 100%; table-layout: auto" height="300">
                <el-table-column fixed prop="id" label="序号" min-width="100" />
                <el-table-column fixed prop="name" label="车型名称" min-width="200" />
                <el-table-column prop="wheelbase" label="轴距" min-width="80" />
                <el-table-column prop="front_track" label="前轮距" min-width="80" />
                <el-table-column prop="rear_track" label="后轮距" min-width="80" />
                <el-table-column prop="price_range" label="售价区间" min-width="120" />
                <el-table-column prop="curb_weight" label="整备质量" min-width="120" />
                <el-table-column prop="maximum_front_axle_mass" label="前轴最大质量" min-width="120" />
                <el-table-column prop="maximum_rear_axle_mass" label="后轴最大质量" min-width="120" />
                <el-table-column prop="car_type_name" label="所属型号" min-width="100" />
                <el-table-column prop="platform_name" label="所属平台" min-width="100" />
                <el-table-column prop="release_date" label="发布时间" min-width="150" />
            </el-table>
        </div>

        <el-divider />

        <!-- 工况选择区域 -->
        <div class="working-conditions">
            <el-form :model="formModules" label-width="auto" class="flex-container">
                <!-- 左侧：工况选择部分 -->
                <div class="left-column">
                    <!-- 坐标选择 -->
                    <el-form-item label="模块">
                        <el-select v-model="formModules.coordinate" placeholder="选择模块：默认为前模块" style="width: 66%;">
                            <el-option label="前模块" value="0" />
                            <el-option label="后模块" value="1" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="横坐标">
                        <el-select v-model="seletedHorizontalAxis" multiple clearable collapse-tags placeholder="请选择横坐标"
                            popper-class="custom-header" :max-collapse-tags="1" style="width: 66%;">
                            <template #header>
                                <el-checkbox v-model="checkAll" :indeterminate="indeterminate" @change="handleCheckAll">
                                    全选
                                </el-checkbox>
                            </template>
                            <el-option v-for="item in HorizontalAxis" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <!-- 工况选择 -->
                    <el-form-item label="工况" v-if="isKcModule">
                        <el-checkbox-group v-model="formModules.moduleTitle">
                            <!-- 遍历工况列表，动态生成复选框 -->
                            <el-checkbox v-for="condition in workingConditionsList" :key="condition.id"
                                :value="condition.id">
                                {{ condition.name }}
                            </el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </div>

                <!-- 右侧：工况详细信息 -->
                <div class="right-column" :style="{ maxHeight: leftColumnHeight + 'px', overflowY: 'auto' }"
                    v-if="isKcModule">
                    <el-form-item label="工况详细">
                        <div v-for="detail in selectedWorkingConditions" :key="detail.id">
                            <!-- 工况标题 -->
                            <span style="margin-right: 10px;">{{ detail.name }}</span>
                            <el-checkbox :value="detail.id" v-model="allSelected[detail.id]"
                                @change="toggleSelectAll(detail.id, allSelected[detail.id])">全选</el-checkbox>
                            <!-- 工况详细内容 -->
                            <el-checkbox-group v-model="formModules.moduleSonParameters">
                                <el-checkbox v-for="workingConditionsDetail in workingConditionsDetailObj[detail.id]"
                                    :key="workingConditionsDetail.id"
                                    :value="`${detail.id}-${workingConditionsDetail.id}`"
                                    @change="updateSelectAllState(detail.id)">
                                    {{ workingConditionsDetail.name }}
                                </el-checkbox>
                            </el-checkbox-group>
                        </div>
                    </el-form-item>
                </div>
            </el-form>

            <!-- 提交按钮 -->
            <div class="form-actions">
                <el-button :plain="true" type="primary" @click="onSubmitDifferentModule"
                    :loading="isLoadingWorkingConditions">查询</el-button>
            </div>
        </div>


        <!-- echart表格区域 -->
        <div class="echarts">
            <div id="main" ref="chartDom"></div>
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
import { useFilterDataStore } from "@/stores/filterdata";
import { storeToRefs } from "pinia";
import { ElNotification } from 'element-plus'
import type { CheckboxValueType } from 'element-plus'
import * as echarts from 'echarts';
import { tr } from "element-plus/es/locales.mjs";

// 从 carBaseInfoStore 中获取汽车基本信息相关的函数和状态
const carBaseInfoStore = useCarBaseInfoStore();
const { carBaseInfoSelectIdList } = storeToRefs(carBaseInfoStore)
const { carBaseInfoList, searchNewCarByMultipleConditionQuery } = carBaseInfoStore;

// 从 workingConditionsStore 中获取工况相关的状态
const workingConditionsStore = useWorkingConditionsStore();
const { workingConditionsList } = storeToRefs(workingConditionsStore); // 工况列表
const { selectedCarTypeId_ts, selectedPlatformList_ts, selectedModuleId_ts } = storeToRefs(carBaseInfoStore); // 选中的车型类型 ID

const suspensionSystemStore = useSuspensionSystemStore()
const brakingSystemStore = useBrakingSystemStore()
const steeringSystemStore = useSteeringSystemStore()
const traditionalFourWheelDriveSystemStore = useTraditionalFourWheelDriveSystemStore()

const filterDataStore = useFilterDataStore();
const { groupWorkingConditionsDetail, extractWorkingConditionsDetails, updateKeyNames, filterDataByRequiredKeys } = filterDataStore

// 定义表单相关的状态
const formInline = reactive({
    // name: "",
    wheelbase: "",
    front_track: "",
    rear_track: "",
}); // 车型名称和轴距的表单数据

// 定义表单工作条件类型
interface FormModules {
    coordinate: string;
    moduleTitle: number[];
    moduleSonParameters: string[]; // 明确类型
    seletedHorizontalAxis: string[]
}
// 初始化表单工作条件
const formModules = reactive<FormModules>({
    coordinate: '0',
    moduleTitle: [],
    moduleSonParameters: [],
    seletedHorizontalAxis: [],
});

interface TableDataModuleItem {
    moduleTitle: string;
    moduleSonParameters: string;
    [key: string]: any; // 允许动态属性，如 car1, car2 等
}

// 定义多个车基信息的类型
interface MultipleWheelbase {
    car_base_info_id: number;
    front_track: number | null;
    name: string;
    rear_track: number | null;
    wheelbase: number;
}

const tableDataModule = ref<TableDataModuleItem[]>([]);


// 加载状态
const isLoading = ref(false); // 查询按钮的加载状态
const isLoadingWorkingConditions = ref(false); // 工况查询按钮的加载状态
const leftColumnHeight = ref(0); // 左侧工况选择区域的高度，用于设置右侧滚动区域的最大高度

const isKcModule = ref(true)
const isSuspensionModule = ref(false)
const isBrakingSystemModule = ref(false)
const isSteeringSystemModule = ref(false)
const isTraditionalFourWheelDriveSystemModule = ref(false)

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

// 获取选中的汽车 ID 列表
const car_id_list = computed(() => carBaseInfoList.map(car => car.id));

// 定义选中的工况详细信息的类型
interface ConditionDetail {
    id: number;
    name: string;
    name_en: string;
}
// 监听工况选择的变化，并更新工况详细内容
const workingConditionsDetailObj = ref<{ [key: number]: any[] }>({});
const selectedWorkingConditions = ref<ConditionDetail[]>([]); // 显式定义类型为 ConditionDetail 数组

// 定义模块通用参数类型
interface ModuleDetail {
    id: number;
    name: string;
    name_en: string;
}
const selectedModuleDetail = ref<ModuleDetail[]>([]); // 显式定义类型为 ModuleSonParameterDetail 数组
const selectedModuleSonParameters = ref<{ [key: number]: any[] }>({});

// 监听工况复选框的变化，动态更新右侧的工况详细信息
watch(
    () => formModules.moduleTitle,
    async (newSelectedConditions, oldSelectedConditions = []) => {
        // console.log(newSelectedConditions,oldSelectedConditions)
        // 找到取消选择的工况
        const deselectedConditions = oldSelectedConditions.filter(id => !newSelectedConditions.includes(id));
        // 移除取消选择的工况详细信息
        if (deselectedConditions.length) {
            formModules.moduleSonParameters = formModules.moduleSonParameters.filter(
                (detailId) => !deselectedConditions.some(deselectedId => String(detailId).startsWith(`${deselectedId}-`))
            );
        }
        // 更新选中的工况详细信息
        selectedWorkingConditions.value = newSelectedConditions.map((conditionId) => {
            const foundCondition = workingConditionsList.value.find((condition) => condition.id === conditionId);
            return foundCondition ? { id: foundCondition.id, name: foundCondition.name, name_en: foundCondition.name_en } : null;
        }).filter(condition => condition !== null) as ConditionDetail[]; // 使用类型断言确保类型匹配
        console.log("选择的工况：", selectedWorkingConditions.value)
        // 获取选中工况的详细标题
        const response = await workingConditionsStore.getWorkingConditionDetailTitle({ working_conditions_list: newSelectedConditions });
        workingConditionsDetailObj.value = response;
        console.log("工况详细：", response)

    },
    { immediate: true } // 在组件加载时立即执行
);

watch(
    () => selectedModuleId_ts.value,
    async (newValue) => {
        tableDataModule.value = []
        // 重置所有模块为 false
        const resetModules = () => {
            isKcModule.value = false;
            isSuspensionModule.value = false;
            isBrakingSystemModule.value = false;
            isSteeringSystemModule.value = false;
            isTraditionalFourWheelDriveSystemModule.value = false;
        };
        // 调用重置函数
        resetModules();
        // selectedWorkingConditions.value = []
        // workingConditionsDetailObj.value = []

        // 根据 newValue 设置对应的模块为 true
        switch (String(newValue)) {
            case "1":
                isKcModule.value = true;
                break;
            case "2":
                isSuspensionModule.value = true;
                break;
            case "3":
                isBrakingSystemModule.value = true;
                break;
            case "4":
                isSteeringSystemModule.value = true;
                break;
            case "5":
                isTraditionalFourWheelDriveSystemModule.value = true;
                break;
        }
    }
);

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
        })
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


// 定义相关类型
type WorkingConditionDetail = { [key: string]: any }; // 根据实际数据结构定义


type TransformedDataItem = {
    data: { [key: string]: any },
    moduleTitle: string,
    moduleSonParameters: string,
    workingConditionEn: string,
    workingConditionDetailEn: string;[key: string]: any
};

const finalData = ref<{ [key: string]: any }>({}); // 定义为 ref 对象
let finalDataSon: { [key: string]: { [key: string]: any[] } } = {}; // 确保定义为包含数组的对象

const onSubmitDifferentModule = async () => {
    if (selectedModuleId_ts.value === "1") {
        let workingConditionsDetailGrouped: { [key: string]: any } = {}; // 在函数顶部声明变量
        try {
            isLoadingWorkingConditions.value = true; // 设置工况查询按钮加载状态
            // 获取轴距轮距数据
            const multipleWheelbase: MultipleWheelbase[] = await carBaseInfoStore.getMultipleWheelbase({ car_base_info_id_list: car_id_list.value });
            console.log("multipleWheelbase: ", multipleWheelbase);
            const data: WorkingConditionDetail[] = await workingConditionsStore.getWorkingConditionDetail({
                car_id_list: car_id_list.value,
                coordinate_system: formModules.coordinate,
                working_conditions_list: formModules.moduleTitle
            });
            // console.log("KC数据：", data);
            // 分组工况详细ID
            workingConditionsDetailGrouped = groupWorkingConditionsDetail(formModules.moduleSonParameters);
            // console.log("分组工况详细ID:", workingConditionsDetailGrouped);
            // 提取工况详细内容
            const extractedDetails = extractWorkingConditionsDetails(
                workingConditionsDetailGrouped,
                workingConditionsDetailObj.value
            );
            // console.log("提取工况详细内容:", extractedDetails);
            // 更新键名为英文名
            const newExtractedDetails = updateKeyNames(extractedDetails, selectedWorkingConditions.value);
            // console.log("更新键名为英文名:", newExtractedDetails);

            // 过滤出只包含需要的字段的数据，并确保包含car_base_info_id
            const filteredData = filterDataByRequiredKeys(newExtractedDetails, data);
            console.log("过滤后数据：", filteredData);

            const transformedData: TransformedDataItem[] = transformDataEcharts(filteredData);
            console.log("可以渲染表格的数据格式：", transformedData);

            // 合并数据的逻辑
            multipleWheelbase.forEach((multipleWheelbaseOnce: MultipleWheelbase) => {
                const carId = multipleWheelbaseOnce.car_base_info_id;
                transformedData.forEach(transformedDataOnce => {
                    const correspondingData = transformedDataOnce.data[carId]; // 查找对应的数据
                    if (correspondingData) {
                        // 如果找到了对应数据，就合并
                        transformedDataOnce.data[carId] = { ...correspondingData, ...multipleWheelbaseOnce }; // 合并数据
                    }
                });
            });

            console.log("transformedData: ", transformedData);

            seletedHorizontalAxis.value.forEach(element => {
                console.log("选择的横坐标为：", element);
                let eleKey = String(element);
                let resultList: any[] = []; // 避免每次迭代重新初始化

                transformedData.forEach(item => {
                    Object.values(item.data).forEach(data => {
                        let resultListOnce: any[] = [];
                        if (element === "1") {
                            console.log("这里是轴距：");
                            resultListOnce.push(data["wheelbase"]);
                            resultListOnce.push(data[item.workingConditionDetailEn]);
                            resultListOnce.push(data["wheelbase"]);
                            resultListOnce.push(data["name"]);
                            resultListOnce.push("轴距");
                        } else if (element === "2") {
                            console.log("这里是前轮距：");
                            resultListOnce.push(data["front_track"]);
                            resultListOnce.push(data[item.workingConditionDetailEn]);
                            resultListOnce.push(data["front_track"]);
                            resultListOnce.push(data["name"]);
                            resultListOnce.push("前轮距");
                        } else if (element === "3") {
                            console.log("这里是后轮距：");
                            resultListOnce.push(data["rear_track"]);
                            resultListOnce.push(data[item.workingConditionDetailEn]);
                            resultListOnce.push(data["rear_track"]);
                            resultListOnce.push(data["name"]);
                            resultListOnce.push("后轮距");
                        }
                        resultList.push(resultListOnce); // 将结果推入外层的 resultList
                    });

                    // 确保 finalDataSon[item.moduleTitle] 被初始化
                    if (!finalDataSon[item.moduleTitle]) {
                        finalDataSon[item.moduleTitle] = {}; // 初始化为一个空对象
                    }

                    // 确保 finalDataSon[item.moduleTitle][item.moduleSonParameters] 被初始化
                    if (!finalDataSon[item.moduleTitle][item.moduleSonParameters]) {
                        finalDataSon[item.moduleTitle][item.moduleSonParameters] = []; // 初始化为一个空数组
                    }

                    // 将 resultList 存入 finalDataSon
                    finalDataSon[item.moduleTitle][item.moduleSonParameters] = resultList;
                    resultList = []; // 重新初始化为数组
                });

                finalData.value[eleKey] = finalDataSon; // 更新 ref 对象的值
                finalDataSon = {}; // 重新初始化为对象
            });

            console.log("finalData: ", finalData.value);

            await nextTick(); // 等待 DOM 更新
            initChart(finalData);
        } finally {
            isLoadingWorkingConditions.value = false; // 工况查询完成后，取消加载状态
            if (selectedWorkingConditions.value.length === 0) {
                ElNotification({
                    title: '状态：查询失败！',
                    message: `请选择需要查询的工况！`,
                    type: 'warning',
                });
            } else if (Object.keys(workingConditionsDetailGrouped).length === 0) {
                ElNotification({
                    title: '状态：查询失败！',
                    message: `请选择待查询工况的工况详细！`,
                    type: 'warning',
                });
            } else {
                ElNotification({
                    title: '状态：查询成功！',
                    message: `K&C 参数查询成功`,
                    type: 'success',
                });
            }
        }
    } else if (selectedModuleId_ts.value === "2") {
        try {
            isLoadingWorkingConditions.value = true; // 设置工况查询按钮加载状态
            await dealSuspensionSystemModule();
        } finally {
            isLoadingWorkingConditions.value = false; // 工况查询完成后，取消加载状态
        }
    } else if (selectedModuleId_ts.value === "3") {
        try {
            isLoadingWorkingConditions.value = true; // 设置工况查询按钮加载状态
            await dealBrakingSystemModule();
        } finally {
            isLoadingWorkingConditions.value = false; // 工况查询完成后，取消加载状态
        }
    } else if (selectedModuleId_ts.value === "4") {
        try {
            isLoadingWorkingConditions.value = true; // 设置工况查询按钮加载状态
            await dealSteeringSystemModule();
        } finally {
            isLoadingWorkingConditions.value = false; // 工况查询完成后，取消加载状态
        }
    } else if (selectedModuleId_ts.value === "5") {
        try {
            isLoadingWorkingConditions.value = true; // 设置工况查询按钮加载状态
            await dealTraditionalFourWheelDriveSystemModule();
        } finally {
            isLoadingWorkingConditions.value = false; // 工况查询完成后，取消加载状态
        }
    }
};

function processModuleData(ModuleSonParametersData: any, ModuleData: any, Data: any) {
    // 更新键名为英文名
    const newExtractedDetails = updateKeyNames(ModuleSonParametersData, ModuleData);
    console.log("更新键名为英文名:", newExtractedDetails);
    // 打印过滤后的结果，调试用
    const filteredData = filterDataByRequiredKeys(newExtractedDetails, Data);
    console.log("过滤后数据：", filteredData);
    // 转换数据格式
    const transformedData = transformModuleData(filteredData);
    tableDataModule.value = transformedData;
    console.log("可以渲染表格的数据格式：", transformedData);
    // 生成索引分组
}

async function dealSuspensionSystemModule() {
    // 获取悬架系统所有所属子表
    const ModuleData = await suspensionSystemStore.getSuspensionSystemModule()
    // 获取悬架系统所有所属子表的参数
    const ModuleSonParametersData = await suspensionSystemStore.getSuspensionSystemModuleSonParameters()
    const Data = await suspensionSystemStore.getSuspensionSystemData({
        car_id_list: car_id_list.value,
        coordinate_system: formModules.coordinate,
    })

    console.log("模块信息：", ModuleData);
    selectedModuleDetail.value = ModuleData
    console.log("悬架系统所属子表参数：", ModuleSonParametersData);
    selectedModuleSonParameters.value = ModuleSonParametersData
    console.log("悬架系统数据：", Data);

    processModuleData(ModuleSonParametersData, ModuleData, Data)
}

async function dealBrakingSystemModule() {
    // 获取悬架系统所有所属子表
    const ModuleData = await brakingSystemStore.getBrakingSystemModule()
    // 获取悬架系统所有所属子表的参数
    const ModuleSonParametersData = await brakingSystemStore.getBrakingSystemModuleSonParameters()
    const Data = await brakingSystemStore.getBrakingSystemData({
        car_id_list: car_id_list.value,
        coordinate_system: formModules.coordinate,
    })

    console.log("模块信息：", ModuleData);
    selectedModuleDetail.value = ModuleData
    console.log("所属子表参数：", ModuleSonParametersData);
    selectedModuleSonParameters.value = ModuleSonParametersData
    console.log("模块数据：", Data);
    processModuleData(ModuleSonParametersData, ModuleData, Data)
}

async function dealSteeringSystemModule() {
    // 获取悬架系统所有所属子表
    const ModuleData = await steeringSystemStore.getSteeringSystemModule()
    // 获取悬架系统所有所属子表的参数
    const ModuleSonParametersData = await steeringSystemStore.getSteeringSystemModuleSonParameters()
    const Data = await steeringSystemStore.getSteeringSystemData({
        car_id_list: car_id_list.value,
        coordinate_system: formModules.coordinate,
    })

    console.log("模块信息：", ModuleData);
    selectedModuleDetail.value = ModuleData
    console.log("所属子表参数：", ModuleSonParametersData);
    selectedModuleSonParameters.value = ModuleSonParametersData
    console.log("模块数据：", Data);
    processModuleData(ModuleSonParametersData, ModuleData, Data)
}

async function dealTraditionalFourWheelDriveSystemModule() {
    // 获取悬架系统所有所属子表
    const ModuleData = await traditionalFourWheelDriveSystemStore.getTraditionalFourWheelDriveSystemModule()
    // 获取悬架系统所有所属子表的参数
    const ModuleSonParametersData = await traditionalFourWheelDriveSystemStore.getTraditionalFourWheelDriveSystemModuleSonParameters()
    const Data = await traditionalFourWheelDriveSystemStore.getTraditionalFourWheelDriveSystemData({
        car_id_list: car_id_list.value,
        coordinate_system: formModules.coordinate,
    })

    console.log("模块信息：", ModuleData);
    selectedModuleDetail.value = ModuleData
    console.log("所属子表参数：", ModuleSonParametersData);
    selectedModuleSonParameters.value = ModuleSonParametersData
    console.log("模块数据：", Data);
    processModuleData(ModuleSonParametersData, ModuleData, Data)
}

function transformDataEcharts(data: { [key: string]: any[] }): TransformedDataItem[] {
    const result: TransformedDataItem[] = []; // 确保 result 的类型是 TransformedDataItem[]

    // 遍历 filteredData 中的每个键（如 "vertical_parallel_arb_connected"）
    for (const [conditionKey, conditionArray] of Object.entries(data)) {
        // 通过 conditionKey 在 selectedWorkingConditions.value 中找到匹配的对象
        const selectedCondition = selectedWorkingConditions.value.find(item => item.name_en === conditionKey);
        if (!selectedCondition) continue; // 如果找不到匹配的工况，跳过当前循环

        // 获取当前工况的 id 和中文名
        const conditionId = selectedCondition.id;
        const conditionName = selectedCondition.name;
        const conditionNameEn = conditionKey; // 英文工况名

        // 对每个 conditionArray 中的对象进行处理
        conditionArray.forEach(item => {
            for (const [key, value] of Object.entries(item)) {
                if (key === 'car_base_info_id') continue;

                // 在 workingConditionsDetailObj.value[conditionId] 中查找 key 对应的工况详细
                const conditionDetails = workingConditionsDetailObj.value[conditionId];
                const selectedDetail = conditionDetails?.find(detail => detail.name_en === key);
                if (!selectedDetail) continue; // 如果找不到匹配的工况详细，跳过当前循环

                // 获取工况详细的中文名和英文名
                const detailName = selectedDetail.name;
                const detailNameEn = key; // 英文工况详细名

                // 查找当前的 result 中是否已经存在相同的 `moduleTitle` 和 `moduleSonParameters`
                let existingEntry = result.find(
                    entry => entry.moduleTitle === conditionName && entry.moduleSonParameters === detailName
                );

                // 如果不存在，创建一个新的条目
                if (!existingEntry) {
                    existingEntry = {
                        moduleTitle: conditionName,              // 替换为中文工况名
                        moduleSonParameters: detailName,         // 替换为中文工况详细名
                        workingConditionEn: conditionNameEn,     // 保留英文工况名
                        workingConditionDetailEn: detailNameEn,  // 保留英文工况详细名
                        data: {}                                  // 初始化 data 属性
                    };
                    result.push(existingEntry);
                }

                // 根据 car_base_info_id 生成键名，并将数据直接插入到 existingEntry 中
                const carBaseInfoId = `${item.car_base_info_id}`;
                existingEntry.data[carBaseInfoId] = existingEntry.data[carBaseInfoId] || {}; // 创建或获取现有对象
                existingEntry.data[carBaseInfoId][detailNameEn] = value; // 将 detailNameEn 作为键，value 作为值
            }
        });
    }
    return result;
}


function transformModuleData(data: { [key: string]: any[] }): { moduleTitle: string; moduleSonParameters: string; moduleTitleEn: string; moduleSonParametersEn: string;[key: string]: any }[] {
    const result: { moduleTitle: string; moduleSonParameters: string; moduleTitleEn: string; moduleSonParametersEn: string;[key: string]: any }[] = [];
    // 遍历 filteredData 中的每个键（如 "vertical_parallel_arb_connected"）
    for (const [conditionKey, conditionArray] of Object.entries(data)) {
        // 通过 conditionKey 在 selectedWorkingConditions.value 中找到匹配的对象
        const selectedModuleSonTable = selectedModuleDetail.value.find(item => item.name_en === conditionKey);
        // console.log("selectedModuleSonTable: ",selectedModuleSonTable)
        if (!selectedModuleSonTable) continue; // 如果找不到匹配的工况，跳过当前循环
        // 获取当前工况的 id 和中文名
        const selectedModuleSonTableId = selectedModuleSonTable.id;
        const selectedModuleSonTableName = selectedModuleSonTable.name;
        const selectedModuleSonTableNameEn = conditionKey; // 英文工况名
        console.log(selectedModuleSonTableId, selectedModuleSonTableName, selectedModuleSonTableNameEn)
        // 对每个 conditionArray 中的对象进行处理
        conditionArray.forEach(item => {
            const carKeyPrefix = `car`; // 前缀
            for (const [key, value] of Object.entries(item)) {
                if (key === 'car_base_info_id') continue;
                // 在 workingConditionsDetailObj.value[conditionId] 中查找 key 对应的工况详细
                const moduleSonParameters = selectedModuleSonParameters.value[selectedModuleSonTableId];
                const selectedDetail = moduleSonParameters?.find(detail => detail.name_en === key);
                if (!selectedDetail) continue; // 如果找不到匹配的，跳过当前循环
                // 获取中文名和英文名
                const detailName = selectedDetail.name;
                const detailNameEn = key; // 英文名
                let existingEntry = result.find(
                    entry => entry.moduleTitle === selectedModuleSonTableName && entry.moduleSonParameters === detailName
                );
                // 如果不存在，创建一个新的条目
                if (!existingEntry) {
                    existingEntry = {
                        moduleTitle: selectedModuleSonTableName,             // 替换为中文工况名
                        moduleSonParameters: detailName,          // 替换为中文工况详细名
                        moduleTitleEn: selectedModuleSonTableNameEn,         // 保留英文工况名
                        moduleSonParametersEn: detailNameEn,      // 保留英文工况详细名
                    };
                    result.push(existingEntry);
                }
                // 根据 car_base_info_id 生成键名，并将数据直接插入到 existingEntry 中
                const carKey = `${carKeyPrefix}${item.car_base_info_id}`;
                existingEntry['data'] = existingEntry['data'] || {}; // 创建 'data' 字典
                existingEntry['data'][carKey] = value;
            }
        });
    }
    return result;
}

// 组件挂载时，初始化数据
onMounted(async () => {
    const data = await workingConditionsStore.getWorkingConditions(); // 获取工况列表数据
    workingConditionsList.value = data.sort((x: any, y: any) => x.id - y.id); // 根据工况 ID 对工况列表排序
    await nextTick(); // 等待 DOM 更新
    const leftColumnEl = document.querySelector(".left-column"); // 获取左侧工况选择区域的 DOM 元素
    if (leftColumnEl) {
        leftColumnHeight.value = leftColumnEl.scrollHeight; // 设置左侧工况选择区域的高度，用于限制右侧滚动区域的高度
    }
    selectedCarTypeId_ts.value = ""
    selectedPlatformList_ts.value = []
    carBaseInfoSelectIdList.value = [];
});



// 工况详细复选框全选
const allSelected = reactive<{ [key: number]: boolean }>({});
// 切换全选状态
function toggleSelectAll(detailId: number, selectAll: boolean) {
    const selectedDetails = workingConditionsDetailObj.value[detailId] || [];
    if (selectAll) {
        selectedDetails.forEach(detail => {
            formModules.moduleSonParameters.push(`${detailId}-${detail.id}`);
        });
    } else {
        formModules.moduleSonParameters = formModules.moduleSonParameters.filter(
            value => !value.startsWith(`${detailId}-`)
        );
    }
}

// 更新全选框状态
function updateSelectAllState(detailId: number) {
    const selectedDetails = workingConditionsDetailObj.value[detailId] || [];
    const allChecked = selectedDetails.every(detail =>
        formModules.moduleSonParameters.includes(`${detailId}-${detail.id}`)
    );
    allSelected[detailId] = allChecked; // 更新全选框状态
}

// 监听复选框的变化
watch(() => formModules.moduleSonParameters, (newVal) => {
    console.log(selectedWorkingConditions.value)
    selectedWorkingConditions.value.forEach(condition => {
        updateSelectAllState(condition.id);
    });
});


// 横坐标
const checkAll = ref(false)
const indeterminate = ref(false)
const seletedHorizontalAxis = ref<CheckboxValueType[]>([])
const HorizontalAxis = ref([
    {
        value: '1',
        label: '轴距',
    },
    {
        value: '2',
        label: '前轮距',
    },
    {
        value: '3',
        label: '后轮距',
    },
])

watch(seletedHorizontalAxis, async (val) => {
    // 将新值转换为 string[] 并赋给 formModules.seletedHorizontalAxis
    formModules.seletedHorizontalAxis = val.map(item => String(item));
    if (val.length === 0) {
        checkAll.value = false
        indeterminate.value = false
    } else if (val.length === HorizontalAxis.value.length) {
        checkAll.value = true
        indeterminate.value = false
    } else {
        indeterminate.value = true
    }
})

const handleCheckAll = (val: CheckboxValueType) => {
    indeterminate.value = false
    if (val) {
        seletedHorizontalAxis.value = HorizontalAxis.value.map((_) => _.value)
    } else {
        seletedHorizontalAxis.value = []
    }
}



// echarts图形绘制

// 定义 chartDom 为 HTMLElement | null 类型
const chartDom = ref<HTMLElement | null>(null);
const initChart = (echartsData: any) => {
    // 检查 chartDom.value 是否为 null
    if (!chartDom.value) {
        console.error("chartDom is not initialized");
        return; // 退出函数，避免进一步的错误
    }

    // 清空现有的图表容器
    chartDom.value.innerHTML = '';

    let totalHeight = 0; // 用于计算总高度
    let optionList = [];

    // 这里是气泡图显示逻辑
    // Object.entries(echartsData.value).forEach(([key, value]) => {
    //     let title = "";
    //     if (key === "1") {
    //         title = "轴距";
    //         console.log("这里是轴距的数据");
    //     } else if (key === "2") {
    //         title = "前轮距";
    //         console.log("这里是前轮距的数据");
    //         // 处理前轮距数据的逻辑
    //     } else if (key === "3") {
    //         title = "后轮距";
    //         console.log("这里是后轮距的数据");
    //         // 处理后轮距数据的逻辑
    //     }

    //     const colorPalette = [
    //         'red',       // 红色
    //         'orange',    // 橙色
    //         'yellow',    // 黄色
    //         'green',     // 绿色
    //         'blue',      // 蓝色
    //         'indigo',    // 靛色
    //         'violet'     // 紫色
    //     ];
    //     Object.entries(value).forEach(([workingConditionsKey, datavalue]) => {
    //         // 创建一个新的 option 对象
    //         const option = {
    //             backgroundColor: '#ffffff', // 设置背景颜色为白色
    //             title: {
    //                 text: workingConditionsKey, // 使用当前工况的名称
    //                 left: '5%',
    //                 top: '3%'
    //             },
    //             legend: {
    //                 right: '10%',
    //                 top: '3%',
    //                 data: []
    //             },
    //             grid: {
    //                 left: '8%',
    //                 top: '10%'
    //             },
    //             xAxis: {
    //                 min: 2600, // 设置横坐标的最小值
    //                 max: 3300, // 设置横坐标的最大值
    //                 name: title, // 将 title 作为横坐标的名称
    //                 nameLocation: 'end', // 名称放在右侧
    //                 splitLine: {
    //                     lineStyle: {
    //                         type: 'dashed'
    //                     }
    //                 },
    //             },
    //             yAxis: {
    //                 splitLine: {
    //                     lineStyle: {
    //                         type: 'dashed'
    //                     }
    //                 },
    //                 scale: true
    //             },
    //             series: []
    //         };

    //         // 这里的dataKey是kc参数的名称：例如悬架刚度，悬架摩擦等；dataValue是这kc的一组参数值[轴距，kc参数名，轴距(气泡大小)，名称，右上标题]，
    //         Object.entries(datavalue).forEach(([dataKey, dataValue], index) => {
    //             const seriesArrayOne: echarts.SeriesOption = {
    //                 name: dataKey,
    //                 data: dataValue,
    //                 type: 'scatter',
    //                 symbolSize: (dataValue: any) => Math.sqrt(dataValue[0]) * 0.5,
    //                 emphasis: {
    //                     focus: 'series',
    //                     label: {
    //                         show: true,
    //                         formatter: (param) => `${param.data[3]}\n${title}: ${param.data[2]}`,
    //                         position: 'top'
    //                     }
    //                 },
    //                 itemStyle: {
    //                     shadowBlur: 10,
    //                     shadowColor: 'rgba(120, 36, 50, 0.5)',
    //                     shadowOffsetY: 5,
    //                     color: colorPalette[index % colorPalette.length] // 循环使用七原色
    //                 },
    //             };
    //             option.legend.data.push(dataKey); // 添加到图例中
    //             option.series.push(seriesArrayOne); // 将系列对象添加到 series 数组中
    //         });
    //         optionList.push(option); // 将每个 option 添加到数组中
    //     });



    // });

    // 气泡信息默认显示
    Object.entries(echartsData.value).forEach(([key, value]) => {
        let title = key === "1" ? "轴距" : key === "2" ? "前轮距" : "后轮距";
        console.log(`这里是${title}的数据`);

        const colorPalette = [
            'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'
        ];
        Object.entries(value).forEach(([workingConditionsKey, datavalue]) => {
            let minX = Infinity;
            let maxX = -Infinity;
            const option = {
                backgroundColor: '#ffffff',
                title: {
                    text: workingConditionsKey,
                    left: '5%',
                    top: '3%'
                },
                legend: {
                    right: '10%',
                    top: '1%',
                    data: [],
                    selected: {},
                    textStyle: {
                        width: 80,
                        backgroundColor: 'transparent'
                    }
                },
                toolbox: {
                    show: true,
                    orient: 'vertical', // 设置为竖直排列
                    right: '5%',       // 调整位置
                    top: '2%',         // 调整位置
                    feature: {
                        mark: { show: true },
                        saveAsImage: {
                            show: true,
                            tooltip: {
                                show: true,
                            }
                        }
                    }
                },
                grid: { left: '8%', top: '10%' },
                xAxis: { min: null, max: null, name: title, nameLocation: 'end', splitLine: { lineStyle: { type: 'dashed' } } },
                yAxis: { splitLine: { lineStyle: { type: 'dashed' } }, scale: true },
                series: []
            };

            // 计算 minX 和 maxX
            Object.entries(datavalue).forEach(([dataKey, dataValue], index) => {
                console.log("dataValue: ", dataValue);
                for (const dataPoint of dataValue) {
                    minX = Math.min(minX, dataPoint[0]);
                    maxX = Math.max(maxX, dataPoint[0]);
                }
                const seriesArrayOne = {
                    name: dataKey,
                    data: dataValue,
                    type: 'scatter',
                    // 气泡大小控制
                    symbolSize: (dataValue) => Math.sqrt(dataValue[0]) * 0.5,
                    // 默认显示出气泡对应信息
                    label: {
                        show: true,
                        formatter: (param) => `${param.data[3]}\n ${param.data[1]}`,
                        position: 'top'
                    },
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(120, 36, 50, 0.5)',
                        shadowOffsetY: 5,
                        color: colorPalette[index % colorPalette.length]
                    },
                };
                option.legend.data.push(dataKey);
                option.legend.selected[dataKey] = index === 0; // 默认显示第一个系列
                option.series.push(seriesArrayOne);
            });
            // 最后设置 minX 和 maxX【横坐标区间控制】
            option.xAxis.min = minX;
            option.xAxis.max = maxX;
            // 插入空字符串可以实现图例换行
            for (let i = 0; i < option.legend.data.length; i++) {
                // 每插入一个空字符串后，i 需要加 1，以避免影响后续插入的位置
                if ((i + 1) % 6 === 0) {
                    option.legend.data.splice(i + 1, 0, ""); // 在当前位置后插入空字符串
                    i++; // 递增 i，跳过刚插入的空字符串
                }
            }
            optionList.push(option);
        });
    });

    if (optionList.length < 2) {
        totalHeight = optionList.length * 660
    } else {
        totalHeight = optionList.length * 600 + 60
    }
    // 设置 .echarts 的高度
    chartDom.value.style.height = `${totalHeight}px`;
    // 绘制所有图形
    optionList.forEach((option) => {
        // 创建一个新的 DOM 元素用于每个图表
        const chartContainer = document.createElement('div');
        chartContainer.style.width = '100%';
        chartContainer.style.height = '600px';
        // chartContainer.style.marginBottom = '20px'; // 添加间距
        chartDom.value.appendChild(chartContainer); // 将新的容器添加到主容器中
        const myChart = echarts.init(chartContainer);
        myChart.setOption(option); // 使用当前选项进行渲染
    });
};
</script>


<style scoped>
/* 允许组件滚动 */
.car-data {
    height: 100vh;
    width: 100%;
    overflow-y: auto;
    /* 允许垂直滚动 */
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


/* 工况区域的样式 */
.working-conditions {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.flex-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: flex-start;
    /* 确保左右盒子顶部对齐 */
}

.left-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    margin-right: 10px;
}

.right-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

/* 工况的网格布局，设置每行3个复选框 */
.el-checkbox-group {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    /* 一行三个复选框 */
    /* gap: 10px;  */
}

/* 提交按钮区域 */
.form-actions {
    display: flex;
    justify-content: flex-start;
}
</style>