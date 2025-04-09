var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import LeadMagnetModal from "./LeadMagnetModal";
const LeadMagnetButton = (_a) => {
    var { title, description, downloadUrl, children } = _a, buttonProps = __rest(_a, ["title", "description", "downloadUrl", "children"]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (_jsxs(_Fragment, { children: [_jsx(Button, Object.assign({}, buttonProps, { onClick: () => setIsModalOpen(true), children: children })), _jsx(LeadMagnetModal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), title: title, description: description, downloadUrl: downloadUrl })] }));
};
export default LeadMagnetButton;
