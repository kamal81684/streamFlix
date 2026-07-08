"use client";

import { useEffect, useRef, useState } from "react";
import { getCachedBlob, putCachedBlob } from "@/lib/imageCache";

interface CachedImageProps {
  /** Stable cache key (the S3 object key). Falls back to plain network load if absent. */
  cacheKey?: string;
  /** Presigned network URL, used on a cache miss. */
  src?: string;
  alt?: string;
  className?: string;
}

/**
 * Renders an <img> whose bytes are cached in IndexedDB by `cacheKey`.
 * On a hit it displays the cached blob (no network); on a miss it fetches the
 * presigned URL once, displays it, and stores the blob for next time.
 */
export default function CachedImage({
  cacheKey,
  src,
  alt = "",
  className,
}: CachedImageProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  // Keep the latest presigned URL without re-running the effect when only the
  // signature changes (the key identifies immutable content).
  const srcRef = useRef(src);
  srcRef.current = src;

  useEffect(() => {
    // No cache key: just load the network URL directly.
    if (!cacheKey) {
      setBlobUrl(null);
      return;
    }

    let cancelled = false;
    let createdUrl: string | null = null;

    const show = (blob: Blob) => {
      if (cancelled) return;
      createdUrl = URL.createObjectURL(blob);
      setBlobUrl(createdUrl);
    };

    (async () => {
      const cached = await getCachedBlob(cacheKey);
      if (cancelled) return;
      if (cached) {
        show(cached);
        return;
      }

      const url = srcRef.current;
      if (!url) return;
      try {
        const res = await fetch(url); // CORS GET; bucket allows the origin
        if (!res.ok) return; // leave blobUrl null -> fall back to network src
        const blob = await res.blob();
        if (cancelled) return;
        void putCachedBlob(cacheKey, blob);
        show(blob);
      } catch {
        // network/CORS failure -> fall back to network src below
      }
    })();

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [cacheKey]);

  // While a keyed blob is resolving, show a light skeleton instead of hitting
  // the network with the presigned URL (which would defeat the cache).
  if (cacheKey && !blobUrl) {
    return <span className={`${className ?? ""} animate-pulse bg-muted`} aria-hidden />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={blobUrl ?? src} alt={alt} className={className} />;
}
