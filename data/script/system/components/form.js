import * as constants from "../../data/constants.js";
import {state} from "../../data/constants.js";
import {showToast, calculateTotalPages, getFinalValue} from "../utils/function.js";
import {getFilteredRecords, renderRecords, saveRecords} from "./records.js";
import {updateChart} from "./chart.js";
export function handleFormSubmit(e) {
  e.preventDefault();
  const grade = getFinalValue(constants.gradeSelect, constants.gradeOtherInput);
  const subject = getFinalValue(constants.subjectSelect, constants.subjectOtherInput);
  const submitter = getFinalValue(constants.submitterSelect, constants.submitterOtherInput);
  const paperSize = getFinalValue(constants.paperSizeSelect, constants.paperSizeOtherInput);
  const expenseType = getFinalValue(constants.expenseTypeSelect, constants.expenseTypeOtherInput);
  if (!grade || grade === '请选择年级') return showToast('请选择年级', 'warning');
  if (!subject) return showToast('请选择或输入学科', 'warning');
  if (!submitter || submitter === '其他') return showToast('请输入有效的送印人', 'warning');

  const newRecord = {
    id: Date.now().toString(),
    date: document.getElementById('date').value,
    grade, subject, paperSize, expenseType, submitter,
    printType: constants.printTypeSelect.value,
    paperCount: parseInt(constants.paperCountInput.value) || 0,
    copyCount: parseInt(constants.copyCountInput.value) || 0,
    plateCount: parseInt(document.getElementById('plate-count').value) || 0,
    totalPages: parseInt(constants.totalPagesInput.value) || 0,
    responsiblePerson: constants.responsiblePersonInput.value.trim(),
    notes: document.getElementById('notes').value.trim(),
    createdAt: new Date().toISOString()
  };
  state.records.unshift(newRecord);
  saveRecords();
  renderRecords();
  updateChart();
  constants.printForm.reset();
  document.getElementById('date').valueAsDate = new Date();
  calculateTotalPages();
  showToast('记录保存成功', 'success');
}

// ========== 分页、搜索、排序 ==========
export function goToPrevPage() {
  if (state.currentPage > 1) {
    state.currentPage--;
    renderRecords();
  }
}

export function goToNextPage() {
  const t = Math.ceil(getFilteredRecords().length / state.pageSize);
  if (state.currentPage < t) {
    state.currentPage++;
    renderRecords();
  }
}

export function handlePageSizeChange() {
  state.pageSize = +constants.pageSizeSelect.value;
  state.currentPage = 1;
  renderRecords();
}

export function handleSearch() {
  state.searchTerm = constants.searchInput.value.trim();
  state.currentPage = 1;
  renderRecords();
}

export function handleSort(f) {
  if (state.sortField === f) state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
  else {
    state.sortField = f;
    state.sortDirection = 'asc';
  }
  document.querySelectorAll('.sortable i').forEach(i => i.className = 'fa fa-sort ml-1');
  const ic = document.querySelector(`.sortable[data-sort="${f}"] i`);
  if (ic) ic.className = `fa fa-sort-${state.sortDirection} ml-1`;
  renderRecords();
}

// ========== 全选 ==========
export function handleSelectAll() {
  document.querySelectorAll('.record-select').forEach(cb => cb.checked = constants.selectAllCheckbox.checked);
}