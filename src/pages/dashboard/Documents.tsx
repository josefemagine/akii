import React from "react";
import DocumentsList from "@/components/dashboard/documents/DocumentsList.tsx";

const Documents = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Training Documents</h1>
        <p className="text-muted-foreground mt-1">
          Upload and manage documents to train your AI agents
        </p>
      </div>

      <DocumentsList />
    </div>
  );
};

export default Documents;
