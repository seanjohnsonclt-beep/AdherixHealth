import type { Metadata } from 'next';
import { PlatformHero } from '../_components/sections/PlatformHero';
import { Engine } from '../_components/sections/Engine';
import { TriggerLogic } from '../_components/sections/TriggerLogic';
import { SmsAlone } from '../_components/sections/SmsAlone';
import { DashboardPreview } from '../_components/sections/DashboardPreview';
import { PlatformCta } from '../_components/sections/PlatformCta';

/**
 * /platform -- the behavioral engine in depth.
 *
 * This is where clinic operators come to understand how Adherix works
 * before they commit to a demo. It answers every "but how does it actually..."
 * question.
 *
 * Sections in order:
 *   PlatformHero    -- frame the page
 *   Engine          -- six-phase progression + animated timeline
 *   TriggerLogic    -- four triggers, how they fire, what they do
 *   SmsAlone        -- why SMS alone is not enough (the behavioral case)
 *   DashboardPreview -- the clinic dashboard mockup
 *   PlatformCta     -- book demo / ROI calculator
 *
 * Header + footer are injected by (marketing)/layout.tsx.
 */
export const metadata: Metadata = {
  title: 'Platform | Adherix Health',
  description:
    'The behavioral adherence engine for GLP-1 retention. Six phases, trigger-driven outreach, clinic routing -- built to run without adding to your team\'s workload.',
};

export default function PlatformPage() {
  return (
    <>
      <PlatformHero />
      <Engine />
      <TriggerLogic />
      <SmsAlone />
      <DashboardPreview />
      <PlatformCta />
    </>
  );
}
