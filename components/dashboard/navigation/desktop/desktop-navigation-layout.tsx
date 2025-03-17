import type React from "react";
import { SideBar } from "../side-bar";
import { SupportBar } from "../support-bar";

export const DesktopNavigationLayout: React.FC<React.PropsWithChildren> = ({ children }) => {

  return (
      <nav className="flex flex-col h-full overflow-hidden">
        <div className="flex flex-1">
          <SideBar/>
          <div className="flex flex-1 overflow-hidden">
            <SupportBar />
            <main className="relative flex-1 max-h-full">
              {children}
            </main>
          </div>
        </div>
      </nav>
  );
};

export default DesktopNavigationLayout;
