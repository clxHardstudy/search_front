<template>
  <el-main class="aside-menu">
    <div id="main" class="main-scrollable" style="width: 600px; height: 800px">
      <!-- ECharts 图表容器 -->
    </div>
    <div id="main1" class="main-scrollable" style="width: 600px; height: 400px">
      <!-- ECharts 图表容器 -->
    </div>
  </el-main>
</template>
  

<script setup name="App" lang="ts">
import { onMounted, reactive } from "vue";
import * as echarts from "echarts";
import { useCarTypeStore } from "../stores/cartype";

const cartypeStore = useCarTypeStore();

const { carTypeList, getAllCarType } = cartypeStore;

var carTypeInfoList = reactive([]);

// 获取所有的cartype数据
onMounted(async () => {
  // try {
  //   // 使用 await 等待 Promise 解析
  //   carTypeInfoList = await getAllCarType();
  //   // console.log(carTypeInfoList); // 打印出数组数据
  // } catch (error) {
  //   console.error("Error fetching car types:", error); // 如果有错误，打印错误
  // }

  //   ts语法
  const namesArray = carTypeInfoList.map((car) => car.name);
  const wheelBaseArray = carTypeInfoList.map((car) => car.wheelbase);
  // console.log(namesArray);

  const chartDom = document.getElementById("main");
  const chartDom1 = document.getElementById("main1");

  // prettier-ignore
  if (chartDom) {
    const myChart = echarts.init(chartDom);
    const myChart1 = echarts.init(chartDom1);

    const option = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [150, 230, 224, 218, 135, 147, 260],
      type: 'line'
    }
  ]
};
    // 设置图表的配置项和数据
    myChart.setOption(option);
    myChart1.setOption(option);
  }
});
</script>
  
  
<style scoped>

.aside-menu {
  height: 100vh; 
  width: 100%;
  overflow-y: auto; /* 允许垂直滚动 */
}

</style>