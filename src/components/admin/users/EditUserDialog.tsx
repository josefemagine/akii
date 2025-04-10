import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { User, EditUserData } from "@/types/user.ts";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: EditUserData;
  setUserData: React.Dispatch<React.SetStateAction<EditUserData>>;
  onSave: () => Promise<void>;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  onOpenChange,
  userData,
  setUserData,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:bg-gray-900 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Edit User</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Update user details and permissions
          </DialogDescription>
        </DialogHeader>
          
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="first_name" className="dark:text-gray-200">First Name</Label>
            <Input 
              id="first_name" 
              value={userData.first_name} 
              onChange={e => setUserData({...userData, first_name: e.target.value})} 
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
            
          <div className="space-y-2">
            <Label htmlFor="last_name" className="dark:text-gray-200">Last Name</Label>
            <Input 
              id="last_name" 
              value={userData.last_name} 
              onChange={e => setUserData({...userData, last_name: e.target.value})} 
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
            
          <div className="space-y-2">
            <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
            <Input 
              id="email" 
              value={userData.email} 
              disabled 
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:opacity-70"
            />
          </div>
            
          <div className="space-y-2">
            <Label htmlFor="company_name" className="dark:text-gray-200">Company Name</Label>
            <Input 
              id="company_name" 
              value={userData.company_name} 
              onChange={e => setUserData({...userData, company_name: e.target.value})} 
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
            
          <div className="space-y-2">
            <Label htmlFor="role" className="dark:text-gray-200">Role</Label>
            <select 
              id="role" 
              value={userData.role} 
              onChange={e => setUserData({...userData, role: e.target.value})}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>
            
          <div className="space-y-2">
            <Label htmlFor="status" className="dark:text-gray-200">User Status</Label>
            <select 
              id="status" 
              value={userData.status} 
              onChange={e => setUserData({...userData, status: e.target.value})}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Setting a user to "inactive" or "suspended" will prevent them from accessing the application.
              If the status field is missing from your database, visit Admin &gt; User Status Migration.
            </p>
          </div>
        </div>
          
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">Cancel</Button>
          <Button onClick={onSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 