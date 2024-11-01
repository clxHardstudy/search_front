// 第一步：引入createRouter
import Main from "@/views/Main.vue";
import PlatForm from "@/views/Info.vue";
import CarType from "@/views/CarType.vue";
import DataImport from "@/views/DataImport.vue";
import BubbleChart from "../views/BubbleChart.vue";
import Login from "@/views/Login.vue";
import { jwtDecode } from 'jwt-decode';
import { createRouter, createWebHistory } from "vue-router";



// 引入一个一个可能呈现的组件

// 第二步：创建路由器
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            component: Login,
        },
        {
            path: '/',
            component: Main,
            meta: { requiresAuth: true } // 添加 requiresAuth 元字段表示需要登录验证
        },
        {
            path: '/info',
            component: PlatForm,
            meta: { requiresAuth: true }
        },
        {
            path: '/cartype',
            component: CarType,
            meta: { requiresAuth: true } // 添加 requiresAuth 元字段表示需要登录验证
        },
        {
            path: '/bubble_chart',
            component: BubbleChart,
            meta: { requiresAuth: true } // 添加 requiresAuth 元字段表示需要登录验证
        },

        {
            path: '/data_import',
            component: DataImport,
            meta: { requiresAuth: true } // 添加 requiresAuth 元字段表示需要登录验证
        },

    ]
})
// 添加全局守卫
router.beforeEach(async (to, from, next) => {
    let isAuthenticated;
    let userRole; // 新增用户角色
    const auth_token = sessionStorage.getItem("token");
    if (auth_token) {
        try {
            const decoded = jwtDecode(auth_token);
            console.log('Decoded token:', decoded);
            const currentTime = Math.floor(Date.now() / 1000); // 获取当前时间戳（秒）
            // 检查 token 是否过期
            if (decoded.exp !== undefined && decoded.exp > currentTime) {
                isAuthenticated = true; // 认证通过
            } else {
                isAuthenticated = false; // token 已过期
                console.error('Token 已过期');
            }
        } catch (error) {
            isAuthenticated = false; // token 解析失败
            console.error('Token 解析错误:', error);
        }
    } else {
        console.log('没有找到 token');
    }
    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ path: '/login' }); // 如果没有认证，重定向到登录页
    }
    else {
        next(); // 允许访问
    }
});

export default router