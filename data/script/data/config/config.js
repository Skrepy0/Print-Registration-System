import * as constants from "../constants.js";
import {updateToggleUI} from "../../system/utils/function.js";
export const config = {
  autoMatchEnabled : localStorage.getItem('autoMatchEnabled') !== null ? JSON.parse(localStorage.getItem('autoMatchEnabled')) : true,
  autoCatchInfo: localStorage.getItem('autoCatchInfo') !== null ? JSON.parse(localStorage.getItem('autoCatchInfo')) : false
}
export function registerConfig() {
  constants.autoCatchToggle.textContent = init(config.autoCatchInfo);
  constants.autoMatchToggle.textContent = init(config.autoMatchEnabled);
  updateToggleUI();
}
function init(value) {
  return value ? '开' : '关';
}
