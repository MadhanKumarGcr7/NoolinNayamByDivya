'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useCartStore from '@/store/cartStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import SectionHeading from '@/components/ui/SectionHeading';
import { brandConfig } from '@/lib/config';

const { currencySymbol, freeShippingThreshold } = brandConfig.shipping;

export default function CheckoutPage() {
  const { items, subtotal } = useCartStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderCreated, setOrderCreated] = useState(null);
  const [returnPolicyAgreed, setReturnPolicyAgreed] = useState(false);
  const [policyError, setPolicyError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();

    if (!returnPolicyAgreed) {
      setPolicyError('Please agree to the Return Policy to continue.');
      return;
    }

    setLoading(true);
    setError(null);
    setPolicyError(null);

    try {
      // Call backend API route stub
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData,
          items,
          subtotal,
          returnPolicyAgreed: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to initialize order.');
      }

      // Order scaffolded in backend stub
      setOrderCreated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !orderCreated) {
    return (
      <div className="pt-32 pb-6 bg-ivory">
        <div className="site-container text-center max-w-md mx-auto py-16 bg-cream border border-border p-8">
          <h1 className="font-serif font-light text-2xl text-charcoal mb-4">No items to checkout</h1>
          <p className="text-body-sm text-charcoal-600 font-light mb-8">Please add items to your cart before proceeding.</p>
          <Button href="/shop" variant="primary" size="lg">RETURN TO SHOP</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-6 bg-ivory">
      <div className="site-container">
        <div className="text-center mb-12">
          <SectionHeading
            label="Checkout"
            headline="Complete Your Order"
            align="center"
            as="h1"
            headlineClassName="text-display-md"
          />
        </div>

        {orderCreated ? (
          /* Integration Placeholder Notice — Never fake a successful payment */
          <div className="max-w-2xl mx-auto bg-cream border border-border p-8 lg:p-12 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-warmBrown/10 text-warmBrown flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="font-serif font-light text-charcoal text-3xl mb-3">
              Order Placed: #{orderCreated.orderNumber || orderCreated.orderId}
            </h2>
            <p className="text-body-md text-charcoal-600 font-light mb-6">
              Your order details have been structured and verified.
            </p>

            <div className="bg-ivory border border-border p-6 text-left mb-8 space-y-2 text-body-xs font-sans text-charcoal-600">
              <p className="text-label-md uppercase tracking-[0.16em] text-warmBrown font-medium mb-2">Integration Readiness Notice:</p>
              <p>• <strong>Payment Gateway Status:</strong> Payment Integration Placeholder (Razorpay/Stripe Ready)</p>
              <p>• <strong>Customer:</strong> {orderCreated.customer.name} ({orderCreated.customer.email})</p>
              <p>• <strong>Shipping To:</strong> {orderCreated.customer.address}, {orderCreated.customer.city}, {orderCreated.customer.pincode}</p>
              <p>• <strong>Amount Due:</strong> {currencySymbol}{orderCreated.amount.toLocaleString('en-IN')}</p>
            </div>

            <p className="text-body-xs text-charcoal-400 font-light italic mb-8">
              Per project specification: Payment gateways (Razorpay/Stripe) are ready to be connected via environment variables (`NEXT_PUBLIC_RAZORPAY_KEY_ID`). Fake payments are never simulated.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/" variant="primary" size="lg">RETURN TO HOME</Button>
              <Button href="/custom-orders" variant="secondary" size="lg">NEED CUSTOMIZATION?</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Form Column (7 cols) */}
            <form onSubmit={handleCreateOrder} className="lg:col-span-7 space-y-8">
              {/* Contact Info */}
              <div className="bg-cream border border-border p-6 lg:p-8 space-y-4">
                <h2 className="font-serif font-light text-charcoal text-xl border-b border-border pb-3 mb-4">
                  1. Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Divya Kumar"
                  />
                  <Input
                    label="Email Address"
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="hello@example.com"
                  />
                </div>
                <Input
                  label="Phone Number (for delivery updates)"
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />
              </div>

              {/* Shipping Address */}
              <div className="bg-cream border border-border p-6 lg:p-8 space-y-4">
                <h2 className="font-serif font-light text-charcoal text-xl border-b border-border pb-3 mb-4">
                  2. Shipping Address
                </h2>
                <Input
                  label="Street Address / House No."
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Atelier Street, Floor 2"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Chennai"
                  />
                  <Input
                    label="State"
                    id="state"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Tamil Nadu"
                  />
                  <Input
                    label="PIN Code"
                    id="pincode"
                    name="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="600001"
                  />
                </div>
                <Input
                  label="Country"
                  id="country"
                  name="country"
                  required
                  disabled
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>

              {/* Return Policy Agreement Gate */}
              <div className="bg-cream border border-border p-6 lg:p-8 space-y-3">
                <h2 className="font-serif font-light text-charcoal text-xl border-b border-border pb-3 mb-4">
                  4. Return Policy Agreement
                </h2>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={returnPolicyAgreed}
                    onChange={(e) => {
                      setReturnPolicyAgreed(e.target.checked);
                      if (e.target.checked) setPolicyError(null);
                    }}
                    className="w-4 h-4 mt-1 accent-warmBrown cursor-pointer flex-shrink-0"
                  />
                  <span className="text-body-xs font-sans text-charcoal font-light leading-relaxed">
                    I have read and agree to the{' '}
                    <Link
                      href="/return-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-warmBrown hover:text-charcoal underline font-medium"
                    >
                      Return Policy
                    </Link>
                    . I understand that returns are accepted <strong>only for size issues</strong> and <strong>only with an unboxing video</strong> recorded upon delivery.
                  </span>
                </label>

                {policyError && (
                  <p className="text-body-xs text-blush-dark font-sans font-medium">
                    {policyError}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-blush-light text-warmBrown p-4 border border-blush text-body-sm font-sans">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="xl"
                className="w-full"
                loading={loading}
                disabled={!returnPolicyAgreed}
                arrow
              >
                PROCEED TO PAYMENT INTEGRATION
              </Button>
            </form>

            {/* Order Summary Sidebar (5 cols) */}
            <div className="lg:col-span-5 bg-cream border border-border p-6 lg:p-8 sticky top-32">
              <h2 className="font-serif font-light text-charcoal text-2xl border-b border-border pb-4 mb-6">
                Your Selection ({items.length})
              </h2>

              <ul className="divide-y divide-border/60 max-h-80 overflow-y-auto mb-6" role="list">
                {items.map((item) => (
                  <li key={item.cartId} className="py-3 flex gap-3 items-center">
                    <div className="w-12 h-14 bg-ivory flex-shrink-0 relative overflow-hidden">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="w-full h-full bg-oatmeal" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-xs font-sans font-medium text-charcoal truncate">{item.name}</p>
                      <p className="text-body-xs text-charcoal-400 font-light">
                        Qty: {item.quantity} {item.size && `• Size: ${item.size}`}
                      </p>
                    </div>
                    <span className="text-body-xs font-sans font-medium text-charcoal">
                      {currencySymbol}{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border pt-4 space-y-2 text-body-sm font-sans">
                <div className="flex justify-between text-charcoal-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-charcoal">{currencySymbol}{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Shipping</span>
                  <span>{subtotal >= freeShippingThreshold ? 'FREE' : '₹100'}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-baseline text-charcoal">
                  <span className="text-label-lg uppercase tracking-[0.16em]">Total Due</span>
                  <span className="font-serif text-2xl font-light">
                    {currencySymbol}{(subtotal >= freeShippingThreshold ? subtotal : subtotal + 100).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
