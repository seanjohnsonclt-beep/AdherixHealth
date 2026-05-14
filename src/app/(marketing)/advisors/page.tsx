import { HomeAdvisors } from '@/app/(marketing)/_components/sections/HomeAdvisors';

export const metadata = {
  title: 'Strategic Advisory Board',
  description:
    'Advisors spanning operations, compliance, privacy, and health system leadership — helping Adherix move fast and build right.',
};

export default function AdvisorsPage() {
  return (
    <main>
      <HomeAdvisors />
    </main>
  );
}
