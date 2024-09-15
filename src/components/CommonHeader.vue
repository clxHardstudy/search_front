<template>
  <el-menu class="el-menu-demo" mode="horizontal" background-color="#545c64" text-color="#fff"
    active-text-color="#ffd04b" @select="handleSelect">
    <el-menu-item index="1">Chery</el-menu-item>

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

    <el-menu-item class="fixed-width" index="3" disabled>
      {{ selectedCarTypeName || carTypeDisabledTitle }}
    </el-menu-item>

    <el-sub-menu index="4">
      <template #title>{{ platformMenuTitle }}</template>

      <!-- 添加 全部 选项 -->
      <el-menu-item :index="'all-platforms'" @click="selectPlatform(null)">
        全部
      </el-menu-item>

      <!-- 平台显示渲染 -->
      <el-menu-item v-show="isPlatformList" v-for="platform in platformList" :key="platform.id"
        :index="'platform' + String(platform.id)" @click="selectPlatform(platform)">
        {{ platform.name }}
      </el-menu-item>
    </el-sub-menu>

    <el-menu-item class="fixed-width" index="5" disabled>
      {{ selectedPlatformName || platformDisabledTitle }}
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, toRefs } from "vue";
import { useCarBaseInfoStore } from "@/stores/carbaseinfo";
import { useCarTypeStore } from "@/stores/cartype";
import { useVerticalParallelARBConnectedStore } from "@/stores/vertical_parallel_arb_connected";
import { storeToRefs } from "pinia";

// 定义props
const props = defineProps<{
  platformList?: Array<{ id: string; name: string }>;
  carTypeList?: Array<{ id: string; name: string }>;
}>();

const activeIndexCarType = ref("all-car-type");
const selectedCarTypeName = ref(""); // 存储选中的车型名称
const selectedPlatformName = ref(""); // 存储选中的平台名称
const selectedCarTypeId = ref<string | null>(null); // 存储选中的id
const selectedPlatformId = ref<string | null>(null); // 存储选中的id

// 引入 Pinia Store
const carBaseInfoStore = useCarBaseInfoStore();
const carTypeStore = useCarTypeStore();
const verticalParallelARBConnectedStore = useVerticalParallelARBConnectedStore();

const { getAllCarBaseInfo, getCarOrSUV } = carBaseInfoStore;
const { carBaseInfoList, selectedCarTypeId_ts } = storeToRefs(carBaseInfoStore)

const { carTypeList, getCarType } = carTypeStore;
const { verticalParallelARBConnectedList } = storeToRefs(
  verticalParallelARBConnectedStore
);
const { getVerticalParallelARBConnected } = verticalParallelARBConnectedStore;

// 计算属性，用于动态确定标题
const carTypeMenuTitle = computed(() => {
  if (props.carTypeList && props.carTypeList.length) {
    return "车型选择";
  } else {
    return "选择"; // 默认标题，当两者都不存在时
  }
});
const platformMenuTitle = computed(() => {
  if (props.platformList && props.platformList.length) {
    return "平台选择";
  } else {
    return "选择"; // 默认标题，当两者都不存在时
  }
});

const carTypeDisabledTitle = computed(() => {
  if (props.carTypeList && props.carTypeList.length) {
    return "全部";
  } else {
    return "选择";
  }
});
const platformDisabledTitle = computed(() => {
  if (props.platformList && props.platformList.length) {
    return "全部";
  } else {
    return "选择";
  }
});

// 控制是否显示平台数据
const isPlatformList = computed(
  () => !!(props.platformList && props.platformList.length)
);
// 控制是否显示车型数据
const isCarTypeList = computed(
  () => !!(props.carTypeList && props.carTypeList.length)
);

const handleSelect = (key: string, keyPath: string[]) => {
  // 处理菜单选择
};

// 选择车型
function selectCarType(carType: { id: string; name: string } | null) {
  if (carType) {
    selectedCarTypeName.value = carType.name;
    selectedCarTypeId.value = carType.id;
    selectedCarTypeId_ts.value = carType.id;
  } else {
    // 选择了 全部 ，清空车型选择
    selectedCarTypeName.value = "全部";
    selectedCarTypeId.value = null;
    selectedCarTypeId_ts.value = null;
  }
  console.log("选中的车型ID:", selectedCarTypeId.value, selectedCarTypeName.value);

  // 重新获取数据，无论是否点击同一个选项
  fetchData();
}

// 选择平台
function selectPlatform(platform: { id: string; name: string } | null) {
  if (platform) {
    selectedPlatformName.value = platform.name;
    selectedPlatformId.value = platform.id;
  } else {
    // 选择了 全部 ，清空平台选择
    selectedPlatformName.value = "全部";
    selectedPlatformId.value = null;
  }
  console.log("选中的平台ID:", selectedPlatformId.value, selectedPlatformName.value);
  // 重新获取数据，无论是否点击同一个选项
  // fetchData();
}


// 在组件加载时调用 getCarOrSUV，并将数据存入 carBaseInfoList
onMounted(async () => {
  await fetchData();
  // 获取车型数据：轿车、SUV【菜单栏】
  const data = await getCarType();
  // 按照 id 从小到大排序
  data.sort((x: any, y: any) => Number(x.id) - Number(y.id));
  // 更新 store 中的 carTypeList
  carTypeStore.carTypeList.splice(0, carTypeStore.carTypeList.length, ...data);
});


// 定义请求数据的方法
async function fetchData() {
  try {
    if (selectedCarTypeId.value) {
      // 清空 carBaseInfoList 以确保数据是最新的
      carBaseInfoStore.carBaseInfoList.length = 0;
      const data = await getCarOrSUV({ id: selectedCarTypeId.value });
      // 确保 data 是数组并且不为 undefined
      if (Array.isArray(data)) {
        carBaseInfoStore.carBaseInfoList.push(...data); // 将返回数据添加到 carBaseInfoList
      } else {
        console.warn("请求返回的数据不是数组或是 undefined:", data);
      }
    }
    else {
      carBaseInfoStore.carBaseInfoList.length = 0;
      const data = await getAllCarBaseInfo();
      // 确保 data 是数组并且不为 undefined
      if (Array.isArray(data)) {
        carBaseInfoStore.carBaseInfoList.push(...data); // 将返回数据添加到 carBaseInfoList
      } else {
        console.warn("请求返回的数据不是数组或是 undefined:", data);
      }
    }
  } catch (error) {
    console.error("Error fetching car types:", error);
  }
}

// 定义函数来调用 getVerticalParallelARBConnected 并更新列表
async function fetchVerticalParallelARBConnected(itemId: number) {
  try {
    const data = await getVerticalParallelARBConnected(itemId);
    // console.log("data：",data)
    // 确保数据是响应式的，使用 ref/ reactive
    verticalParallelARBConnectedList.value = data || [];
    // console.log("更新后的 verticalParallelARBConnectedList:", verticalParallelARBConnectedStore.verticalParallelARBConnectedList);
  } catch (error) {
    console.error("Error fetching verticalParallelARBConnected data:", error);
  }
}
</script>

<style scoped>
.el-menu-demo {
  border-radius: 10px;
}

.fixed-width {
  /* 固定宽度 */
  width: 100px;
}
</style>
