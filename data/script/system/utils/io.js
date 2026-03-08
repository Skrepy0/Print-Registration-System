import { showToast} from "./function.js";
import * as constants from "../../data/constants.js";
import {state} from "../../data/constants.js";
import {renderRecords} from "../components/records.js";
import {updateChart} from "../components/chart.js";

export function exportSelectedRecords() {
  const ids = Array.from(document.querySelectorAll('.record-select:checked')).map(c => c.dataset.id);
  if (!ids.length) return showToast('请选择记录', 'warning');
  exportRecordsToExcel(state.records.filter(r => ids.includes(r.id)), '印刷记录_选中');
}

export function exportAllRecords() {
  exportRecordsToExcel(state.records, '印刷记录_全部');
}

export function exportRecordsToExcel(data, name) {
  const out = data.map(r => ({
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
      showToast('解析失败'+err, 'error');
      console.log(err);
    }
    constants.fileUploadInput.value = '';
  };
  reader.readAsText(file);
}