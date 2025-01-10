import React from "react";

export default function DefaultBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-screen mx-3 mt-3 rounded-md">
      {children}
    </div>
  );
}
