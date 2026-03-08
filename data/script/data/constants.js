import {showToast} from "../system/utils/function.js";
export const state ={
  currentPage : 1,
  pageSize : 10,
  sortField : null,
  sortDirection : 'asc',
  searchTerm : '',
  chart : null,
  subjects_options:null,
  expense_type_options: ['试卷', '答题卡'],
  submitterOptions:null,
  autoMatchEnabled : localStorage.getItem('autoMatchEnabled') !== null ? JSON.parse(localStorage.getItem('autoMatchEnabled')) : true,
  records : (JSON.parse(localStorage.getItem('printingRecords')) || []).map(({unitPrice, totalAmount, ...rest}) => rest)
}

// DOM 元素
export const printForm = document.getElementById('print-form');
export const recordsTableBody = document.getElementById('records-table-body');
export const totalRecordsElement = document.getElementById('total-records');
export const startRecordElement = document.getElementById('start-record');
export const endRecordElement = document.getElementById('end-record');
export const currentPageElement = document.getElementById('current-page');
export const prevPageButton = document.getElementById('prev-page');
export const nextPageButton = document.getElementById('next-page');
export const pageSizeSelect = document.getElementById('page-size');
export const searchInput = document.getElementById('search-input');
export const selectAllCheckbox = document.getElementById('select-all');
export const exportSelectedButton = document.getElementById('export-selected-btn');
export const exportAllButton = document.getElementById('export-all-btn');
export const backupButton = document.getElementById('backup-btn');
export const settingsButton = document.getElementById('settings-btn');
export const editModal = document.getElementById('edit-modal');
export const modalContent = document.getElementById('modal-content');
export const closeModalButton = document.getElementById('close-modal');
export const editForm = document.getElementById('edit-form');
export const importButton = document.getElementById('import-btn');
export const fileUploadInput = document.getElementById('file-upload');
export const settingsModal = document.getElementById('settingsModal');
export const closeBtn = document.getElementById('closeSettings');
export const autoMatchToggle = document.getElementById('transform-button');
// 设置部分的全局变量
autoMatchToggle.textContent = state.autoMatchEnabled ? "开" : "关";
// 计算字段 (印刷总数)
export const paperCountInput = document.getElementById('paper-count');
export const copyCountInput = document.getElementById('copy-count');
export const printTypeSelect = document.getElementById('print-type');
export const totalPagesInput = document.getElementById('total-pages');  // 只读，位于费用分类区块
// 下拉框"其他"相关 (包含恢复的费用分类字段)
export const paperSizeSelect = document.getElementById('paper-size');
export const paperSizeOtherContainer = document.getElementById('paper-size-other-container');
export const paperSizeOtherInput = document.getElementById('paper-size-other');
export const gradeSelect = document.getElementById('grade');
export const gradeOtherContainer = document.getElementById('grade-other-container');
export const gradeOtherInput = document.getElementById('grade-other');
// 费用分类相关 (已恢复)
export const expenseTypeSelect = document.getElementById('expense-type');
export const expenseTypeOtherContainer = document.getElementById('expense-type-other-container');
export const expenseTypeOtherInput = document.getElementById('expense-type-other');
export const subjectSelect = document.getElementById('subject');
export const subjectOtherContainer = document.getElementById('subject-other-container');
export const subjectOtherInput = document.getElementById('subject-other');
export const submitterSelect = document.getElementById('submitter');
export const submitterOtherContainer = document.getElementById('submitter-other-container');
export const submitterOtherInput = document.getElementById('submitter-other');
export const responsiblePersonInput = document.getElementById('responsible-person'); // 已移入费用分类
// 预设值列表
document.addEventListener('DOMContentLoaded', function () {
  // ===== 处理 select 数据 =====
  if (window.selectData) {
    const data = window.selectData;

    // 添加额外费用类型
    if (data.added_expense_type && Array.isArray(data.added_expense_type)) {
      data.added_expense_type.forEach(expenseType => {
        const option = document.createElement('option');
        option.text = expenseType;
        option.value = expenseType;
        // 插入到第二个选项之前（索引1），保留第一个提示项
        expenseTypeSelect.insertBefore(option, expenseTypeSelect[1]);
        state.expense_type_options.push(expenseType);
      });
    }

    // 设置科目选项
    if (data.subject && Array.isArray(data.subject)) {
      state.subjects_options = data.subject; // 保存到全局变量（如果需要）
      data.subject.forEach(subject => {
        const option = document.createElement('option');
        option.text = subject;
        option.value = subject;
        subjectSelect.insertBefore(option, subjectSelect[1]);
      });
    }
    showToast('配置数据加载成功', 'info');
  } else {
    console.error('selectData 未定义');
    showToast('配置数据加载失败', 'error');
  }

  // ===== 处理 teachers 数据 =====
  if (window.teachersData) {
    window.getSubjectBySubmitter = window.teachersData; // 保持全局变量名一致
    state.submitterOptions = Object.keys(window.teachersData);
    state.submitterOptions.forEach((submitter) => {
      const option = document.createElement('option');
      option.text = submitter;
      option.value = submitter;
      submitterSelect.insertBefore(option, submitterSelect[1]);
    });
    showToast('教师数据加载成功', 'info');
  } else {
    console.error('teachersData 未定义');
    showToast('教师数据加载失败', 'error');
  }
});
export const GRADE_OPTIONS = ['高一', '高二', '高三'];
export const PAPER_SIZE_OPTIONS = ['A3', 'A4', 'A5', 'B4', 'B5'];

// 初始化日期为今天
document.getElementById('date').valueAsDate = new Date();