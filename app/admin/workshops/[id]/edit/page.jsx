'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input, { Textarea, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function EditWorkshopPage({ params }) {
  const id = params?.id;
  const router = useRouter();

  const [loading, setLoading]                 = useState(true);
  const [title, setTitle]                     = useState('');
  const [description, setDescription]         = useState('');
  const [coverImage, setCoverImage]           = useState('');
  const [date, setDate]                       = useState('');
  const [time, setTime]                       = useState('10:30 AM - 1:30 PM');
  const [duration, setDuration]               = useState('3 Hours');
  const [location, setLocation]               = useState('');
  const [isOnline, setIsOnline]               = useState(false);
  const [meetingLink, setMeetingLink]         = useState('');
  const [seatsTotal, setSeatsTotal]           = useState('10');
  const [seatsFilled, setSeatsFilled]         = useState('0');
  const [price, setPrice]                     = useState('0');
  const [isFree, setIsFree]                   = useState(true);
  const [skillLevel, setSkillLevel]           = useState('All Levels');
  const [registrationDeadline, setDeadline]   = useState('');
  const [status, setStatus]                   = useState('published');

  const [uploading, setUploading]             = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [error, setError]                     = useState(null);

  useEffect(() => {
    async function loadWorkshop() {
      try {
        const res = await fetch(`/api/admin/workshops/${id}`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Workshop not found');

        const w = data.workshop;
        setTitle(w.title || '');
        setDescription(w.description || '');
        setCoverImage(w.coverImage || '');
        setDate(w.date ? new Date(w.date).toISOString().split('T')[0] : '');
        setTime(w.time || '');
        setDuration(w.duration || '');
        setLocation(w.location || '');
        setIsOnline(Boolean(w.isOnline));
        setMeetingLink(w.meetingLink || '');
        setSeatsTotal(String(w.seatsTotal || 10));
        setSeatsFilled(String(w.seatsFilled || 0));
        setPrice(String(w.price || 0));
        setIsFree(Boolean(w.isFree));
        setSkillLevel(w.skillLevel || 'All Levels');
        setDeadline(w.registrationDeadline ? new Date(w.registrationDeadline).toISOString().split('T')[0] : '');
        setStatus(w.status || 'published');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadWorkshop();
  }, [id]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/workshops/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setCoverImage(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        title,
        description,
        coverImage,
        date,
        time,
        duration,
        location: isOnline ? 'Online' : location,
        isOnline,
        meetingLink: isOnline ? meetingLink : '',
        seatsTotal: parseInt(seatsTotal, 10),
        seatsFilled: parseInt(seatsFilled, 10),
        price: isFree ? 0 : parseFloat(price),
        isFree,
        skillLevel,
        registrationDeadline: registrationDeadline || null,
        status,
      };

      const res = await fetch(`/api/admin/workshops/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error updating workshop');

      router.push('/admin/workshops');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-6 h-6 border-2 border-warmBrown border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/workshops" className="text-label-md uppercase tracking-[0.14em] text-warmBrown hover:underline mb-1 inline-block">
            ← Back to Workshops
          </Link>
          <h1 className="font-serif font-light text-charcoal text-display-xs">Edit Workshop</h1>
        </div>
      </div>

      {error && (
        <div className="bg-blush-light text-warmBrown p-4 border border-blush text-body-sm font-sans">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-ivory border border-border p-6 sm:p-8">
        {/* Title & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Workshop Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <Select
            label="Publish Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'published', label: 'Published (Live)' },
              { value: 'draft', label: 'Draft' },
              { value: 'full', label: 'Full (Registration Closed)' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>

        {/* Description */}
        <Textarea
          label="Workshop Description"
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Cover Image Upload */}
        <div className="space-y-2">
          <label className="text-label-lg uppercase tracking-[0.16em] font-sans font-medium text-charcoal block">
            Cover Image
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-32 h-24 bg-cream border border-border overflow-hidden relative shrink-0">
              {coverImage ? (
                <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-body-xs text-charcoal-400">No Image</div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="text-body-xs text-charcoal-600 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-label-md file:uppercase file:bg-charcoal file:text-ivory hover:file:bg-warmBrown file:cursor-pointer"
              />
              {uploading && <p className="text-body-xs text-warmBrown animate-pulse">Uploading cover image...</p>}
            </div>
          </div>
        </div>

        {/* Date, Time, Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Workshop Date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            label="Time Slot"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <Input
            label="Duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        {/* Location / Online Toggle */}
        <div className="space-y-4 border-t border-border/60 pt-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isOnline"
              checked={isOnline}
              onChange={(e) => setIsOnline(e.target.checked)}
              className="w-4 h-4 accent-warmBrown"
            />
            <label htmlFor="isOnline" className="text-body-sm text-charcoal font-medium">
              This is an Online Workshop (via Zoom / Google Meet)
            </label>
          </div>

          {isOnline ? (
            <Input
              label="Meeting Link / Details (Sent upon registration)"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
          ) : (
            <Input
              label="Physical Location / Studio Address"
              required={!isOnline}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          )}
        </div>

        {/* Seats & Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-border/60 pt-6">
          <Input
            label="Total Seats Capacity"
            type="number"
            min="1"
            required
            value={seatsTotal}
            onChange={(e) => setSeatsTotal(e.target.value)}
          />

          <Input
            label="Seats Filled"
            type="number"
            min="0"
            required
            value={seatsFilled}
            onChange={(e) => setSeatsFilled(e.target.value)}
          />

          <div>
            <Select
              label="Skill Level"
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              options={[
                { value: 'All Levels', label: 'All Levels' },
                { value: 'Beginner', label: 'Beginner' },
                { value: 'Intermediate', label: 'Intermediate' },
                { value: 'Advanced', label: 'Advanced' },
              ]}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-label-lg uppercase tracking-[0.16em] font-sans font-medium text-charcoal">
                Price (₹)
              </label>
              <label className="flex items-center gap-1.5 text-body-xs text-charcoal-600">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => {
                    setIsFree(e.target.checked);
                    if (e.target.checked) setPrice('0');
                  }}
                  className="accent-warmBrown"
                />
                Free
              </label>
            </div>
            <Input
              type="number"
              min="0"
              disabled={isFree}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        {/* Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/60 pt-6">
          <Input
            label="Registration Deadline (Optional)"
            type="date"
            value={registrationDeadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        {/* Submit CTAs */}
        <div className="flex justify-end gap-4 border-t border-border/60 pt-6">
          <Link href="/admin/workshops">
            <Button variant="secondary" size="lg">CANCEL</Button>
          </Link>
          <Button variant="primary" size="lg" type="submit" loading={saving}>
            UPDATE WORKSHOP
          </Button>
        </div>
      </form>
    </div>
  );
}
