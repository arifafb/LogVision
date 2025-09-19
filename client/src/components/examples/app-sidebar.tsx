import { AppSidebar } from '../app-sidebar';
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-96 w-full">
        <AppSidebar />
        <div className="flex-1 p-6">
          <h2 className="text-xl font-semibold mb-4">Main Content Area</h2>
          <p className="text-muted-foreground">
            This is where the main dashboard content would appear. 
            Click on sidebar items to navigate (functionality will be added in full app).
          </p>
        </div>
      </div>
    </SidebarProvider>
  );
}