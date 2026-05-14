'use client';

import Image from 'next/image';
import { FadeRise } from '../animation/MotionPrimitives';

/**
 * Clinical Advisory Board  -  homepage section.
 *
 * Credibility signal for clinic operators and health system contacts.
 * Keep bios tight  -  one sentence title, two sentences of context max.
 */

type Advisor = {
  name: string;
  title: string;
  org: string;
  bio: string;
  image: string;
  initials: string;
};

const advisors: Advisor[] = [
  {
    name: 'Brandon Hubbs',
    title: 'Cardiovascular Service Line Administrator',
    org: 'Health System Operations',
    bio: 'With over 15 years leading cardiovascular program strategy across inpatient and outpatient settings, Brandon brings deep expertise in service line growth, care pathway integration, and the operational realities of keeping patients engaged through complex treatment journeys.',
    image: '/advisor-brandon.png',
    initials: 'BH',
  },
  {
    name: 'Clair Singleton',
    title: 'Chief Medical Officer',
    org: 'CareOne',
    bio: 'A practicing internist and executive physician leader, Clair has spent her career designing clinically rigorous, operationally lean care programs across primary care and metabolic medicine. She brings a frontline perspective on what it takes to sustain patient engagement when motivation is lowest.',
    image: '/advisor-clair.png',
    initials: 'CS',
  },
  {
    name: 'Tara Renee Jackson, MBA, CHCO',
    title: 'HIPAA Compliance & Governance',
    org: 'Duke University Health System',
    bio: 'A Certified HIPAA Compliance Officer with over 30 years of healthcare experience, Tara leads privacy compliance, EHR auditing, and incident investigation at DUHS. She brings deep expertise in information governance and regulatory compliance to ensure Adherix meets the highest standards for patient data integrity.',
    image: '/advisor-tara.jpg',
    initials: 'TJ',
  },
];

function AdvisorCard({ advisor, index }: { advisor: Advisor; index: number }) {
  const isPending = advisor.name === 'Coming Soon';

  return (
    <FadeRise
      className={`mkt-v2-advisor__card${isPending ? ' mkt-v2-advisor__card--pending' : ''}`}
      delay={0.06 * index}
    >
      <div className="mkt-v2-advisor__photo-wrap">
        {advisor.image ? (
          <Image
            src={advisor.image}
            alt={advisor.name}
            width={80}
            height={80}
            className="mkt-v2-advisor__photo"
          />
        ) : (
          <div className="mkt-v2-advisor__photo mkt-v2-advisor__photo--tbd">
            <span>{advisor.initials}</span>
          </div>
        )}
      </div>

      <div className="mkt-v2-advisor__meta">
        <div className="mkt-v2-advisor__name">{advisor.name}</div>
        <div className="mkt-v2-advisor__title">{advisor.title}</div>
        {advisor.org && (
          <div className="mkt-v2-advisor__org">{advisor.org}</div>
        )}
      </div>

      <p className="mkt-v2-advisor__bio">{advisor.bio}</p>
    </FadeRise>
  );
}

export function HomeAdvisors() {
  return (
    <section className="mkt-v2-section mkt-v2-section--alt" id="advisors">
      <div className="mkt-container">
        <div className="mkt-v2-section__head">
          <FadeRise as="span" className="mkt-eyebrow">
            Clinical Advisory Board
          </FadeRise>
          <FadeRise as="h2" className="mkt-h2" delay={0.05}>
            Built with people who live inside clinical operations
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead" delay={0.1}>
            Adherix is shaped by advisors who have run service lines, managed
            patient panels, and felt the cost of disengagement firsthand.
          </FadeRise>
        </div>

        <div className="mkt-v2-advisor__grid">
          {advisors.map((advisor, i) => (
            <AdvisorCard key={advisor.name} advisor={advisor} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
