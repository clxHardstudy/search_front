import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from "axios";


export const useFilterDataStore = defineStore('filterdata', () => {

  // 分组工况详细ID
  function groupWorkingConditionsDetail(details: string[]): { [key: number]: number[] } {
    return details.reduce((acc: { [key: number]: number[] }, detailId: string) => {
      const [conditionId, detailOriginalId] = detailId.split('-').map(Number);
      if (!acc[conditionId]) acc[conditionId] = [];
      acc[conditionId].push(detailOriginalId);
      return acc;
    }, {});
  }

  // 提取工况详细内容
  function extractWorkingConditionsDetails(
    groupedDetails: { [key: number]: number[] },
    detailObj: { [key: number]: { id: number }[] }
  ): { [key: number]: { id: number }[] } {
    const extracted: { [key: number]: { id: number }[] } = {};
    Object.keys(groupedDetails).forEach(conditionIdStr => {
      const conditionId = Number(conditionIdStr);
      const detailIds = groupedDetails[conditionId];
      if (detailObj[conditionId]) {
        extracted[conditionId] = detailObj[conditionId].filter(detail =>
          detailIds.includes(detail.id)
        );
      }
    });
    return extracted;
  }

  // 根据英文名更新键名
  function updateKeyNames(
    extractedDetails: { [key: number]: any[] },
    selectedDetails: { id: number; name_en: string }[]
  ): { [key: string]: any[] } {
    const updated: { [key: string]: any[] } = {};
    selectedDetails.forEach(conditionObj => {
      const conditionId = conditionObj.id;
      const conditionNameEn = conditionObj.name_en;
      if (extractedDetails[conditionId]) {
        updated[conditionNameEn] = extractedDetails[conditionId];
      }
    });
    return updated;
  }

  // 过滤出需要的字段并保留 car_base_info_id
  function filterDataByRequiredKeys(
    newExtractedDetails: { [key: string]: { name_en: string }[] },
    data: { [key: string]: any[] }
  ): { [key: string]: any[] } {
    const filtered: { [key: string]: any[] } = {};
    Object.keys(newExtractedDetails).forEach(key => {
      const detailsList = newExtractedDetails[key];
      const dataList = data[key];
      if (dataList && detailsList) {
        const requiredKeys = detailsList.map(detail => detail.name_en);
        filtered[key] = dataList.map(item => {
          const filteredItem: any = {};

          // 保留 car_base_info_id
          if (item.hasOwnProperty('car_base_info_id')) {
            filteredItem['car_base_info_id'] = item['car_base_info_id'];
          }

          // 保留 requiredKeys 中的字段
          requiredKeys.forEach(requiredKey => {
            if (item.hasOwnProperty(requiredKey)) {
              filteredItem[requiredKey] = item[requiredKey];
            }
          });
          return filteredItem;
        });
      }
    });
    return filtered;
  }

  return { groupWorkingConditionsDetail, extractWorkingConditionsDetails, updateKeyNames, filterDataByRequiredKeys }
})