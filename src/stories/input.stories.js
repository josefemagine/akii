import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// [build] library: 'shadcn'
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
const meta = {
    title: "ui/Input",
    component: Input,
    tags: ["autodocs"],
    argTypes: {},
};
export default meta;
export const Default = {
    render: (args) => _jsx(Input, Object.assign({}, args)),
    args: {
        type: "email",
        placeholder: "Email",
    },
};
export const Disabled = {
    render: (args) => _jsx(Input, Object.assign({ disabled: true }, args)),
    args: Object.assign({}, Default.args),
};
export const WithLabel = {
    render: (args) => (_jsxs("div", { className: "grid w-full max-w-sm items-center gap-1.5", children: [_jsx(Label, { htmlFor: "email", children: args.placeholder }), _jsx(Input, Object.assign({}, args, { id: "email" }))] })),
    args: Object.assign({}, Default.args),
};
export const WithText = {
    render: (args) => (_jsxs("div", { className: "grid w-full max-w-sm items-center gap-1.5", children: [_jsx(Label, { htmlFor: "email-2", children: args.placeholder }), _jsx(Input, Object.assign({}, args, { id: "email-2" })), _jsx("p", { className: "text-sm text-slate-500", children: "Enter your email address." })] })),
    args: Object.assign({}, Default.args),
};
export const WithButton = {
    render: (args) => (_jsxs("div", { className: "flex w-full max-w-sm items-center space-x-2", children: [_jsx(Input, Object.assign({}, args)), _jsx(Button, { type: "submit", children: "Subscribe" })] })),
    args: Object.assign({}, Default.args),
};
