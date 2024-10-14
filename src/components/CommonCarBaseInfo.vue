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
      <el-table :data="transformedCarBaseInfoList" style="width: 100%; table-layout: auto" height="300">
        <el-table-column fixed prop="id" label="序号" min-width="100" />
        <el-table-column fixed prop="name" label="车型名称" min-width="200" />
        <el-table-column prop="wheelbase" label="轴距" min-width="120" />
        <el-table-column prop="front_track" label="前轮距" min-width="120" />
        <el-table-column prop="rear_track" label="后轮距" min-width="120" />
        <el-table-column prop="car_type_name" label="所属型号" min-width="100" />
        <el-table-column prop="platform_name" label="所属平台" min-width="100" />
        <el-table-column prop="release_date" label="发布时间" min-width="150" />
      </el-table>
    </div>

    <el-divider />

    <!-- 工况选择区域 -->
    <div class="working-conditions">
      <el-form :model="formWorkingConditions" label-width="auto" class="flex-container">
        <!-- 左侧：工况选择部分 -->
        <div class="left-column">
          <!-- 坐标选择 -->
          <el-form-item label="坐标">
            <el-select v-model="formWorkingConditions.coordinate" placeholder="选择坐标系：默认为前模块" style="width: 60%;">
              <el-option label="前模块" value="0" />
              <el-option label="后模块" value="1" />
            </el-select>
          </el-form-item>
          <!-- 工况选择 -->
          <el-form-item label="工况">
            <el-checkbox-group v-model="formWorkingConditions.WorkingConditions">
              <!-- 遍历工况列表，动态生成复选框 -->
              <el-checkbox v-for="condition in workingConditionsList" :key="condition.id" :value="condition.id">
                {{ condition.name }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>

        <!-- 右侧：工况详细信息 -->
        <div class="right-column" :style="{ maxHeight: leftColumnHeight + 'px', overflowY: 'auto' }">
          <el-form-item label="工况详细">
            <div v-for="detail in selectedWorkingConditions" :key="detail.id">
              <span style="margin-right: 10px;">{{ detail.name }}</span>
              <el-checkbox :value="detail.id" v-model="allSelected[detail.id]"
                @change="toggleSelectAll(detail.id, allSelected[detail.id])">全选</el-checkbox>
              <el-checkbox-group v-model="formWorkingConditions.WorkingConditionsDetail">
                <el-checkbox v-for="workingConditionsDetail in workingConditionsDetailObj[detail.id]"
                  :key="workingConditionsDetail.id" :value="`${detail.id}-${workingConditionsDetail.id}`"
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
        <el-button type="primary" @click="onSubmitWorkingConditions"
          :loading="isLoadingWorkingConditions">查询</el-button>
        <el-button type="success" @click="toggleMerge">{{ mergeButtonLabel }}</el-button>
      </div>
    </div>
    <!-- 表格展示工况、工况详细以及车型和参数 -->
    <div class="working-conditions-table">
      <el-table :data="tableData" :span-method="arraySpanMethod" border style="width: 100%; margin-top: 20px;"
        height="600">
        <el-table-column prop="workingCondition" :label="workingConditionLabel" width="220" fixed="left" />
        <el-table-column prop="workingConditionDetail" label="工况详细" width="180" fixed="left" />
        <el-table-column v-for="(car, index) in carBaseInfoList" :key="index" :prop="'data.car' + car.id"
          :label="car.name" min-width="100" />
      </el-table>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, onMounted, watch, ref, nextTick } from "vue";
import { useCarBaseInfoStore } from "../stores/carbaseinfo";
import { useWorkingConditionsStore } from "../stores/workingconditions";
import { useFilterDataStore } from "@/stores/filterdata";
import { storeToRefs } from "pinia";
import type { TableColumnCtx } from 'element-plus'
import { useUtilsStore } from "@/stores/utils";

