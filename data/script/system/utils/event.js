import * as constants from "../../data/constants.js";
import {state} from "../../data/constants.js";
import {updateToggleUI} from "./function.js";
export function registerEvents() {
  // 点击切换
  constants.autoMatchToggle.addEventListener('click', () => {
    state.autoMatchEnabled = !state.autoMatchEnabled;
    updateToggleUI();
    constants.autoMatchToggle.textContent = state.autoMatchEnabled ? '开' : '关';
    localStorage.setItem('autoMatchEnabled', JSON.stringify(state.autoMatchEnabled));
  });

  // 关闭模态框（点击遮罩或关闭按钮）
  constants.closeBtn.addEventListener('click', () => {
    constants.settingsModal.classList.add('hidden');
  });

  // 点击遮罩层关闭
  constants.settingsModal.addEventListener('click', (e) => {
    if (e.target === constants.settingsModal) {
      constants.settingsModal.classList.add('hidden');
    }
  });
}