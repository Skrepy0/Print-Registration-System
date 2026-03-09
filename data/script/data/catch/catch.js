import {showToast} from "../../system/utils/function.js";

export const data = {
  catchTeacherList: (() => {
    try {
      const stored = localStorage.getItem('catchTeacherList');
      if (stored) {
        const parsed = JSON.parse(stored);
        return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
      }
    } catch (e) {
      showToast("解析送印人数据失败："+e,"error");
      console.error('解析 catchTeacherList 失败:', e);
    }
    return {};
  })()
}
export function saveData(){
  localStorage.setItem('catchTeacherList', JSON.stringify(data.catchTeacherList));
}