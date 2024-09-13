<template>
    <div class="car-data">
      <div class="search-form">
        <el-form :inline="true" :model="formInline" class="demo-form-inline">
          <el-form-item label="车型名称">
            <el-input
              v-model="formInline.name"
              placeholder="请输入..."
              clearable
            />
          </el-form-item>
          <el-form-item label="轴距">
            <el-input
              v-model="formInline.wheelbase"
              placeholder="示例：2880 或 2880-3000"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
  
      <div class="table">
        <el-table
          :data="transformedCarBaseInfoList"
          style="width: 100%; table-layout: auto"
          height="300"
        >
          <el-table-column fixed prop="id" label="序号" min-width="150" />
          <el-table-column fixed prop="name" label="车型名称" min-width="200" />
          <el-table-column prop="wheelbase" label="轴距" min-width="120" />
          <el-table-column prop="release_date" label="发布时间" min-width="120" />
          <el-table-column prop="car_type_name" label="型号类别" min-width="100" />
        </el-table>
      </div>
  
      <div class="chart-area">
        <div id="bubble-chart" class="chart-container">
          <!-- ECharts 图表容器 -->
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { computed, reactive, onMounted, watch } from "vue";
  import { useCarBaseInfoStore } from "../stores/carbaseinfo"; // 确保导入路径正确
  import * as echarts from 'echarts';
  
  // 使用 CarBaseInfoStore
  const carBaseInfoStore = useCarBaseInfoStore();
  const { carBaseInfoList, searchCarOrSUV, searchCarByWheelbase, searchCarByNameAndWheelbase } = carBaseInfoStore;
//   console.log("carBaseInfoList: ",carBaseInfoList)
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
  
  const onSubmit = async () => {
    try {
      if (formInline.name.trim() && !formInline.wheelbase.trim()) {
        // 名称搜索
        const data = await searchCarOrSUV({ name: formInline.name });
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
        const data = await searchCarByWheelbase({ wheelbase: formInline.wheelbase });
        carBaseInfoStore.carBaseInfoList.splice(0, carBaseInfoStore.carBaseInfoList.length, ...data);
      } else if (formInline.name.trim() && formInline.wheelbase.trim()) {
        // 名称和轴距组合搜索
        const data = await searchCarByNameAndWheelbase({ name: formInline.name, wheelbase: formInline.wheelbase });
        carBaseInfoStore.carBaseInfoList.splice(0, carBaseInfoStore.carBaseInfoList.length, ...data);
      }
    } catch (error) {
      console.error("Error fetching car types:", error);
    }
  };
  
  // ECharts 图表初始化和响应式更新
  let myChart_bubble_chart: any;
  
  onMounted(() => {
    // 初始化 ECharts 实例
    const chartDom = document.getElementById("bubble-chart");
    if (chartDom) {
      myChart_bubble_chart = echarts.init(chartDom);
      updateChart(); // 初始化时绘制图表
    }
  });
  
  // 监控 carBaseInfoList 的变化以更新图表
  watch(
    () => carBaseInfoList,
    () => {
      updateChart(); // 数据变化时更新图表
    },
    { deep: true } // 深度监控对象内部变化
  );
  
  function updateChart() {
    if (!myChart_bubble_chart) return;
  
    // 将 carBaseInfoList 转换为 ECharts 数据格式
    const chartData = carBaseInfoList.map(car => [car.name, car.wheelbase, car.wheelbase]);
  
    // ECharts 配置
    const option = {
      title: {
        text: '车型-轴距',
        left: 'center',
        top: '3%'
      },
      xAxis: {
        type: 'category',
        name: '车型名称',
        data: carBaseInfoList.map(car => car.name),
        splitLine: { lineStyle: { type: 'dashed' } }
      },
      yAxis: {
        type: 'value',
        name: '轴距',
        splitLine: { lineStyle: { type: 'dashed' } },
        scale: true
      },
      series: [
        {
          name: 'Car Types',
          type: 'scatter',
          data: chartData,
          symbolSize: function (data: any) {
            return Math.sqrt(data[2]) / 2; // 根据轴距调整气泡大小
          },
          emphasis: {
            focus: 'series',
            label: {
              show: true,
              formatter: function (param: any) {
                return param.data[0] + "\n" + param.data[1]; // 显示车型名称
              },
              position: 'top'
            }
          },
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(120, 36, 50, 0.5)',
            shadowOffsetY: 5,
            color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
              { offset: 0, color: 'rgb(251, 118, 123)' },
              { offset: 1, color: 'rgb(204, 46, 72)' }
            ])
          }
        }
      ]
    };
  
    // 设置图表的配置项和数据
    myChart_bubble_chart.setOption(option);
  }
  </script>
  
  <style scoped>
  /* 允许组件滚动 */
  .car-data {
    height: 100vh;
    width: 100%;
    overflow-y: auto; /* 允许垂直滚动 */
  }
  
  /* 表格 */
  .el-table {
    border: 1px solid #dcdfe6; /* 设置表格的边框 */
    border-radius: 4px; /* 设置圆角边框 */
  }
  
  .el-table th,
  .el-table td {
    border: 1px solid #dcdfe6; /* 设置表头和单元格的边框 */
  }
  
  .el-table thead {
    background-color: #f5f7f9; /* 设置表头背景色 */
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
    height: 400px; /* 设置固定高度或相对高度 */
  }
  
  .chart-container {
    width: 100%; /* 占父容器宽度 */
    height: 100%; /* 占父容器高度 */
    position: relative;
  }
  </style>
  