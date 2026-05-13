import { HomeAdvisors } from '@/app/(marketing)/_components/sections/HomeAdvisors';

export const metadata = {
  title: 'Clinical Advisory Board',
  description:
    'Adherix is shaped by clinicians and operators who have run service lines, managed patient panels, and felt the cost of disengagement firsthand.',
};

export default function AdvisorsPage() {
  return (
    <main>
      <HomeAdvisors />
    </main>
  );
}
