import {renderRecords} from "./components/records.js";
import {initChart} from "./components/chart.js";
import {initEvents} from "./utils/event.js";
import {calculateTotalPages} from "./utils/function.js";

export function init() {
  calculateTotalPages();
  initEvents();
  renderRecords();
  initChart();
}