import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { AlertCircle } from "lucide-react";

interface TestModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  testData: any;
}

const TestModal: React.FC<TestModalProps> = ({ isOpen, setIsOpen, testData }) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Edge Function Details</DialogTitle>
          <DialogDescription>
            Raw values from the super-action Edge Function
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <div className="mb-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Environment Details</AlertTitle>
              <AlertDescription>
                These values show the current configuration of your Edge Function environment.
              </AlertDescription>
            </Alert>
          </div>
          <div className="bg-muted rounded-md p-4">
            <pre className="whitespace-pre-wrap overflow-auto">{JSON.stringify(testData, null, 2)}</pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestModal; 