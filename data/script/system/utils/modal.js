import * as constants from "../../data/constants.js";

export function openModal() {
  constants.editModal.classList.remove('hidden');
  void constants.modalContent.offsetWidth;
  constants.modalContent.classList.remove('scale-95', 'opacity-0');
  constants.modalContent.classList.add('scale-100', 'opacity-100');
}

export function closeModal() {
  constants.modalContent.classList.remove('scale-100', 'opacity-100');
  constants.modalContent.classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    constants.editModal.classList.add('hidden');
    constants.editForm.innerHTML = '';
  }, 300);
}