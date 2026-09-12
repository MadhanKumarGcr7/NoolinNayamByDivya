'use client';

import { useState, useEffect } from 'react';
import useCartStore from '@/store/cartStore';
import { brandConfig } from '@/lib/config';

const { currencySymbol } = brandConfig.shipping;

export default function CustomInquiriesCartSection() {
  const [customRequests, setCustomRequests] = useState([]);
  const [loading, setLoading]               = useState(true);
  const { addItem, items }                  = useCartStore();

  useEffect(() => {
    async function loadCustomInquiries() {
      try {
        let storedIds = [];
        let storedEmail = '';

        try {
          storedIds   = JSON.parse(localStorage.getItem('noolinnayam_custom_inquiries') || '[]');
          storedEmail = localStorage.getItem('noolinnayam_customer_email') || '';
        } catch { /* localStorage fallback */ }

        if (!Array.isArray(storedIds)) storedIds = [];

        if (storedIds.length === 0 && !storedEmail) {
          setLoading(false);
          return;
        }

        const res = await fetch('/api/custom-orders/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: storedIds, email: storedEmail }),
        });

        const data = await res.json();
        setCustomRequests(data.requests || []);
      } catch (err) {
        console.error('Error loading custom inquiries in cart:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCustomInquiries();
  }, []);

  if (loading || customRequests.length === 0) return null;

  const statusBadges = {
    New:         { label: 'Pending Owner Review', color: 'bg-blush-light text-warmBrown border-blush' },
    Reviewed:    { label: 'Reviewed & Quoted', color: 'bg-sand/40 text-charcoal border-sand' },
    'In Progress':{ label: 'Handcrafting in Progress', color: 'bg-sage-light text-sage-dark border-sage' },
    Completed:   { label: 'Completed & Ready', color: 'bg-sage text-charcoal border-sage-dark' },
    Declined:    { label: 'Inquiry Closed', color: 'bg-charcoal-200 text-charcoal-600 border-charcoal-300' },
  };

  const handleAddCustomToBag = (req) => {
    const itemPrice = req.quotedPrice || 0;
    const customId = `custom-${req._id}`;
    const customTitle = `Custom ${req.productType || 'Outfit'} (Inquiry #${req._id?.slice(-6).toUpperCase()})`;

    addItem(
      {
        id: customId,
        name: customTitle,
        slug: 'custom-orders',
        images: req.referenceImageUrl
          ? [req.referenceImageUrl]
          : (req.selectedGalleryImages?.[0]?.imageUrl ? [req.selectedGalleryImages[0].imageUrl] : []),
        price: itemPrice,
      },
      {
        size: req.customSize || req.ageGroup || 'Custom Sizing',
        color: req.preferredColor || 'As Requested',
        quantity: 1,
      }
    );
  };

  return (
    <div className="mb-12 bg-cream border border-border p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="font-serif font-light text-charcoal text-2xl">
            Custom Order Inquiries & Live Status
          </h2>
          <p className="text-body-xs text-charcoal-400 font-light mt-0.5">
            Track whether Divya has reviewed your custom order requests and view quoted prices.
          </p>
        </div>
        <span className="text-label-md uppercase tracking-[0.14em] text-warmBrown font-medium">
          {customRequests.length} Inquiry{customRequests.length > 1 ? 's' : ''} Tracked
        </span>
      </div>

      <div className="space-y-4">
        {customRequests.map((req) => {
          const badge = statusBadges[req.status] || { label: req.status, color: 'bg-sand/40 text-warmBrown border-sand' };
          const cartItemId = `custom-${req._id}`;
          const isAlreadyInCart = items.some((i) => i.productId === cartItemId || i.cartId?.includes(cartItemId));

          return (
            <div key={req._id} className="bg-ivory border border-border p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2">
                <div>
                  <span className="text-body-sm font-sans font-medium text-charcoal">
                    {req.productType} — Inquiry #{req._id?.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-body-xs text-charcoal-400 font-light block sm:inline sm:ml-2">
                    Submitted {new Date(req.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <span className={`px-2.5 py-1 text-label-sm uppercase tracking-[0.12em] font-sans font-medium border ${badge.color}`}>
                  {badge.label}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-body-xs font-sans text-charcoal-600 font-light">
                <div><span>Age/Size: </span><strong className="text-charcoal font-medium">{req.ageGroup || req.customSize || 'Custom'}</strong></div>
                <div><span>Color: </span><strong className="text-charcoal font-medium">{req.preferredColor || 'As requested'}</strong></div>
                <div><span>Desired Date: </span><strong className="text-charcoal font-medium">{req.desiredDate}</strong></div>
              </div>

              {/* Owner Feedback Note & Quoted Price */}
              {(req.ownerResponse || req.quotedPrice > 0) ? (
                <div className="bg-sage-light/50 border border-sage p-3.5 space-y-1.5 mt-2">
                  <p className="text-label-sm uppercase tracking-[0.12em] font-sans font-medium text-sage-dark">
                    Feedback & Price Quote from Divya:
                  </p>
                  {req.ownerResponse && (
                    <p className="text-body-xs text-charcoal font-light italic">
                      &quot;{req.ownerResponse}&quot;
                    </p>
                  )}
                  <p className="text-body-sm font-sans font-medium text-charcoal">
                    Quoted Price: <span className="text-warmBrown font-bold">{currencySymbol}{(req.quotedPrice || 0).toLocaleString('en-IN')}</span>
                  </p>
                </div>
              ) : (
                <div className="bg-cream border border-border/60 p-3 text-body-xs text-charcoal-400 font-light italic">
                  Status: <strong>Pending Review</strong> — Divya will review your design requirements and set a custom price quote shortly.
                </div>
              )}

              {/* Add to Bag Action */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/40">
                <span className="text-body-xs text-charcoal-400 font-light">
                  {isAlreadyInCart ? '✓ Item is currently in your Shopping Bag' : 'Ready to add custom item to bag:'}
                </span>

                <button
                  type="button"
                  onClick={() => handleAddCustomToBag(req)}
                  className={`px-4 py-2 text-label-sm uppercase tracking-[0.14em] font-sans font-medium transition-colors ${
                    isAlreadyInCart
                      ? 'bg-sage-light text-sage-dark border border-sage cursor-default'
                      : 'bg-charcoal text-ivory hover:bg-warmBrown shadow-warm-xs'
                  }`}
                >
                  {isAlreadyInCart ? '✓ Added to Bag' : req.quotedPrice > 0 ? `Add Custom Order to Bag (${currencySymbol}${req.quotedPrice.toLocaleString('en-IN')})` : 'Add Custom Order to Bag'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
