import * as constants from "../../data/constants.js";
import {dataModalContent, editDataModal, editTeacherDataModal, state} from "../../data/constants.js";
import {disableBackgroundWheel, enableBackgroundWheel} from "./function.js";

export function openModal() {
  constants.editModal.classList.remove('hidden');
  void constants.modalContent.offsetWidth;
  constants.modalContent.classList.remove('scale-95', 'opacity-0');
  constants.modalContent.classList.add('scale-100', 'opacity-100');
  disableBackgroundWheel();
}

export function closeModal() {
  constants.modalContent.classList.remove('scale-100', 'opacity-100');
  constants.modalContent.classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    constants.editModal.classList.add('hidden');
    constants.editForm.innerHTML = '';
  }, 300);
  enableBackgroundWheel();
}

export function showEditDataModal() {
  constants.editTeacherDataModal.classList.add('hidden');
  constants.editDataModal.classList.remove('hidden');
  constants.dataModalContent.classList.remove('scale-95', 'opacity-0');
  constants.dataModalContent.classList.add('scale-100', 'opacity-100');
  disableBackgroundWheel();
}