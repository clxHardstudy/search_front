<template>
    <div class="car-data">
        <!-- 搜索表单区域 -->
        <div class="search-form">
            <el-form :inline="true" :model="formInline" class="demo-form-inline">
                <el-form-item label="车型名称">
                    <el-input v-model="formInline.name" placeholder="请输入..." clearable />
                </el-form-item>
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
                    <el-button type="primary" @click="onSubmit" :loading="isLoading">查询</el-button>
                </el-form-item>
            </el-form>
        </div>
        <!-- 表格显示区域 -->
        <div>
            <el-table :data="transformedCarBaseInfoList" style="width: 100%; table-layout: auto" height="400">
                <el-table-column fixed prop="id" label="序号" min-width="100" />
                <el-table-column fixed prop="name" label="车型名称" min-width="180" />
                <el-table-column prop="wheelbase" label="轴距" min-width="120" />
                <el-table-column prop="front_track" label="前轮距" min-width="120" />
                <el-table-column prop="rear_track" label="后轮距" min-width="120" />
                <el-table-column prop="car_type_name" label="所属型号" min-width="100" />
                <el-table-column prop="platform_name" label="所属平台" min-width="100" />
                <el-table-column prop="release_date" label="发布时间" min-width="150" />

                <!-- 操作列 -->
                <el-table-column label="操作" min-width="100" align="center">
                    <template #default="scope">
                        <el-button type="success" size="small" @click="handleEdit(scope.row)">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <el-divider />

        <div class="form-container">
            <el-form :model="form" label-width="auto" style="max-width: 33%;">
                <el-form-item label="Activity name">
                    <el-input v-model="form.name" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmitEdit">Create</el-button>
                    <el-button>Cancel</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, reactive, onMounted, watch, ref, nextTick } from "vue";
import { useCarBaseInfoStore } from "../stores/carbaseinfo";
import { useWorkingConditionsStore } from "../stores/workingconditions";
import { storeToRefs } from "pinia";
import { da, de } from "element-plus/es/locales.mjs";

// 从 carBaseInfoStore 中获取汽车基本信息相关的函数和状态
const carBaseInfoStore = useCarBaseInfoStore();
const { carBaseInfoList, searchCarByMultipleConditionQuery } = carBaseInfoStore;


// 从 workingConditionsStore 中获取工况相关的状态
const workingConditionsStore = useWorkingConditionsStore();
const { workingConditionsList } = storeToRefs(workingConditionsStore); // 工况列表
const { getWorkingConditionDetailOnce, getWorkingConditionDetailTitle } = workingConditionsStore
const { selectedCarTypeId_ts, selectedPlatformList_ts } = storeToRefs(carBaseInfoStore); // 选中的车型类型 ID

// 定义表单相关的状态
const formInline = reactive({
    name: "",
    wheelbase: "",
    front_track: "",
    rear_track: "",
});

// 加载状态
const isLoading = ref(false); // 查询按钮的加载状态

// 转换后的汽车基本信息列表，计算汽车类型名称
const transformedCarBaseInfoList = computed(() => {
    return carBaseInfoList.map((item) => ({
        ...item,
        car_type_name: item.car_type_id === 1 ? "轿车" : item.car_type_id === 2 ? "SUV" : "其他",
        platform_name: item.platform_id === 1 ? "T1X" : item.platform_id === 2 ? "T2X" : "未知",
    }));
});

// 车型查询按钮点击事件
const onSubmit = async () => {
    try {
        isLoading.value = true; // 设置加载状态
        const data = await searchCarByMultipleConditionQuery({
            car_type_id: Number(selectedCarTypeId_ts.value),
            platform_id_list: selectedPlatformList_ts.value,
            name: formInline.name,
            wheelbase: formInline.wheelbase,
            front_track: formInline.front_track,
            rear_track: formInline.rear_track,
        });
        carBaseInfoStore.carBaseInfoList.splice(0, carBaseInfoStore.carBaseInfoList.length, ...data); // 更新表格数据
    } finally {
        isLoading.value = false; // 查询完成后，取消加载状态
    }
};

const workingConditionsData = ref<any>({ front: {}, rear: {} });

// 编辑按钮点击事件
const handleEdit = async (row: any) => {
    try {
        // 确保 fetchData 完成后再执行后续操作
        await fetchData(row);
        console.log("workingConditionsData: ", workingConditionsData.value);
        // 调用函数，获取数据，确保数据获取后再处理 finalResult
        await fetchWorkingConditionsData();
        console.log("finalResult: ", finalResult);
    } catch (error) {
        console.error("编辑过程中出现错误", error);
    }
};

