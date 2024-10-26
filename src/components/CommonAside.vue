<template>
  <el-aside class="aside-menu">
    <el-menu :default-active="activePath" active-text-color="#ffd04b" background-color="#545c64"
      class="el-menu-vertical-demo" text-color="#fff" :router="true" @open="handleOpen" @close="handleClose">
      <router-link to="/">
        <el-menu-item index="/" style="display: flex; justify-content: center; align-items: center">
          <!-- 将 index 设置为路由路径 -->
          <CheryIcon />
        </el-menu-item>
      </router-link>

      <router-link to="/cartype">
        <el-menu-item index="/cartype">
          <car-icon />
          <span>汽车管理</span>
        </el-menu-item>
      </router-link>

      <router-link to="/info">
        <el-menu-item index="/info">
          <platform-icon />
          <span>信息管理</span>
        </el-menu-item>
      </router-link>

      <router-link to="/data_import">
        <el-menu-item index="/data_import">
          <platform-icon />
          <span>数据导入</span>
        </el-menu-item>
      </router-link>


    </el-menu>
  </el-aside>
</template>

<script setup lang="ts">

import CarIcon from "./icons/CarIcon.vue";
import PlatformIcon from "./icons/PlatformIcon.vue";
import CheryIcon from "./icons/CheryIcon.vue";

import { ref, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const activePath = computed(() => route.path);

const handleOpen = (key: string, keyPath: string[]) => {
  // console.log(key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
  // console.log(key, keyPath);
};
</script>

<style scoped>
.aside-menu {
  height: 100vh;
  /* 设置高度为视口高度 */
  overflow-y: auto;
  /* 允许垂直滚动 */
  width: 13%;
  /* 自定义宽度 */
  background-color: #545c64;
  /* 背景色 */
}

.el-menu-demo {
  width: 100%;
  /* 使菜单宽度适应容器 */
}

.aside-menu {
  border-radius: 0 10px 10px 0;
}

a {
  text-decoration: none;
  /* 移除下划线 */
}
</style>
