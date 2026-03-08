import {updateToggleUI} from "./system/utils/function.js";
import {init} from "./system/init.js";
import {registerEvents} from "./system/utils/event.js";

(function () {
  updateToggleUI();
  registerEvents();
  init();
})();
