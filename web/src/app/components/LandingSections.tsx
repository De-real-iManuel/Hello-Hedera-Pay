'use client';

/**
 * Client-side wrapper for below-fold landing sections.
 * Required because Next.js 15 App Router does not allow ssr:false
 * in dynamic() calls inside Server Components.
 */

import dynamic from 'next/dynamic';

export const FeaturesSection = dynamic(() => import('./FeaturesSection'), {
  ssr: false,
  loading: () => <div className="py-24 lg:py-32" aria-hidden="true" />,
});

export const DemoPreviewSection = dynamic(() => import('./DemoPreviewSection'), {
  ssr: false,
  loading: () => <div className="py-24 lg:py-32" aria-hidden="true" />,
});
