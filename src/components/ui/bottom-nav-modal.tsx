import type { ReactNode } from "react";
import { type IconDefinition } from "@fortawesome/free-solid-svg-icons";
import Modal from "./modal";

interface BottomNavModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: IconDefinition;
  children: ReactNode;
}

const BottomNavModal = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
}: BottomNavModalProps) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={title}
      icon={icon}
      variant="bottom"
    >
      {children}
    </Modal>
  );
};

export default BottomNavModal;
