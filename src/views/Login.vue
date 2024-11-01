<template>
    <div class="form-container">
        <el-form ref="ruleFormRef" :model="ruleForm" status-icon :rules="rules" label-width="auto"
            class="demo-ruleForm">
            <h2 class="login-title">登录</h2>
            <el-form-item label="账号" prop="username">
                <el-input v-model="ruleForm.username" autocomplete="off" class="input-width" />
            </el-form-item>
            <el-form-item label="密码" prop="checkPassword">
                <el-input v-model="ruleForm.checkPassword" type="password" autocomplete="off" class="input-width" />
            </el-form-item>

            <el-form-item class="loginButton">
                <el-button type="primary" @click="submitForm(ruleFormRef)">
                    登录
                </el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useLoginStore } from '@/stores/login';
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'; // 引入 useRouter

const router = useRouter(); // 获取 router 实例

const loginStore = useLoginStore()

const ruleFormRef = ref<FormInstance>()

const ruleForm = reactive({
    username: '',
    checkPassword: '',
})

const rules = reactive<FormRules<typeof ruleForm>>({
    username: [{ required: true, message: '请填写账号', trigger: 'blur' }],
    checkPassword: [{ required: true, message: '请填写密码', trigger: 'blur' }],
})

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate(async (valid) => {
        if (valid) {
            try {
                const response = await loginStore.login({
                    username: ruleForm.username,
                    password: ruleForm.checkPassword
                });
                if (response["status_code"] == 200) {
                    console.log("账号密码校验正确，允许登陆")
                    sessionStorage.setItem('token', response['auth_token']);
                    router.push('/');
                    ElMessage({
                        message: '登陆成功, 欢迎来到底盘知识领域',
                        type: 'success',
                    })

                } else if (response["status_code"] == 401) {
                    console.log("用户存在，密码错误，禁止登陆")
                } else if (response["status_code"] == 404) {
                    console.log("用户不存在，禁止登陆")
                }
                // 根据后端返回的结果进行处理
            } catch (error) {
                console.error('登录失败', error);
                // 处理错误，例如显示提示信息
            }
        } else {
            console.log('error submit!')
        }
    })
}

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
}
</script>

<style scoped>
.form-container {
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    /* 垂直居中 */
    height: 100vh;
    /* 使容器高度为100vh */
}

.demo-ruleForm {
    border: 1px solid #dcdfe6;
    /* 添加边框 */
    padding: 20px;
    /* 内边距 */
    border-radius: 5px;
    /* 圆角 */
    background-color: #fff;
    /* 背景颜色 */
    width: 400px;
    /* 设置一个固定宽度 */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    /* 添加阴影以增强效果 */
}

.input-width {
    width: 100%;
    /* 使输入框宽度为100% */
}

.login-title {
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
}

.loginButton {
    margin-top: 20px;
}
</style>