// 从 carBaseInfoStore 中获取汽车基本信息相关的函数和状态
const carBaseInfoStore = useCarBaseInfoStore();
const { carBaseInfoSelectIdList } = storeToRefs(carBaseInfoStore)
const { carBaseInfoList, searchNewCarByMultipleConditionQuery, searchCarByMultipleConditionQuery } = carBaseInfoStore;

// 从 workingConditionsStore 中获取工况相关的状态
const workingConditionsStore = useWorkingConditionsStore();
const { workingConditionsList } = storeToRefs(workingConditionsStore); // 工况列表
const { selectedCarTypeId_ts, selectedPlatformList_ts } = storeToRefs(carBaseInfoStore); // 选中的车型类型 ID

const filterDataStore = useFilterDataStore();
const { groupWorkingConditionsDetail, extractWorkingConditionsDetails, updateKeyNames, filterDataByRequiredKeys } = filterDataStore

// 定义表单相关的状态
const formInline = reactive({
  name: "",
  wheelbase: "",
  front_track: "",
  rear_track: "",
}); // 车型名称和轴距的表单数据

// 定义表单工作条件类型
interface FormWorkingConditions {
  coordinate: string;
  WorkingConditions: number[];
  WorkingConditionsDetail: string[]; // 明确类型
}
// 初始化表单工作条件
const formWorkingConditions = reactive<FormWorkingConditions>({
  coordinate: '',
  WorkingConditions: [],
  WorkingConditionsDetail: []
});

interface TableDataItem {
  workingCondition: string;
  workingConditionDetail: string;
  [key: string]: any; // 允许动态属性，如 car1, car2 等
}
// 创建一个响应式的 tableData 变量
const tableData = ref<TableDataItem[]>([]);


// 加载状态
const isLoading = ref(false); // 查询按钮的加载状态
const isLoadingWorkingConditions = ref(false); // 工况查询按钮的加载状态
const leftColumnHeight = ref(0); // 左侧工况选择区域的高度，用于设置右侧滚动区域的最大高度

// 定义选中的工况详细信息的类型
interface ConditionDetail {
  id: number;
  name: string;
  name_en: string;
}

// 转换后的汽车基本信息列表，计算汽车类型名称和平台名称
const transformedCarBaseInfoList = computed(() => {
  const platformMap: { [key: number]: string } = {
    1: "T1X",
    2: "T2X",
    3: "E0X",
    4: "M1X",
    5: "Benchmark",
  };

  return carBaseInfoList.map((item) => ({
    ...item,
    car_type_name: item.car_type_id === 1 ? "轿车" : item.car_type_id === 2 ? "SUV" : item.car_type_id === 3 ? "MPV" : "其他",
    platform_name: platformMap[item.platform_id as keyof typeof platformMap] || "未知", // 显式转换 platform_id 的类型
  }));
});


// 获取选中的汽车 ID 列表
const car_id_list = computed(() => carBaseInfoList.map(car => car.id));

// 获取工况 ID 列表
// const working_conditions_list = computed(() => workingConditionsList.value.map(condition => condition.id));

// 监听工况选择的变化，并更新工况详细内容
const workingConditionsDetailObj = ref<{ [key: number]: any[] }>({});
const selectedWorkingConditions = ref<ConditionDetail[]>([]); // 显式定义类型为 ConditionDetail 数组

