import { SiteHeader } from '@/app/(marketing)/_components/SiteHeader';
import { SiteFooter } from '@/app/(marketing)/_components/SiteFooter';
import { Hero } from '@/app/(marketing)/_components/sections/Hero';
import { Drift } from '@/app/(marketing)/_components/sections/Drift';
import { SmsAlone } from '@/app/(marketing)/_components/sections/SmsAlone';
import { Engine } from '@/app/(marketing)/_components/sections/Engine';
import { RoiTiles } from '@/app/(marketing)/_components/sections/RoiTiles';
import { DashboardPreview } from '@/app/(marketing)/_components/sections/DashboardPreview';
import { PilotBand } from '@/app/(marketing)/_components/sections/PilotBand';
import { FounderNote } from '@/app/(marketing)/_components/sections/FounderNote';

/**
 * Adherix Health - public marketing homepage.
 *
 * Redesign 2026-04: thin Server Component that composes eight client
 * sections. Each section owns its own copy, layout, and motion.
 */
export const metadata = {
  title: 'Adherix Health \u00b7 Retention intelligence for modern metabolic care',
  description:
    'Adherix is the retention intelligence layer for GLP-1 programs. We detect patient drift early and automate the behavioral engagement that keeps adherence above the average.',
};

export default function MarketingHome() {
  return (
    <div className="mkt-page">
      <SiteHeader />
      <main>
        <Hero />
        <Drift />
        <SmsAlone />
        <Engine />
        <RoiTiles />
        <DashboardPreview />
        <PilotBand />
        <FounderNote />
      </main>
      <SiteFooter />
    </div>
  );
}
