import AppNavigation from "@/components/AppNavigation";
import InstallPrompt from "@/components/InstallPrompt";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNavigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <InstallPrompt />
    </div>
  );
};

export default MainLayout;
