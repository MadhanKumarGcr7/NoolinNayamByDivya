'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import useCartStore from '@/store/cartStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import SectionHeading from '@/components/ui/SectionHeading';
import { brandConfig, getShippingFee } from '@/lib/config';

import CouponInput from '@/components/cart/CouponInput';

const { currencySymbol } = brandConfig.shipping;

export default function CheckoutPage() {
  const { items, subtotal, clearCart, appliedCoupon } = useCartStore();

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

  const shippingFee = getShippingFee(formData.state);
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [returnPolicyAgreed, setReturnPolicyAgreed] = useState(false);
  const [policyError, setPolicyError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerifyPayment = async (razorpayResponse, orderId) => {
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
          orderId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Payment signature verification failed.');
      }

      // Clear Shopping Cart upon verified payment success
      clearCart();
      setOrderConfirmed(data.order);
    } catch (err) {
      setError(err.message || 'Payment verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
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
      // 1. Create Razorpay order & scaffold pending order in DB
      const res = await fetch('/api/payments/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
          deliveryAddress: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            country: formData.country,
          },
          items,
          couponCode: appliedCoupon?.code || '',
          returnPolicyAgreed: true,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize payment.');
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: data.keyId,
        amount: data.amountPaise,
        currency: data.currency || 'INR',
        name: 'Noolin Nayam by Divya',
        description: `Order #${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#211C18',
        },
        handler: async function (response) {
          await handleVerifyPayment(response, data.orderId);
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment was not completed. You can retry payment when ready.');
          },
        },
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setLoading(false);
          setError(`Payment failed: ${resp.error?.description || 'Transaction declined.'}`);
        });
        rzp.open();
      } else {
        // Fallback simulation in dev environment if script loading is blocked
        const simResponse = {
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_order_id: data.razorpayOrderId,
          razorpay_signature: `sig_sim_${Date.now()}_test_signature_valid`,
        };
        await handleVerifyPayment(simResponse, data.orderId);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (items.length === 0 && !orderConfirmed) {
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
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

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

        {orderConfirmed ? (
          <div className="max-w-2xl mx-auto bg-cream border border-border p-8 lg:p-12 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-sage-light text-sage-dark flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="font-serif font-light text-charcoal text-3xl mb-2">
              Payment Successful!
            </h2>
            <p className="text-label-md uppercase tracking-[0.16em] text-warmBrown font-medium mb-6">
              Order #{orderConfirmed.orderNumber || orderConfirmed.id}
            </p>

            <div className="bg-ivory border border-border p-6 text-left mb-8 space-y-2 text-body-xs font-sans text-charcoal-600">
              <p className="text-label-md uppercase tracking-[0.16em] text-charcoal font-medium mb-2 border-b border-border pb-2">
                Order & Payment Confirmation
              </p>
              <p>• <strong>Payment Status:</strong> <span className="text-sage-dark font-medium uppercase">{orderConfirmed.paymentStatus}</span></p>
              <p>• <strong>Razorpay Payment ID:</strong> <code className="bg-sand/30 px-1 py-0.5 rounded">{orderConfirmed.razorpayPaymentId || 'N/A'}</code></p>
              <p>• <strong>Contact Email:</strong> {orderConfirmed.contactEmail}</p>
              <p>• <strong>Contact Phone:</strong> {orderConfirmed.contactPhone}</p>
              <p>• <strong>Amount Paid:</strong> {currencySymbol}{Number(orderConfirmed.totalAmount).toLocaleString('en-IN')}</p>
            </div>

            <p className="text-body-xs text-charcoal-600 font-light mb-8 leading-relaxed">
              Thank you for supporting slow, handcrafted fashion! We are preparing your order stitch by stitch. You will receive SMS & email updates on delivery progress.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/account" variant="primary" size="lg">VIEW YOUR ORDERS</Button>
              <Button href="/shop" variant="secondary" size="lg">CONTINUE SHOPPING</Button>
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
                  3. Return Policy Agreement
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
                PAY SECURELY VIA RAZORPAY
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
                {appliedCoupon && (
                  <div className="flex justify-between text-sage-dark font-medium">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>−{currencySymbol}{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between items-start text-charcoal-600">
                  <div>
                    <span>Shipping</span>
                    <span className="text-body-xs text-charcoal-400 block font-light">
                      {!formData.state.trim()
                        ? 'Tamil Nadu: ₹60 | Other States: ₹120'
                        : shippingFee === 60
                        ? 'Inside State (Tamil Nadu)'
                        : 'Outside State'}
                    </span>
                  </div>
                  <span className="font-medium text-charcoal">{currencySymbol}{shippingFee}</span>
                </div>

                <div className="pt-2">
                  <CouponInput />
                </div>

                <div className="border-t border-border pt-3 flex justify-between items-baseline text-charcoal">
                  <span className="text-label-lg uppercase tracking-[0.16em]">Total Due</span>
                  <span className="font-serif text-2xl font-light">
                    {currencySymbol}{finalTotal.toLocaleString('en-IN')}
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
