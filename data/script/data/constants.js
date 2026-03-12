import {showToast} from "../system/utils/function.js";
import {data} from "./catch/catch.js";
import * as constants from "./constants.js";

export const state = {
  currentPage: 1,
  pageSize: 10,
  sortField: null,
  sortDirection: 'asc',
  searchTerm: '',
  searchData: '',
  chart: null,
  subjects_options: null,
  expense_type_options: ['试卷', '答题卡'],
  submitterOptions: null,
  records: (JSON.parse(localStorage.getItem('printingRecords')) || []).map(({unitPrice, totalAmount, ...rest}) => rest)
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
export const delSelectedRecord = document.getElementById('del-selected');
export const totalPrintNum = document.getElementById('total-print');
export const selectTodayRecords = document.getElementById('select-today');
// 导入文件
export const importModeModal = document.getElementById('import-mode-modal');
export const importModeModalContent = document.getElementById('import-mode-modal-content');
export const importModalMessage = document.getElementById('modal-message');
export const mergeButton = document.getElementById('merge-btn');
export const overwriteButton = document.getElementById('overwrite-btn');
export const cancelButton = document.getElementById('cancel-btn');

// 提示窗口
export const promptModal = document.getElementById('prompt-modal');
export const promptModalContent= document.getElementById('prompt-modal-content');
export const promptTitle= document.getElementById('prompt-title');
export const promptTrueBtn = document.getElementById('prompt-true');
export const promptFalseBtn = document.getElementById('prompt-false');

// 设置
export const toggles = document.getElementsByClassName("settings-button");
export const autoMatchToggle = document.getElementById('auto-match-button');
export const reverseUpload = document.getElementById('reverse-upload-button');
export const autoCatchToggle = document.getElementById('auto-catch-button');
export const editTeacherDataToggle = document.getElementById('edit-catch-teacher-data-button');
export const editTeacherDataModal = document.getElementById('edit-catch-modal');
export const closeEditTeacherData = document.getElementById('close-edit-teacher-catch');
export const editCatchTBody = document.getElementById('edit-catch-records-table-body');
export const editCatchSelectAll = document.getElementById('edit-catch-select-all');
export const deleteSelectData = document.getElementById('delect-selected-data-button');
export const searchDataInput = document.getElementById('data-search-input');
export const editDataModal = document.getElementById('edit-data-modal');
export const dataModalContent = document.getElementById('data-modal-content');
export const editDataForm = document.getElementById('edit-data-form');
export const closeDataModalButton = document.getElementById('close-data-modal');
export const closeAddDataModalButton = document.getElementById('close-add-modal');
export const addModalContent = document.getElementById('add-modal-content');
export const addDataModal = document.getElementById('add-modal');
export const addDataButton = document.getElementById('add-data');
export const backupSubmitterButton = document.getElementById('backup-data-button');
export const loadBackupSubmitterButton = document.getElementById('import-data-button');
export const uploadSubmitterFile = document.getElementById('import-submitter-file');
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

// 费用分类相关
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
reload();
export const GRADE_OPTIONS = ['高一', '高二', '高三'];
export const PAPER_SIZE_OPTIONS = ['A3', 'A4', 'A5', 'B4', 'B5'];
document.getElementById('date').valueAsDate = new Date();

export function loadSubmitters() {
  constants.submitterSelect.innerHTML = `<option value="">请选择送印人</option>
                                        <option value="其他">其他</option>`;
  if (data.catchTeacherList) {
    Object.entries(data.catchTeacherList).forEach(([key, value]) => {
      if (!Array.isArray(window.teachersData[key])) {
        window.teachersData[key] = ['', ''];
      }
      window.teachersData[key][1] = value[1];
      window.teachersData[key][0] = value[0];
    });
  }
  if (window.teachersData) {
    window.getAutoDataBySubmitter = window.teachersData; // 保持全局变量名一致
    state.submitterOptions = Object.keys(window.teachersData);
    state.submitterOptions.forEach((submitter) => {
      const option = document.createElement('option');
      option.text = submitter;
      option.value = submitter;
      constants.submitterSelect.insertBefore(option, submitterSelect[1]);
    });
    showToast('教师数据加载成功', 'info');
  } else {
    console.error('teachersData 未定义');
    showToast('教师数据加载失败', 'error');
  }
}

export function reload() {
  if (window.selectData) {
    const selectData = window.selectData;
    if (selectData.added_expense_type && Array.isArray(selectData.added_expense_type)) {
      const existingTexts = new Set(Array.from(expenseTypeSelect.options).map(opt => opt.text));

      selectData.added_expense_type.forEach(expenseType => {
        if (!existingTexts.has(expenseType)) {
          const option = document.createElement('option');
          option.text = expenseType;
          option.value = expenseType;
          expenseTypeSelect.insertBefore(option, expenseTypeSelect[1]);
          state.expense_type_options.push(expenseType);
          existingTexts.add(expenseType);
        }
      });
    }

    if (selectData.subject && Array.isArray(selectData.subject)) {
      state.subjects_options = selectData.subject;
      selectData.subject.forEach(subject => {
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

  loadSubmitters();
}