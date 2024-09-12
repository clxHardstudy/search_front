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

        <el-form-item>
          <el-button type="primary" @click="onSubmit">Query</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table">
      <el-table
        :data="transformedCarTypeInfoList"
        style="width: 100%; table-layout: auto"
        height="300"
      >
        <el-table-column fixed prop="id" label="序号" min-width="150" />
        <el-table-column fixed prop="name" label="车型名称" min-width="200" />
        <el-table-column prop="wheelbase" label="轴距" min-width="120" />
        <el-table-column prop="release_date" label="发布时间" min-width="120" />
        <el-table-column prop="category" label="型号类别" min-width="100" />
      </el-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive } from "vue";
import { useCarTypeStore } from "../stores/cartype";
import axios from "axios";

const carTypeStore = useCarTypeStore();
const { carTypeInfoList,searchCarOrSUV } = carTypeStore;

// 计算属性来处理数据转换
const transformedCarTypeInfoList = computed(() => {
  return carTypeInfoList.map((item) => ({
    ...item,
    category:
      item.category === 0
        ? "轿车"
        : item.category === 1
        ? "SUV"
        : "其他",
  }));
});

const formInline = reactive({
  name: "",  // 这里应该与接口参数保持一致，假设你用 'user' 作为属性名
});

const onSubmit = async () => {
  if (formInline.name.trim()) {
    try {
      const data = await searchCarOrSUV({ name: formInline.name });
      // 更新数组内容而不是整个数组
      carTypeStore.carTypeInfoList.splice(0, carTypeStore.carTypeInfoList.length, ...data);
    } catch (error) {
      console.error("Error fetching car types:", error);
    }
  }
};

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
</style>
