import type { Metadata } from 'next';
import Link from 'next/link';
import { FadeRise, TapButton } from '../_components/animation/MotionPrimitives';
import { DemoInteractive } from './DemoInteractive';

export const metadata: Metadata = {
  title: 'Demo | Adherix Health',
  description:
    'See the Adherix retention engine in action. Walk through every phase, trigger, and patient interaction  -  then try it on your own phone.',
};

export default function DemoPage() {
  return (
    <>
      {/* Hero */}
      <section className="mkt-v2-section" id="demo-hero">
        <div className="mkt-container">
          <FadeRise as="span" className="mkt-eyebrow">
            Interactive demo
          </FadeRise>
          <FadeRise as="h1" className="mkt-h1" delay={0.06}>
            See exactly what your patients experience.
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead" delay={0.12}>
            Walk through every phase and trigger the engine handles automatically  - 
            then enroll your own number and feel it firsthand.
          </FadeRise>
          <FadeRise
            delay={0.18}
            style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 32 }}
          >
            <TapButton>
              <a href="#enroll" className="mkt-btn mkt-btn--primary mkt-btn--lg">
                Try it on your phone
              </a>
            </TapButton>
            <TapButton>
              <a href="#walkthrough" className="mkt-btn mkt-btn--ghost mkt-btn--lg">
                See the walkthrough
              </a>
            </TapButton>
          </FadeRise>
        </div>
      </section>

      {/* Walkthrough + live enroll (client) */}
      <DemoInteractive />

      {/* CTA band */}
      <section className="mkt-v2-section mkt-v2-section--ink" id="cta">
        <div className="mkt-container mkt-v2-trust">
          <FadeRise as="h2" className="mkt-h2 mkt-v2-trust__title">
            Ready to run this for your clinic?
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
            Demo walk-throughs take 30 minutes. Three-month pilot setup in under 48 hours.
          </FadeRise>
          <FadeRise delay={0.14}>
            <TapButton>
              <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">
                Book a demo call
              </Link>
            </TapButton>
          </FadeRise>
        </div>
      </section>
    </>
  );
}
