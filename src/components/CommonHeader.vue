<template>
  <el-menu class="el-menu-demo" mode="horizontal" background-color="#545c64" text-color="#fff"
    active-text-color="#ffd04b" @select="handleSelect">

    <el-menu-item index="1">Chery</el-menu-item>

    <!-- 车型选择菜单 -->
    <el-sub-menu index="2">
      <template #title>{{ carTypeMenuTitle }}</template>

      <!-- 添加 全部 选项 -->
      <el-menu-item :index="'all-car-type'" @click="selectCarType(null)">
        全部
      </el-menu-item>

      <!-- 车型显示渲染 -->
      <el-menu-item v-show="isCarTypeList" v-for="carType in carTypeList" :key="carType.id"
        :index="'car-' + String(carType.id)" @click="selectCarType(carType)">
        {{ carType.name }}
      </el-menu-item>
    </el-sub-menu>

    <!-- 车型展示 -->
    <el-menu-item class="fixed-width" index="3" disabled>
      {{ selectedCarType.name || carTypeDisabledTitle }}
    </el-menu-item>

    <el-menu-item index="4">
      <el-select-v2 v-model="platformValue" :options="platformOptions" multiple clearable collapse-tags
        placeholder="请选择平台" popper-class="custom-header" :max-collapse-tags="1" style="width: 240px">
        <template #header>
          <el-checkbox v-model="platformCheckAll" :indeterminate="platformIndeterminate"
            @change="platformHandleCheckAll">
            全选
          </el-checkbox>
        </template>
      </el-select-v2>
    </el-menu-item>

    <el-menu-item index="5">
      <el-select-v2 v-model="carShowValue" :options="carShowOptions" filterable multiple clearable collapse-tags
        placeholder="请选择车辆" popper-class="custom-header" :max-collapse-tags="1" style="width: 240px">
      </el-select-v2>
    </el-menu-item>


  </el-menu>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, watchEffect } from "vue";
import { useCarBaseInfoStore } from "@/stores/carbaseinfo";
import { useCarTypeStore } from "@/stores/cartype";
import { usePlatformStore } from "@/stores/platform";
import { storeToRefs } from "pinia";
import type { CheckboxValueType } from 'element-plus'


// 定义props
const props = defineProps<{
  platformList?: Array<{ id: string; name: string }>;
  carTypeList?: Array<{ id: string; name: string }>;
}>();

// activeIndex 的值控制菜单的高亮
const activeIndexCarType = ref("all-car-type");
// 使用对象存储选中的车型信息
const selectedCarType = ref<{ id: string | null; name: string | null }>({
  id: null,
  name: null,
});

const platformOptions = ref<{ value: string; label: string }[]>([]);
const carShowOptions = ref<{ value: string; label: string }[]>([]);


// 引入 Pinia Store
const carBaseInfoStore = useCarBaseInfoStore();
const carTypeStore = useCarTypeStore();
const platformStore = usePlatformStore();

const { carTypeList, getCarType } = carTypeStore;

const { platformList, getPlatform } = platformStore;

const { carBaseInfoSelectIdList } = storeToRefs(carBaseInfoStore)
const { getAllCarBaseInfo, getCarBaseInfoList, getCarByCarTypeAndPlatform } = carBaseInfoStore;

// 计算属性，用于动态确定标题
const carTypeMenuTitle = computed(() => props.carTypeList?.length ? "车型选择" : "选择");
const carTypeDisabledTitle = computed(() => props.carTypeList?.length ? "全部" : "选择");

const isCarTypeList = computed(() => !!props.carTypeList?.length);

const handleSelect = (key: string) => {
  // 处理菜单选择
};

// 选择车型
function selectCarType(carType: { id: string; name: string } | null) {
  if (carType) {
    selectedCarType.value.id = carType.id;
    selectedCarType.value.name = carType.name;
    carBaseInfoStore.selectedCarTypeId_ts = carType.id
  } else {
    selectedCarType.value.id = null;
    selectedCarType.value.name = "全部";
  }
  fetchData();
}

