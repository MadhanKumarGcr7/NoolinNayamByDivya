'use client';

import { useState } from 'react';
import Input, { Textarea, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import useCartStore from '@/store/cartStore';
import Link from 'next/link';
import DesignGalleryPicker from '@/components/custom-orders/DesignGalleryPicker';
import { getWhatsAppUrl } from '@/lib/config';

const productTypes = [
  { value: 'crochet-dress', label: 'Crochet Dress' },
  { value: 'birthday-frock', label: 'Birthday Frock / Occasion Outfit' },
  { value: 'baby-shower-set', label: 'Baby Shower Set' },
  { value: 'sibling-set', label: 'Sibling Matching Set' },
  { value: 'crochet-top', label: 'Crochet Top / Bonnet / Accessories' },
  { value: 'other', label: 'Other Custom Idea' },
];

const ageRanges = [
  { value: '1y-2y', label: '1 – 2 Years' },
  { value: '2y-4y', label: '2 – 4 Years' },
  { value: '4y-6y', label: '4 – 6 Years' },
  { value: '6y-8y', label: '6 – 8 Years' },
  { value: 'custom-measurements', label: 'Custom Measurements (will provide)' },
];

export default function CustomOrderForm() {
  const addItem = useCartStore((state) => state.addItem);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    productType: '',
    ageGroup: '',
    customSize: '',
    preferredColor: '',
    occasion: '',
    desiredDate: '',
    requirements: '',
    notes: '',
  });

  const [selectedGalleryImages, setSelectedGalleryImages] = useState([]);
  const [referenceFile, setReferenceFile]                 = useState(null);

  const [loading, setLoading] = useState(false);
  const [status, setStatus]   = useState(null); // 'success' | 'error' | null
  const [submittedId, setSubmittedId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setErrorMsg(null);

    // Validate that at least one of [written requirements, gallery images, reference upload] is present
    const hasText = Boolean(formData.requirements && formData.requirements.trim());
    const hasGallery = selectedGalleryImages.length > 0;
    const hasFile = Boolean(referenceFile);

    if (!hasText && !hasGallery && !hasFile) {
      setErrorMsg('Please share your design vision by selecting gallery inspiration elements, uploading a reference photo, or writing custom requirements.');
      setLoading(false);
      return;
    }

    try {
      let uploadedRefUrl = null;

      // Handle customer reference photo upload if provided
      if (referenceFile) {
        try {
          const uploadData = new FormData();
          uploadData.append('file', referenceFile);
          const uploadRes = await fetch('/api/admin/design-gallery/upload', {
            method: 'POST',
            body: uploadData,
          });
          const uploadResult = await uploadRes.json();
          if (uploadResult.url) {
            uploadedRefUrl = uploadResult.url;
          }
        } catch (uploadErr) {
          console.warn('Reference photo upload failed, continuing submission:', uploadErr);
        }
      }

      // Submit custom order payload
      const payload = {
        ...formData,
        selectedGalleryImages,
        referenceImageUrl: uploadedRefUrl,
      };

      const res = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to submit custom order inquiry.');
      }

      if (data.id) {
        setSubmittedId(data.id);
        try {
          const existingIds = JSON.parse(localStorage.getItem('noolinnayam_custom_inquiries') || '[]');
          if (!existingIds.includes(data.id)) {
            existingIds.unshift(data.id);
            localStorage.setItem('noolinnayam_custom_inquiries', JSON.stringify(existingIds));
          }
          if (formData.email) {
            localStorage.setItem('noolinnayam_customer_email', formData.email.trim().toLowerCase());
          }
        } catch { /* localStorage fallback */ }
      }

      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'There was an issue submitting your request. Please try again.');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream border border-border p-6 sm:p-10 shadow-warm-md">
      {status === 'success' ? (
        <div className="text-center py-12 animate-fade-in space-y-4">
          <div className="w-16 h-16 rounded-full bg-warmBrown/10 text-warmBrown flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="font-serif font-light text-charcoal text-3xl">Inquiry Received</h3>
          <p className="text-body-md text-charcoal-600 font-light max-w-md mx-auto leading-relaxed">
            Thank you, {formData.name}. Divya will review your custom design vision
            {selectedGalleryImages.length > 0 && ` (${selectedGalleryImages.length} gallery inspiration detail${selectedGalleryImages.length > 1 ? 's' : ''} combined)`} and reach out within 24–48 hours to discuss yarn choices, sizing, and pricing.
          </p>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                addItem(
                  {
                    id: submittedId ? `custom-${submittedId}` : `custom-draft-${Date.now()}`,
                    name: `Custom ${formData.productType || 'Outfit'} Inquiry${submittedId ? ` (#${submittedId.slice(-6).toUpperCase()})` : ''}`,
                    slug: 'custom-orders',
                    images: referenceFile ? [] : (selectedGalleryImages?.[0]?.imageUrl ? [selectedGalleryImages[0].imageUrl] : []),
                    price: 0,
                  },
                  {
                    size: formData.customSize || formData.ageGroup || 'Custom Sizing',
                    color: formData.preferredColor || 'As requested',
                    quantity: 1,
                  }
                );
              }}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-charcoal text-ivory text-label-md uppercase tracking-[0.14em] hover:bg-warmBrown transition-colors shadow-warm-xs font-medium"
            >
              <span>Add Custom Order to Cart</span>
            </button>

            <Link
              href="/account"
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-charcoal text-charcoal text-label-md uppercase tracking-[0.14em] hover:bg-charcoal hover:text-ivory transition-colors font-medium"
            >
              <span>Track Status in My Account →</span>
            </Link>

            <a
              href={getWhatsAppUrl(`Hi Divya! I just submitted a custom order inquiry for a ${formData.productType || 'piece'} on your website.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-border text-charcoal-600 text-label-md uppercase tracking-[0.14em] hover:text-warmBrown transition-colors font-medium"
            >
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Contact Details */}
          <div>
            <h3 className="font-serif font-light text-charcoal text-xl border-b border-border pb-2 mb-4">
              1. Your Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Your Name"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Divya Nair"
              />
              <Input
                label="Email Address"
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
              />
              <Input
                label="Phone / WhatsApp"
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          {/* Section 2: Custom Garment Specifications */}
          <div>
            <h3 className="font-serif font-light text-charcoal text-xl border-b border-border pb-2 mb-4">
              2. Design & Sizing Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Select
                label="Product Type"
                id="productType"
                name="productType"
                required
                options={productTypes}
                value={formData.productType}
                onChange={handleChange}
                placeholder="Select custom outfit type"
              />
              <Select
                label="Age / Size Range"
                id="ageGroup"
                name="ageGroup"
                required
                options={ageRanges}
                value={formData.ageGroup}
                onChange={handleChange}
                placeholder="Select target age range"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Preferred Colors"
                id="preferredColor"
                name="preferredColor"
                value={formData.preferredColor}
                onChange={handleChange}
                placeholder="e.g. Muted Blush & Warm Ivory, or Sage Green"
              />
              <Input
                label="Occasion"
                id="occasion"
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                placeholder="e.g. 1st Birthday photoshoot, Naming ceremony"
              />
            </div>
          </div>

          {/* Section 3: BUILD YOUR INSPIRATION (DESIGN GALLERY) */}
          <div>
            <h3 className="font-serif font-light text-charcoal text-xl border-b border-border pb-2 mb-4">
              3. Build Your Inspiration (Interactive Design Gallery)
            </h3>
            <DesignGalleryPicker
              selectedItems={selectedGalleryImages}
              onChange={setSelectedGalleryImages}
            />
          </div>

          {/* Section 4: Date, Written Requirements & Reference Photo */}
          <div>
            <h3 className="font-serif font-light text-charcoal text-xl border-b border-border pb-2 mb-4">
              4. Desired Date & Written Description
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Input
                label="Desired Date Needed By *"
                id="desiredDate"
                name="desiredDate"
                type="date"
                required
                value={formData.desiredDate}
                onChange={handleChange}
              />
              <Input
                label="Exact Size / Height / Chest (Optional)"
                id="customSize"
                name="customSize"
                value={formData.customSize}
                onChange={handleChange}
                placeholder="e.g. Chest 20 inches, Length 18 inches"
              />
            </div>

            <Textarea
              label="Custom Requirements & Written Description (Optional if gallery items selected)"
              id="requirements"
              name="requirements"
              rows={4}
              value={formData.requirements}
              onChange={handleChange}
              placeholder="Describe what you have in mind: preferred stitch pattern, sleeve type, ribbon details, matching accessories..."
            />
          </div>

          {/* Reference photo upload */}
          <div className="bg-ivory border border-dashed border-border p-5 text-center">
            <p className="text-label-md uppercase tracking-[0.14em] text-charcoal-600 mb-1">
              Own Reference Image / Sketch (Optional)
            </p>
            <p className="text-body-xs text-charcoal-400 font-light mb-3">
              Have your own Pinterest photo or drawing? Attach it below to combine with your gallery choices.
            </p>
            <input
              type="file"
              id="referenceImage"
              accept="image/*"
              onChange={(e) => setReferenceFile(e.target.files?.[0] || null)}
              className="text-body-xs font-sans text-charcoal-600 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-cream file:text-charcoal file:text-label-md file:uppercase file:tracking-[0.14em] hover:file:bg-oatmeal cursor-pointer"
            />
          </div>

          {errorMsg && (
            <div className="bg-blush-light text-warmBrown p-4 border border-blush text-body-sm font-sans">
              {errorMsg}
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button type="submit" variant="primary" size="xl" className="w-full sm:w-auto" loading={loading} arrow>
              SUBMIT CUSTOM INQUIRY
            </Button>

            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-label-md uppercase tracking-[0.14em] text-warmBrown hover:text-charcoal transition-colors font-medium"
            >
              Or Chat Directly on WhatsApp →
            </a>
          </div>
        </form>
      )}
    </div>
  );
}
