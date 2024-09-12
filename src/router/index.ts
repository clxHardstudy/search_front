// 第一步：引入createRouter
import Main from "@/views/Main.vue";
import PlatForm from "@/views/PlatForm.vue";
import CarType from "@/views/CarType.vue";

import { createRouter,createWebHistory } from "vue-router";

// 引入一个一个可能呈现的组件

// 第二步：创建路由器
const router = createRouter({
    history:createWebHistory(),
    routes:[
        {
            path:'/',
            component:Main,
        },
        {
            path:'/platform',
            component:PlatForm
        },
        {
            path:'/cartype',
            component:CarType
        },

    ]
})

export default router