import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { useStore } from "../../store";
import { useEffect } from "react";

export function Layout() {
  const { darkMode } = useStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <Sidebar />
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6 min-h-[calc(100vh-117px)]">
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
}
