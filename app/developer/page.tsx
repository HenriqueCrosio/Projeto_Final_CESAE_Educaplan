import { NextPage } from "next";
import React from "react";
import { CodeSnippet } from "@/components/code-snippet";
import { getAdminMessage } from "@/services/message.service";
import ZustandViewerPage from "@/components/zustand-viewer";

const Admin: NextPage = async () => {
  const { text } = await getAdminMessage();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-shrink-0">
        <CodeSnippet title="Admin Message" code={text} />
      </div>
      <div className="flex-grow overflow-auto">
        <ZustandViewerPage />
      </div>
    </div>
  );
};

export default Admin;


