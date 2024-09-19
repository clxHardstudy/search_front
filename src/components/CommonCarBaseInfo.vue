<template>
  <div class="car-data">
    <div class="search-form">
      <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="车型名称">
          <el-input v-model="formInline.name" placeholder="请输入..." clearable />
        </el-form-item>
        <el-form-item label="轴距">
          <el-input v-model="formInline.wheelbase" placeholder="示例：2880 或 2880-3000" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit" :loading="isLoading">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table">
      <el-table :data="transformedCarBaseInfoList" style="width: 100%; table-layout: auto" height="300">
        <el-table-column fixed prop="id" label="序号" min-width="150" />
        <el-table-column fixed prop="name" label="车型名称" min-width="200" />
        <el-table-column prop="wheelbase" label="轴距" min-width="120" />
        <el-table-column prop="release_date" label="发布时间" min-width="120" />
        <el-table-column prop="car_type_name" label="型号类别" min-width="100" />
      </el-table>
    </div>

    <el-divider />

    <!-- 工作条件区域 -->
    <div class="working-conditions">
      <el-form :model="formWorkingConditions" label-width="auto" class="flex-container">
        <!-- 左侧部分 -->
        <div class="left-column">
          <el-form-item label="坐标">
            <el-select v-model="formWorkingConditions.coordinate" placeholder="选择坐标系" style="width: 60%;">
              <el-option label="前" value="0" />
              <el-option label="后" value="1" />
            </el-select>
          </el-form-item>

          <el-form-item label="工况">
            <el-checkbox-group v-model="formWorkingConditions.WorkingConditions">
              <el-checkbox v-for="condition in workingConditionsList" :key="condition.id" :value="condition.id">
                {{ condition.name }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>

        <!-- 右侧部分：工况详细，动态设置高度 -->
        <div class="right-column" :style="{ maxHeight: leftColumnHeight + 'px', overflowY: 'auto' }">
          <el-form-item label="工况详细">
            <div v-for="detail in selectedConditionsDetails" :key="detail.id">
              {{ detail.name }}
              <el-checkbox-group v-model="formWorkingConditions.WorkingConditionsDetail">
                <el-checkbox v-for="workingConditionsDetail in workingConditionsDetailObj[detail.id]"
                  :key="workingConditionsDetail.id" :value="`${detail.id}-${workingConditionsDetail.id}`">
                  {{ workingConditionsDetail.name }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </el-form-item>
        </div>
      </el-form>

      <!-- 提交按钮在整体下方 -->
      <div class="form-actions">
        <el-button type="primary" @click="onSubmitWorkingConditions"
          :loading="isLoadingWorkingConditions">查询</el-button>
      </div>
    </div>



  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, onMounted, watch, ref, nextTick } from "vue";
import { useCarBaseInfoStore } from "../stores/carbaseinfo"; // 确保导入路径正确
import { storeToRefs } from "pinia";
import { useWorkingConditionsStore } from "../stores/workingconditions";

const workingConditionsStore = useWorkingConditionsStore()
const { workingConditionsList } = storeToRefs(workingConditionsStore)
const { getWorkingConditions, getWorkingConditionDetail, getWorkingConditionDetailTitle } = workingConditionsStore
// 使用 CarBaseInfoStore
const carBaseInfoStore = useCarBaseInfoStore();
const { carBaseInfoList, searchCarOrSUV, searchCarByWheelbase, searchCarByNameAndWheelbase } = carBaseInfoStore;
const { selectedCarTypeId_ts } = storeToRefs(carBaseInfoStore);

// 计算属性来处理数据转换
const transformedCarBaseInfoList = computed(() => {
  return carBaseInfoList.map((item) => ({
    ...item,
    car_type_name: item.car_type_id === 1 ? "轿车" : item.car_type_id === 2 ? "SUV" : "其他",
  }));
});

const formInline = reactive({
  name: "",
  wheelbase: "",
});

const isLoading = ref(false); // 定义 isLoading 状态
const isLoadingWorkingConditions = ref(false); // 定义 isLoading 状态
const onSubmit = async () => {
  try {
    isLoading.value = true; // 开始加载，设置为 true
    if (formInline.name.trim() && !formInline.wheelbase.trim()) {
      // 名称搜索
      const data = await searchCarOrSUV({ car_type_id: Number(selectedCarTypeId_ts.value), name: formInline.name });
      carBaseInfoStore.carBaseInfoList.splice(0, carBaseInfoStore.carBaseInfoList.length, ...data);
    } else if (!formInline.name.trim() && formInline.wheelbase.trim()) {
      // 轴距搜索
      const wheelbasePattern = /^(\d+|\d+-\d+)$/;
      if (!wheelbasePattern.test(formInline.wheelbase)) {
        alert("轴距输入格式错误，请输入纯数字或数字范围（如 2800-3000）。");
        return;
      }
      if (formInline.wheelbase.includes("-")) {
        const [left, right] = formInline.wheelbase.split("-").map(Number);
        if (left > right) {
          alert("轴距范围输入错误，左边的数字不能大于右边的数字。");
          return;
        }
      }
      const data = await searchCarByWheelbase({ car_type_id: Number(selectedCarTypeId_ts.value), wheelbase: formInline.wheelbase });
      carBaseInfoStore.carBaseInfoList.splice(0, carBaseInfoStore.carBaseInfoList.length, ...data);
    } else if (formInline.name.trim() && formInline.wheelbase.trim()) {
      // 名称和轴距组合搜索
      const data = await searchCarByNameAndWheelbase({ car_type_id: Number(selectedCarTypeId_ts.value), name: formInline.name, wheelbase: formInline.wheelbase });
      carBaseInfoStore.carBaseInfoList.splice(0, carBaseInfoStore.carBaseInfoList.length, ...data);
    }
  } catch (error) {
    console.error("Error fetching car types:", error);
  } finally {
    isLoading.value = false; // 加载完成，设置为 false
  }
};


const leftColumnHeight = ref(0);

onMounted(async () => {
  const data = await getWorkingConditions();
  // 按照 id 从小到大排序
  data.sort((x: any, y: any) => Number(x.id) - Number(y.id));
  // 更新 store 中的 workingConditionsList
  workingConditionsList.value.splice(0, workingConditionsList.value.length, ...data);

  console.log("workingConditionsList.value", workingConditionsList.value)
  // 所有工况表中的参数
  const kcTitleObj = await getWorkingConditionDetailTitle({ working_conditions_list: working_conditions_list.value })
  console.log("kcTitleObj", kcTitleObj)

  // 等待组件渲染完成，确保DOM已更新
  await nextTick();

  const leftColumnEl = document.querySelector(".left-column");
  if (leftColumnEl) {
    // 获取左侧盒子的实际高度
    leftColumnHeight.value = leftColumnEl.scrollHeight;
  }
});


// 工况div
const formWorkingConditions = reactive({
  coordinate: '',
  WorkingConditions: [],
  WorkingConditionsDetail: [],
})


// 获取 carBaseInfoList 中所有数据的 id 并放到 car_id_list 中
const car_id_list = computed(() => {
  return carBaseInfoList.map((car) => car.id);
});

// 获取 workingConditionsList 中所有数据的 id 并放到 working_conditions_list 中  将工况表中的id汇总
const working_conditions_list = computed(() => {
  return workingConditionsList.value.map((workingConditions) => workingConditions.id);
});

const workingConditionsDetailObj = ref<{ [key: number]: { id: number; name: string; name_en: string }[] }>({});
const selectedConditionsDetails = ref<{ id: number; name: string; name_en: string }[]>([]);

// 当工况发生变化时，更新工况详细
watch(
  () => formWorkingConditions.WorkingConditions,
  async (newSelectedConditions, oldSelectedConditions = []) => {
    console.log("newSelectedConditions", newSelectedConditions)
    // 找出被取消的工况
    const deselectedConditions = oldSelectedConditions.filter(id => !newSelectedConditions.includes(id));
    // 清除取消勾选的工况对应的工况详细
    if (deselectedConditions.length) {
      formWorkingConditions.WorkingConditionsDetail = formWorkingConditions.WorkingConditionsDetail.filter(
        (detailId) => !deselectedConditions.some(
          deselectedId => String(detailId).startsWith(`${deselectedId}-`)
        )
      );
    }
    try {
      selectedConditionsDetails.value = newSelectedConditions.map((conditionId) => {
        // 根据选中的工况 id 查找对应的工况
        const foundCondition = workingConditionsList.value.find((condition) => condition.id === conditionId);
        // 返回对象，包含 id, name, name_en
        return foundCondition ? { id: foundCondition.id, name: foundCondition.name, name_en: foundCondition.name_en } : null;
      }).filter((condition): condition is { id: number; name: string; name_en: string } => condition !== null);
      // console.log("已选中的工况详情：", selectedConditionsDetails);
      // 当工况变化时，请求获取工况详细
      const response = await getWorkingConditionDetailTitle({
        working_conditions_list: newSelectedConditions,
      });
      // console.log("response", response)
      // 获取工况详细标题并更新 workingConditionsDetailList
      workingConditionsDetailObj.value = response;
      console.log("workingConditionsDetailList.value", workingConditionsDetailObj.value)
    } catch (error) {
      console.error("Error fetching working condition detail titles:", error);
    }
  },
  { immediate: true } // 立即执行一次，以确保初次渲染时也能获取数据
);


// 根据现存的汽车id去获取 勾选工况的KC参数
const onSubmitWorkingConditions = async () => {
  try {
    isLoadingWorkingConditions.value = true; // 开始加载，设置为 true
    // console.log(formWorkingConditions)
    const data = await getWorkingConditionDetail({
      car_id_list: car_id_list.value,
      coordinate_system: formWorkingConditions.coordinate,
      working_conditions_list: formWorkingConditions.WorkingConditions
    })
    console.log(data)
  } catch (error) {
    console.error("Error fetching car types:", error);
  } finally {
    isLoadingWorkingConditions.value = false; // 加载完成，设置为 false
  }
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
</style>