"use client";

import type { ReactNode } from "react";
import { Footer, Header } from "./components/chrome";
import { vibrantSans, vibrantSerif } from "./fonts";
import "./theme.css";

export function VibrantLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${vibrantSans.variable} ${vibrantSerif.variable} vibrant-theme flex min-h-full flex-col antialiased`}
    >
      <Header />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}
