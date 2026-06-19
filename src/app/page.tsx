'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plane, ArrowRight, ChevronDown, Menu, X, Inbox, CircleAlert, CircleCheck } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SiteSettings { [key: string]: string }
interface Circular { id: string; country: string; flag: string; title: string; salary: string; requirements: string; is_active: boolean }
interface Flight { id: string; group_name: string; role: string; origin: string; destination: string; route: string; flight_date: string }
interface Award { id: string; title: string; issuer: string; year: string; description: string; sort_order: number }
interface Testimonial { id: string; quote: string; name: string; role: string; country: string; image_url: string; is_featured: boolean }

const DEMO_FLIGHTS: Flight[] = [
  { id: 'demo-1', group_name: 'Alpha Group', role: 'Construction Workers', origin: 'DAC', destination: 'RUH', route: 'Dhaka → Riyadh',  flight_date: '02 Jun 2026' },
  { id: 'demo-2', group_name: 'Beta Group', role: 'Housekeeping Staff', origin: 'DAC', destination: 'KUL', route: 'Dhaka → Kuala Lumpur', flight_date: '05 Jun 2026' },
  { id: 'demo-3', group_name: 'Gamma Group', role: 'Factory Workers', origin: 'DAC', destination: 'DXB', route: 'Dhaka → Dubai', flight_date: '08 Jun 2026' },
  { id: 'demo-4', group_name: 'Delta Group', role: 'Drivers', origin: 'DAC', destination: 'DOH', route: 'Dhaka → Doha', flight_date: '12 Jun 2026' },
  { id: 'demo-5', group_name: 'Epsilon Group', role: 'Security Personnel', origin: 'DAC', destination: 'KWI', route: 'Dhaka → Kuwait City',  flight_date: '15 Jun 2026' },
  { id: 'demo-6', group_name: 'Zeta Group', role: 'Sales Staff', origin: 'DAC', destination: 'MLE', route: 'Dhaka → Male', flight_date: '19 Jun 2026' },
];

const DEFAULT_SETTINGS: SiteSettings = {
  hero_badge: 'BAIRA LICENSED · REG. NO. RL-2716', hero_heading: 'YOUR TRUSTED WAY TO ', hero_heading_accent: 'GLOBAL OPPORTUNITY',
  hero_paragraph: 'BAIRA-licensed overseas recruitment for Bangladeshi workers. Saudi Arabia, Malaysia, UAE, Qatar, Kuwait — handled end to end with verified employers, sharp execution, and full compliance.',
  hero_cta_primary: 'Get Free Consultation', hero_cta_secondary: 'View Active Circulars',
  stat_1_value: '12,000+', stat_1_label: 'Workers Placed', stat_2_value: '15+', stat_2_label: 'Years of Trust',
  stat_3_value: '8', stat_3_label: 'Countries Served', stat_4_value: '98%', stat_4_label: 'Visa Success Rate',
  slide_1_label: 'OUR MISSION', slide_1_title: 'Empowering dreams through global opportunities', slide_1_subtitle: 'Trusted recruitment for skilled workers across the Gulf, Southeast Asia, and beyond.',
  slide_2_label: 'PROVEN TRACK RECORD', slide_2_title: 'Over 12,000 workers placed since 2009', slide_2_subtitle: 'BAIRA-licensed and globally connected with verified employers.',
  slide_3_label: 'END-TO-END SUPPORT', slide_3_title: 'Visa, training, and deployment under one roof', slide_3_subtitle: 'From medical tests to airport handover — we handle every step.',
  slide_4_label: 'COUNTRY COVERAGE', slide_4_title: 'Saudi Arabia, Malaysia, UAE, Qatar, Kuwait', slide_4_subtitle: 'Direct demand letters from licensed Gulf and ASEAN employers.',
  about_heading: 'Built on trust,', about_heading_accent: 'since 2009',
  about_body_1: "Shining Overseas was founded in Dhaka with one mission: to give Bangladeshi workers a fair, transparent, and licensed path to overseas employment. Over fifteen years, we've grown from a small office to a BAIRA-licensed agency with verified employer partners across the Gulf and Southeast Asia.",
  about_body_2: "Every worker we place is supported through medical, training, visa processing, and post-deployment care. We don't take shortcuts — and we don't charge what we don't deliver.",
  footer_headline: 'Your trusted gateway to global opportunity',
  footer_description: 'BAIRA-licensed overseas recruitment agency placing skilled Bangladeshi workers across the Gulf and Southeast Asia since 2009.',
  contact_label: 'GET CONSULTATION',
  contact_heading_1: 'Talk to a',
  contact_heading_2: 'licensed advisor',
  contact_heading_3_acc: 'today',
  contact_paragraph: 'Free consultation. No commitment. Our team responds within 24 hours.',
  contact_office: 'Plot 47, Road 11, Banani, Dhaka 1213',
  contact_hotline: '+880 1700-000000',
  contact_email: 'info@shiningoverseas.com',
  contact_hours: 'Sat–Thu, 9:00 AM – 6:00 PM',
  contact_visit_heading: 'Schedule a visit.',
  contact_visit_desc: "Enter your phone and pick a date — we'll register you as a hot lead instantly.",
  contact_form_label: 'REQUEST FORM',
  contact_form_title: 'Start your journey.',
};

