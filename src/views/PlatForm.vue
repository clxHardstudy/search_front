<template>
  <div class="common-layout">
    <el-container class="lay-container">
      <!-- 自定义左侧组件 -->
      <common-aside />

      <el-container>
        <el-header class="el-header">
          <common-header :PlatFormList="platformList"/>
        </el-header>

        <el-main class="right-main">
          <common-platform />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
  
<script setup lang="ts">
import { storeToRefs } from "pinia";

import CommonAside from "../components/CommonAside.vue";
import CommonHeader from "../components/CommonHeader.vue";
import CommonPlatform from "../components/CommonPlatform.vue";

import { usePlatformStore } from "../stores/platform";

const platformStore = usePlatformStore();
const { platformList } = storeToRefs(platformStore);

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