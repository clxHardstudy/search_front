import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'

export const usePlatformStore = defineStore('platform', () => {
    const platformList = reactive([
        { id: "1-1", platform: 'T1X' },
        { id: "1-2", platform: 'T2X' },
        { id: "1-3", platform: 'T3X' },
        { id: "1-4", platform: 'T4X' },
        { id: "1-5", platform: 'T5X' },
        { id: "1-6", platform: 'T6X' },
        { id: "1-7", platform: 'T7X' },
        { id: "1-8", platform: 'T8X' },
        { id: "1-9", platform: 'T9X' },
    ])

    return { platformList }
})
