import { SiteHeader } from '@/app/(marketing)/_components/SiteHeader';
import { SiteFooter } from '@/app/(marketing)/_components/SiteFooter';
import { HomeHero } from '@/app/(marketing)/_components/sections/HomeHero';
import { HomeProblem } from '@/app/(marketing)/_components/sections/HomeProblem';
import { HomePillars } from '@/app/(marketing)/_components/sections/HomePillars';
import { HomeTrustCta } from '@/app/(marketing)/_components/sections/HomeTrustCta';

/**
 * Adherix Health — public marketing homepage.
 *
 * Four sections. Tight. Each section has one job.
 *
 *   Hero       — establish the problem, earn the next scroll
 *   Problem    — name the leak, give it a number
 *   Pillars    — how Adherix addresses it (behavioral signals / smart interventions / retention intelligence)
 *   Trust CTA  — stats + conversion + trust signals
 *
 * Depth (phases, triggers, comparison, dashboard) lives at /platform.
 */
export const metadata = {
  title: 'Adherix Health · Retention intelligence for modern metabolic care',
  description:
    'Adherix helps GLP-1 clinics detect patient disengagement early, trigger smarter interventions, and retain more patients through the treatment journey.',
};

export default function MarketingHome() {
  return (
    <div className="mkt-page">
      <SiteHeader />
      <main>
        <HomeHero />
        <HomeProblem />
        <HomePillars />
        <HomeTrustCta />
      </main>
      <SiteFooter />
    </div>
  );
}
