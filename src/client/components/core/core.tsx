import classNames from "classnames";
import React from "react";
import styles from "./index.module.scss";

// Define Polymorphic Type
type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PolymorphicComponentProps<
  C extends React.ElementType,
  Props = {}
> = AsProp<C> &
  React.ComponentPropsWithoutRef<C> &
  Props & {
    ref?: React.ComponentPropsWithRef<C>["ref"];
  };

// Box Component
export type BoxProps<C extends React.ElementType = "div"> =
  PolymorphicComponentProps<C, {}>;

export function Box<C extends React.ElementType = "div">({
  as,
  className,
  ...props
}: BoxProps<C>) {
  const Component = as || "div";
  return <Component className={classNames(className, styles.box)} {...props} />;
}

// Button Component
export type ButtonProps<C extends React.ElementType = "button"> =
  PolymorphicComponentProps<C, {}>;

export function Button<C extends React.ElementType = "button">({
  as,
  className,
  ...props
}: ButtonProps<C>) {
  const Component = as || "button";

  // Only add button-specific props when rendering as a button
  const buttonProps =
    Component === "button"
      ? { type: "button" as const, role: "button" as const }
      : {};

  return (
    <Component
      className={classNames(className, styles.button)}
      {...buttonProps}
      {...props}
    />
  );
}

// Flex Component
export type FlexProps<C extends React.ElementType = "div"> =
  PolymorphicComponentProps<
    C,
    {
      direction?: "column" | "column-reverse" | "row" | "row-reverse";
    }
  >;

export function Flex<C extends React.ElementType = "div">({
  as,
  direction,
  className,
  style,
  ...props
}: FlexProps<C>) {
  const Component = as || "div";
  return (
    <Component
      className={classNames(className, styles.flex)}
      style={{
        flexDirection: direction,
        ...style,
      }}
      {...props}
    />
  );
}

export type ModalProps<C extends React.ElementType = "div"> =
  PolymorphicComponentProps<
    C,
    {
      isOpen: boolean;
      onClose?: () => void;
      title?: string;
    }
  >;
export function Modal<C extends React.ElementType = "div">({
  as,
  isOpen,
  onClose,
  title,
  className,
  children,
  ...props
}: ModalProps<C>) {
  const Component = as || "div";
  return (
    <Component
      className={classNames(className, styles.modal)}
      style={{
        display: isOpen ? undefined : "none",
      }}
      {...props}
    >
      <div className={styles.modalContent}>
        <div className={styles.closeButton} role="button" onClick={onClose}>
          &times;
        </div>
        {title && <h2 className={styles.modalTitle}>{title}</h2>}
        <div className={styles.modalBody}>{children}</div>
      </div>
    </Component>
  );
}
