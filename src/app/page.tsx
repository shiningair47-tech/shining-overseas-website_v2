'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plane, ArrowRight, ChevronDown, Menu, X, Inbox, CircleAlert, CircleCheck } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SiteSettings { [key: string]: string }
interface Circular { id: string; country: string; flag: string; title: string; salary: string; requirements: string; is_active: boolean }
interface Flight { id: string; group_name: string; role: string; origin: string; destination: string; route: string; flight_date: string }
interface Award { id: string; title: string; issuer: string; year: string; description: string; sort_order: number }
interface Testimonial { id: string; quote: string; name: string; role: string; country: string; image_url: string; is_featured: boolean }

const DEFAULT_SETTINGS: SiteSettings = {
  hero_badge: 'BAIRA LICENSED · REG. NO. RL-2716', hero_heading: 'Your trusted gateway to ', hero_heading_accent: 'global opportunity.',
  hero_paragraph: 'BAIRA-licensed overseas recruitment for Bangladeshi workers. Saudi Arabia, Malaysia, UAE, Qatar, Kuwait — handled end to end with verified employers, sharp execution, and full compliance.',
  hero_cta_primary: 'Get Free Consultation', hero_cta_secondary: 'View Active Circulars',
  stat_1_value: '12,000+', stat_1_label: 'Workers Placed', stat_2_value: '15+', stat_2_label: 'Years of Trust',
  stat_3_value: '8', stat_3_label: 'Countries Served', stat_4_value: '98%', stat_4_label: 'Visa Success Rate',
  slide_1_label: 'OUR MISSION', slide_1_title: 'Empowering dreams through global opportunities', slide_1_subtitle: 'Trusted recruitment for skilled workers across the Gulf, Southeast Asia, and beyond.',
  slide_2_label: 'PROVEN TRACK RECORD', slide_2_title: 'Over 12,000 workers placed since 2009', slide_2_subtitle: 'BAIRA-licensed and globally connected with verified employers.',
  slide_3_label: 'END-TO-END SUPPORT', slide_3_title: 'Visa, training, and deployment under one roof', slide_3_subtitle: 'From medical tests to airport handover — we handle every step.',
  slide_4_label: 'COUNTRY COVERAGE', slide_4_title: 'Saudi Arabia, Malaysia, UAE, Qatar, Kuwait', slide_4_subtitle: 'Direct demand letters from licensed Gulf and ASEAN employers.',
  about_heading: 'Built on trust,', about_heading_accent: 'since 2009.',
  about_body_1: "Shining Overseas was founded in Dhaka with one mission: to give Bangladeshi workers a fair, transparent, and licensed path to overseas employment. Over fifteen years, we've grown from a small office to a BAIRA-licensed agency with verified employer partners across the Gulf and Southeast Asia.",
  about_body_2: "Every worker we place is supported through medical, training, visa processing, and post-deployment care. We don't take shortcuts — and we don't charge what we don't deliver.",
  footer_headline: 'Your trusted gateway to global opportunity.',
  footer_description: 'BAIRA-licensed overseas recruitment agency placing skilled Bangladeshi workers across the Gulf and Southeast Asia since 2009.',
};