// 加载数据
onMounted(async () => {
  const carTypeData = await getCarType();
  const platformData = await getPlatform();
  carTypeData.sort((x: any, y: any) => Number(x.id) - Number(y.id));
  platformData.sort((x: any, y: any) => Number(x.id) - Number(y.id));
  carTypeStore.carTypeList.splice(0, carTypeStore.carTypeList.length, ...carTypeData);
  platformStore.platformList.splice(0, platformStore.platformList.length, ...platformData);

  await fetchData();
  // 平台
  platformOptions.value = platformStore.platformList.map(platform => ({
    value: platform.id,
    label: platform.name
  }));
});


// 数据请求函数
async function fetchData() {
  try {
    if (selectedCarType.value.id || platformValue.value) {
      carBaseInfoStore.carBaseInfoList.length = 0;
      const data = await getCarByCarTypeAndPlatform({
        car_type_id: Number(selectedCarType.value.id),
        platform_id_list: platformValue.value.map(id => Number(id))
      });
      if (Array.isArray(data)) {
        carBaseInfoStore.carBaseInfoList.push(...data);
        carShowOptions.value = carBaseInfoStore.carBaseInfoList.map(car_base_info => ({
          value: String(car_base_info.id),  // 将 id 转换为字符串
          label: car_base_info.name
        }));
      }
    } else {
      carBaseInfoStore.carBaseInfoList.length = 0;
      const data = await getAllCarBaseInfo();
      if (Array.isArray(data)) carBaseInfoStore.carBaseInfoList.push(...data);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}


const platformCheckAll = ref(false)
const platformIndeterminate = ref(false)
const platformValue = ref<CheckboxValueType[]>([])
const carShowValue = ref<CheckboxValueType[]>([])

watch(platformValue, (val) => {
  if (val.length === 0) {
    platformCheckAll.value = false
    platformIndeterminate.value = false
  } else if (val.length === platformOptions.value.length) {
    platformCheckAll.value = true
    platformIndeterminate.value = false
  } else {
    platformIndeterminate.value = true
  }
  carBaseInfoStore.selectedPlatformList_ts = platformValue.value.map(id => Number(id));
  // 监听到选择的平台发生变化，重新获取数据
  fetchData();
})

watch(carShowValue, (val) => {
  if (val.length !== 0) {
    const numberVal = val.map(v => Number(v));
    carBaseInfoSelectIdList.value = numberVal
  }
});


const platformHandleCheckAll = (val: CheckboxValueType) => {
  platformIndeterminate.value = false
  if (val) {
    platformValue.value = platformOptions.value.map((_) => _.value)
  } else {
    platformValue.value = []
  }
}

// 使用 watchEffect 动态监听 platformList 的变化并更新 options
watchEffect(() => {
  if (platformStore.platformList.length > 0) {
    platformOptions.value = platformStore.platformList.map(platform => ({
      value: platform.id,
      label: platform.name
    }));
  }
});
</script>

<style scoped>
.el-menu-demo {
  border-radius: 10px;
}

.fixed-width {
  width: 100px;
}

.transparent-btn {
  background-color: transparent;
  border: none;
  color: #fff;
}

.transparent-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #fff;
  border: none;
  /* 确保没有边框 */
  outline: none;
  /* 去掉默认的焦点轮廓 */
}

.dropdown-item-span {
  /* display: flex; */
  /* justify-content: center; 水平居中 */
  /* align-items: center; 垂直居中 */
  width: 100px;
  /* 占据全部宽度 */
  padding: 10px 0;
  /* 根据需要调整上下内边距 */
  box-sizing: border-box;
  /* 使内边距不影响元素的总宽度 */
  color: #fff;
}

.dropdownPlatform {
  background-color: #545c64;
}

/* 自定义下拉菜单的头部 */
.custom-header {
  .el-checkbox {
    display: flex;
    height: unset;
  }
}
</style>
