"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      richColors
      position="top-right"
      theme="dark"
      toastOptions={{
        className: "border border-white/12 bg-[#11192c] text-white",
      }}
    />
  );
}