// 监听工况复选框的变化，动态更新右侧的工况详细信息
watch(
  () => formWorkingConditions.WorkingConditions,
  async (newSelectedConditions, oldSelectedConditions = []) => {
    // console.log(newSelectedConditions,oldSelectedConditions)
    // 找到取消选择的工况
    const deselectedConditions = oldSelectedConditions.filter(id => !newSelectedConditions.includes(id));
    // 移除取消选择的工况详细信息
    if (deselectedConditions.length) {
      formWorkingConditions.WorkingConditionsDetail = formWorkingConditions.WorkingConditionsDetail.filter(
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

// 车型查询按钮点击事件
const onSubmit = async () => {
  try {
    isLoading.value = true; // 设置加载状态
    const data = await searchNewCarByMultipleConditionQuery({
      car_type_id: Number(selectedCarTypeId_ts.value),
      platform_id_list: selectedPlatformList_ts.value,
      name: formInline.name,
      wheelbase: formInline.wheelbase,
      front_track: formInline.front_track,
      rear_track: formInline.rear_track,
      car_base_info_id_list: carBaseInfoSelectIdList.value
    })
    carBaseInfoStore.carBaseInfoList.splice(0, carBaseInfoStore.carBaseInfoList.length, ...data); // 更新表格数据
  } finally {
    isLoading.value = false; // 查询完成后，取消加载状态
  }
};

// 工况查询按钮点击事件
const onSubmitWorkingConditions = async () => {
  try {
    isLoadingWorkingConditions.value = true; // 设置工况查询按钮加载状态

    const data = await workingConditionsStore.getWorkingConditionDetail({
      car_id_list: car_id_list.value,
      coordinate_system: formWorkingConditions.coordinate,
      working_conditions_list: formWorkingConditions.WorkingConditions
    });
    console.log("KC数据：", data);

    // 分组工况详细ID
    const workingConditionsDetailGrouped = groupWorkingConditionsDetail(formWorkingConditions.WorkingConditionsDetail);
    console.log("分组工况详细ID:", workingConditionsDetailGrouped)
    // 提取工况详细内容
    const extractedDetails = extractWorkingConditionsDetails(
      workingConditionsDetailGrouped,
      workingConditionsDetailObj.value
    );
    console.log("提取工况详细内容:", extractedDetails)
    // 更新键名为英文名
    const newExtractedDetails = updateKeyNames(extractedDetails, selectedWorkingConditions.value);
    console.log("更新键名为英文名:", newExtractedDetails)
    // 过滤出只包含需要的字段的数据，并确保包含car_base_info_id
    const filteredData = filterDataByRequiredKeys(newExtractedDetails, data);
    // 打印过滤后的结果，调试用
    console.log("过滤后数据：", filteredData);

    const transformedData = transformData(filteredData);
    tableData.value = transformedData
    console.log("可以渲染表格的数据格式：", transformedData)
    // console.log(JSON.stringify(transformedData, null, 2));
    console.log("选择的工况：", selectedWorkingConditions.value)
    console.log("选择的工况详细：", workingConditionsDetailObj.value)

    mindexGroups = generateIndexGroups(tableData.value, ["workingCondition"]);

  } finally {
    isLoadingWorkingConditions.value = false; // 工况查询完成后，取消加载状态
  }
};

function transformData(data: { [key: string]: any[] }): { workingCondition: string; workingConditionDetail: string; workingConditionEn: string; workingConditionDetailEn: string;[key: string]: any }[] {
  const result: { workingCondition: string; workingConditionDetail: string; workingConditionEn: string; workingConditionDetailEn: string;[key: string]: any }[] = [];
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
      const carKeyPrefix = `car`; // 前缀
      for (const [key, value] of Object.entries(item)) {
        if (key === 'car_base_info_id') continue;
        // 在 workingConditionsDetailObj.value[conditionId] 中查找 key 对应的工况详细
        const conditionDetails = workingConditionsDetailObj.value[conditionId];
        const selectedDetail = conditionDetails?.find(detail => detail.name_en === key);
        if (!selectedDetail) continue; // 如果找不到匹配的工况详细，跳过当前循环
        // 获取工况详细的中文名和英文名
        const detailName = selectedDetail.name;
        const detailNameEn = key; // 英文工况详细名
        // 查找当前的 result 中是否已经存在相同的 `workingCondition` 和 `workingConditionDetail`
        let existingEntry = result.find(
          entry => entry.workingCondition === conditionName && entry.workingConditionDetail === detailName
        );
        // 如果不存在，创建一个新的条目
        if (!existingEntry) {
          existingEntry = {
            workingCondition: conditionName,             // 替换为中文工况名
            workingConditionDetail: detailName,          // 替换为中文工况详细名
            workingConditionEn: conditionNameEn,         // 保留英文工况名
            workingConditionDetailEn: detailNameEn,      // 保留英文工况详细名
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
  carBaseInfoSelectIdList.value = [];
});


// 合并工况
// 明确指定类型
const merge = ref(false);
let mindexGroups = reactive<{ start: number; end: number; }[]>([]);

const mergeButtonLabel = computed(() => {
  return merge.value ? "展开工况" : "合并工况";
});
const workingConditionLabel = computed(() => {
  return merge.value ? "工况（状态：合并）" : "工况（状态：展开）";
});


function toggleMerge() {
  merge.value = !merge.value;
  console.log("合并工况")
}


// 展示表中的工况列合并
// 声明参数的类型
function arraySpanMethod({
  row,
  column,
  rowIndex,
  columnIndex,
}: {
  row: { [key: string]: any }; // 或者更具体的类型
  column: TableColumnCtx<any>;
  rowIndex: number;
  columnIndex: number;
}) {
  if (!merge.value) {
    return;
  }
  if (columnIndex === 0) {
    for (const group of mindexGroups) {
      if (rowIndex === group.start) {
        return [group.end - group.start + 1, 1];
      }
    }
    return [0, 0]; // 不合并
  }
  return [1, 1]; // 其他列正常显示
}

function generateIndexGroups(data: Array<Record<string, any>>, field: string[]) {
  let tmp = data.map((i) => {
    return field.map(f => i[f]).join("+");
  });
  return findIndexs(tmp);
}

function findIndexs(array: string[]): { start: number; end: number }[] {
  let current = array[0];
  let result: { start: number; end: number }[] = [];
  let startIndex = 0;

  for (let i = 1; i < array.length; i++) {
    if (array[i] !== current) {
      result.push({ start: startIndex, end: i - 1 });
      current = array[i];
      startIndex = i;
    }
  }
  result.push({ start: startIndex, end: array.length - 1 });
  return result;
}


// 工况详细复选框全选
const allSelected = reactive<{ [key: number]: boolean }>({});
// 切换全选状态
function toggleSelectAll(detailId: number, selectAll: boolean) {
  const selectedDetails = workingConditionsDetailObj.value[detailId] || [];
  if (selectAll) {
    selectedDetails.forEach(detail => {
      formWorkingConditions.WorkingConditionsDetail.push(`${detailId}-${detail.id}`);
    });
  } else {
    formWorkingConditions.WorkingConditionsDetail = formWorkingConditions.WorkingConditionsDetail.filter(
      value => !value.startsWith(`${detailId}-`)
    );
  }
}

// 更新全选框状态
function updateSelectAllState(detailId: number) {
  const selectedDetails = workingConditionsDetailObj.value[detailId] || [];
  const allChecked = selectedDetails.every(detail =>
    formWorkingConditions.WorkingConditionsDetail.includes(`${detailId}-${detail.id}`)
  );
  allSelected[detailId] = allChecked; // 更新全选框状态
}

// 监听复选框的变化
watch(() => formWorkingConditions.WorkingConditionsDetail, (newVal) => {
  selectedWorkingConditions.value.forEach(condition => {
    updateSelectAllState(condition.id);
  });
});

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

/* echarts */
.chart-area {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  /* 设置固定高度或相对高度 */
}

.chart-container {
  width: 100%;
  /* 占父容器宽度 */
  height: 100%;
  /* 占父容器高度 */
  position: relative;
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

.working-conditions-table {
  height: 100%;
  /* 或者设置具体高度，比如 400px */
  overflow: auto;
  /* 确保内容溢出时可以滚动 */
}
</style>