"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import styles from "./Reveal.module.css";

type Props = {
  children: ReactNode;
  delay?: number;
  as?: "div" | "section" | "article" | "header";
  className?: string;
};

export default function Reveal({ children, delay = 0, as: Tag = "div", className }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cls = `${styles.reveal} ${visible ? styles.visible : ""} ${className ?? ""}`.trim();
  const style = { transitionDelay: `${delay}ms` } as React.CSSProperties;

  return (
    <Tag ref={ref as never} className={cls} style={style}>
      {children}
    </Tag>
  );
}