export default function HomePage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [awardIndex, setAwardIndex] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [portalOpen, setPortalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetch('/api/site-settings').then(r => r.json()).then(setSettings).catch(() => {});
    fetch('/api/circulars?active=true').then(r => r.json()).then(setCirculars).catch(() => {});
    fetch('/api/flights').then(r => r.json()).then(setFlights).catch(() => {});
    fetch('/api/awards').then(r => r.json()).then(setAwards).catch(() => {});
    fetch('/api/testimonials').then(r => r.json()).then(setTestimonials).catch(() => {});
    const iv = setInterval(() => setSlideIndex(i => (i + 1) % 4), 5000);
    return () => clearInterval(iv);
  }, []);

  const s = settings;
  const slides = [
    { label: s.slide_1_label, title: s.slide_1_title, subtitle: s.slide_1_subtitle },
    { label: s.slide_2_label, title: s.slide_2_title, subtitle: s.slide_2_subtitle },
    { label: s.slide_3_label, title: s.slide_3_title, subtitle: s.slide_3_subtitle },
    { label: s.slide_4_label, title: s.slide_4_title, subtitle: s.slide_4_subtitle },
  ];
  const currentSlide = slides[slideIndex] || slides[0];

  const countries = ['All', ...Array.from(new Set(circulars.map(c => c.country)))];
  const filteredCirculars = selectedCountry === 'All' ? circulars : circulars.filter(c => c.country === selectedCountry);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(''); setFormLoading(true);
    const fd = new FormData(e.currentTarget);
    const phone = (fd.get('phone') as string || '').trim();
    const name = (fd.get('name') as string || '').trim();
    if (!phone) { setFormError('Phone number is required.'); setFormLoading(false); return; }
    try {
      const res = await fetch('/api/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit', full_name: name, phone_number: phone, country: fd.get('country') || '', source: 'homepage', owner_user: null, has_visit_date: false, visit_date: '', message: fd.get('message') || '' }),
      });
      const data = await res.json();
      if (data.ok) { setFormSubmitted(true); (e.target as HTMLFormElement).reset(); }
      else setFormError(data.msg || 'Could not submit. Please try again.');
    } catch { setFormError('Network error. Please try again.'); }
    setFormLoading(false);
  };

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: 'white', minHeight: '100vh' }}>
      {/* HEADER */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ background: 'white', borderBottom: '1px solid rgba(0,13,16,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1280, margin: '0 auto', padding: '20px 24px' }}>
            <a href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <Plane size={16} color="#bc7155" />
                <span style={{ fontWeight: 700, color: '#000d10', fontSize: 16, letterSpacing: '-0.02em' }}>SHINING</span>
                <span style={{ fontWeight: 300, color: '#000d10', letterSpacing: '0.2em', fontSize: 11, marginLeft: 4 }}>OVERSEAS</span>
              </div>
              <span style={{ fontSize: 9, color: '#8e8e95', letterSpacing: '0.15em', marginTop: 2, textTransform: 'uppercase', fontWeight: 500 }}>BAIRA Lic. RL-2716</span>
            </a>
            {/* Desktop nav */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              {[['Active Circulars', '#circulars'], ['Success Stories', '#stories']].map(([label, href]) => (
                <a key={href} href={href} style={{ fontSize: 13, fontWeight: 600, color: '#000d10', textDecoration: 'none', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</a>
              ))}
              <a href="/student-visa" style={{ fontSize: 13, fontWeight: 600, color: '#000d10', textDecoration: 'none', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Student Visa</a>
              <a href="#flights" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, color: '#000d10', textDecoration: 'none', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <span style={{ height: 6, width: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite', display: 'inline-block' }} />
                Recent Flights
              </a>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setPortalOpen(!portalOpen)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#000d10', cursor: 'pointer', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Team Portal <ChevronDown size={12} />
                </button>
                {portalOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, background: 'white', border: '1px solid rgba(0,13,16,0.1)', width: 192, zIndex: 50 }}>
                    {[['Staff Members', '/login?role=team'], ['Influencers', '/login?role=influencer']].map(([label, href]) => (
                      <a key={href} href={href} onClick={() => setPortalOpen(false)} style={{ display: 'block', padding: '12px 20px', fontSize: 13, color: '#000d10', textDecoration: 'none', borderBottom: '1px solid rgba(0,13,16,0.08)' }}>{label}</a>
                    ))}
                  </div>
                )}
              </div>
              <a href="#contact" style={{ padding: '8px 20px', background: '#000d10', color: 'white', borderRadius: 9999, fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Get Consultation</a>
            </nav>
            <button onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#000d10' }} className="mobile-menu-btn">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          {mobileOpen && (
            <div style={{ borderTop: '1px solid rgba(0,13,16,0.1)' }}>
              {[['Active Circulars', '#circulars'], ['Student Visa', '/student-visa'], ['Success Stories', '#stories'], ['Recent Flights', '#flights'], ['Staff Login', '/login?role=team'], ['Influencer Login', '/login?role=influencer'], ['Get Consultation', '#contact']].map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '16px 24px', fontSize: 13, fontWeight: 600, color: label === 'Get Consultation' ? '#bc7155' : '#000d10', textDecoration: 'none', borderBottom: '1px solid rgba(0,13,16,0.08)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</a>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* HERO */}
      <section style={{ background: 'white' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 16px', border: '1px solid rgba(0,13,16,0.12)', borderRadius: 9999, marginBottom: 40 }}>
            <span style={{ color: '#bc7155', marginRight: 8, fontSize: 12 }}>●</span>
            <span style={{ fontSize: 11, letterSpacing: '0.25em', fontWeight: 700, color: '#000d10', textTransform: 'uppercase' }}>{s.hero_badge}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 700, color: '#000d10', lineHeight: 1.0, letterSpacing: '-0.03em', maxWidth: 900, margin: '0 0 40px' }}>
            {s.hero_heading}<span style={{ color: '#bc7155' }}>{s.hero_heading_accent}</span>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#8e8e95', maxWidth: 640, lineHeight: 1.6, fontWeight: 500, marginBottom: 48 }}>{s.hero_paragraph}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 80 }}>
            <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 32px', background: '#000d10', color: 'white', borderRadius: 9999, fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {s.hero_cta_primary} <ArrowRight size={16} />
            </a>
            <a href="#circulars" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 32px', border: '1px solid rgba(0,13,16,0.15)', color: '#000d10', borderRadius: 9999, fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {s.hero_cta_secondary}
            </a>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: '24px 0', paddingTop: 48, borderTop: '1px solid rgba(0,13,16,0.08)' }}>
            {[['stat_1_value', 'stat_1_label'], ['stat_2_value', 'stat_2_label'], ['stat_3_value', 'stat_3_label'], ['stat_4_value', 'stat_4_label']].map(([vk, lk], i) => (
              <div key={i} style={{ paddingLeft: i === 0 ? 0 : 32, paddingRight: 32, borderRight: i < 3 ? '1px solid rgba(0,13,16,0.10)' : 'none' }}>
                <div style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 700, color: '#000d10', letterSpacing: '-0.03em' }}>{s[vk]}</div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#8e8e95', marginTop: 8, fontWeight: 600 }}>{s[lk]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SLIDER */}
      <section style={{ background: '#0f0f1c' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ minHeight: 340 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 40 }}>
              <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
              <span style={{ fontSize: 11, letterSpacing: '0.25em', color: 'white', fontWeight: 700, textTransform: 'uppercase' }}>{currentSlide.label}</span>
            </div>
            <h2 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, color: 'white', lineHeight: 1.05, letterSpacing: '-0.03em', maxWidth: 900, marginBottom: 40 }}>{currentSlide.title}</h2>
            <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#d5d3d4', maxWidth: 640, lineHeight: 1.6, fontWeight: 500 }}>{currentSlide.subtitle}</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24, marginTop: 64, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              {slides.map((_, i) => (
                <span key={i} style={{ fontSize: 11, letterSpacing: '0.25em', color: slideIndex === i ? 'white' : 'rgba(255,255,255,0.3)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setSlideIndex(i)}>
                  0{i + 1}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {slides.map((_, i) => (
                <button key={i} onClick={() => setSlideIndex(i)} style={{ height: 1, width: slideIndex === i ? 48 : 24, background: slideIndex === i ? '#bc7155' : 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', transition: 'all 0.5s' }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section style={{ background: 'white' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 64 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 40 }}>
                <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
                <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase' }}>OUR HISTORY</span>
              </div>
              <h2 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, color: '#000d10', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 40 }}>
                {s.about_heading}<br /><span style={{ color: '#bc7155' }}>{s.about_heading_accent}</span>
              </h2>
              <p style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', color: '#8e8e95', lineHeight: 1.6, fontWeight: 500, maxWidth: 480, marginBottom: 24 }}>{s.about_body_1}</p>
              <p style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', color: '#8e8e95', lineHeight: 1.6, fontWeight: 500, maxWidth: 480 }}>{s.about_body_2}</p>
            </div>
            <div style={{ paddingTop: 16 }}>
              {[['01', 'BAIRA Licensed', 'Reg. No. RL-2716. Full government compliance and legal backing.'], ['02', 'Verified Demand Letters', 'Every job comes from a verified employer with valid visa quotas.'], ['03', 'Transparent Pricing', 'No hidden fees. Every cost is documented before you commit.'], ['04', 'End-to-End Service', 'Medical, training, visa, ticket, airport pickup — all under one roof.'], ['05', 'Post-Deployment Support', "We stay with you after arrival. Real support, not just paperwork."]].map(([num, title, desc]) => (
                <div key={num} style={{ display: 'flex', gap: 16, padding: '28px 0', borderTop: '1px solid rgba(0,13,16,0.12)' }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#bc7155', fontWeight: 700, flexShrink: 0, paddingTop: 4, width: 48 }}>{num}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#000d10', marginBottom: 8 }}>{title}</div>
                    <div style={{ fontSize: 14, color: '#8e8e95', lineHeight: 1.6, fontWeight: 500 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CIRCULARS */}
      <section id="circulars" style={{ background: 'white' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 64, gap: 40 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 32 }}>
                <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
                <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700 }}>ACTIVE CIRCULARS</span>
              </div>
              <h2 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, color: '#000d10', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 32 }}>
                Open positions,<br /><span style={{ color: '#bc7155' }}>hiring now.</span>
              </h2>
              <p style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', color: '#8e8e95', lineHeight: 1.6, fontWeight: 500, maxWidth: 480 }}>Verified jobs with valid demand letters from licensed employers.</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {countries.map(c => (
                <button key={c} onClick={() => setSelectedCountry(c)} style={{ padding: '10px 20px', background: selectedCountry === c ? '#000d10' : 'transparent', color: selectedCountry === c ? 'white' : '#000d10', border: `1px solid ${selectedCountry === c ? '#000d10' : 'rgba(0,13,16,0.15)'}`, borderRadius: 9999, fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.2s' }}>{c}</button>
              ))}
            </div>
          </div>
          {filteredCirculars.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '96px 0', border: '1px solid rgba(0,13,16,0.1)' }}>
              <Inbox size={40} color="#8e8e95" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: 14, color: '#8e8e95', fontWeight: 500 }}>No circulars currently active for this country.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 1, background: 'rgba(0,13,16,0.1)' }}>
              {filteredCirculars.map(circ => (
                <div key={circ.id} style={{ background: 'white', padding: 32, display: 'flex', flexDirection: 'column', border: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid rgba(0,13,16,0.1)' }}>
                    <span style={{ fontSize: 28 }}>{circ.flag}</span>
                    <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#8e8e95', fontWeight: 700, textTransform: 'uppercase' }}>{circ.country}</span>
                  </div>
                  <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: '#000d10', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 20 }}>{circ.title}</h3>
                  <div style={{ marginBottom: 20 }}>
                    <span style={{ fontSize: 18, color: '#bc7155', fontWeight: 700 }}>{circ.salary}</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#8e8e95', lineHeight: 1.6, fontWeight: 500, flexGrow: 1, marginBottom: 32 }}>{circ.requirements}</p>
                  <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, paddingTop: 24, borderTop: '1px solid rgba(0,13,16,0.1)', color: '#000d10', textDecoration: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    Apply Now <ArrowRight size={14} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AWARDS */}
      <section id="awards" style={{ background: '#0f0f1c' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 40 }}>
              <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
              <span style={{ fontSize: 11, letterSpacing: '0.25em', color: 'white', fontWeight: 700 }}>RECOGNITION</span>
            </div>
            <h2 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, color: 'white', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 32 }}>Awards &<br />accreditations.</h2>
            <p style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', color: '#d5d3d4', lineHeight: 1.6, fontWeight: 500, maxWidth: 480 }}>Recognized by industry bodies and government for ethical recruitment.</p>
          </div>
          {awards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '96px 0', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ color: '#d5d3d4', fontSize: 14 }}>No awards yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 1, background: 'rgba(255,255,255,0.05)' }}>
              {awards.map((award, i) => (
                <div key={award.id} style={{ padding: 40, background: '#151623', border: `1px solid ${awardIndex === i ? 'rgba(188,113,85,0.5)' : 'rgba(255,255,255,0.08)'}`, opacity: awardIndex === i ? 1 : 0.5, transition: 'all 0.7s', cursor: 'pointer' }} onClick={() => setAwardIndex(i)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#bc7155', fontWeight: 700 }}>0{i + 1}</span>
                    <span style={{ fontSize: 11, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{award.year}</span>
                  </div>
                  <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 16 }}>{award.title}</h3>
                  <div style={{ fontSize: 12, color: '#bc7155', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 24 }}>{award.issuer}</div>
                  <p style={{ fontSize: 14, color: '#d5d3d4', lineHeight: 1.6, fontWeight: 500 }}>{award.description}</p>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 64 }}>
            {awards.map((_, i) => (
              <button key={i} onClick={() => setAwardIndex(i)} style={{ height: 1, width: awardIndex === i ? 48 : 24, background: awardIndex === i ? '#bc7155' : 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', transition: 'all 0.5s' }} />
            ))}
          </div>
        </div>
      </section>

      {/* FLIGHTS */}
      <section id="flights" style={{ background: '#0f0f1c' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 32 }}>
              <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
              <span style={{ fontSize: 11, letterSpacing: '0.25em', color: 'white', fontWeight: 700 }}>RECENT FLIGHTS</span>
            </div>
            <h2 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, color: 'white', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 32 }}>Workers we&apos;ve<br />deployed this month.</h2>
            <p style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', color: '#d5d3d4', lineHeight: 1.6, fontWeight: 500, maxWidth: 480 }}>Real groups. Real flights. Real people building their futures.</p>
          </div>
          {flights.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '96px 0', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ color: '#d5d3d4', fontSize: 14 }}>No flights yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 1, background: 'rgba(255,255,255,0.05)', overflowX: 'auto', paddingBottom: 24, marginLeft: -24, marginRight: -24, paddingLeft: 24, paddingRight: 24 }}>
              {flights.map((f, i) => (
                <div key={f.id} style={{ flexShrink: 0, width: 'clamp(300px, 38vw, 380px)', padding: 36, background: '#151623', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#bc7155', fontWeight: 700 }}>0{i + 1}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ height: 6, width: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                      <span style={{ fontSize: 10, letterSpacing: '0.25em', color: '#34d399', fontWeight: 700 }}>DEPLOYED</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: 'white', letterSpacing: '-0.03em' }}>{f.origin}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, padding: '0 16px' }}>
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.2)' }} />
                      <Plane size={16} color="#bc7155" />
                      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.2)' }} />
                    </div>
                    <span style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: 'white', letterSpacing: '-0.03em' }}>{f.destination}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#d5d3d4', fontWeight: 500, letterSpacing: '0.03em', marginBottom: 32 }}>{f.route}</div>
                  <div style={{ fontSize: 11, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 32 }}>{f.flight_date}</div>
                  <div style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: 12, color: '#bc7155', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>{f.group_name}</div>
                    <div style={{ fontSize: 16, color: 'white', fontWeight: 700, letterSpacing: '-0.01em' }}>{f.role}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="stories" style={{ background: 'white' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 32 }}>
              <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
              <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700 }}>SUCCESS STORIES</span>
            </div>
            <h2 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, color: '#000d10', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 32 }}>Voices from<br /><span style={{ color: '#bc7155' }}>the field.</span></h2>
            <p style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', color: '#8e8e95', lineHeight: 1.6, fontWeight: 500, maxWidth: 480 }}>From Riyadh to Kuala Lumpur — workers we placed, in their own words.</p>
          </div>
          {testimonials.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '96px 0', border: '1px solid rgba(0,13,16,0.1)' }}>
              <p style={{ color: '#8e8e95', fontSize: 14 }}>No testimonials yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 1, background: 'rgba(0,13,16,0.1)' }}>
              {testimonials.map((t, i) => {
                const initials = t.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                return (
                  <div key={t.id} style={{ background: 'white', padding: 32, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid rgba(0,13,16,0.1)' }}>
                      <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#bc7155', fontWeight: 700 }}>0{i + 1}</span>
                      <div style={{ display: 'flex', gap: 2 }}>{[...Array(5)].map((_, j) => <span key={j} style={{ color: '#bc7155', fontSize: 12 }}>★</span>)}</div>
                    </div>
                    <p style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', color: '#000d10', lineHeight: 1.5, fontWeight: 500, letterSpacing: '-0.01em', flexGrow: 1, marginBottom: 32 }}>&ldquo;{t.quote}&rdquo;</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 24, borderTop: '1px solid rgba(0,13,16,0.1)' }}>
                      <div style={{ height: 48, width: 48, borderRadius: '50%', background: '#000d10', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#000d10' }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: '#8e8e95', marginTop: 4, fontWeight: 500 }}>{t.role} · {t.country}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ background: '#0f0f1c' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 64 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 40 }}>
                <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
                <span style={{ fontSize: 11, letterSpacing: '0.25em', color: 'white', fontWeight: 700 }}>GET CONSULTATION</span>
              </div>
              <h2 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, color: 'white', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 32 }}>
                Talk to a<br />licensed advisor<br /><span style={{ color: '#bc7155' }}>today.</span>
              </h2>
              <p style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', color: '#d5d3d4', lineHeight: 1.6, fontWeight: 500, maxWidth: 400, marginBottom: 48 }}>Free consultation. No commitment. Our team responds within 24 hours.</p>
              {[['01', 'Office', 'Plot 47, Road 11, Banani, Dhaka 1213'], ['02', 'Hotline', '+880 1700-000000'], ['03', 'Email', 'info@shiningoverseas.com'], ['04', 'Hours', 'Sat–Thu, 9:00 AM – 6:00 PM']].map(([num, label, value]) => (
                <div key={num} style={{ display: 'flex', gap: 16, padding: '28px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#bc7155', fontWeight: 700, flexShrink: 0, paddingTop: 4, width: 48 }}>{num}</div>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
                    <div style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', color: 'white', fontWeight: 700 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ background: 'white', padding: 'clamp(32px, 4vw, 40px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid rgba(0,13,16,0.1)' }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#bc7155', fontWeight: 700, marginBottom: 12 }}>REQUEST FORM</div>
                  <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: '#000d10', letterSpacing: '-0.02em' }}>Start your journey.</h3>
                </div>
                <form onSubmit={handleContactSubmit}>
                  {[['Full Name', 'name', 'text', 'Your name'], ['Phone Number', 'phone', 'tel', '+880 1XXX-XXXXXX']].map(([label, name, type, placeholder]) => (
                    <div key={name} style={{ marginBottom: 24 }}>
                      <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>{label}</label>
                      <input name={name} type={type} placeholder={placeholder} style={{ width: '100%', padding: '12px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 15, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Country of Interest</label>
                    <select name="country" style={{ width: '100%', padding: '12px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 15, color: '#000d10', fontWeight: 500, appearance: 'none' }}>
                      <option value="">Select a country</option>
                      {['Saudi Arabia', 'Malaysia', 'UAE', 'Qatar', 'Kuwait', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 32 }}>
                    <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Message (optional)</label>
                    <textarea name="message" placeholder="Tell us about your goals..." rows={3} style={{ width: '100%', padding: '12px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 15, color: '#000d10', fontWeight: 500, resize: 'none', boxSizing: 'border-box' }} />
                  </div>
                  {formError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', marginBottom: 20 }}>
                      <CircleAlert size={16} color="#dc2626" />
                      <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 500 }}>{formError}</span>
                    </div>
                  )}
                  {formSubmitted && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: 20 }}>
                      <CircleCheck size={16} color="#16a34a" />
                      <span style={{ fontSize: 13, color: '#15803d', fontWeight: 500 }}>Thank You! Our team will contact you soon.</span>
                    </div>
                  )}
                  <button type="submit" disabled={formLoading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 28px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: formLoading ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: formLoading ? 0.7 : 1 }}>
                    {formLoading ? 'Submitting...' : <><span>Submit Request</span><ArrowRight size={16} /></>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'white' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px 96px' }}>
          <div style={{ marginBottom: 80 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 16px', border: '1px solid rgba(0,13,16,0.12)', borderRadius: 9999, marginBottom: 48 }}>
              <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
              <span style={{ fontSize: 11, letterSpacing: '0.25em', fontWeight: 700, color: '#000d10' }}>BAIRA LICENSED · REG. NO. RL-2716</span>
            </div>
            <h2 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, color: '#000d10', lineHeight: 1.0, letterSpacing: '-0.03em', maxWidth: 800 }}>{s.footer_headline}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 48, paddingTop: 64, borderTop: '1px solid rgba(0,13,16,0.12)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 20 }}>
                <Plane size={16} color="#bc7155" />
                <span style={{ fontWeight: 700, color: '#000d10', fontSize: 16 }}>SHINING</span>
                <span style={{ fontWeight: 300, color: '#000d10', letterSpacing: '0.2em', fontSize: 11, marginLeft: 4 }}>OVERSEAS</span>
              </div>
              <p style={{ fontSize: 14, color: '#8e8e95', lineHeight: 1.6, fontWeight: 500, maxWidth: 300 }}>{s.footer_description}</p>
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, marginBottom: 20, textTransform: 'uppercase' }}>Explore</div>
              {[['Active Circulars', '#circulars'], ['Recent Flights', '#flights'], ['Success Stories', '#stories'], ['Student Visa', '/student-visa']].map(([label, href]) => (
                <a key={href} href={href} style={{ display: 'block', padding: '10px 0', fontSize: 13, color: '#8e8e95', textDecoration: 'none', fontWeight: 500 }}>{label}</a>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, marginBottom: 20, textTransform: 'uppercase' }}>Portal</div>
              {[['Staff Login', '/login?role=team'], ['Influencer Login', '/login?role=influencer'], ['Get Consultation', '#contact']].map(([label, href]) => (
                <a key={href} href={href} style={{ display: 'block', padding: '10px 0', fontSize: 13, color: '#8e8e95', textDecoration: 'none', fontWeight: 500 }}>{label}</a>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, marginBottom: 20, textTransform: 'uppercase' }}>Contact</div>
              {['Plot 47, Road 11', 'Banani, Dhaka 1213', '+880 1700-000000', 'info@shiningoverseas.com'].map(line => (
                <div key={line} style={{ padding: '4px 0', fontSize: 13, color: '#8e8e95', fontWeight: 500 }}>{line}</div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, paddingTop: 40, marginTop: 64, borderTop: '1px solid rgba(0,13,16,0.08)' }}>
            <div style={{ fontSize: 12, color: '#8e8e95', fontWeight: 500 }}>© 2024 Shining Overseas. All rights reserved.</div>
            <div style={{ fontSize: 12, color: '#8e8e95', fontWeight: 500 }}>Crafted with care in Dhaka.</div>
          </div>
        </div>
      </footer>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </main>
  );
}
