'use client';

import { useState } from 'react';

export default function CraftStudioImage() {
  const [imgSrc, setImgSrc] = useState('/assets/crochet/custom-craft-studio.jpg');

  return (
    <div className="hover-zoom overflow-hidden rounded-sm shadow-warm-md border border-border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        onError={() => setImgSrc('/assets/crochet/hands-crafting.jpg')}
        alt="Custom Craft Studio — Hands crocheting custom dress"
        className="w-full h-auto object-cover aspect-[3/4]"
      />
    </div>
  );
}
