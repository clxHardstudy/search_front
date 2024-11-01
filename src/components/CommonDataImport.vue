<template>
    <div class="car-data">
        <!-- 搜索表单区域 -->
        <div class="search-form">
            <el-form :inline="true" :model="formInline" class="demo-form-inline">
                <el-form-item label="轴距">
                    <el-input v-model="formInline.wheelbase" placeholder="示例：2880 或 2880-3000" clearable />
                </el-form-item>
                <el-form-item label="前轮距">
                    <el-input v-model="formInline.front_track" placeholder="示例：2880 或 2880-3000" clearable />
                </el-form-item>
                <el-form-item label="后轮距">
                    <el-input v-model="formInline.rear_track" placeholder="示例：2880 或 2880-3000" clearable />
                </el-form-item>
                <el-form-item>
                    <el-button plain type="primary" @click="onSubmit" :loading="isLoading">查询</el-button>
                </el-form-item>
            </el-form>
        </div>
        <!-- 表格显示区域 -->
        <div>
            <el-table :data="transformedCarBaseInfoList" style="width: 100%; table-layout: auto" height="300">
                <el-table-column fixed prop="id" label="序号" min-width="100" />
                <el-table-column fixed prop="name" label="车型名称" min-width="200" />
                <el-table-column prop="wheelbase" label="轴距" min-width="80" />
                <el-table-column prop="front_track" label="前轮距" min-width="80" />
                <el-table-column prop="rear_track" label="后轮距" min-width="80" />
                <el-table-column prop="price_range" label="售价区间" min-width="120" />
                <el-table-column prop="curb_weight" label="整备质量" min-width="120" />
                <el-table-column prop="maximum_front_axle_mass" label="前轴最大质量" min-width="120" />
                <el-table-column prop="maximum_rear_axle_mass" label="后轴最大质量" min-width="120" />
                <el-table-column prop="car_type_name" label="所属型号" min-width="100" />
                <el-table-column prop="platform_name" label="所属平台" min-width="100" />
                <el-table-column prop="release_date" label="发布时间" min-width="150" />
            </el-table>
        </div>
        <el-divider />

        <div class="upload">
            <el-upload class="upload-demo" drag :action="getUploadUrl()" multiple :auto-upload="false" :limit="1"
                :on-exceed="handleExceed" ref="upload" :on-success="handleSuccess" :on-error="handleError">
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                    文件拖拽到这 或者<em> 点击上传</em>
                </div>
                <template #tip>
                    <div class="el-upload__tip">
                        上传excel文件导入数据
                    </div>
                </template>
            </el-upload>

            <!-- 手动上传按钮 -->
            <el-button type="primary" @click="submitUpload">数据提交</el-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, reactive, onMounted, watch, ref, nextTick } from "vue";
import { useCarBaseInfoStore } from "../stores/carbaseinfo";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { UploadFilled } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'
import { ElMessage } from 'element-plus'
import { genFileId } from 'element-plus'
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import { API_BASE_URL } from "@/config/config"

// 从 carBaseInfoStore 中获取汽车基本信息相关的函数和状态
const carBaseInfoStore = useCarBaseInfoStore();
const { carBaseInfoSelectIdList } = storeToRefs(carBaseInfoStore)
const { carBaseInfoList, searchNewCarByMultipleConditionQuery, searchCarByMultipleConditionQuery } = carBaseInfoStore;
const userStore = useUserStore();

// 从 workingConditionsStore 中获取工况相关的状态
const { selectedCarTypeId_ts, selectedPlatformList_ts } = storeToRefs(carBaseInfoStore); // 选中的车型类型 ID

// 在你的脚本中定义一个函数
const getUploadUrl = () => {
    return `${API_BASE_URL}/data_import`; // 使用封装的 API_BASE_URL
};

// 定义表单相关的状态
const formInline = reactive({
    // name: "",
    wheelbase: "",
    front_track: "",
    rear_track: "",
}); // 车型名称和轴距的表单数据

// 加载状态
const isLoading = ref(false); // 查询按钮的加载状态

// 转换后的汽车基本信息列表，计算汽车类型名称和平台名称
const transformedCarBaseInfoList = computed(() => {
    const platformMap: { [key: number]: string } = {
        1: "T1X",
        2: "T2X",
        3: "E0X",
        4: "M1X",
        5: "Benchmark",
    };
    const CarTypeMap: { [key: number]: string } = {
        1: "SD",
        2: "SUV",
        3: "MPV",
    };
    return carBaseInfoList.map((item) => ({
        ...item,
        car_type_name: CarTypeMap[item.car_type_id as keyof typeof CarTypeMap] || "未知",
        platform_name: platformMap[item.platform_id as keyof typeof platformMap] || "未知", // 显式转换 platform_id 的类型
    }));
});

// 车型查询按钮点击事件
const onSubmit = async () => {
    try {
        isLoading.value = true; // 设置加载状态
        const data = await searchNewCarByMultipleConditionQuery({
            car_type_id: Number(selectedCarTypeId_ts.value),
            platform_id_list: selectedPlatformList_ts.value,
            // name: formInline.name,
            wheelbase: formInline.wheelbase,
            front_track: formInline.front_track,
            rear_track: formInline.rear_track,
            car_base_info_id_list: carBaseInfoSelectIdList.value
        })
        carBaseInfoStore.carBaseInfoList.splice(0, carBaseInfoStore.carBaseInfoList.length, ...data); // 更新表格数据
    } finally {
        isLoading.value = false; // 查询完成后，取消加载状态
        ElNotification({
            title: '状态：查询成功！',
            message: `共查询到 ${carBaseInfoStore.carBaseInfoList.length} 条数据。`,  // 显示查询到的数量
            type: 'success',
        })
    }
};

// 文件上传
const upload = ref<UploadInstance>()

const handleExceed: UploadProps['onExceed'] = (files) => {
    upload.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    upload.value!.handleStart(file)
}

// 文件上传成功后的处理
const handleSuccess = (response: any) => {
    ElNotification({
        title: '上传成功',
        message: '文件已成功上传并处理。',
        type: 'success',
    })
    console.log("上传成功，后端返回的响应:", response)
}

// 文件上传失败后的处理
const handleError = (error: any) => {
    ElNotification({
        title: '上传失败',
        message: '文件上传或处理失败。',
        type: 'error',
    })
    console.error("上传失败，错误信息:", error)
}

// 手动提交上传
const submitUpload = async () => {
    const token = sessionStorage.getItem("token");
    console.log("提交文件！")
    if (token) {
        const response = await userStore.getUserOne({ token: token })
        console.log("response: ", response)
        if (response.name_en !== "admin") {
            ElMessage.error('禁止！你没有此操作权限')
            return
        }
        (upload.value as any).submit()
    }
}

</script>


<style scoped>
/* 允许组件滚动 */
.car-data {
    height: 100vh;
    width: 100%;
    overflow-y: auto;
    /* 允许垂直滚动 */
}

/* 表格 */
.el-table {
    border: 1px solid #dcdfe6;
    /* 设置表格的边框 */
    border-radius: 4px;
    /* 设置圆角边框 */
}

.el-table th,
.el-table td {
    border: 1px solid #dcdfe6;
    /* 设置表头和单元格的边框 */
}

.el-table thead {
    background-color: #f5f7f9;
    /* 设置表头背景色 */
}

/* search-form表单 */
.demo-form-inline .el-input {
    --el-input-width: 220px;
}

.demo-form-inline .el-select {
    --el-select-width: 220px;
}

.upload {
    margin-top: 20px;
}
</style>