import { SiteHeader } from '@/app/(marketing)/_components/SiteHeader';
import { SiteFooter } from '@/app/(marketing)/_components/SiteFooter';
import { HomeHero } from '@/app/(marketing)/_components/sections/HomeHero';
import { HomeProblem } from '@/app/(marketing)/_components/sections/HomeProblem';
import { HomePillars } from '@/app/(marketing)/_components/sections/HomePillars';
import { HomeRoi } from '@/app/(marketing)/_components/sections/HomeRoi';
import { HomeFounder } from '@/app/(marketing)/_components/sections/HomeFounder';
import { HomeTrustCta } from '@/app/(marketing)/_components/sections/HomeTrustCta';

export const metadata = {
  title: 'Adherix Health | Retention intelligence for modern metabolic care',
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
        <HomeRoi />
        <HomeFounder />
        <HomeTrustCta />
      </main>
      <SiteFooter />
    </div>
  );
}
