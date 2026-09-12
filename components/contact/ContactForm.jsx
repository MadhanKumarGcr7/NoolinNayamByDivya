'use client';

import { useState } from 'react';
import Input, { Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    // Map input IDs (e.g. c-name -> name)
    const field = id.replace(/^c-/, '');
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to send message.');
      }

      setSuccessMsg(data.message || 'Thank you! Your message has been sent successfully.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again or chat via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream border border-border p-8">
      <h2 className="font-serif font-light text-charcoal text-2xl border-b border-border pb-4 mb-6">
        Send a Message
      </h2>

      {successMsg && (
        <div className="mb-6 p-4 bg-sage-light border border-sage text-sage-dark text-body-sm rounded-sm">
          <p className="font-medium">Message Sent!</p>
          <p className="font-light mt-1">{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-body-sm rounded-sm">
          <p className="font-medium">Form Submission Error</p>
          <p className="font-light mt-1">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Your Name"
            id="c-name"
            required
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
          />
          <Input
            label="Email Address"
            id="c-email"
            type="email"
            required
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <Input
          label="Phone Number"
          id="c-phone"
          type="tel"
          placeholder="Phone (optional)"
          value={formData.phone}
          onChange={handleChange}
        />
        <Input
          label="Subject"
          id="c-subject"
          placeholder="Order question, custom sizing, general inquiry..."
          value={formData.subject}
          onChange={handleChange}
        />
        <Textarea
          label="Message"
          id="c-message"
          required
          rows={5}
          placeholder="How can we help you?"
          value={formData.message}
          onChange={handleChange}
        />
        <Button type="submit" variant="primary" size="lg" loading={loading} arrow>
          {loading ? 'SENDING MESSAGE...' : 'SEND MESSAGE'}
        </Button>
      </form>
    </div>
  );
}
