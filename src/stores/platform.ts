import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'

interface PlatForm {
    id: string;
    name: string;
}
export const usePlatformStore = defineStore('platform', () => {
    const platformList = ref<PlatForm[]>([
        { id: "1", name: 'T1X' },
        { id: "2", name: 'T2X' },
        { id: "3", name: 'T3X' },
        { id: "4", name: 'T4X' },
        { id: "5", name: 'T5X' },
        { id: "6", name: 'T6X' },
        { id: "7", name: 'T7X' },
        { id: "8", name: 'T8X' },
        { id: "9", name: 'T9X' },
    ])

    return { platformList }
})
