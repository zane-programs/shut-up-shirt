import { useCallback, useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    setValue(modalConfig?.defaultValue || "");
  }, [modalConfig]);

  return (
    <TextModalContext.Provider value={{ prompt: setModalConfig }}>
      {children}
      {modalConfig && (
        <ModalComponent
          modalConfig={modalConfig}
          setModalConfig={setModalConfig}
          value={value}
          setValue={setValue}
        />
      )}
    </TextModalContext.Provider>
  );
}

function ModalComponent({
  modalConfig,
  setModalConfig,
  value,
  setValue,
}: {
  modalConfig: ITextModalConfig;
  setModalConfig: React.Dispatch<React.SetStateAction<ITextModalConfig | null>>;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

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
    inputRef.current?.focus();
  }, []);

  return (
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
        ref={inputRef}
      />
      <Button onClick={handleSubmit}>
        {modalConfig.submitButtonText || "Submit"}
      </Button>
    </Modal>
  );
}
