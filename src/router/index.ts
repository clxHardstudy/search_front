// 第一步：引入createRouter
import Main from "@/views/Main.vue";
import PlatForm from "@/views/Info.vue";
import CarType from "@/views/CarType.vue";
import DataImport from "@/views/DataImport.vue";
import BubbleChart from "../views/BubbleChart.vue";
import Login from "@/views/Login.vue";


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
router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('token'); // 这里假设你使用 token 来判断是否已登录
    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ path: '/login' }); // 如果没有认证，重定向到登录页
    } else {
        next(); // 允许访问
    }
});

export default router