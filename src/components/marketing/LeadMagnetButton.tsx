import React, { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button.tsx";
import LeadMagnetModal from "./LeadMagnetModal.tsx";

interface LeadMagnetButtonProps extends ButtonProps {
  title?: string;
  description?: string;
  downloadUrl?: string;
  children: React.ReactNode;
}

const LeadMagnetButton = ({
  title,
  description,
  downloadUrl,
  children,
  ...buttonProps
}: LeadMagnetButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button {...buttonProps} onClick={() => setIsModalOpen(true)}>
        {children}
      </Button>
      <LeadMagnetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        description={description}
        downloadUrl={downloadUrl}
      />
    </>
  );
};

export default LeadMagnetButton;
