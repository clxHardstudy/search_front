import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import type { TableColumnCtx } from 'element-plus'


export const useUtilsStore = defineStore('utils', () => {
    // 合并工况
    // 明确指定类型
    const merge = ref(false);
    let mindexGroups = reactive<{ start: number; end: number; }[]>([]);

    function toggleMerge() {
        merge.value = !merge.value;
        console.log("合并工况")
    }

    // 声明参数的类型
    function arraySpanMethod({
        row,
        column,
        rowIndex,
        columnIndex,
    }: {
        row: { [key: string]: any }; // 或者更具体的类型
        column: TableColumnCtx<any>;
        rowIndex: number;
        columnIndex: number;
    }) {
        if (!merge.value) {
            return;
        }
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

    function generateIndexGroups(data: Array<Record<string, any>>, field: string[]) {
        let tmp = data.map((i) => {
            return field.map(f => i[f]).join("+");
        });
        return findIndexs(tmp);
    }

    function findIndexs(array: string[]): { start: number; end: number }[] {
        let current = array[0];
        let result: { start: number; end: number }[] = [];
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
    return { toggleMerge, arraySpanMethod, generateIndexGroups }
})