<template>
  <div class="common-layout">
    <el-container class="lay-container">
      <!-- 自定义左侧组件 -->
      <common-aside />

      <el-container>
        <el-header class="el-header">
          <common-header :carTypeList="carTypeList" />
        </el-header>

        <el-main class="right-main">
          <common-car-type />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
    
<script setup lang="ts">
import { storeToRefs } from "pinia";

import CommonAside from "../components/CommonAside.vue";
import CommonHeader from "../components/CommonHeader.vue";
// import CommonMain from "../components/CommonMain.vue";
import CommonCarType from "../components/CommonCarType.vue";

import { useCarTypeStore } from "../stores/cartype";

const carTypeStore = useCarTypeStore();
const { carTypeList } = storeToRefs(carTypeStore);
</script>
    
<style>
.common-layout,
.lay-container {
  height: 100%;
}
.el-header {
  /* background-color: #333; */
  padding: 0;
}
body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
  /* 防止滚动 */
  overflow: hidden;
}
</style>