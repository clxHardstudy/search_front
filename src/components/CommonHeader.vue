<template>
  <el-menu
    :default-active="activeIndex2"
    class="el-menu-demo"
    mode="horizontal"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b"
    @select="handleSelect"
  >
    <el-menu-item index="1" @click="fetchVerticalParallelARBConnected">Chery</el-menu-item>

    <el-sub-menu index="2">
      <!-- 使用计算属性动态显示标题 -->
      <template #title>{{ menuTitle }}</template>

      <!-- 平台显示渲染 -->
      <el-menu-item
        v-show="isPlatformList"
        v-for="platform in PlatFormList"
        :key="platform.id"
        :index="String(platform.id)"
        @click="selectPlatform(platform)"
      >
        {{ platform.platform }}
      </el-menu-item>

      <!-- 车型显示渲染 -->
      <el-menu-item
        v-show="isCarTypeList"
        v-for="carType in carTypeList"
        :key="carType.id"
        :index="String(carType.id)"
        @click="selectCarType(carType)"
      >
        {{ carType.name }}
      </el-menu-item>
    </el-sub-menu>

    <!-- 显示选中的平台或车型 -->
    <el-menu-item class="fixed-width" index="3" disabled>
      {{ selectedName || disabledTitle }}
    </el-menu-item>
    <el-menu-item index="4">Orders</el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import { useCarBaseInfoStore } from "../stores/carbaseinfo";
import { useCarTypeStore } from "../stores/cartype";
import { useVerticalParallelARBConnectedStore } from "../stores/vertical_parallel_arb_connected";

// 定义props
const props = defineProps<{
  PlatFormList?: Array<{ id: string; platform: string }>;
  carTypeList?: Array<{ id: string; name: string }>;
}>();

const activeIndex2 = ref("1");
const selectedName = ref(""); // 存储选中的平台或车型名称
const selectedId = ref<string | null>(null); // 存储选中的id

// 引入 Pinia Store
const carBaseInfoStore = useCarBaseInfoStore();
const carTypeStore = useCarTypeStore();
const verticalParallelARBConnectedStore = useVerticalParallelARBConnectedStore();

const { carBaseInfoList, getCarOrSUV } = carBaseInfoStore;
const { carTypeList, getCarType } = carTypeStore;
const { verticalParallelARBConnectedList, getVerticalParallelARBConnected } = verticalParallelARBConnectedStore;

// 计算属性，用于动态确定标题
const menuTitle = computed(() => {
  if (props.PlatFormList && props.PlatFormList.length) {
    return "平台选择";
  } else if (props.carTypeList && props.carTypeList.length) {
    return "车型选择";
  } else {
    return "选择"; // 默认标题，当两者都不存在时
  }
});

const disabledTitle = computed(() => {
  if (props.PlatFormList && props.PlatFormList.length) {
    return "请选择平台";
  } else if (props.carTypeList && props.carTypeList.length) {
    return "请选择车型";
  }
});

// 控制是否显示平台数据
const isPlatformList = computed(
  () => !!(props.PlatFormList && props.PlatFormList.length)
);
// 控制是否显示车型数据
const isCarTypeList = computed(
  () => !!(props.carTypeList && props.carTypeList.length)
);

const handleSelect = (key: string, keyPath: string[]) => {
  // console.log(key, keyPath);
};

// 选择平台
function selectPlatform(platform: { id: string; platform: string }) {
  selectedName.value = platform.platform;
  selectedId.value = platform.id;
  console.log("选中的平台ID:", selectedId.value); // 输出选中的平台 ID
}

// 选择车型
function selectCarType(carType: { id: string; name: string }) {
  selectedName.value = carType.name;
  selectedId.value = carType.id;
  console.log("选中的车型ID:", selectedId.value, selectedName.value); // 输出选中的车型 ID
  fetchVerticalParallelARBConnected(); // 调用数据请求函数
}

// 在组件加载时调用 getCarOrSUV，并将数据存入 carBaseInfoList
onMounted(async () => {
  await fetchData();
  // 获取车型数据
  const data = await getCarType();
  // 按照 id 从小到大排序
  data.sort((x: any, y: any) => Number(x.id) - Number(y.id));
  // 更新 store 中的 carTypeList
  carTypeStore.carTypeList.splice(0, carTypeStore.carTypeList.length, ...data);
});

// 监听 selectedId 的变化并触发数据请求
watch(selectedId, async (newId) => {
  if (newId !== null) {
    await fetchData();
  }
});

// 定义请求数据的方法
async function fetchData() {
  try {
    if (selectedId.value) {
      // 清空 carBaseInfoList 以确保数据是最新的
      carBaseInfoStore.carBaseInfoList.length = 0;

      const data = await getCarOrSUV({ id: selectedId.value });

      // 确保 data 是数组并且不为 undefined
      if (Array.isArray(data)) {
        carBaseInfoStore.carBaseInfoList.push(...data); // 将返回数据添加到 carBaseInfoList
        console.log("更新后的车型数据:", carBaseInfoList);
      } else {
        console.warn("请求返回的数据不是数组或是 undefined:", data);
      }
    }
  } catch (error) {
    console.error("Error fetching car types:", error);
  }
}

// 定义函数来调用 getVerticalParallelARBConnected 并更新列表
async function fetchVerticalParallelARBConnected() {
  if (selectedId.value) {
    await getVerticalParallelARBConnected(Number(selectedId.value));
    console.log("更新后的 verticalParallelARBConnectedList:", verticalParallelARBConnectedList.value);
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
