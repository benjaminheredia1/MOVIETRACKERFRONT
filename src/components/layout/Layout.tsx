import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { Toaster } from "@/components/ui/sonner";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
