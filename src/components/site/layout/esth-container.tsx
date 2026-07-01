import type { ReactNode } from "react";

type EsthContainerProps = {
  children: ReactNode;
  /** Match original Bootstrap `container p-0` — no inner horizontal padding */
  flush?: boolean;
  className?: string;
  innerClassName?: string;
};

export function EsthContainer({ children, flush, className, innerClassName }: EsthContainerProps) {
  return (
    <div className={className ? `esth-container-fluid ${className}` : "esth-container-fluid"}>
      <div
        className={[
          "esth-container",
          flush ? "esth-container--flush" : "",
          innerClassName ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
