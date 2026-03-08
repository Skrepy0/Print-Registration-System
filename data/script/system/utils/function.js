import * as constants from "../../data/constants.js";
import {state} from "../../data/constants.js";

export function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toast-icon');
  const msgEl = document.getElementById('toast-message');
  const colors = {success: 'green', warning: 'yellow', error: 'red', info: 'blue'};
  const icons = {
    success: 'fa-check-circle',
    warning: 'fa-exclamation-triangle',
    error: 'fa-times-circle',
    info: 'fa-info-circle'
  };
  toast.className = `fixed bottom-5 right-5 px-4 py-3 rounded-xl shadow-2xl transform translate-y-20 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center z-50 backdrop-blur-md bg-white/90 border border-${colors[type]}-200`;
  icon.className = `fa ${icons[type]} mr-2 text-${colors[type]}-600`;
  msgEl.textContent = msg;
  setTimeout(() => {
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  }, 10);
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3000);
}

// 计算印刷总数
export function calculateTotalPages() {
  const paperCount = parseInt(constants.paperCountInput.value) || 0;
  const copyCount = parseInt(constants.copyCountInput.value) || 0;
  constants.totalPagesInput.value = paperCount * copyCount;
}

export function updateSyncStatus(s) {
  document.getElementById('sync-status').innerHTML = s ? '<i class="fa fa-check-circle text-green-500 mr-1 animate-pulse"></i><span>数据已同步</span>' : '<i class="fa fa-exclamation-triangle text-yellow-500 mr-1"></i><span>数据未同步</span>';
}

export function updateSubject() {
  if (!state.autoMatchEnabled) return;
  const submitter = document.getElementById('submitter');
  if (submitter && submitter.value !== '其他') {
    if (getSubjectBySubmitter[submitter.value]) {
      constants.subjectSelect.value = getSubjectBySubmitter[submitter.value];
    }
  }
}

export function togglePaperSizeOther() {
  constants.paperSizeSelect.value === '其他' ? constants.paperSizeOtherContainer.classList.remove('hidden') : (constants.paperSizeOtherContainer.classList.add('hidden'), constants.paperSizeOtherInput.value = '');
}

export function toggleGradeOther() {
  constants.gradeSelect.value === '其他' ? constants.gradeOtherContainer.classList.remove('hidden') : (constants.gradeOtherContainer.classList.add('hidden'), constants.gradeOtherInput.value = '');
}

export function toggleSubjectOther() {
  constants.subjectSelect.value === '其他' ? constants.subjectOtherContainer.classList.remove('hidden') : (constants.subjectOtherContainer.classList.add('hidden'), constants.subjectOtherInput.value = '');
}

export function toggleSubmitterOther() {
  constants.submitterSelect.value === '其他' ? constants.submitterOtherContainer.classList.remove('hidden') : (constants.submitterOtherContainer.classList.add('hidden'), constants.submitterOtherInput.value = '');
}

export function toggleExpenseTypeOther() {
  constants.expenseTypeSelect.value === '其他' ? constants.expenseTypeOtherContainer.classList.remove('hidden') : (constants.expenseTypeOtherContainer.classList.add('hidden'), constants.expenseTypeOtherInput.value = '');
}

export function getFinalValue(sel, other) {
  if (sel.value === '其他') return other.value.trim() || '其他';
  return sel.value || '';
}

export function updateToggleUI() {
  constants.autoMatchToggle.style.color = state.autoMatchEnabled ? 'green' : 'red';
}

export function settings() {
  constants.settingsModal.classList.remove('hidden');
}