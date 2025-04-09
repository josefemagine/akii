var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
const Billing = () => {
    const stripe = useStripe();
    const elements = useElements();
    const handleSubmit = (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
        if (!stripe || !elements) {
            return;
        }
        const cardElement = elements.getElement(CardElement);
        if (cardElement) {
            const { error, paymentMethod } = yield stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });
            if (error) {
                console.error('[Billing] Payment method creation failed:', error);
            }
            else {
                console.log('[Billing] Payment method created successfully:', paymentMethod);
            }
        }
    });
    return (_jsxs("div", { children: [_jsx("h2", { children: "Billing Management" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx(CardElement, {}), _jsx("button", { type: "submit", disabled: !stripe, children: "Submit Payment" })] })] }));
};
export default Billing;
