/**
 * Brand Configuration
 * ────────────────────────────────────────────────────────────────────────────
 * All brand-level config lives here. Update these values before going live.
 * Never hardcode these values in individual components.
 */

export const brandConfig = {
  // ─── BRAND IDENTITY ────────────────────────────────────────────────────
  name: 'Noolin Nayam by Divya',
  displayName: 'Noolin Nayam by Divya',
  tagline: 'Handcrafted little moments.',
  subTagline: 'Beautifully made crochet and kidswear, created stitch by stitch.',

  // ─── ANNOUNCEMENT BAR ──────────────────────────────────────────────────
  // Update this text for promotions, announcements, or seasonal messages
  announcementText: 'Handcrafted with love · Made to order · Flat Shipping: ₹60 (Tamil Nadu) | ₹120 (Other States)',
  announcementEnabled: true,

  // ─── CONTACT ───────────────────────────────────────────────────────────
  email: 'hello@noolinnayambydivya.com',
  phone: '+91 82200 00020',

  // ─── WHATSAPP ──────────────────────────────────────────────────────────
  // Used for custom order WhatsApp CTA link
  whatsapp: {
    number: '918220000020',
    message: "Hi! I came across your crochet collection and I'm interested in knowing more about your products.",
  },

  // ─── WHATSAPP COMMUNITY ────────────────────────────────────────────────
  community: {
    whatsappGroupInviteUrl: process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL || 'https://chat.whatsapp.com/GlV1BkokPC70K7XwVAlmYm?s=sw&p=i&mlu=0',
    heading: 'Join our little community.',
    subheading: 'A cozy WhatsApp space for crochet lovers — workshop updates, behind-the-scenes, and first access to new pieces.',
  },

  // ─── SOCIAL LINKS ──────────────────────────────────────────────────────
  social: {
    instagram: 'https://www.instagram.com/noolin_nayam?igsi=enVvdDFnb2o0amUy',
    instagramHandle: '@noolin_nayam',
    pinterest: 'https://in.pinterest.com/noolinnayambydivya/',
    whatsapp: 'https://wa.me/918220000020',
  },

  // ─── SEO DEFAULTS ──────────────────────────────────────────────────────
  seo: {
    title: 'Noolin Nayam by Divya | Handmade Crochet & Kids Dresses',
    description:
      'Discover Noolin Nayam by Divya, a handmade crochet shop creating beautiful crochet designs, kids dresses, floral crochet, accessories and unique handmade pieces crafted with love.',
    keywords: [
      'handmade crochet',
      'crochet shop',
      'handmade crochet shop',
      'crochet products',
      'crochet dresses',
      'handmade crochet dresses',
      'kids dresses',
      'handmade kids dresses',
      'crochet kids dresses',
      'crochet dresses for kids',
      'kids crochet',
      'handmade crochet for kids',
      'floral crochet',
      'crochet flowers',
      'handmade crochet flowers',
      'crochet floral designs',
      'crochet flower designs',
      'custom crochet',
      'personalized crochet',
      'handmade crochet gifts',
      'unique handmade gifts',
      'crochet accessories',
      'handmade creations',
      'Noolin Nayam by Divya',
    ],
    ogImage: '/assets/og-image.jpg', // [PLACEHOLDER — replace with real OG image]
    siteUrl: 'https://noolinnaayambydivya.com', // [PLACEHOLDER — replace with real domain]
  },

  // ─── SHIPPING ──────────────────────────────────────────────────────────
  shipping: {
    insideStateFee: 60,
    outsideStateFee: 120,
    homeState: 'Tamil Nadu',
    freeShippingThreshold: 0,
    currency: 'INR',
    currencySymbol: '₹',
  },

  // ─── PAYMENT ───────────────────────────────────────────────────────────
  // INTEGRATION POINT: Wire in Razorpay key when ready
  payment: {
    provider: 'razorpay',         // 'razorpay' | 'stripe'
    razorpayKeyId: '',            // [PLACEHOLDER — set via env: NEXT_PUBLIC_RAZORPAY_KEY_ID]
  },

  // ─── RETURN POLICY CONFIG ──────────────────────────────────────────────
  // Configurable return window (days after delivery)
  returns: {
    windowDays: 3,
  },
};

/**
 * Returns the WhatsApp chat URL with a pre-filled message
 */
export function getWhatsAppUrl(customMessage) {
  const message = customMessage || brandConfig.whatsapp.message;
  return `https://wa.me/${brandConfig.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

/**
 * Returns pre-filled WhatsApp URL for size-issue return requests
 */
export function getReturnWhatsAppUrl({ orderNumber, productName, size }) {
  const message = `Hi, I'd like to return an item from my order.

Order ID: ${orderNumber || 'N/A'}
Product: ${productName || 'Handmade Item'}
Size ordered: ${size || 'N/A'}
Reason: The size doesn't fit as expected.

I have an unboxing video ready to share.`;
  return `https://wa.me/${brandConfig.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

/**
 * Calculates shipping fee based on delivery state.
 * Inside State (Tamil Nadu / TN) = ₹60
 * Outside State = ₹120
 */
export function getShippingFee(state) {
  if (!state || typeof state !== 'string' || !state.trim()) {
    return brandConfig.shipping.insideStateFee;
  }
  const cleanState = state.trim().toLowerCase();
  if (cleanState === 'tamil nadu' || cleanState === 'tamilnadu' || cleanState === 'tn') {
    return brandConfig.shipping.insideStateFee;
  }
  return brandConfig.shipping.outsideStateFee;
}

export default brandConfig;
