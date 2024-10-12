<template>
  <div>这里是platform</div>

  <el-dropdown size="large" split-button type="primary">
    Large
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item>Action 1</el-dropdown-item>
        <el-dropdown-item>Action 2</el-dropdown-item>
        <el-dropdown-item>Action 3</el-dropdown-item>
        <el-dropdown-item>Action 4</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <div class="div1">
    <div class="flex flex-wrap items-center gap-4">

      <el-dropdown placement="top" :hide-on-click="false">
        <el-button class="transparent-btn"> top </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>The Action 1st</el-dropdown-item>
            <el-dropdown-item>The Action 2st</el-dropdown-item>
            <el-dropdown-item>The Action 3st</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.div1 {
  background-color: aqua;
}
.transparent-btn {
  background-color: transparent;  /* 背景透明 */
  border: none;                   /* 移除边框 */
  color: #fff;                    /* 设置文本颜色 */
}

.transparent-btn:hover {
  background-color: rgba(255, 255, 255, 0.1); /* 可选：增加 hover 效果 */
}
</style>