import { Link } from "react-router";
import { Button, ButtonProps, Flex } from "../../shared/core";
import classNames from "classnames";

import styles from "./home.module.scss";

export default function Home() {
  return (
    <Flex as="main" direction="column" className={styles.home}>
      <LinkButton to="/text" className={styles.text}>
        <span>Text</span>
      </LinkButton>
      <LinkButton to="/editor" className={styles.editor}>
        Editor
      </LinkButton>
      <LinkButton to="/presets" className={styles.presets}>
        presets
      </LinkButton>
    </Flex>
  );
}

function LinkButton({
  to,
  children,
  className,
  ...props
}: ButtonProps & {
  to: string;
}) {
  return (
    <Button
      className={classNames(styles.linkButton, className)}
      as={Link}
      to={to}
      {...props}
    >
      {children}
    </Button>
  );
}
