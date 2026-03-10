import {showToast} from "./function.js";
import * as constants from "../../data/constants.js";
import {reload, state} from "../../data/constants.js";
import {renderRecords, saveRecords} from "../components/records.js";
import {updateChart} from "../components/chart.js";
import {data, saveData} from "../../data/catch/catch.js";
import {renderData} from "../../data/catch/form.js";
import {config} from "../../data/config/config.js";

export function exportSelectedRecords() {
  const ids = Array.from(document.querySelectorAll('.record-select:checked')).map(c => c.dataset.id);
  if (!ids.length) return showToast('请选择记录', 'warning');
  exportRecordsToExcel(state.records.filter(r => ids.includes(r.id)), '印刷记录_选中');
}

export function exportAllRecords() {
  exportRecordsToExcel(state.records, '印刷记录_全部');
}

export function exportRecordsToExcel(data, name) {
  let newData = data;
  if (config.reverseDateUpload) {
    newData = [...data].sort((a, b) => {
      const format = (dateStr) => dateStr.replace(/\//g, '-'); // 将 / 替换为 -
      return format(a.date).localeCompare(format(b.date));
    });
  }
  const out = newData.map(r => ({
    日期: r.date, 年级: r.grade || '', 学科: r.subject, 送印人: r.submitter, 纸张: r.paperSize,
    单双: r.printType, 纸张数: r.paperCount, 份数: r.copyCount, 印刷总数: r.totalPages,
    类型: r.expenseType, 负责人: r.responsiblePerson || '', 备注: r.notes || ''
  }));
  const ws = XLSX.utils.json_to_sheet(out);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '印刷记录');
  XLSX.writeFile(wb, `${name}_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  showToast('导出成功', 'success');
}

// ========== 备份 ==========
export function backupData() {
  if (!state.records.length) return showToast('无数据可备份', 'warning');
  const cleanForBackup = state.records.map(({unitPrice, totalAmount, ...keep}) => keep);
  const blob = new Blob([JSON.stringify({records: cleanForBackup, time: new Date()})], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `备份_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('备份成功', 'success');
}
export function backupSubmitterData() {
  if (!data.catchTeacherList || Object.keys(data.catchTeacherList).length === 0) {
    return showToast('无数据可备份', 'warning');
  }
  try {
    const jsonStr = JSON.stringify(data.catchTeacherList, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-submitters-${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('备份成功', 'success');
  } catch (error) {
    console.error('备份失败:', error);
    showToast('备份失败', 'error');
  }
}
// ========== 导入 ==========
export function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file || (file.type !== 'application/json' && !file.name.endsWith('.json'))) {
    showToast('请选择JSON文件', 'error');
    constants.fileUploadInput.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.records || !Array.isArray(data.records)) throw new Error('无效备份');
      const cleanedIncoming = data.records.map(({unitPrice, totalAmount, ...rest}) => rest);
      const isValid = cleanedIncoming.every(r => r.id && r.date && r.subject && r.submitter);
      if (!isValid) {
        showToast('备份文件中存在不完整的记录', 'error');
        constants.fileUploadInput.value = '';
        return;
      }

      const mode = confirm(`备份中有 ${cleanedIncoming.length} 条记录。\n确定=覆盖现有，取消=合并`);
      if (mode) {
        state.records = cleanedIncoming;
      } else {
        const existingIds = new Set(state.records.map(r => r.id));
        const newRecords = cleanedIncoming.filter(r => !existingIds.has(r.id));
        const updatedRecords = cleanedIncoming.filter(r => existingIds.has(r.id));
        updatedRecords.forEach(backupRecord => {
          const index = state.records.findIndex(r => r.id === backupRecord.id);
          if (index !== -1) state.records[index] = backupRecord;
        });
        state.records = [...newRecords, ...state.records];
      }
      saveRecords();
      renderRecords();
      updateChart();
      showToast('导入成功', 'success');
    } catch (err) {
      showToast('解析失败' + err, 'error');
      console.log(err);
    }
    constants.fileUploadInput.value = '';
  };
  reader.readAsText(file);
}
export function fileUploadSubmitterData(e) {
  const file = e.target.files[0];
  // 文件类型检查
  if (!file || (file.type !== 'application/json' && !file.name.endsWith('.json'))) {
    showToast('请选择JSON文件', 'error');
    e.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const importedData = JSON.parse(event.target.result);

      // 验证根数据是否为对象（且不是数组）
      if (typeof importedData !== 'object' || importedData === null || Array.isArray(importedData)) {
        throw new Error('文件格式错误：应为对象');
      }

      // 验证每个教师的数据格式
      for (const [key, value] of Object.entries(importedData)) {
        if (!Array.isArray(value) || value.length < 2) {
          throw new Error(`数据格式错误：教师 "${key}" 的值不是有效数组`);
        }
        // 可选：确保学科和年级为字符串
        if (typeof value[0] !== 'string' || typeof value[1] !== 'string') {
          throw new Error(`教师 "${key}" 的学科或年级应为字符串`);
        }
      }

      // 统计导入的教师数量
      const importCount = Object.keys(importedData).length;
      if (importCount === 0) {
        showToast('备份文件中没有教师数据', 'warning');
        e.target.value = '';
        return;
      }

      // 询问用户选择覆盖还是合并
      const mode = confirm(`备份中有 ${importCount} 位教师数据。\n确定=覆盖现有数据，取消=合并（新增或更新）`);

      if (mode) {
        // 覆盖：直接替换
        data.catchTeacherList = importedData;
        showToast('已覆盖现有教师数据', 'info');
      } else {
        // 合并：新增或更新
        const currentList = data.catchTeacherList || {};
        // 合并对象：导入的教师条目将覆盖同名的现有条目，新增不存在条目
        data.catchTeacherList = { ...currentList, ...importedData };
        showToast('已合并教师数据', 'info');
      }

      // 保存到 localStorage
      saveData();

      // 刷新相关界面（确保这些函数已导入）
      reload();
      renderData();

      showToast('导入成功', 'success');
    } catch (error) {
      console.error('导入失败:', error);
      showToast('导入失败：' + error.message, 'error');
    } finally {
      // 清空 input 以便重新选择同一文件
      e.target.value = '';
    }
  };
  reader.readAsText(file);
}