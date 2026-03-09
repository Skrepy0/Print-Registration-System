import {data, saveData} from "./catch.js";
import * as constants from "../constants.js";
import {loadSubmitters, state} from "../constants.js";
import {showToast} from "../../system/utils/function.js";

function editData(id) {
  return undefined;
}

function delData(key){
  data.catchTeacherList = Object.keys(data.catchTeacherList).filter(k => k !== key);
  if (window.teachersData[key]) {
    delete window.teachersData[key];
  }
}

function deleteData(key) {
  if(!confirm("确认删除？"))return;
  delData(key);
  saveData();
  loadSubmitters();
  renderData();
}

export function deleteSelectDataRecords(){
  const ids = Array.from(document.querySelectorAll('.record-teacher-select:checked')).map(c => c.dataset.id);
  if (!ids.length) return showToast('请选择记录', 'warning');
  if (confirm("确定删除？")){
    ids.forEach(key => {
      delData(key);
    });
    saveData();
    loadSubmitters();
    renderData();
  }
}
export function handleDataSearch() {
  state.searchData = constants.searchDataInput.value.trim();
  renderData();
}
function getFilterData(){
  if (!state.searchData) return data.catchTeacherList;
  let results = {};
  Object.keys(data.catchTeacherList).filter(key=>{
    if (state.searchData === key || state.searchData === data.catchTeacherList[key][0] || state.searchData === data.catchTeacherList[key][1]){
      results[key] = data.catchTeacherList[key];
    }
  });
  return results;
}
export function updateSelectAllData() {
  const cs = document.querySelectorAll('.record-teacher-select');
  constants.editCatchSelectAll.checked = cs.length && Array.from(cs).every(c => c.checked);
}
export function handleSelectAllData() {
  document.querySelectorAll('.record-teacher-select').forEach(cb => cb.checked = constants.editCatchSelectAll.checked);
}
export function renderData() {
  // 确保数据存在
  if (!data || !data.catchTeacherList) return;
  let filter = getFilterData();
  // 清空表格体（删除所有现有行）
  constants.editCatchTBody.innerHTML = '';

  const keys = Object.keys(filter);
  keys.forEach(key => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50/80 transition-colors';

    // 从数据中获取学科和年级（假设数据结构为 { 教师姓名: [学科, 年级] }）
    const subject = filter[key][0];
    const grade = filter[key][1];

    tr.innerHTML = `
      <td class="px-3 py-3">
        <input type="checkbox" class="record-teacher-select rounded border-gray-300 text-primary focus:ring-primary/30" data-id="${key}">
      </td>
      <td class="px-3 py-3">${key}</td>
      <td class="px-3 py-3">${grade}</td>
      <td class="px-3 py-3">${subject}</td>
      <td class="px-3 py-3">
        <button class="edit-teacher-btn text-blue-500 p-1 hover:text-blue-700 transition-transform hover:scale-110">
          <i class="fa info-link" data-info="修改记录">📝</i>
        </button>
        <button class="delete-teacher-btn text-red-500 p-1 hover:text-red-700 transition-transform hover:scale-110">
          <i class="fa info-link" data-info="删除记录">🔥</i>
        </button>
      </td>
    `;

    constants.editCatchTBody.appendChild(tr);

    // 绑定事件
    tr.querySelector('.edit-teacher-btn').addEventListener('click', () => editData(key));
    tr.querySelector('.delete-teacher-btn').addEventListener('click', () => deleteData(key));
    const cb = tr.querySelector('.record-teacher-select');
    cb.addEventListener('change', updateSelectAllData);
  });

  // 更新全选复选框状态
  updateSelectAllData();
}
