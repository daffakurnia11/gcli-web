import type { ModalComponent } from "@/types/Modal";

import GlobalModal from "./GlobalModal";

const Modal = {} as ModalComponent;
Modal.Global = GlobalModal;

export { Modal };
export { default as GlobalModal } from "./GlobalModal";
export type { GlobalModalProps, ModalComponent } from "@/types/Modal";
