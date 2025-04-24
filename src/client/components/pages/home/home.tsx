import { Link } from "react-router";
import { Button, type ButtonProps, Flex } from "../../core/core";
import classNames from "classnames";

import styles from "./home.module.scss";
import { useTextModal } from "../../shared/text-modal/text-modal";
import { useCallback } from "react";
import { renderText } from "../../../utils/render-text/render-text";
import { useSocket } from "../../shared/socket/socket";

export default function Home() {
  const { prompt: showPrompt } = useTextModal();
  const { sendImage } = useSocket();

  const promptForText = useCallback(() => {
    showPrompt({
      title: "enter text",
      placeholder: "your message goes here",
      submitButtonText: "Submit",
      onConfirm: async (text) => {
        if (text) {
          const imageBlob = await renderText(text);
          if (imageBlob) {
            sendImage(imageBlob);
          }
        }
      },
      onCancel: () => {
        console.log("Modal closed");
      },
    });
  }, [showPrompt, sendImage]);

  return (
    <>
      <Flex as="main" direction="column" className={styles.home}>
        <HomeButton className={styles.text} onClick={promptForText}>
          <span>Text</span>
        </HomeButton>
        <HomeButton as={Link} to="/draw" className={styles.draw}>
          Draw
        </HomeButton>
        <HomeButton as={Link} to="/editor" className={styles.editor}>
          Editor
        </HomeButton>
        <HomeButton as={Link} to="/presets" className={styles.presets}>
          presets
        </HomeButton>
      </Flex>
    </>
  );
}

function HomeButton<C extends React.ElementType = "button">({
  as,
  className,
  ...props
}: ButtonProps<C>) {
  const Component = as || "button";
  return (
    <Button
      as={Component}
      className={classNames(styles.linkButton, className)}
      {...props}
    />
  );
}
