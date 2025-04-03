import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const Billing: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (cardElement) {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        console.error('[Billing] Payment method creation failed:', error);
      } else {
        console.log('[Billing] Payment method created successfully:', paymentMethod);
      }
    }
  };

  return (
    <div>
      <h2>Billing Management</h2>
      <form onSubmit={handleSubmit}>
        <CardElement />
        <button type="submit" disabled={!stripe}>
          Submit Payment
        </button>
      </form>
    </div>
  );
};

export default Billing; 