import { ReactNode, useState } from 'react';
import { createPortal } from 'react-dom';
import { useActivate, useUnactivate } from 'react-activation';

export default function AppFloatingAction({
  children,
}: {
  children: ReactNode;
}) {
  const [active, setActive] = useState(true);
  useActivate(() => setActive(true));
  useUnactivate(() => setActive(false));

  return active
    ? createPortal(
        <div className="uma-floating-action">{children}</div>,
        document.body,
      )
    : null;
}
