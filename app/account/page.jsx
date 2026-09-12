'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import SectionHeading from '@/components/ui/SectionHeading';
import { brandConfig, getReturnWhatsAppUrl } from '@/lib/config';

const { currencySymbol } = brandConfig.shipping;

// ─── Tab buttons ─────────────────────────────────────────────────────────
const tabs = [
  { id: 'profile',         label: 'Profile'          },
  { id: 'orders',          label: 'Order History'     },
  { id: 'custom-requests', label: 'Custom Requests'  },
  { id: 'addresses',       label: 'Addresses'         },
  { id: 'wishlist',        label: 'Wishlist'          },
  { id: 'logout',          label: 'Sign Out'          },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, fetchUser, logout, updateProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="pt-32 pb-6 bg-ivory">
        <div className="site-container text-center py-20">
          <div className="w-8 h-8 border-2 border-warmBrown border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-body-sm text-charcoal-400 mt-4 font-light">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) return null; // Middleware handles redirect

  return (
    <div className="pt-28 pb-6 bg-ivory">
      <div className="site-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <SectionHeading
              label="My Account"
              headline={`Hello, ${user.name?.split(' ')[0] || 'there'}`}
              as="h1"
              headlineClassName="text-display-md"
            />
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-cream border border-border text-label-md uppercase tracking-[0.14em] text-charcoal hover:border-warmBrown hover:text-warmBrown transition-colors font-medium flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-warmBrown" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            Sign Out
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-border mb-8 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-5 py-3 text-label-lg uppercase tracking-[0.14em] font-sans font-medium
                transition-colors duration-200 whitespace-nowrap border-b-2 -mb-px
                ${activeTab === tab.id
                  ? 'text-warmBrown border-warmBrown'
                  : 'text-charcoal-400 border-transparent hover:text-charcoal hover:border-charcoal-200'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'profile'         && <ProfileTab user={user} updateProfile={updateProfile} handleLogout={handleLogout} />}
          {activeTab === 'orders'          && <OrdersTab />}
          {activeTab === 'custom-requests' && <CustomRequestsTab />}
          {activeTab === 'addresses'       && <AddressesTab user={user} updateProfile={updateProfile} />}
          {activeTab === 'wishlist'        && <WishlistTab />}
          {activeTab === 'logout'          && (
            <div className="bg-cream border border-border p-8 max-w-lg mx-auto text-center space-y-4 my-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-warmBrown mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              <h3 className="font-serif font-light text-charcoal text-2xl">Sign Out of Account</h3>
              <p className="text-body-sm text-charcoal-600 font-light">Are you sure you want to sign out of Noolin Nayam by Divya?</p>
              <Button variant="primary" size="lg" onClick={handleLogout} className="w-full">
                CONFIRM & SIGN OUT
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PROFILE TAB
// ═════════════════════════════════════════════════════════════════════════════
function ProfileTab({ user, updateProfile, handleLogout }) {
  const [name, setName]     = useState(user.name || '');
  const [phone, setPhone]   = useState(user.phone || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await updateProfile({ name, phone });
      setMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-cream border border-border p-6 lg:p-8 shadow-warm-sm">
        <h2 className="font-serif font-light text-charcoal text-xl border-b border-border pb-3 mb-6">
          Profile Details
        </h2>
        <form onSubmit={handleSave} className="space-y-5">
          <Input
            label="Full Name"
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-label-lg uppercase tracking-[0.14em] font-sans font-medium text-charcoal-600">
              Email Address
            </label>
            <div className="w-full px-4 py-3 bg-ivory/50 border border-border text-charcoal-400 text-body-sm font-sans font-light">
              {user.email}
            </div>
            <p className="text-body-xs text-charcoal-400 font-light">Email cannot be changed.</p>
          </div>
          <Input
            label="Phone / WhatsApp"
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          {msg && (
            <div className={`p-3 border text-body-xs font-sans ${
              msg.type === 'success'
                ? 'bg-sage-light text-sage-dark border-sage'
                : 'bg-blush-light text-warmBrown border-blush'
            }`}>
              {msg.text}
            </div>
          )}

          <Button type="submit" variant="primary" size="md" loading={saving}>
            SAVE CHANGES
          </Button>
        </form>
      </div>

      {/* Logout / Sign Out Card */}
      <div className="bg-cream/40 border border-border p-6 flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-light text-charcoal">Session Management</h3>
          <p className="text-body-xs text-charcoal-600 font-light mt-0.5">Signed in as {user.email}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          SIGN OUT
        </Button>
      </div>

      {/* Account info */}
      <div className="text-body-xs text-charcoal-400 font-light">
        <p>Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ORDERS TAB
// ═════════════════════════════════════════════════════════════════════════════
function OrdersTab() {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [returnModal, setReturnModal] = useState(null); // { order, item }
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/auth/orders', { credentials: 'include' });
        const data = await res.json();
        setOrders(data.orders || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statusColors = {
    Pending:    'bg-sand/40 text-warmBrown',
    Processing: 'bg-blush-light text-blush-dark',
    Shipped:    'bg-sage-light text-sage-dark',
    Delivered:  'bg-sage text-charcoal',
    Cancelled:  'bg-charcoal-200 text-charcoal-600',
  };

  const handleConfirmWhatsAppReturn = async () => {
    if (!returnModal) return;
    const { order, item } = returnModal;
    setSubmittingReturn(true);

    try {
      // Flag return requested in database
      await fetch('/api/auth/orders/return-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order._id }),
        credentials: 'include',
      });

      // Update local state
      setOrders(orders.map((o) => (o._id === order._id ? { ...o, returnRequested: true } : o)));

      // Generate WhatsApp URL and open in new tab
      const whatsappUrl = getReturnWhatsAppUrl({
        orderNumber: order.orderNumber || order._id?.slice(-8).toUpperCase(),
        productName: item.name,
        size: item.size,
      });

      window.open(whatsappUrl, '_blank');
      setReturnModal(null);
    } catch (err) {
      console.error('Return request error:', err);
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-cream border border-border p-8 text-center max-w-md">
        <h3 className="font-serif font-light text-charcoal text-xl mb-2">No orders yet</h3>
        <p className="text-body-sm text-charcoal-600 font-light mb-6">
          Once you place an order, it will appear here.
        </p>
        <Button href="/shop" variant="primary" size="md">BROWSE SHOP</Button>
      </div>
    );
  }

  const returnWindowDays = brandConfig.returns?.windowDays || 3;

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const displayOrderId = order.orderNumber || `NY-${new Date(order.createdAt).getFullYear()}${String(new Date(order.createdAt).getMonth() + 1).padStart(2, '0')}-${order._id?.slice(-4).toUpperCase()}`;
        const isDelivered = order.status === 'Delivered';
        const deliveredDate = new Date(order.updatedAt || order.createdAt);
        const diffDays = (new Date() - deliveredDate) / (1000 * 60 * 60 * 24);
        const isWithinReturnWindow = isDelivered && diffDays <= returnWindowDays;

        return (
          <div key={order._id} className="bg-cream border border-border p-5 lg:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-label-md uppercase tracking-[0.14em] text-charcoal-400 font-sans font-medium">
                  Order #{displayOrderId}
                </p>
                <p className="text-body-xs text-charcoal-400 font-light mt-0.5">
                  Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {order.returnRequested && (
                  <span className="px-2.5 py-1 bg-warmBrown/10 text-warmBrown border border-warmBrown/30 text-[10px] uppercase tracking-[0.14em] font-sans font-medium">
                    Return Requested via WhatsApp
                  </span>
                )}
                <span className={`inline-block px-3 py-1 text-label-md uppercase tracking-[0.14em] font-sans font-medium ${statusColors[order.status] || 'bg-sand/40 text-warmBrown'}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-border/60 pt-3 space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 text-body-xs font-sans gap-2 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-charcoal font-medium">
                      {item.name} {item.size && `(${item.size})`} × {item.quantity}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <span className="text-charcoal-600 font-medium">
                      {currencySymbol}{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>

                    {/* Return Action button if Delivered & within Return Window */}
                    {isWithinReturnWindow && !order.returnRequested && (
                      <button
                        onClick={() => setReturnModal({ order, item })}
                        className="text-[11px] uppercase tracking-[0.14em] text-warmBrown hover:text-charcoal font-medium underline transition-colors"
                      >
                        Return this item →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Footer */}
            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="text-label-lg uppercase tracking-[0.14em] font-sans font-medium text-charcoal-400">Total</span>
              <span className="font-serif text-lg font-light text-charcoal">{currencySymbol}{order.total?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        );
      })}

      {/* RETURN CONFIRMATION MODAL */}
      {returnModal && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ivory border border-border p-6 sm:p-8 max-w-lg w-full shadow-warm-xl animate-scale-in space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-serif font-light text-charcoal text-xl">Return Request Conditions</h3>
              <button onClick={() => setReturnModal(null)} className="text-charcoal-400 hover:text-charcoal text-lg">
                ✕
              </button>
            </div>

            {/* Policy Conditions Banner */}
            <div className="bg-cream border border-border p-4 space-y-3 text-body-xs font-sans">
              <p className="text-label-md uppercase tracking-[0.14em] text-warmBrown font-medium">
                Important Return Policy Notice
              </p>
              <ul className="space-y-2 text-charcoal-600 font-light leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-warmBrown font-bold">•</span>
                  <span>Returns are accepted <strong>only for size issues</strong>. We cannot accept returns for change of mind or preference.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warmBrown font-bold">•</span>
                  <span>An <strong>unboxing video showing the sealed package opened for the first time</strong> is strictly required for verification in WhatsApp chat.</span>
                </li>
              </ul>
            </div>

            {/* Item Preview */}
            <div className="bg-ivory border border-border/80 p-4 text-body-xs font-sans space-y-1">
              <p><strong className="font-medium text-charcoal-500">Order ID:</strong> #{returnModal.order.orderNumber || returnModal.order._id?.slice(-8).toUpperCase()}</p>
              <p><strong className="font-medium text-charcoal-500">Item:</strong> {returnModal.item.name}</p>
              <p><strong className="font-medium text-charcoal-500">Size Ordered:</strong> {returnModal.item.size || 'Standard'}</p>
            </div>

            <p className="text-body-xs text-charcoal-500 font-light italic">
              Clicking &quot;Continue to WhatsApp&quot; will open WhatsApp with a pre-filled size return request and notify Divya.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button variant="secondary" size="md" onClick={() => setReturnModal(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleConfirmWhatsAppReturn} loading={submittingReturn}>
                Continue to WhatsApp →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CUSTOM REQUESTS TAB
// ═════════════════════════════════════════════════════════════════════════════
function CustomRequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const addItem                 = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/auth/custom-requests', { credentials: 'include' });
        const data = await res.json();
        setRequests(data.requests || []);
      } catch {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statusColors = {
    New:          'bg-blush-light text-warmBrown border-blush',
    Reviewed:     'bg-sand/40 text-charcoal-600 border-sand',
    'In Progress':'bg-sage-light text-sage-dark border-sage',
    Completed:    'bg-sage text-charcoal border-sage-dark',
    Declined:     'bg-charcoal-200 text-charcoal-600 border-charcoal-300',
  };

  const statusLabels = {
    New:          'Received — Pending Review by Divya',
    Reviewed:     'Reviewed — Price Quoted & Ready',
    'In Progress': 'Handcrafting in Progress',
    Completed:    'Handcrafted & Ready to Ship',
    Declined:     'Inquiry Declined / Closed',
  };

  const handleAddToCart = (req) => {
    const itemPrice = req.quotedPrice || 0;
    const customTitle = `Custom ${req.productType || 'Outfit'} (Inquiry #${req._id?.slice(-6).toUpperCase()})`;

    addItem(
      {
        id: `custom-${req._id}`,
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-cream border border-border p-8 text-center max-w-md">
        <h3 className="font-serif font-light text-charcoal text-xl mb-2">No Custom Requests Yet</h3>
        <p className="text-body-sm text-charcoal-600 font-light mb-6">
          Submit your bespoke design vision or inspiration photos to get started.
        </p>
        <Button href="/custom-orders" variant="primary" size="md">REQUEST CUSTOM OUTFIT</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {requests.map((req) => (
        <div key={req._id} className="bg-cream border border-border p-5 lg:p-6 space-y-4 shadow-warm-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div>
              <p className="text-label-md uppercase tracking-[0.14em] text-warmBrown font-sans font-medium">
                Custom Inquiry #{req._id?.slice(-6).toUpperCase()}
              </p>
              <p className="text-body-xs text-charcoal-400 font-light mt-0.5">
                Submitted {new Date(req.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Live Status Badge */}
            <span className={`inline-block px-3 py-1.5 text-label-md uppercase tracking-[0.14em] font-sans font-medium border ${statusColors[req.status] || 'bg-sand/40 text-warmBrown'}`}>
              {statusLabels[req.status] || req.status}
            </span>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-body-xs font-sans">
            <div><span className="text-charcoal-400 block">Product Type</span><span className="text-charcoal font-medium">{req.productType}</span></div>
            <div><span className="text-charcoal-400 block">Age / Size Range</span><span className="text-charcoal font-medium">{req.ageGroup || req.customSize || 'Custom'}</span></div>
            <div><span className="text-charcoal-400 block">Preferred Color</span><span className="text-charcoal font-medium">{req.preferredColor || '—'}</span></div>
            <div><span className="text-charcoal-400 block">Occasion</span><span className="text-charcoal font-medium">{req.occasion || '—'}</span></div>
            <div><span className="text-charcoal-400 block">Desired Date</span><span className="text-charcoal font-medium">{req.desiredDate}</span></div>
          </div>

          {req.customRequirements && (
            <div className="bg-ivory border border-border/60 p-3">
              <span className="text-label-sm uppercase tracking-[0.12em] text-charcoal-400 block mb-1">Your Requirements:</span>
              <p className="text-body-xs text-charcoal font-light leading-relaxed">{req.customRequirements}</p>
            </div>
          )}

          {/* Owner Response Note & Pricing */}
          {(req.ownerResponse || req.quotedPrice > 0) && (
            <div className="bg-sage-light/60 border border-sage p-4 space-y-2">
              <p className="text-label-md uppercase tracking-[0.14em] text-sage-dark font-medium flex items-center gap-2">
                <span>Direct Feedback from Divya</span>
              </p>
              {req.ownerResponse && (
                <p className="text-body-xs text-charcoal font-light italic leading-relaxed">
                  &quot;{req.ownerResponse}&quot;
                </p>
              )}
              {req.quotedPrice > 0 && (
                <p className="text-body-sm font-sans text-charcoal font-medium">
                  Quoted Price: <span className="text-warmBrown font-bold">{currencySymbol}{req.quotedPrice.toLocaleString('en-IN')}</span>
                </p>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/60">
            <div className="text-body-xs text-charcoal-400 font-light">
              Status: <strong className="text-charcoal">{req.status}</strong>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleAddToCart(req)}
                className="px-4 py-2 bg-charcoal text-ivory text-label-sm uppercase tracking-[0.14em] font-medium hover:bg-warmBrown transition-colors shadow-warm-xs flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
                </svg>
                Add Custom Order to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ADDRESSES TAB
// ═════════════════════════════════════════════════════════════════════════════
function AddressesTab({ user, updateProfile }) {
  const [addresses, setAddresses] = useState(user.addresses || []);
  const [editing, setEditing]     = useState(null); // index or 'new'
  const [form, setForm]           = useState({ label: 'Home', street: '', city: '', state: '', pincode: '', country: 'India' });
  const [saving, setSaving]       = useState(false);

  const handleEdit = (idx) => {
    setEditing(idx);
    setForm(addresses[idx]);
  };

  const handleNew = () => {
    setEditing('new');
    setForm({ label: 'Home', street: '', city: '', state: '', pincode: '', country: 'India' });
  };

  const handleDelete = async (idx) => {
    const updated = addresses.filter((_, i) => i !== idx);
    setSaving(true);
    try {
      await updateProfile({ addresses: updated });
      setAddresses(updated);
    } catch { /* */ }
    setSaving(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    let updated;
    if (editing === 'new') {
      updated = [...addresses, form];
    } else {
      updated = addresses.map((a, i) => (i === editing ? form : a));
    }
    try {
      await updateProfile({ addresses: updated });
      setAddresses(updated);
      setEditing(null);
    } catch { /* */ }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl">
      {editing !== null ? (
        <div className="bg-cream border border-border p-6 lg:p-8">
          <h3 className="font-serif font-light text-charcoal text-xl border-b border-border pb-3 mb-6">
            {editing === 'new' ? 'Add New Address' : 'Edit Address'}
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Label" id="addr-label" value={form.label} onChange={(e) => setForm({...form, label: e.target.value})} placeholder="e.g. Home, Work" />
            <Input label="Street Address" id="addr-street" value={form.street} onChange={(e) => setForm({...form, street: e.target.value})} required />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="City" id="addr-city" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} required />
              <Input label="State" id="addr-state" value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} required />
              <Input label="PIN Code" id="addr-pincode" value={form.pincode} onChange={(e) => setForm({...form, pincode: e.target.value})} required />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" size="md" loading={saving}>SAVE ADDRESS</Button>
              <Button type="button" variant="ghost" size="md" onClick={() => setEditing(null)}>CANCEL</Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {addresses.length === 0 ? (
            <div className="bg-cream border border-border p-8 text-center max-w-md">
              <h3 className="font-serif font-light text-charcoal text-xl mb-2">No saved addresses</h3>
              <p className="text-body-sm text-charcoal-600 font-light mb-6">Add an address for faster checkout.</p>
              <Button variant="primary" size="md" onClick={handleNew}>ADD ADDRESS</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr, i) => (
                <div key={i} className="bg-cream border border-border p-5 flex justify-between items-start gap-4">
                  <div>
                    <p className="text-label-md uppercase tracking-[0.14em] text-warmBrown font-sans font-medium mb-1">{addr.label}</p>
                    <p className="text-body-sm text-charcoal font-light">{addr.street}</p>
                    <p className="text-body-xs text-charcoal-600 font-light">{addr.city}, {addr.state} {addr.pincode}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(i)} className="text-label-sm uppercase tracking-[0.14em] text-charcoal-400 hover:text-warmBrown transition-colors">Edit</button>
                    <button onClick={() => handleDelete(i)} className="text-label-sm uppercase tracking-[0.14em] text-charcoal-400 hover:text-warmBrown transition-colors">Delete</button>
                  </div>
                </div>
              ))}
              <Button variant="secondary" size="md" onClick={handleNew}>ADD ANOTHER ADDRESS</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// WISHLIST TAB
// ═════════════════════════════════════════════════════════════════════════════
function WishlistTab() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <WishlistContent />;
}

function WishlistContent() {
  const useWishlistStore = require('@/store/wishlistStore').default;
  const { items, toggleItem } = useWishlistStore();

  if (items.length === 0) {
    return (
      <div className="bg-cream border border-border p-8 text-center max-w-md">
        <h3 className="font-serif font-light text-charcoal text-xl mb-2">Your wishlist is empty</h3>
        <p className="text-body-sm text-charcoal-600 font-light mb-6">
          Browse our collection and tap the heart icon to save your favourites.
        </p>
        <Button href="/shop" variant="primary" size="md">BROWSE SHOP</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.id} className="bg-cream border border-border p-4 group">
          <div className="aspect-portrait bg-ivory mb-3 overflow-hidden">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full bg-oatmeal flex items-center justify-center">
                <span className="text-label-md text-charcoal-400">No image</span>
              </div>
            )}
          </div>
          <h4 className="font-serif font-light text-charcoal text-lg mb-1">{item.name}</h4>
          <p className="text-body-sm text-warmBrown font-medium mb-3">{currencySymbol}{item.price?.toLocaleString('en-IN')}</p>
          <div className="flex gap-2">
            <Button href={`/shop/${item.slug}`} variant="primary" size="sm" className="flex-1">VIEW</Button>
            <button
              onClick={() => toggleItem(item)}
              className="px-3 py-2 border border-border text-charcoal-400 hover:text-warmBrown hover:border-warmBrown transition-colors"
              aria-label="Remove from wishlist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
