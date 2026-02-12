import type { ReactNode } from "react";

export interface GlobalModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  size?: "md" | "lg" | "xl" | "2xl";
}

export interface ModalComponent {
  Global: React.FC<GlobalModalProps>;
}
