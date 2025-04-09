import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
export default function ConfirmDialog({ open, onOpenChange, title, description, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'default', }) {
    return (_jsx(AlertDialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: title }), _jsx(AlertDialogDescription, { children: description })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { asChild: true, children: _jsx(Button, { variant: "outline", children: cancelText }) }), _jsx(AlertDialogAction, { asChild: true, children: _jsx(Button, { variant: variant === 'destructive' ? 'destructive' : 'default', onClick: onConfirm, children: confirmText }) })] })] }) }));
}
