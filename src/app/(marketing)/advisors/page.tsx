import { HomeAdvisors } from '@/app/(marketing)/_components/sections/HomeAdvisors';

export const metadata = {
  title: 'Strategic Advisory Board',
  description:
    'Advisors spanning operations, compliance, privacy, and health system leadership - so Adherix is built to earn trust from day one.',
};

export default function AdvisorsPage() {
  return (
    <main>
      <HomeAdvisors />
    </main>
  );
}
