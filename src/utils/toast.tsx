import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

let addToast: (message: string, type: ToastType) => void = () => {};

export const toast = {
  success: (message: string) => addToast(message, "success"),
  error: (message: string) => addToast(message, "error"),
  info: (message: string) => addToast(message, "info"),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    addToast = (message: string, type: ToastType) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };
    return () => {
      addToast = () => {};
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center gap-3 bg-white border px-4 py-3 rounded-lg shadow-lg text-sm font-medium min-w-[250px] max-w-[400px] pointer-events-auto",
            t.type === "success" && "border-green-700 text-green-700",
            t.type === "error" && "border-red-700 text-red-700",
            t.type === "info" && "border-blue-700 text-blue-700",
          )}
        >
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() =>
              setToasts((prev) => prev.filter((x) => x.id !== t.id))
            }
            className="text-gray-800 opacity-70 hover:opacity-100 text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