export default function HomePage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [flightIndex, setFlightIndex] = useState(0);
  const [awardIndex, setAwardIndex] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [portalOpen, setPortalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [otherCountry, setOtherCountry] = useState('');
  const [showOtherCountry, setShowOtherCountry] = useState(false);
  const [visitOfficePhone, setVisitOfficePhone] = useState('');
  const [visitOfficeSubmitted, setVisitOfficeSubmitted] = useState(false);
  const [visitOfficeError, setVisitOfficeError] = useState('');
  const [visitOfficeLoading, setVisitOfficeLoading] = useState(false);
  const [selectedVisitDate, setSelectedVisitDate] = useState('');

  const getNext10Days = () => {
    const days: { label: string; iso: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const day = d.getDate();
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      days.push({ label: `${weekday} ${day} ${month}`, iso: d.toISOString().split('T')[0] });
    }
    return days;
  };

  useEffect(() => {
    fetch('/api/site-settings').then(r => r.json()).then(setSettings).catch(() => {});
    fetch('/api/circulars?active=true').then(r => r.json()).then(setCirculars).catch(() => {});
    fetch('/api/flights').then(r => r.json()).then(setFlights).catch(() => {});
    fetch('/api/awards').then(r => r.json()).then(setAwards).catch(() => {});
    fetch('/api/testimonials').then(r => r.json()).then(setTestimonials).catch(() => {});
    const iv = setInterval(() => setSlideIndex(i => (i + 1) % 4), 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const len = flights.length > 0 ? flights.length : 6;
    const fiv = setInterval(() => setFlightIndex(i => (i + 1) % len), 1000);
    return () => clearInterval(fiv);
  }, [flights.length]);

  const s = settings;
  const displayFlights = flights.length > 0 ? flights : DEMO_FLIGHTS;
  const slides = [
    { label: s.slide_1_label, title: s.slide_1_title, subtitle: s.slide_1_subtitle },
    { label: s.slide_2_label, title: s.slide_2_title, subtitle: s.slide_2_subtitle },
    { label: s.slide_3_label, title: s.slide_3_title, subtitle: s.slide_3_subtitle },
    { label: s.slide_4_label, title: s.slide_4_title, subtitle: s.slide_4_subtitle },
  ];
  const currentSlide = slides[slideIndex] || slides[0];

  const countries = ['All', ...Array.from(new Set(circulars.map(c => c.country)))];
  const filteredCirculars = selectedCountry === 'All' ? circulars : circulars.filter(c => c.country === selectedCountry);

  const handleVisitOfficeSubmit = async (date: string) => {
    const phone = visitOfficePhone.trim();
    if (!phone) { setVisitOfficeError('Please enter your phone number.'); return; }
    setVisitOfficeLoading(true); setVisitOfficeError('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit', full_name: 'Office Visit', phone_number: phone,
          country: '', source: 'homepage', owner_user: null,
          has_visit_date: true, visit_date: date, message: 'Hot lead - scheduled office visit',
        }),
      });
      const data = await res.json();
      if (data.ok) { setVisitOfficeSubmitted(true); setSelectedVisitDate(date); setVisitOfficePhone(''); }
      else setVisitOfficeError(data.msg || 'Could not submit.');
    } catch { setVisitOfficeError('Network error.'); }
    setVisitOfficeLoading(false);
  };

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
        body: JSON.stringify({ action: 'submit', full_name: name, phone_number: phone, country: showOtherCountry ? otherCountry : (fd.get('country') as string || ''), source: 'homepage', owner_user: null, has_visit_date: false, visit_date: '', message: fd.get('message') || '' }),
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
          <div className="header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1280, margin: '0 auto', padding: '20px 24px' }}>
            <a href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <Plane size={16} color="#bc7155" />
                <span style={{ fontWeight: 700, color: '#000d10', fontSize: 16, letterSpacing: '-0.02em' }}>SHINING</span>
                <span style={{ fontWeight: 300, color: '#000d10', letterSpacing: '0.2em', fontSize: 11, marginLeft: 4 }}>OVERSEAS</span>
              </div>
              <span style={{ fontSize: 9, color: '#8e8e95', letterSpacing: '0.15em', marginTop: 2, textTransform: 'uppercase', fontWeight: 500 }}>BAIRA Lic. RL-2716</span>
            </a>
            {/* Desktop nav */}
            <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
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
            </nav>              <button onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#000d10', alignItems: 'center', justifyContent: 'center', padding: 4 }} className="mobile-menu-btn">
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
      <section className="section-hero" style={{ background: 'white' }}>
        <div className="section-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 16px', border: '1px solid rgba(0,13,16,0.12)', borderRadius: 9999, marginBottom: 40 }}>
            <span style={{ color: '#bc7155', marginRight: 8, fontSize: 12 }}>●</span>
            <span style={{ fontSize: 11, letterSpacing: '0.25em', fontWeight: 700, color: '#000d10', textTransform: 'uppercase' }}>{s.hero_badge}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 700, color: '#000d10', lineHeight: 1.0, letterSpacing: '-0.03em', maxWidth: 900, margin: '0 0 40px' }}>
            {s.hero_heading}<span style={{ color: '#bc7155' }}>{s.hero_heading_accent}</span>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#8e8e95', maxWidth: 640, lineHeight: 1.6, fontWeight: 500, marginBottom: 48 }}>{s.hero_paragraph}</p>
          <div className="hero-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 80 }}>
            <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 32px', background: '#000d10', color: 'white', borderRadius: 9999, fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {s.hero_cta_primary} <ArrowRight size={16} />
            </a>
            <a href="#circulars" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 32px', border: '1px solid rgba(0,13,16,0.15)', color: '#000d10', borderRadius: 9999, fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {s.hero_cta_secondary}
            </a>
          </div>
          <div className="hero-stats" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: '24px 0', paddingTop: 48, borderTop: '1px solid rgba(0,13,16,0.08)' }}>
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
      <section className="section-slider" style={{ background: '#0f0f1c' }}>
        <div className="section-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
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
      <section className="section-about" style={{ background: 'white' }}>
        <div className="section-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
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
      <section id="circulars" className="section-circulars" style={{ background: 'white' }}>
        <div className="section-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 64, gap: 40 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 32 }}>
                <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
                <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700 }}>ACTIVE CIRCULARS</span>
              </div>
              <h2 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, color: '#000d10', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 32 }}>
                Open positions,<br /><span style={{ color: '#bc7155', fontWeight: 700 }}>HIRING NOW</span>
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
      <section id="awards" className="section-awards" style={{ background: '#0f0f1c' }}>
        <div className="section-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 40 }}>
              <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
              <span style={{ fontSize: 11, letterSpacing: '0.25em', color: 'white', fontWeight: 700 }}>RECOGNITION</span>
            </div>
            <h2 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, color: 'white', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 32 }}>Awards &<br />accreditations</h2>
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
      <section id="flights" className="section-flights" style={{ background: '#0f0f1c' }}>
        <div className="section-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 32 }}>
              <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
              <span style={{ fontSize: 11, letterSpacing: '0.25em', color: 'white', fontWeight: 700 }}>RECENT FLIGHTS</span>
            </div>
            <h2 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, color: 'white', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 32 }}>Workers we&apos;ve<br />deployed this month</h2>
            <p style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', color: '#d5d3d4', lineHeight: 1.6, fontWeight: 500, maxWidth: 480 }}>Real groups. Real flights. Real people building their futures.</p>
          </div>
          {/* Carousel: mobile = 1 card, desktop = 3 cards */}
          <div className="flight-carousel-wrap" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="flight-carousel-track" style={{
              display: 'flex', gap: 1,
              transition: 'transform 0.4s ease',
              transform: `translateX(-${(flightIndex % displayFlights.length) / displayFlights.length * 100}%)`,
            }}>
              {displayFlights.map((f, i) => (
                <div key={f.id} className="flight-card" style={{ flexShrink: 0, width: '100%', padding: '0 max(8px, calc((100% - 400px) / 2))', boxSizing: 'border-box' }}>
                  <div style={{ padding: 36, background: '#151623', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#bc7155', fontWeight: 700 }}>0{i + 1}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ height: 6, width: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                        <span style={{ fontSize: 10, letterSpacing: '0.25em', color: '#34d399', fontWeight: 700 }}>DEPLOYED</span>
                      </div>
                    </div>
                    <div className="flight-route-row" style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                      <span className="flight-origin" style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: 'white', letterSpacing: '-0.03em' }}>{f.origin}</span>
                      <div className="flight-route-line" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, padding: '0 16px' }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.2)' }} />
                        <Plane size={16} color="#bc7155" />
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.2)' }} />
                      </div>
                      <span className="flight-destination" style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: 'white', letterSpacing: '-0.03em' }}>{f.destination}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#d5d3d4', fontWeight: 500, letterSpacing: '0.03em', marginBottom: 32 }}>{f.route}</div>
                    <div style={{ fontSize: 11, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 32 }}>{f.flight_date}</div>
                    <div style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ fontSize: 12, color: '#bc7155', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>{f.group_name}</div>
                      <div style={{ fontSize: 16, color: 'white', fontWeight: 700, letterSpacing: '-0.01em' }}>{f.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Navigation dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
            {displayFlights.map((_, i) => (
              <button key={i} onClick={() => setFlightIndex(i)} style={{ height: 1, width: (flightIndex % displayFlights.length) === i ? 48 : 24, background: (flightIndex % displayFlights.length) === i ? '#bc7155' : 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer', transition: 'all 0.5s' }} />
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="stories" className="section-testimonials" style={{ background: 'white' }}>
        <div className="section-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 32 }}>
              <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
              <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700 }}>SUCCESS STORIES</span>
            </div>
            <h2 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, color: '#000d10', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 32 }}>Voices from<br /><span style={{ color: '#bc7155' }}>the field</span></h2>
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
      <section id="contact" className="section-contact" style={{ background: '#0f0f1c' }}>
        <div className="section-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 64 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 40 }}>
                <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
                <span style={{ fontSize: 11, letterSpacing: '0.25em', color: 'white', fontWeight: 700 }}>{s.contact_label}</span>
              </div>
              <h2 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, color: 'white', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 32 }}>
                {s.contact_heading_1}<br />{s.contact_heading_2}<br /><span style={{ color: '#bc7155' }}>{s.contact_heading_3_acc}</span>
              </h2>
              <p style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', color: '#d5d3d4', lineHeight: 1.6, fontWeight: 500, maxWidth: 400, marginBottom: 48 }}>{s.contact_paragraph}</p>
              {[['01', 'Office', s.contact_office], ['02', 'Hotline', s.contact_hotline], ['03', 'Email', s.contact_email], ['04', 'Hours', s.contact_hours]].map(([num, label, value]) => (
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
              {/* VISIT OFFICE QUICK-SCHEDULE */}
              <div style={{ background: '#151623', padding: 'clamp(28px, 3vw, 36px)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 32 }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#bc7155', fontWeight: 700, marginBottom: 12 }}>VISIT OFFICE</div>
                  <h3 style={{ fontSize: 'clamp(20px,2.5vw,26px)', fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>{s.contact_visit_heading}</h3>
                  <p style={{ fontSize: 14, color: '#d5d3d4', fontWeight: 500, marginTop: 8, lineHeight: 1.5 }}>{s.contact_visit_desc}</p>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Your Phone Number</label>
                  <input type="tel" value={visitOfficePhone} onChange={e => { setVisitOfficePhone(e.target.value); setVisitOfficeError(''); setVisitOfficeSubmitted(false); }} placeholder="+880 1XXX-XXXXXX" style={{ width: '100%', padding: '12px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', background: 'transparent', fontSize: 15, color: 'white', fontWeight: 500, boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Pick Your Date</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {getNext10Days().map(day => {
                      const isSelected = selectedVisitDate === day.iso;
                      return (
                        <button key={day.iso} onClick={() => handleVisitOfficeSubmit(day.iso)}
                          disabled={visitOfficeLoading || visitOfficeSubmitted}
                          style={{
                            padding: '10px 14px', border: `1px solid ${isSelected ? '#bc7155' : 'rgba(255,255,255,0.2)'}`,
                            background: isSelected ? 'rgba(188,113,85,0.15)' : 'transparent',
                            borderRadius: 8, cursor: visitOfficeLoading || visitOfficeSubmitted ? 'default' : 'pointer',
                            fontSize: 12, fontWeight: 600, color: 'white', textAlign: 'center', minWidth: 72,
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { if (!visitOfficeSubmitted && !isSelected) { e.currentTarget.style.borderColor = '#bc7155'; e.currentTarget.style.background = 'rgba(188,113,85,0.08)'; } }}
                          onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'transparent'; } }}
                        >{day.label}</button>
                      );
                    })}
                  </div>
                </div>
                {visitOfficeError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'rgba(254,242,242,0.1)', border: '1px solid rgba(254,202,202,0.3)', marginBottom: 16 }}>
                    <CircleAlert size={16} color="#fca5a5" />
                    <span style={{ fontSize: 13, color: '#fca5a5', fontWeight: 500 }}>{visitOfficeError}</span>
                  </div>
                )}
                {visitOfficeSubmitted && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'rgba(240,253,244,0.1)', border: '1px solid rgba(187,247,208,0.3)' }}>
                    <CircleCheck size={16} color="#86efac" />
                    <span style={{ fontSize: 13, color: '#86efac', fontWeight: 500 }}>Visit scheduled! We&apos;ll confirm shortly.</span>
                  </div>
                )}
              </div>
              <div style={{ background: 'white', padding: 'clamp(32px, 4vw, 40px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid rgba(0,13,16,0.1)' }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#bc7155', fontWeight: 700, marginBottom: 12 }}>{s.contact_form_label}</div>
                  <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700, color: '#000d10', letterSpacing: '-0.02em' }}>{s.contact_form_title}</h3>
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
                    <select name="country" onChange={e => setShowOtherCountry(e.target.value === 'Other')} style={{ width: '100%', padding: '12px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 15, color: '#000d10', fontWeight: 500, appearance: 'none' }}>
                      <option value="">Select a country</option>
                      {['Saudi Arabia', 'Malaysia', 'UAE', 'Qatar', 'Kuwait', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {showOtherCountry && (
                      <input name="other_country" type="text" placeholder="Type your country..." value={otherCountry} onChange={e => setOtherCountry(e.target.value)} style={{ width: '100%', padding: '12px 0', marginTop: 12, borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 15, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
                    )}
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
      <footer className="footer-section" style={{ background: 'white' }}>
        <div className="section-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px 96px' }}>
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
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}

/* ─── Mobile Responsiveness ──────────────────────────────────────────── */
@media (max-width: 767px) {
  /* Show mobile menu button, hide desktop nav items */
  .mobile-menu-btn { display: flex !important; }
  .desktop-nav > a:not(.mobile-keep),
  .desktop-nav > div { display: none !important; }
  .desktop-nav > a:last-child { display: none !important; }

  /* Center all section text on mobile */
  .section-hero, .section-slider, .section-about,
  .section-circulars, .section-awards, .section-flights,
  .section-testimonials, .section-contact, .footer-section {
    text-align: center;
  }

  /* Center headings */
  .section-hero h1,
  .section-hero p,
  .section-about h2,
  .section-about p,
  .section-circulars h2,
  .section-circulars p,
  .section-awards h2,
  .section-awards p,
  .section-flights h2,
  .section-flights p,
  .section-testimonials h2,
  .section-testimonials p,
  .section-contact h2,
  .section-contact p,
  .footer-section h2,
  .footer-section p {
    margin-left: auto !important;
    margin-right: auto !important;
    text-align: center;
  }

  /* Center hero badge */
  .section-hero > div > div:first-child {
    margin-left: auto !important;
    margin-right: auto !important;
  }

  /* Center hero buttons */
  .section-hero > div > div:nth-child(4) {
    justify-content: center;
  }

  /* Stats: center, remove borders, half width */
  .section-hero .hero-stats {
    justify-content: center !important;
  }
  .section-hero .hero-stats > div {
    border-right: none !important;
    padding: 8px 12px !important;
    text-align: center;
    width: 50%;
  }

  /* Section heading badge centering */
  .section-slider > div > div:first-child > div:first-child,
  .section-about > div > div:first-child > div:first-child,
  .section-circulars > div > div:first-child > div:first-child > div:first-child,
  .section-awards > div > div:first-child > div:first-child,
  .section-flights > div > div:first-child > div:first-child,
  .section-testimonials > div > div:first-child > div:first-child,
  .section-contact > div > div:first-child > div:first-child,
  .footer-section > div > div:first-child {
    margin-left: auto !important;
    margin-right: auto !important;
  }

  /* Contact section first column centering */
  .section-contact > div > div:first-child {
    text-align: center;
  }
  .section-contact > div > div:first-child p {
    margin-left: auto !important;
    margin-right: auto !important;
  }

  /* Contact info rows centering (Office, Hotline, Email, Hours) */
  .section-contact .section-inner > div:first-child > div:first-child > h2 + p ~ div {
    justify-content: center !important;
    text-align: center;
  }
  .section-contact .section-inner > div:first-child > div:first-child > h2 + p ~ div > div:last-child {
    text-align: left;
  }

  /* Reduce section padding on mobile */
  .section-inner {
    padding: 64px 20px 80px !important;
  }

  /* Footer centering */
  .footer-section h2 {
    margin-left: auto !important;
    margin-right: auto !important;
  }

  /* Mobile menu items styling */
  header .header-inner {
    padding: 16px 20px !important;
  }

  /* Flights carousel: full-width card on mobile */
  .flight-carousel-track {
    width: 100%;
  }
  .flight-card {
    width: 100% !important;
    padding: 0 !important;
  }

  /* Flight route: vertical stack on mobile */
  .flight-route-row {
    flex-direction: column !important;
    gap: 8px !important;
    margin-bottom: 24px !important;
  }
  .flight-route-line {
    width: 100% !important;
    padding: 0 !important;
    flex: none !important;
  }
  .flight-route-line > div {
    flex: 1 !important;
  }
  .flight-card > div {
    padding: 28px !important;
  }
  .flight-card > div > div:first-child {
    margin-bottom: 28px !important;
    padding-bottom: 16px !important;
  }
}

/* Desktop: show 3 cards in a row for flights */
@media (min-width: 768px) {
  .flight-carousel-wrap {
    overflow: visible !important;
  }
  .flight-carousel-track {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 1px !important;
    transform: none !important;
    transition: none !important;
  }
  .flight-card {
    width: auto !important;
    padding: 0 !important;
  }
}

/* Tablet adjustments */
@media (min-width: 768px) and (max-width: 1023px) {
  .section-inner {
    padding-left: 32px !important;
    padding-right: 32px !important;
  }
}`}</style>
    </main>
  );
}