// 定义一个异步函数来获取数据
const fetchData = async (row: any) => {
    try {
        // 等待异步操作完成，并将结果赋值给 data.value
        workingConditionsData.value = await getWorkingConditionDetailOnce({ "car_base_info_id": row.id });
    } catch (error) {
        console.error('获取数据失败', error);
    }
};

// 组件挂载时，初始化数据
onMounted(async () => {
    const data = await workingConditionsStore.getWorkingConditions(); // 获取工况列表数据
    console.log(data)
    workingConditionsList.value = data.sort((x: any, y: any) => x.id - y.id); // 根据工况 ID 对工况列表排序
    await nextTick(); // 等待 DOM 更新


});


// 定义接口类型，表示每个 detailList 项的结构
interface DetailItem {
    id:number;
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
const finalResult: {
    name: ConditionDetails[];  // 存储工况的 name
    name_en: ConditionDetailsEn[];  // 存储工况的 name_en
    data: WorkingConditionData;  // 存储工况详细信息，front 和 rear 数据
    title: {  // 新增 title 属性
        table: { id: number, name: string; name_en: string };  // 每个工况的名称和英文名称
        workingConditionsDetails: { id: number, name: string; name_en: string }[];  // 工况的详细信息
    }[]
} = {
    name: [],
    name_en: [],
    data: {
        front: {}, // front 的数据是以 name_en 作为键的对象
        rear: {}   // rear 的数据也是以 name_en 作为键的对象
    },
    title: []  // 初始化 title 为一个空数组
};

// 遍历workingConditionsList，逐个获取每个工况详细信息
const fetchWorkingConditionsData = async () => {
    // 初始化 finalResult.data，确保最外层的 front 和 rear 是对象
    finalResult.data = {
        front: {},
        rear: {}
    };

    // 初始化 finalResult.title 为一个数组
    finalResult.title = [];

    for (const condition of workingConditionsList.value) {
        const id = condition.id;
        try {
            // 通过ID请求接口获取详细数据
            const response = await workingConditionsStore.getWorkingConditionDetailTitle({ working_conditions_list: [id] });
            // 获取接口返回的数组数据，类型为 DetailItem[]
            const detailList: DetailItem[] = response[id];

            // 将返回的数据中的 'name' 和 'name_en' 提取并放入最终结果对象中
            // finalResult.name.push({
            //     name: condition.name,
            //     details: detailList.map((item: DetailItem) => item.name) // 显式指定 item 的类型
            // });
            // finalResult.name_en.push({
            //     name_en: condition.name_en,
            //     details: detailList.map((item: DetailItem) => item.name_en) // 显式指定 item 的类型
            // });
            // 添加到title数组，包含table和workingConditionsDetails
            finalResult.title.push({
                table: {
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
            // 使用 name_en 作为键
            const dataKey = condition.name_en;
            // 处理 finalResult.data 部分，将 front 和 rear 拉到最外层
            const firstLevelKeys = ['front', 'rear'];
            firstLevelKeys.forEach((levelKey) => {
                // 初始化最外层的 front 或 rear 对象
                if (!finalResult.data[levelKey as 'front' | 'rear']) {
                    finalResult.data[levelKey as 'front' | 'rear'] = {};
                }
                // 如果该条件的 detail 存在于 workingConditionsData 中
                if (workingConditionsData.value[levelKey] && workingConditionsData.value[levelKey][dataKey]) {
                    // 遍历每个工况详情，将其数据存储在相应的 front 或 rear 下
                    finalResult.data[levelKey as 'front' | 'rear'][dataKey] = {};
                    detailList.forEach((detail) => {
                        const detailKey = detail.name_en;  // detail.name_en 对应的是具体的字段名称

                        if (workingConditionsData.value[levelKey][dataKey][0][detailKey]) {
                            finalResult.data[levelKey as 'front' | 'rear'][dataKey][detailKey] = workingConditionsData.value[levelKey][dataKey][0][detailKey];
                        } else {
                            console.warn(`在 data 中找不到键 ${detailKey}`);
                        }
                    });
                } else {
                    console.warn(`在 data 中找不到一级键 ${levelKey} 或二级键 ${dataKey}`);
                }
            });
        } catch (error) {
            console.error(`获取ID为${id}的工况详细信息失败`, error);
        }
    }
};




// do not use same name with ref
const form = reactive({
    name: '',
    region: '',
    date1: '',
    date2: '',
    delivery: false,
    type: [],
    resource: '',
    desc: '',
})
const onSubmitEdit = () => {
    console.log('submit!')
}
</script>



<style scoped>
/* Flex 布局 */
.car-data {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow-y: auto;
}

.search-form {
    padding: 16px;
}

.table-container {
    flex: 1;
    overflow-y: auto;
}

.form-container {
    padding: 16px;
    /* min-height: 1000px; */
}

.edit-form {
    background-color: #fff;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>