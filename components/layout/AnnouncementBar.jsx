'use client';

import { brandConfig } from '@/lib/config';

export default function AnnouncementBar() {
  return (
    <div
      className="w-full bg-charcoal text-ivory py-2.5 px-4 text-center"
      role="banner"
      aria-label="Announcement"
    >
      <p className="announcement-text text-ivory/90 font-light">
        {brandConfig.announcementText}
      </p>
    </div>
  );
}
