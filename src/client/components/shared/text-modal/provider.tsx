import { useCallback, useEffect, useState } from "react";
import { Button, Modal } from "../../core/core";
import { type ITextModalConfig, TextModalContext } from "./text-modal";

import styles from "./text-modal.module.scss";

export default function TextModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [modalConfig, setModalConfig] = useState<ITextModalConfig | null>(null);
  const [value, setValue] = useState<string>("");

  const handleClose = () => {
    setModalConfig(null);
  };
  const handleSubmit = useCallback(() => {
    if (modalConfig?.onConfirm) {
      modalConfig.onConfirm(value);
    }
    handleClose();
  }, [modalConfig, value]);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    },
    [handleSubmit]
  );

  useEffect(() => {
    setValue(modalConfig?.defaultValue || "");
  }, [modalConfig]);

  return (
    <TextModalContext.Provider value={{ prompt: setModalConfig }}>
      {children}
      {modalConfig && (
        <Modal
          isOpen={!!modalConfig}
          onClose={handleClose}
          title={modalConfig.title}
        >
          <input
            type="text"
            placeholder={modalConfig.placeholder}
            defaultValue={modalConfig.defaultValue}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.textInput}
          />
          <Button onClick={handleSubmit}>
            {modalConfig.submitButtonText || "Submit"}
          </Button>
        </Modal>
      )}
    </TextModalContext.Provider>
  );
}
