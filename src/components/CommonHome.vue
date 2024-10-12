<template>
  <h2>实现表格的合并</h2>
  <div>
    <el-button type="primary" @click="toggleMerge">合并</el-button>
    <el-table :data="tableData" border :span-method="arraySpanMethod" style="width: 100%">
      <el-table-column align="center" v-for="(item, index) in tabHeader" :key="index" :prop="item.prop"
        :label="item.label" :width="item.width" />
    </el-table>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";

const tabHeader = [
  { prop: "dept", label: "部门", width: 180 },
  { prop: "name", label: "姓名" },
  { prop: "area", label: "所属地" },
];

const tableData = reactive([
  { dept: "部门1", name: "李1", area: "1" },
  { dept: "部门1", name: "李2", area: "1" },
  { dept: "部门1", name: "李3", area: "3" },
  { dept: "部门1", name: "李4", area: "2" },
  { dept: "部门2", name: "李1", area: "5" },
  { dept: "部门2", name: "李想3", area: "5" },
  { dept: "部门3", name: "李想33", area: "7" },
]);

let mindexGroups = reactive([]);
const merge = ref(false);

onMounted(() => {
  mindexGroups = generateIndexGroups(tableData, ["dept"]);
});

function toggleMerge() {
  merge.value = !merge.value;
}

function arraySpanMethod({ row, column, rowIndex, columnIndex }) {
  if (!merge.value) {
    return;
  }
  // 合并部门列
  if (columnIndex === 0) {
    for (const group of mindexGroups) {
      if (rowIndex === group.start) {
        return [group.end - group.start + 1, 1];
      }
    }
    return [0, 0]; // 不合并
  }
  return [1, 1]; // 其他列正常显示
}

function generateIndexGroups(data, field) {
  let tmp = data.map((i) => {
    return field.map(f => i[f]).join("+");
  });
  return findIndexs(tmp);
}

function findIndexs(array) {
  let current = array[0];
  let result = [];
  let startIndex = 0;

  for (let i = 1; i < array.length; i++) {
    if (array[i] !== current) {
      result.push({ start: startIndex, end: i - 1 });
      current = array[i];
      startIndex = i;
    }
  }

  result.push({ start: startIndex, end: array.length - 1 });
  return result;
}
</script>