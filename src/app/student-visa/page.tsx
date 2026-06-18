'use client';
import { Plane, ArrowRight, GraduationCap, FileText, HandCoins } from 'lucide-react';

export default function StudentVisaPage() {
  const header = (
    <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'white', borderBottom: '1px solid rgba(0,13,16,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1280, margin: '0 auto', padding: '20px 24px' }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <Plane size={16} color="#bc7155" />
            <span style={{ fontWeight: 700, color: '#000d10', fontSize: 16 }}>SHINING</span>
            <span style={{ fontWeight: 300, color: '#000d10', letterSpacing: '0.2em', fontSize: 11, marginLeft: 4 }}>OVERSEAS</span>
          </div>
          <span style={{ fontSize: 9, color: '#8e8e95', letterSpacing: '0.15em', marginTop: 2, textTransform: 'uppercase', fontWeight: 500 }}>BAIRA Lic. RL-2716</span>
        </a>
        <a href="/#contact" style={{ padding: '8px 20px', background: '#000d10', color: 'white', borderRadius: 9999, fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Get Consultation</a>
      </div>
    </header>
  );

  const footer = (
    <footer style={{ background: 'white', borderTop: '1px solid rgba(0,13,16,0.08)', padding: '40px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: 12, color: '#8e8e95', fontWeight: 500 }}>© 2024 Shining Overseas. All rights reserved.</p>
    </footer>
  );

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: 'white', minHeight: '100vh' }}>
      {header}
      {/* Hero */}
      <section style={{ background: 'white' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 40 }}>
            <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
            <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700 }}>STUDENT VISA</span>
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 7vw, 88px)', fontWeight: 700, color: '#000d10', lineHeight: 1.0, letterSpacing: '-0.03em', maxWidth: 900, marginBottom: 40 }}>
            Study abroad<br />pathways for <span style={{ color: '#bc7155' }}>Bangladeshi students.</span>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#8e8e95', maxWidth: 640, lineHeight: 1.6, fontWeight: 500, marginBottom: 48 }}>
            We guide students through admission, visa processing, and pre-departure for Malaysia, UK, Canada, Australia, and more. Free counseling, verified institutions, transparent fees.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 64 }}>
            <a href="/#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 32px', background: '#000d10', color: 'white', borderRadius: 9999, fontSize: 12, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Book Free Counseling <ArrowRight size={16} />
            </a>
            <a href="/#circulars" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 32px', border: '1px solid rgba(0,13,16,0.15)', color: '#000d10', borderRadius: 9999, fontSize: 12, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              View Active Circulars
            </a>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 48, borderTop: '1px solid rgba(0,13,16,0.08)' }}>
            {['🇲🇾 Malaysia', '🇬🇧 United Kingdom', '🇨🇦 Canada', '🇦🇺 Australia', '🇩🇪 Germany'].map(c => (
              <div key={c} style={{ padding: '10px 20px', border: '1px solid rgba(0,13,16,0.15)', color: '#000d10', borderRadius: 9999, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{c}</div>
            ))}
          </div>
        </div>
      </section>
      {/* What's included */}
      <section style={{ background: '#0f0f1c' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 40 }}>
              <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
              <span style={{ fontSize: 11, letterSpacing: '0.25em', color: 'white', fontWeight: 700 }}>WHAT&apos;S INCLUDED</span>
            </div>
            <h2 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, color: 'white', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 32 }}>Every step,<br /><span style={{ color: '#bc7155' }}>handled.</span></h2>
            <p style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', color: '#d5d3d4', lineHeight: 1.6, fontWeight: 500, maxWidth: 480 }}>From application to airport — our counselors stay with you the whole way.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 1, background: 'rgba(255,255,255,0.05)' }}>
            {[
              { num: '01', Icon: GraduationCap, title: 'Admission Support', desc: 'Help with applications to verified universities and colleges abroad.' },
              { num: '02', Icon: FileText, title: 'Document Prep', desc: 'Transcripts, SOP, recommendations — reviewed and polished.' },
              { num: '03', Icon: Plane, title: 'Visa & Travel', desc: 'Visa application, interview prep, ticket booking, airport handover.' },
              { num: '04', Icon: HandCoins, title: 'Scholarship Guidance', desc: 'Information on bursaries, loans, and merit-based aid.' },
            ].map(({ num, Icon, title, desc }) => (
              <div key={num} style={{ border: '1px solid rgba(255,255,255,0.1)', padding: 32, background: '#151623', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#bc7155', fontWeight: 700, marginBottom: 48 }}>{num}</div>
                <div style={{ marginBottom: 48 }}><Icon size={20} color="white" /></div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: 16 }}>{title}</div>
                <div style={{ fontSize: 14, color: '#d5d3d4', lineHeight: 1.6, fontWeight: 500 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {footer}
    </main>
  );
}
