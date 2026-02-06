import type { ReactNode } from "react";

export interface GlobalModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}

export interface ModalComponent {
  Global: React.FC<GlobalModalProps>;
}
