<template>
  <div>
    <el-table
      :data="tableData"
      :span-method="objectSpanMethod"
      border
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column prop="workingConditions" label="工况" width="180" />
      <el-table-column prop="workingConditionsDetail" label="工况详细" />
      <el-table-column prop="amount1" label="Amount 1" />
      
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumnCtx } from 'element-plus'

interface WorkCondition {
  workingConditions: string
  workingConditionsDetail: string
  amount1: number
}

interface SpanMethodProps {
  row: WorkCondition
  column: TableColumnCtx<WorkCondition>
  rowIndex: number
  columnIndex: number
}

const objectSpanMethod = ({
  row,
  column,
  rowIndex,
  columnIndex,
}: SpanMethodProps) => {
  if (columnIndex === 0) {
    if (rowIndex % 2 === 0) {
      return {
        rowspan: 2,
        colspan: 1,
      }
    } else {
      return {
        rowspan: 0,
        colspan: 0,
      }
    }
  }
}

const tableData: WorkCondition[] = [
  {
    workingConditions: '工况1',
    workingConditionsDetail: '工况详细1',
    amount1: 234,
  },
  {
    workingConditions: '工况2',
    workingConditionsDetail: '工况详细2',
    amount1: 234,
  },
  {
    workingConditions: '工况3',
    workingConditionsDetail: '工况详细3',
    amount1: 234,
  },
  {
    workingConditions: '工况4',
    workingConditionsDetail: '工况详细4',
    amount1: 234,
  },
  {
    workingConditions: '工况5',
    workingConditionsDetail: '工况详细5',
    amount1: 234,
  },
  
]
</script>
