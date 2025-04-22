import { createContext, useContext } from "react";

export interface ITextModalConfig {
  title: string;
  placeholder?: string;
  submitButtonText?: string;
  onConfirm?: (text: string) => void;
  onCancel?: () => void;
  defaultValue?: string;
}
export interface ITextModalContext {
  prompt: (config: ITextModalConfig) => void;
}

export const TextModalContext = createContext<ITextModalContext>(
  {} as ITextModalContext
);

export function useTextModal() {
  const context = useContext(TextModalContext);
  if (!context) {
    throw new Error("useTextModal must be used within a TextModalProvider");
  }
  return context;
}

export { default as TextModalProvider } from "./provider";
