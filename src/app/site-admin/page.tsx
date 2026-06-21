'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Plus, X, Check, LoaderCircle, Pencil, Trash2, ToggleLeft, ToggleRight, ArrowRight, LogOut, Copy, CheckCheck, RefreshCw, Search } from 'lucide-react';

interface User { id: string; email: string; role: string; full_name: string; phone_number: string; referral_code: string; status: string; tier: string; facebook_page: string }

const TABS = [
  ['circulars', 'Circulars'],
  ['flights', 'Flights'],
  ['awards', 'Awards'],
  ['testimonials', 'Testimonials'],
  ['accounts', 'Accounts'],
  ['digital_id', 'Digital ID'],
  ['site_settings', 'Site Settings'],
];

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: 'white', width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', padding: 40 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid rgba(0,13,16,0.1)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#000d10' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8e95' }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', placeholder = '' }: { label: string; name: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>{label}</label>
      {type === 'textarea' ? (
        <textarea name={name} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
          style={{ width: '100%', padding: '10px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 14, color: '#000d10', fontWeight: 500, resize: 'vertical', boxSizing: 'border-box' }} />
      ) : (
        <input type={type} name={name} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width: '100%', padding: '10px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 14, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
      )}
    </div>
  );
}

export default function SiteAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('circulars');
  const [circulars, setCirculars] = useState<Record<string, unknown>[]>([]);
  const [flights, setFlights] = useState<Record<string, unknown>[]>([]);
  const [awards, setAwards] = useState<Record<string, unknown>[]>([]);
  const [testimonials, setTestimonials] = useState<Record<string, unknown>[]>([]);
  const [accounts, setAccounts] = useState<Record<string, unknown>[]>([]);
  const [digitalIds, setDigitalIds] = useState<Record<string, unknown>[]>([]);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [leads, setLeads] = useState<Record<string, unknown>[]>([]);
  const [teamOptions, setTeamOptions] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ type: string; data?: Record<string, unknown> } | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [formMsg, setFormMsg] = useState('');
  const [copied, setCopied] = useState('');
  const [settingsSaveMsg, setSettingsSaveMsg] = useState('');
  const [showChangePw, setShowChangePw] = useState(false);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [leadDateFilter, setLeadDateFilter] = useState('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [leadSortOrder, setLeadSortOrder] = useState('newest');
  const [leadPage, setLeadPage] = useState(0);
  const [leadPageSize, setLeadPageSize] = useState(20);
  const [circularsPage, setCircularsPage] = useState(0);
  const [flightsPage, setFlightsPage] = useState(0);
  const [awardsPage, setAwardsPage] = useState(0);
  const [testimonialsPage, setTestimonialsPage] = useState(0);
  const [digitalIdsPage, setDigitalIdsPage] = useState(0);
  const [siteSettingsPage, setSiteSettingsPage] = useState(0);
  const [accountPage, setAccountPage] = useState(0);
  const [adminPageSize, setAdminPageSize] = useState(20);
  const [pendingResetReqs, setPendingResetReqs] = useState<{ email: string; created_at: string }[]>([]);
  const [resetReqMsg, setResetReqMsg] = useState('');
  const [resetReqLoading, setResetReqLoading] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('so_user');
    if (!stored) { router.replace('/login'); return; }
    try {
      const u = JSON.parse(stored);
      if (u.role !== 'ADMIN') { router.replace('/portal'); return; }
      setUser(u);
    } catch { router.replace('/login'); }
  }, [router]);

  const loadTab = useCallback(async (tab: string) => {
    setLoading(true);
    try {
      if (tab === 'circulars') { const d = await fetch('/api/circulars').then(r => r.json()); setCirculars(Array.isArray(d) ? d : []); }
      if (tab === 'flights') { const d = await fetch('/api/flights').then(r => r.json()); setFlights(Array.isArray(d) ? d : []); }
      if (tab === 'awards') { const d = await fetch('/api/awards').then(r => r.json()); setAwards(Array.isArray(d) ? d : []); }
      if (tab === 'testimonials') { const d = await fetch('/api/testimonials').then(r => r.json()); setTestimonials(Array.isArray(d) ? d : []); }        if (tab === 'accounts') {
        const [accs, teams, leds, resetReqs] = await Promise.all([
          fetch('/api/accounts').then(r => r.json()),
          fetch('/api/accounts?teamOptions=true').then(r => r.json()),
          fetch('/api/leads').then(r => r.json()),
          fetch('/api/auth/pending-reset-requests', { headers: user ? { 'x-user-id': user.id } : {} }).then(r => r.json()),
        ]);
        setAccounts(Array.isArray(accs) ? accs : []);
        setTeamOptions(Array.isArray(teams) ? teams : []);
        setLeads(Array.isArray(leds) ? leds : []);
        setPendingResetReqs(Array.isArray(resetReqs) ? resetReqs : []);
      }
      if (tab === 'digital_id') { const d = await fetch('/api/digital-id').then(r => r.json()); setDigitalIds(Array.isArray(d) ? d : []); }
      if (tab === 'site_settings') { const d = await fetch('/api/site-settings').then(r => r.json()); setSiteSettings(d || {}); }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { if (user) loadTab(activeTab); }, [user, activeTab, loadTab]);

  const handleLogout = () => { localStorage.removeItem('so_user'); router.replace('/'); };
  const handleCopy = (text: string, key: string) => { navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(''), 2000); }); };

  const openModal = (type: string, data?: Record<string, unknown>) => {
    setForm(data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v ?? '')])) : {});
    setFormMsg(''); setModal({ type, data });
  };

  const closeModal = () => { setModal(null); setFormMsg(''); };

  const handleFormSubmit = async () => {
    if (!modal) return;
    setFormMsg('Saving...');
    let url = '', body: Record<string, unknown> = {};
    const { type } = modal;
    const id = (modal.data as Record<string, unknown>)?.id as string || '';

    if (type === 'circular') {
      url = '/api/circulars'; body = { id, country: form.country, flag: form.flag, title: form.title, salary: form.salary, requirements: form.requirements, is_active: form.is_active === 'true' || form.is_active === 'on' };
    } else if (type === 'flight') {
      url = '/api/flights'; body = { id, group_name: form.group_name, role: form.role, origin: form.origin, destination: form.destination, route: form.route, flight_date: form.flight_date };
    } else if (type === 'award') {
      url = '/api/awards'; body = { id, title: form.title, issuer: form.issuer, year: form.year, description: form.description, image_url: form.image_url || '', sort_order: form.sort_order || '0' };
    } else if (type === 'testimonial') {
      url = '/api/testimonials'; body = { id, quote: form.quote, name: form.name, role: form.role, country: form.country, image_url: form.image_url || '', is_featured: form.is_featured === 'true' };
    } else if (type === 'account') {
      if (!form.temp_password || form.temp_password.length < 8) { setFormMsg('Temporary password is required (min 8 characters).'); return; }
      url = '/api/accounts'; body = { email: form.email, full_name: form.full_name, role: form.role || 'TEAM_MEMBER', temp_password: form.temp_password, assigned_to: form.assigned_to || '' };
    } else if (type === 'transfer_lead') {
      url = '/api/leads'; body = { action: 'transfer', lead_id: form.lead_id, new_owner_id: form.new_owner_id, new_owner_name: teamOptions.find((t: Record<string, unknown>) => t.id === form.new_owner_id)?.full_name || '' };
    }

    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(user ? { 'x-user-id': user.id } : {}) }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.ok || data.temp_password) {
        let msg = 'Saved!';
        if (data.temp_password) msg = `Account created! Temp password: ${data.temp_password}`;
        setFormMsg(msg);
        await loadTab(activeTab);
        setTimeout(() => closeModal(), data.temp_password ? 5000 : 1500);
      } else setFormMsg(data.msg || 'Error saving.');
    } catch { setFormMsg('Network error.'); }
  };

  const handleDelete = async (tab: string, id: string, extra?: Record<string, unknown>) => {
    if (!confirm('Are you sure?')) return;
    try {
      if (tab === 'circulars') await fetch('/api/circulars', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      else if (tab === 'flights') await fetch('/api/flights', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      else if (tab === 'awards') await fetch('/api/awards', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      else if (tab === 'testimonials') await fetch('/api/testimonials', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      else if (tab === 'accounts') {
        const res = await fetch('/api/accounts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
        const data = await res.json();
        if (!data.ok) { alert(data.msg || 'Failed to delete account.'); return; }
      }
      await loadTab(activeTab);
    } catch {}
  };

  const handleToggle = async (tab: string, id: string, field: string, current: unknown) => {
    try {
      if (tab === 'circulars') await fetch('/api/circulars', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, toggleActive: true, value: !current }) });
      else if (tab === 'testimonials') await fetch('/api/testimonials', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, toggleFeatured: true, value: !current }) });
      else if (tab === 'digital_id') await fetch('/api/digital-id', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggle_active', id, value: !current }) });
      else if (tab === 'accounts') await fetch('/api/accounts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, toggleActive: true, value: !!current }) });
      await loadTab(activeTab);
    } catch {}
  };

  const handleResetPassword = async (id: string) => {
    try {
      const res = await fetch('/api/accounts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, resetPassword: true }) });
      const data = await res.json();
      if (data.ok) alert(`Password reset! Temp password: ${data.temp_password}`);
    } catch {}
  };

  const handleSaveSettings = async () => {
    setSettingsSaveMsg('Saving...');
    try {
      const res = await fetch('/api/site-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(siteSettings) });
      const data = await res.json();
      setSettingsSaveMsg(data.ok ? 'Saved!' : 'Error saving.'); setTimeout(() => setSettingsSaveMsg(''), 2000);
    } catch { setSettingsSaveMsg('Error.'); }
  };

  const handleApproveResetRequest = async (email: string) => {
    if (!user) return;
    setResetReqLoading(email);
    setResetReqMsg('');
    try {
      const res = await fetch('/api/auth/approve-reset-request', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setResetReqMsg(`✓ Password reset for ${email}. Temp password: ${data.temp_password}`);
        // Remove from pending list
        setPendingResetReqs(prev => prev.filter(r => r.email !== email));
        setTimeout(() => setResetReqMsg(''), 8000);
      } else {
        setResetReqMsg(`Error: ${data.msg || 'Failed to reset.'}`);
      }
    } catch {
      setResetReqMsg('Network error.');
    }
    setResetReqLoading(null);
  };

  const handleChangePassword = async () => {
    if (!user) return;
    if (!pwCurrent || !pwNew || !pwConfirm) { setPwMsg('All fields are required.'); return; }
    if (pwNew.length < 8) { setPwMsg('New password must be at least 8 characters.'); return; }
    if (pwNew !== pwConfirm) { setPwMsg('New passwords do not match.'); return; }
    setPwLoading(true); setPwMsg('');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, currentPassword: pwCurrent, newPassword: pwNew }),
      });
      const data = await res.json();
      if (data.ok) {
        setPwMsg('✓ Password changed successfully!');
        setPwCurrent(''); setPwNew(''); setPwConfirm('');
        setTimeout(() => { setPwMsg(''); setShowChangePw(false); }, 3000);
      } else {
        setPwMsg(data.error || 'Failed to change password.');
      }
    } catch { setPwMsg('Network error. Please try again.'); }
    setPwLoading(false);
  };

  const isWithinDays = (created: string, days: number) => {
    if (!created) return false;
    const diff = Date.now() - new Date(created).getTime();
    return diff < days * 24 * 60 * 60 * 1000;
  };

  const leadUniqueStatuses = useMemo(() => {
    const set = new Set(leads.map(l => (l.status as string)).filter(Boolean));
    return Array.from(set).sort();
  }, [leads]);

  const filteredLeads = useMemo(() => {
    let result = [...leads];
    if (leadDateFilter === '7d') result = result.filter(l => isWithinDays(l.created as string, 7));
    else if (leadDateFilter === '30d') result = result.filter(l => isWithinDays(l.created as string, 30));
    else if (leadDateFilter === '90d') result = result.filter(l => isWithinDays(l.created as string, 90));
    if (leadStatusFilter !== 'all') result = result.filter(l => (l.status as string) === leadStatusFilter);
    if (leadSearchQuery.trim()) {
      const q = leadSearchQuery.trim().toLowerCase();
      result = result.filter(l => ((l.name as string) || '').toLowerCase().includes(q) || ((l.phone as string) || '').includes(q));
    }
    result.sort((a, b) => {
      const da = a.created ? new Date(a.created as string).getTime() : 0;
      const db = b.created ? new Date(b.created as string).getTime() : 0;
      return leadSortOrder === 'newest' ? db - da : da - db;
    });
    return result;
  }, [leads, leadDateFilter, leadStatusFilter, leadSearchQuery, leadSortOrder]);

  const leadTotalPages = Math.max(1, Math.ceil(filteredLeads.length / leadPageSize));
  const leadSafePage = Math.min(leadPage, leadTotalPages - 1);
  const paginatedLeads = filteredLeads.slice(leadSafePage * leadPageSize, (leadSafePage + 1) * leadPageSize);

  // Reset page when filters change
  useEffect(() => { setLeadPage(0); }, [leadDateFilter, leadStatusFilter, leadSearchQuery]);

  const formatLeadDate = (created: string) => {
    if (!created) return '—';
    const d = new Date(created);
    const day = d.getDate();
    const suffix = day >= 11 && day <= 13 ? 'th' : ['st','nd','rd'][(day - 1) % 10] || 'th';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${day}${suffix} ${months[d.getMonth()]}`;
  };

  const downloadCSV = () => {
    const headers = ['Name','Phone','Country','Owner','Status','Lead Type','Source','Source Label','Transfer Label','Created','Influencer ID'];
    const rows = filteredLeads.map(l => [
      `"${((l.name as string) || '').replace(/"/g, '""')}"`,
      `"${((l.phone as string) || '').replace(/"/g, '""')}"`,
      `"${((l.country as string) || '').replace(/"/g, '""')}"`,
      `"${((l.owner as string) || '').replace(/"/g, '""')}"`,
      `"${((l.status as string) || '').replace(/"/g, '""')}"`,
      (l.is_hot as boolean) ? 'HOT' : 'COLD',
      `"${((l.source as string) || '').replace(/"/g, '""')}"`,
      `"${((l.sourceLabel as string) || '').replace(/"/g, '""')}"`,
      `"${((l.transferLabel as string) || '').replace(/"/g, '""')}"`,
      l.created ? formatLeadDate(l.created as string) : '—',
      `"${((l.influencer_id as string) || '').replace(/"/g, '""')}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `all-leads-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleConvertLead = async (leadId: string) => {
    try { await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'convert', lead_id: leadId }) }); await loadTab(activeTab); } catch {}
  };

  const ActionBtn = ({ onClick, icon: Icon, label, variant = 'default' }: { onClick: () => void; icon: React.ElementType; label: string; variant?: string }) => (
    <button onClick={onClick} title={label} style={{ padding: '6px 10px', background: variant === 'danger' ? '#fef2f2' : 'transparent', border: `1px solid ${variant === 'danger' ? '#fecaca' : 'rgba(0,13,16,0.1)'}`, borderRadius: 6, cursor: 'pointer', color: variant === 'danger' ? '#dc2626' : '#000d10', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}>
      <Icon size={12} />{label}
    </button>
  );

  const tableHeader = (cols: string[]) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap: 12, padding: '12px 24px', background: '#f8f8f9', borderBottom: '1px solid rgba(0,13,16,0.08)' }}>
      {cols.map(c => <div key={c} style={{ fontSize: 10, letterSpacing: '0.2em', fontWeight: 700, color: '#8e8e95', textTransform: 'uppercase' }}>{c}</div>)}
    </div>
  );

  if (!user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoaderCircle size={32} color="#bc7155" style={{ animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#f8f8f9', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid rgba(0,13,16,0.08)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1280, margin: '0 auto', padding: '16px 24px' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <Plane size={16} color="#bc7155" />
            <span style={{ fontWeight: 700, color: '#000d10', fontSize: 16 }}>SHINING</span>
            <span style={{ fontWeight: 300, color: '#000d10', letterSpacing: '0.2em', fontSize: 11, marginLeft: 4 }}>OVERSEAS</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#000d10' }}>{user.full_name}</div>
              <div style={{ fontSize: 11, color: '#8e8e95', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Site Admin</div>
            </div>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid rgba(0,13,16,0.15)', background: 'transparent', borderRadius: 9999, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#000d10', letterSpacing: '0.08em' }}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Banner */}
      <section style={{ background: '#0f0f1c' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px 64px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 24 }}>
            <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
            <span style={{ fontSize: 11, letterSpacing: '0.25em', color: 'white', fontWeight: 700 }}>ADMIN PANEL</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,56px)', fontWeight: 700, color: 'white', lineHeight: 1.05, letterSpacing: '-0.03em' }}>Site Control Centre</h1>
          <p style={{ fontSize: 16, color: '#d5d3d4', marginTop: 16, fontWeight: 500 }}>Manage all content, accounts, and settings from here.</p>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid rgba(0,13,16,0.1)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', overflowX: 'auto' }}>
          {TABS.map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{ position: 'relative', padding: '20px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === key ? '#000d10' : 'transparent'}`, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: activeTab === key ? '#000d10' : '#8e8e95', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
              {label}
              {key === 'accounts' && pendingResetReqs.length > 0 && (
                <span style={{ position: 'absolute', top: 10, right: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9999, background: '#dc2626', color: 'white', fontSize: 10, fontWeight: 800, lineHeight: 1, boxSizing: 'border-box' }}>
                  {pendingResetReqs.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 96px' }}>

        {/* ── CIRCULARS ── */}
        {activeTab === 'circulars' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase' }}>Circulars ({circulars.length})</div>
              <button onClick={() => openModal('circular')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}><Plus size={14} /> Add Circular</button>
            </div>
            <div style={{ background: 'white', border: '1px solid rgba(0,13,16,0.1)' }}>
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}><LoaderCircle size={24} color="#bc7155" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div> : (
                <>
                {(() => {
                  const t = Math.max(1, Math.ceil(circulars.length / adminPageSize));
                  const s = Math.min(circularsPage, t - 1);
                  return circulars.slice(s * adminPageSize, (s + 1) * adminPageSize).map((c, i) => (
                  <div key={c.id as string} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '20px 24px', borderTop: i > 0 ? '1px solid rgba(0,13,16,0.07)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 200 }}>
                      <span style={{ fontSize: 24 }}>{c.flag as string}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#000d10' }}>{c.title as string}</div>
                        <div style={{ fontSize: 12, color: '#8e8e95', marginTop: 2, fontWeight: 500 }}>{c.country as string} · {c.salary as string}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => handleToggle('circulars', c.id as string, 'is_active', c.is_active)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.is_active ? '#16a34a' : '#8e8e95', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
                        {c.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />} {c.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                      <ActionBtn onClick={() => openModal('circular', c)} icon={Pencil} label="Edit" />
                      <ActionBtn onClick={() => handleDelete('circulars', c.id as string)} icon={Trash2} label="Delete" variant="danger" />
                    </div>
                  </div>
                  ));
                })()}
                {circulars.length > adminPageSize && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 24px', borderTop: '1px solid rgba(0,13,16,0.07)' }}>
                    <button onClick={() => setCircularsPage(p => Math.max(0, p - 1))} disabled={circularsPage === 0}
                      style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: circularsPage === 0 ? '#d5d3d4' : '#000d10', cursor: circularsPage === 0 ? 'default' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', opacity: circularsPage === 0 ? 0.5 : 1 }}>← Prev</button>
                    {Array.from({ length: Math.ceil(circulars.length / adminPageSize) }, (_, i) => (
                      <button key={i} onClick={() => setCircularsPage(i)}
                        style={{ padding: '6px 12px', border: `1px solid ${i === circularsPage ? '#000d10' : 'rgba(0,13,16,0.15)'}`, borderRadius: 9999, background: i === circularsPage ? '#000d10' : 'transparent', color: i === circularsPage ? 'white' : '#8e8e95', cursor: 'pointer', fontSize: 11, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{i + 1}</button>
                    ))}
                    <button onClick={() => setCircularsPage(p => Math.min(Math.ceil(circulars.length / adminPageSize) - 1, p + 1))} disabled={circularsPage >= Math.ceil(circulars.length / adminPageSize) - 1}
                      style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: circularsPage >= Math.ceil(circulars.length / adminPageSize) - 1 ? '#d5d3d4' : '#000d10', cursor: circularsPage >= Math.ceil(circulars.length / adminPageSize) - 1 ? 'default' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', opacity: circularsPage >= Math.ceil(circulars.length / adminPageSize) - 1 ? 0.5 : 1 }}>Next →</button>
                    <select value={adminPageSize} onChange={e => { setAdminPageSize(Number(e.target.value)); setCircularsPage(0); }}
                      style={{ padding: '4px 10px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: '#000d10', cursor: 'pointer', fontSize: 10, fontWeight: 700, outline: 'none', marginLeft: 8, appearance: 'none', paddingRight: 22, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%238e8e95'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                )}
                {!loading && circulars.length === 0 && <div style={{ padding: '48px', textAlign: 'center', color: '#8e8e95', fontSize: 14 }}>No circulars yet.</div>}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── FLIGHTS ── */}
        {activeTab === 'flights' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase' }}>Recent Flights ({flights.length})</div>
              <button onClick={() => openModal('flight')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}><Plus size={14} /> Add Flight</button>
            </div>
            <div style={{ background: 'white', border: '1px solid rgba(0,13,16,0.1)' }}>
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}><LoaderCircle size={24} color="#bc7155" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div> : (
                <>
                {(() => {
                  const t = Math.max(1, Math.ceil(flights.length / adminPageSize));
                  const s = Math.min(flightsPage, t - 1);
                  return flights.slice(s * adminPageSize, (s + 1) * adminPageSize).map((f, i) => (
                  <div key={f.id as string} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '20px 24px', borderTop: i > 0 ? '1px solid rgba(0,13,16,0.07)' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#000d10' }}>{f.origin as string} → {f.destination as string} · {f.flight_date as string}</div>
                      <div style={{ fontSize: 12, color: '#8e8e95', marginTop: 2, fontWeight: 500 }}>{f.group_name as string} · {f.role as string}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <ActionBtn onClick={() => openModal('flight', f)} icon={Pencil} label="Edit" />
                      <ActionBtn onClick={() => handleDelete('flights', f.id as string)} icon={Trash2} label="Delete" variant="danger" />
                    </div>
                  </div>
                  ));
                })()}
                {flights.length > adminPageSize && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 24px', borderTop: '1px solid rgba(0,13,16,0.07)' }}>
                    <button onClick={() => setFlightsPage(p => Math.max(0, p - 1))} disabled={flightsPage === 0}
                      style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: flightsPage === 0 ? '#d5d3d4' : '#000d10', cursor: flightsPage === 0 ? 'default' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', opacity: flightsPage === 0 ? 0.5 : 1 }}>← Prev</button>
                    {Array.from({ length: Math.ceil(flights.length / adminPageSize) }, (_, i) => (
                      <button key={i} onClick={() => setFlightsPage(i)}
                        style={{ padding: '6px 12px', border: `1px solid ${i === flightsPage ? '#000d10' : 'rgba(0,13,16,0.15)'}`, borderRadius: 9999, background: i === flightsPage ? '#000d10' : 'transparent', color: i === flightsPage ? 'white' : '#8e8e95', cursor: 'pointer', fontSize: 11, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{i + 1}</button>
                    ))}
                    <button onClick={() => setFlightsPage(p => Math.min(Math.ceil(flights.length / adminPageSize) - 1, p + 1))} disabled={flightsPage >= Math.ceil(flights.length / adminPageSize) - 1}
                      style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: flightsPage >= Math.ceil(flights.length / adminPageSize) - 1 ? '#d5d3d4' : '#000d10', cursor: flightsPage >= Math.ceil(flights.length / adminPageSize) - 1 ? 'default' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', opacity: flightsPage >= Math.ceil(flights.length / adminPageSize) - 1 ? 0.5 : 1 }}>Next →</button>
                    <select value={adminPageSize} onChange={e => { setAdminPageSize(Number(e.target.value)); setFlightsPage(0); }}
                      style={{ padding: '4px 10px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: '#000d10', cursor: 'pointer', fontSize: 10, fontWeight: 700, outline: 'none', marginLeft: 8, appearance: 'none', paddingRight: 22, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%238e8e95'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                )}
                {!loading && flights.length === 0 && <div style={{ padding: '48px', textAlign: 'center', color: '#8e8e95', fontSize: 14 }}>No flights yet.</div>}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── AWARDS ── */}
        {activeTab === 'awards' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase' }}>Awards ({awards.length})</div>
              <button onClick={() => openModal('award')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}><Plus size={14} /> Add Award</button>
            </div>
            <div style={{ background: 'white', border: '1px solid rgba(0,13,16,0.1)' }}>
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}><LoaderCircle size={24} color="#bc7155" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div> : (
                <>
                {(() => {
                  const t = Math.max(1, Math.ceil(awards.length / adminPageSize));
                  const s = Math.min(awardsPage, t - 1);
                  return awards.slice(s * adminPageSize, (s + 1) * adminPageSize).map((a, i) => (
                  <div key={a.id as string} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '20px 24px', borderTop: i > 0 ? '1px solid rgba(0,13,16,0.07)' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#000d10' }}>{a.title as string} <span style={{ color: '#bc7155', fontWeight: 500 }}>· {a.year as string}</span></div>
                      <div style={{ fontSize: 12, color: '#8e8e95', marginTop: 2, fontWeight: 500 }}>{a.issuer as string}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <ActionBtn onClick={() => openModal('award', a)} icon={Pencil} label="Edit" />
                      <ActionBtn onClick={() => handleDelete('awards', a.id as string)} icon={Trash2} label="Delete" variant="danger" />
                    </div>
                  </div>
                  ));
                })()}
                {awards.length > adminPageSize && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 24px', borderTop: '1px solid rgba(0,13,16,0.07)' }}>
                    <button onClick={() => setAwardsPage(p => Math.max(0, p - 1))} disabled={awardsPage === 0}
                      style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: awardsPage === 0 ? '#d5d3d4' : '#000d10', cursor: awardsPage === 0 ? 'default' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', opacity: awardsPage === 0 ? 0.5 : 1 }}>← Prev</button>
                    {Array.from({ length: Math.ceil(awards.length / adminPageSize) }, (_, i) => (
                      <button key={i} onClick={() => setAwardsPage(i)}
                        style={{ padding: '6px 12px', border: `1px solid ${i === awardsPage ? '#000d10' : 'rgba(0,13,16,0.15)'}`, borderRadius: 9999, background: i === awardsPage ? '#000d10' : 'transparent', color: i === awardsPage ? 'white' : '#8e8e95', cursor: 'pointer', fontSize: 11, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{i + 1}</button>
                    ))}
                    <button onClick={() => setAwardsPage(p => Math.min(Math.ceil(awards.length / adminPageSize) - 1, p + 1))} disabled={awardsPage >= Math.ceil(awards.length / adminPageSize) - 1}
                      style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: awardsPage >= Math.ceil(awards.length / adminPageSize) - 1 ? '#d5d3d4' : '#000d10', cursor: awardsPage >= Math.ceil(awards.length / adminPageSize) - 1 ? 'default' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', opacity: awardsPage >= Math.ceil(awards.length / adminPageSize) - 1 ? 0.5 : 1 }}>Next →</button>
                    <select value={adminPageSize} onChange={e => { setAdminPageSize(Number(e.target.value)); setAwardsPage(0); }}
                      style={{ padding: '4px 10px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: '#000d10', cursor: 'pointer', fontSize: 10, fontWeight: 700, outline: 'none', marginLeft: 8, appearance: 'none', paddingRight: 22, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%238e8e95'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                )}
                {!loading && awards.length === 0 && <div style={{ padding: '48px', textAlign: 'center', color: '#8e8e95', fontSize: 14 }}>No awards yet.</div>}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── TESTIMONIALS ── */}
        {activeTab === 'testimonials' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase' }}>Testimonials ({testimonials.length})</div>
              <button onClick={() => openModal('testimonial')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}><Plus size={14} /> Add Testimonial</button>
            </div>
            <div style={{ background: 'white', border: '1px solid rgba(0,13,16,0.1)' }}>
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}><LoaderCircle size={24} color="#bc7155" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div> : (
                <>
                {(() => {
                  const t = Math.max(1, Math.ceil(testimonials.length / adminPageSize));
                  const s = Math.min(testimonialsPage, t - 1);
                  return testimonials.slice(s * adminPageSize, (s + 1) * adminPageSize).map((tm, i) => (
                  <div key={tm.id as string} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '20px 24px', borderTop: i > 0 ? '1px solid rgba(0,13,16,0.07)' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#000d10' }}>{tm.name as string} <span style={{ color: '#8e8e95', fontWeight: 500 }}>· {tm.country as string}</span></div>
                      <div style={{ fontSize: 12, color: '#8e8e95', marginTop: 2, fontWeight: 500, maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>&ldquo;{tm.quote as string}&rdquo;</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => handleToggle('testimonials', tm.id as string, 'is_featured', tm.is_featured)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: tm.is_featured ? '#16a34a' : '#8e8e95', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
                        {tm.is_featured ? <ToggleRight size={18} /> : <ToggleLeft size={18} />} {tm.is_featured ? 'FEATURED' : 'HIDDEN'}
                      </button>
                      <ActionBtn onClick={() => openModal('testimonial', tm)} icon={Pencil} label="Edit" />
                      <ActionBtn onClick={() => handleDelete('testimonials', tm.id as string)} icon={Trash2} label="Delete" variant="danger" />
                    </div>
                  </div>
                  ));
                })()}
                {testimonials.length > adminPageSize && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 24px', borderTop: '1px solid rgba(0,13,16,0.07)' }}>
                    <button onClick={() => setTestimonialsPage(p => Math.max(0, p - 1))} disabled={testimonialsPage === 0}
                      style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: testimonialsPage === 0 ? '#d5d3d4' : '#000d10', cursor: testimonialsPage === 0 ? 'default' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', opacity: testimonialsPage === 0 ? 0.5 : 1 }}>← Prev</button>
                    {Array.from({ length: Math.ceil(testimonials.length / adminPageSize) }, (_, i) => (
                      <button key={i} onClick={() => setTestimonialsPage(i)}
                        style={{ padding: '6px 12px', border: `1px solid ${i === testimonialsPage ? '#000d10' : 'rgba(0,13,16,0.15)'}`, borderRadius: 9999, background: i === testimonialsPage ? '#000d10' : 'transparent', color: i === testimonialsPage ? 'white' : '#8e8e95', cursor: 'pointer', fontSize: 11, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{i + 1}</button>
                    ))}
                    <button onClick={() => setTestimonialsPage(p => Math.min(Math.ceil(testimonials.length / adminPageSize) - 1, p + 1))} disabled={testimonialsPage >= Math.ceil(testimonials.length / adminPageSize) - 1}
                      style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: testimonialsPage >= Math.ceil(testimonials.length / adminPageSize) - 1 ? '#d5d3d4' : '#000d10', cursor: testimonialsPage >= Math.ceil(testimonials.length / adminPageSize) - 1 ? 'default' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', opacity: testimonialsPage >= Math.ceil(testimonials.length / adminPageSize) - 1 ? 0.5 : 1 }}>Next →</button>
                    <select value={adminPageSize} onChange={e => { setAdminPageSize(Number(e.target.value)); setTestimonialsPage(0); }}
                      style={{ padding: '4px 10px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: '#000d10', cursor: 'pointer', fontSize: 10, fontWeight: 700, outline: 'none', marginLeft: 8, appearance: 'none', paddingRight: 22, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%238e8e95'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                )}
                {!loading && testimonials.length === 0 && <div style={{ padding: '48px', textAlign: 'center', color: '#8e8e95', fontSize: 14 }}>No testimonials yet.</div>}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── ACCOUNTS ── */}
        {activeTab === 'accounts' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase' }}>Accounts ({accounts.length})</div>
              <button onClick={() => openModal('account')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}><Plus size={14} /> Create Account</button>
            </div>
            <div style={{ background: 'white', border: '1px solid rgba(0,13,16,0.1)', marginBottom: 40 }}>
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}><LoaderCircle size={24} color="#bc7155" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div> : (
                <>
                {(() => {
                  const accTotal = Math.max(1, Math.ceil(accounts.length / adminPageSize));
                  const accSafe = Math.min(accountPage, accTotal - 1);
                  return accounts.slice(accSafe * adminPageSize, (accSafe + 1) * adminPageSize).map((a, i) => (
                  <div key={a.id as string} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '20px 24px', borderTop: i > 0 ? '1px solid rgba(0,13,16,0.07)' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#000d10' }}>{a.full_name as string}</div>
                      <div style={{ fontSize: 12, color: '#8e8e95', marginTop: 2, fontWeight: 500 }}>{a.email as string} · <span style={{ fontWeight: 700, color: a.role === 'TEAM_MEMBER' ? '#1d4ed8' : '#7c3aed' }}>{a.role as string}</span></div>
                      {Boolean(a.referral_code) && <div style={{ fontSize: 11, color: '#bc7155', marginTop: 4, fontWeight: 600 }}>Code: {String(a.referral_code)}</div>}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                      <button onClick={() => handleToggle('accounts', a.id as string, 'status', (a.status as string) !== 'ACTIVE')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: (a.status as string) === 'ACTIVE' ? '#16a34a' : '#8e8e95', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
                        {(a.status as string) === 'ACTIVE' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />} {(a.status as string) === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                      <ActionBtn onClick={() => handleResetPassword(a.id as string)} icon={RefreshCw} label="Reset PW" />
                      <ActionBtn onClick={() => handleDelete('accounts', a.id as string)} icon={Trash2} label="Delete" variant="danger" />
                    </div>
                  </div>
                  ));
                })()}
                {accounts.length > adminPageSize && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 24px', borderTop: '1px solid rgba(0,13,16,0.07)' }}>
                    <button onClick={() => setAccountPage(p => Math.max(0, p - 1))} disabled={accountPage === 0}
                      style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: accountPage === 0 ? '#d5d3d4' : '#000d10', cursor: accountPage === 0 ? 'default' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', opacity: accountPage === 0 ? 0.5 : 1 }}>← Prev</button>
                    {Array.from({ length: Math.ceil(accounts.length / adminPageSize) }, (_, i) => (
                      <button key={i} onClick={() => setAccountPage(i)}
                        style={{ padding: '6px 12px', border: `1px solid ${i === accountPage ? '#000d10' : 'rgba(0,13,16,0.15)'}`, borderRadius: 9999, background: i === accountPage ? '#000d10' : 'transparent', color: i === accountPage ? 'white' : '#8e8e95', cursor: 'pointer', fontSize: 11, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{i + 1}</button>
                    ))}
                    <button onClick={() => setAccountPage(p => Math.min(Math.ceil(accounts.length / adminPageSize) - 1, p + 1))} disabled={accountPage >= Math.ceil(accounts.length / adminPageSize) - 1}
                      style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: accountPage >= Math.ceil(accounts.length / adminPageSize) - 1 ? '#d5d3d4' : '#000d10', cursor: accountPage >= Math.ceil(accounts.length / adminPageSize) - 1 ? 'default' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', opacity: accountPage >= Math.ceil(accounts.length / adminPageSize) - 1 ? 0.5 : 1 }}>Next →</button>
                    <span style={{ fontSize: 11, color: '#8e8e95', fontWeight: 500, marginLeft: 8 }}>{accounts.length} total</span>
                    <select value={adminPageSize} onChange={e => { setAdminPageSize(Number(e.target.value)); setAccountPage(0); }}
                      style={{ padding: '4px 10px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: '#000d10', cursor: 'pointer', fontSize: 10, fontWeight: 700, outline: 'none', marginLeft: 8, appearance: 'none', paddingRight: 22, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%238e8e95'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                )}
                {!loading && accounts.length === 0 && <div style={{ padding: '48px', textAlign: 'center', color: '#8e8e95', fontSize: 14 }}>No accounts yet.</div>}
                </>
              )}
            </div>

            {/* Password Reset Requests */}
            {pendingResetReqs.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#bc7155', fontWeight: 700, textTransform: 'uppercase' }}>Password Reset Requests ({pendingResetReqs.length})</div>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#dc2626', animation: 'pulse 2s infinite' }} />
                </div>
                {resetReqMsg && (
                  <div style={{ padding: '12px 16px', background: resetReqMsg.startsWith('✓') ? '#f0fdf4' : '#fef2f2', border: '1px solid', borderColor: resetReqMsg.startsWith('✓') ? '#bbf7d0' : '#fecaca', marginBottom: 16, fontSize: 13, color: resetReqMsg.startsWith('✓') ? '#15803d' : '#dc2626', fontWeight: 500, wordBreak: 'break-all' }}>{resetReqMsg}</div>
                )}
                <div style={{ background: 'white', border: '1px solid rgba(0,13,16,0.1)' }}>
                  {pendingResetReqs.map((req, i) => (
                    <div key={req.email} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 24px', borderTop: i > 0 ? '1px solid rgba(0,13,16,0.07)' : 'none' }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#000d10' }}>{req.email}</div>
                        <div style={{ fontSize: 11, color: '#8e8e95', marginTop: 2, fontWeight: 500 }}>Requested {new Date(req.created_at).toLocaleString()}</div>
                      </div>
                      <button
                        onClick={() => handleApproveResetRequest(req.email)}
                        disabled={resetReqLoading === req.email}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: resetReqLoading === req.email ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: resetReqLoading === req.email ? 0.6 : 1 }}>
                        {resetReqLoading === req.email ? <><LoaderCircle size={14} style={{ animation: 'spin 1s linear infinite' }} /> Resetting...</> : 'Approve & Reset'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leads Section */}
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 24 }}>All Leads ({leads.length})</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16, padding: '10px 14px', background: '#f8f8f9', border: '1px solid rgba(0,13,16,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 9, fontWeight: 700, background: '#eef2ff', color: '#4338ca', letterSpacing: '0.05em', lineHeight: 1.4 }}>Influencer: Jane</span>
                  <span style={{ fontSize: 12, color: '#8e8e95', fontWeight: 500 }}>= from an influencer</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 9, fontWeight: 700, background: '#fef3c7', color: '#92400e', letterSpacing: '0.05em', lineHeight: 1.4 }}>Transferred from: Mark</span>
                  <span style={{ fontSize: 12, color: '#8e8e95', fontWeight: 500 }}>= transferred by admin</span>
                </div>
              </div>
              {/* Filter & Sort Bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} color="#8e8e95" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input type="text" value={leadSearchQuery} onChange={e => setLeadSearchQuery(e.target.value)} placeholder="Search name or phone..."
                      style={{ padding: '6px 12px 6px 34px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: '#000d10', fontSize: 11, fontWeight: 500, outline: 'none', width: 180, boxSizing: 'border-box' }} />
                  </div>
                  {[['all', 'All time'], ['7d', '7 days'], ['30d', '30 days'], ['90d', '90 days']].map(([key, label]) => (
                    <button key={key} onClick={() => setLeadDateFilter(key)} style={{ padding: '6px 14px', border: `1px solid ${leadDateFilter === key ? '#000d10' : 'rgba(0,13,16,0.15)'}`, borderRadius: 9999, background: leadDateFilter === key ? '#000d10' : 'transparent', color: leadDateFilter === key ? 'white' : '#8e8e95', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', transition: 'all 0.15s' }}>{label}</button>
                  ))}
                  <select value={leadStatusFilter} onChange={e => setLeadStatusFilter(e.target.value)}
                    style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: leadStatusFilter === 'all' ? '#8e8e95' : '#000d10', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', outline: 'none', appearance: 'none', paddingRight: 28, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238e8e95'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                    <option value="all">All Status</option>
                    {leadUniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setLeadSortOrder(s => s === 'newest' ? 'oldest' : 'newest')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: '#000d10', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
                      {leadSortOrder === 'newest' ? '↓ Newest' : '↑ Oldest'}
                    </button>
                    <button onClick={downloadCSV} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: '1px solid #bc7155', borderRadius: 9999, background: 'transparent', color: '#bc7155', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
                      ↓ CSV
                    </button>
                  </div>
              </div>
              <div style={{ background: 'white', border: '1px solid rgba(0,13,16,0.1)' }}>
                {filteredLeads.length === 0 ? (
                  <div style={{ padding: '48px', textAlign: 'center', color: '#8e8e95', fontSize: 14 }}>No leads match this filter.</div>
                ) : (
                  <>
                {paginatedLeads.map((l, i) => (
                  <div key={l.id as string} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 24px', borderTop: i > 0 ? '1px solid rgba(0,13,16,0.07)' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ padding: '3px 8px', borderRadius: 9999, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', background: l.is_hot ? '#fef3c7' : '#f1f5f9', color: l.is_hot ? '#92400e' : '#64748b', textTransform: 'uppercase' }}>{l.is_hot ? '🔥 HOT' : 'COLD'}</span>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#000d10', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {l.name as string || '—'}
                          {(() => { const d = l.created as string; if (!d) return null; const diff = Date.now() - new Date(d).getTime(); return diff < 24 * 60 * 60 * 1000 ? <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 8, fontWeight: 800, letterSpacing: '0.08em', background: '#dc2626', color: 'white', textTransform: 'uppercase', lineHeight: 1.4 }}>NEW</span> : null; })()}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: '#8e8e95', fontWeight: 500 }}>{l.phone as string} · Owner: {l.owner as string} · {l.country as string}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                        {(l.sourceLabel as string) && (
                          <span title="This lead was sent from an influencer's digital ID page" style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 9, fontWeight: 700, background: '#eef2ff', color: '#4338ca', letterSpacing: '0.05em', lineHeight: 1.4 }}>
                            {l.sourceLabel as string}
                          </span>
                        )}
                        {(l.transferLabel as string) && (
                          <span title="This lead was transferred from another team member by an admin" style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 9, fontWeight: 700, background: '#fef3c7', color: '#92400e', letterSpacing: '0.05em', lineHeight: 1.4 }}>
                            {l.transferLabel as string}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#8e8e95', fontWeight: 500, whiteSpace: 'nowrap' }}>{formatLeadDate(l.created as string)}</span>
                      <span style={{ fontSize: 10, padding: '3px 8px', background: (l.status as string) === 'DEPLOYED' ? '#f0fdf4' : '#f8f8f9', color: (l.status as string) === 'DEPLOYED' ? '#16a34a' : '#8e8e95', fontWeight: 700, borderRadius: 9999, textTransform: 'uppercase' }}>{l.status as string}</span>
                      {(l.status as string) !== 'DEPLOYED' && <ActionBtn onClick={() => handleConvertLead(l.id as string)} icon={Check} label="Convert" />}
                      {teamOptions.length > 0 && <ActionBtn onClick={() => openModal('transfer_lead', { lead_id: l.id as string, lead_name: l.name as string })} icon={ArrowRight} label="Transfer" />}
                      <button onClick={() => handleCopy(l.phone as string, l.id as string)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === l.id ? '#16a34a' : '#8e8e95' }}>
                        {copied === l.id as string ? <CheckCheck size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
                {/* Pagination */}
                {leadTotalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 24px', borderTop: '1px solid rgba(0,13,16,0.07)' }}>
                    <button onClick={() => setLeadPage(p => Math.max(0, p - 1))} disabled={leadSafePage === 0}
                      style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: leadSafePage === 0 ? '#d5d3d4' : '#000d10', cursor: leadSafePage === 0 ? 'default' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', opacity: leadSafePage === 0 ? 0.5 : 1 }}>← Prev</button>
                    {Array.from({ length: leadTotalPages }, (_, i) => (
                      <button key={i} onClick={() => setLeadPage(i)}
                        style={{ padding: '6px 12px', border: `1px solid ${i === leadSafePage ? '#000d10' : 'rgba(0,13,16,0.15)'}`, borderRadius: 9999, background: i === leadSafePage ? '#000d10' : 'transparent', color: i === leadSafePage ? 'white' : '#8e8e95', cursor: 'pointer', fontSize: 11, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{i + 1}</button>
                    ))}
                    <button onClick={() => setLeadPage(p => Math.min(leadTotalPages - 1, p + 1))} disabled={leadSafePage === leadTotalPages - 1}
                      style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: leadSafePage === leadTotalPages - 1 ? '#d5d3d4' : '#000d10', cursor: leadSafePage === leadTotalPages - 1 ? 'default' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', opacity: leadSafePage === leadTotalPages - 1 ? 0.5 : 1 }}>Next →</button>
                    <span style={{ fontSize: 11, color: '#8e8e95', fontWeight: 500, marginLeft: 8 }}>{filteredLeads.length} total</span>
                    <select value={leadPageSize} onChange={e => { setLeadPageSize(Number(e.target.value)); setLeadPage(0); }}
                      style={{ padding: '4px 10px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: '#000d10', cursor: 'pointer', fontSize: 10, fontWeight: 700, outline: 'none', marginLeft: 8, appearance: 'none', paddingRight: 22, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%238e8e95'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── DIGITAL ID ── */}
        {activeTab === 'digital_id' && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 24 }}>Digital ID Pages ({digitalIds.length})</div>
            <div style={{ background: 'white', border: '1px solid rgba(0,13,16,0.1)' }}>
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}><LoaderCircle size={24} color="#bc7155" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div> : (
                <>
                {(() => {
                  const dt = Math.max(1, Math.ceil(digitalIds.length / adminPageSize));
                  const ds = Math.min(digitalIdsPage, dt - 1);
                  return digitalIds.slice(ds * adminPageSize, (ds + 1) * adminPageSize).map((d, i) => {
                    const link = `/p/${d.slug as string}`;
                    return (
                      <div key={d.id as string} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '20px 24px', borderTop: i > 0 ? '1px solid rgba(0,13,16,0.07)' : 'none' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#000d10' }}>{d.name as string}</div>
                          <div style={{ fontSize: 12, color: '#8e8e95', marginTop: 2, fontWeight: 500 }}>{d.specialty as string} · Code: {d.slug as string}</div>
                          <div style={{ fontSize: 11, color: '#bc7155', marginTop: 4, fontWeight: 500 }}>{link}</div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                          <button onClick={() => handleToggle('digital_id', d.id as string, 'is_active', d.is_active)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: d.is_active ? '#16a34a' : '#8e8e95', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
                            {d.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />} {d.is_active ? 'ACTIVE' : 'OFF'}
                          </button>
                          <button onClick={() => handleCopy(`${typeof window !== 'undefined' ? window.location.origin : ''}${link}`, `did_${d.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === `did_${d.id}` ? '#16a34a' : '#8e8e95', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}>
                            {copied === `did_${d.id}` ? <CheckCheck size={14} /> : <Copy size={14} />} Copy Link
                          </button>
                          <a href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#000d10', textDecoration: 'none', padding: '6px 10px', border: '1px solid rgba(0,13,16,0.1)', borderRadius: 6 }}>
                            <ArrowRight size={12} /> View
                          </a>
                        </div>
                      </div>
                    );
                  });
                })()}
                {digitalIds.length > adminPageSize && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 24px', borderTop: '1px solid rgba(0,13,16,0.07)' }}>
                    <button onClick={() => setDigitalIdsPage(p => Math.max(0, p - 1))} disabled={digitalIdsPage === 0}
                      style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: digitalIdsPage === 0 ? '#d5d3d4' : '#000d10', cursor: digitalIdsPage === 0 ? 'default' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', opacity: digitalIdsPage === 0 ? 0.5 : 1 }}>← Prev</button>
                    {Array.from({ length: Math.ceil(digitalIds.length / adminPageSize) }, (_, i) => (
                      <button key={i} onClick={() => setDigitalIdsPage(i)}
                        style={{ padding: '6px 12px', border: `1px solid ${i === digitalIdsPage ? '#000d10' : 'rgba(0,13,16,0.15)'}`, borderRadius: 9999, background: i === digitalIdsPage ? '#000d10' : 'transparent', color: i === digitalIdsPage ? 'white' : '#8e8e95', cursor: 'pointer', fontSize: 11, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{i + 1}</button>
                    ))}
                    <button onClick={() => setDigitalIdsPage(p => Math.min(Math.ceil(digitalIds.length / adminPageSize) - 1, p + 1))} disabled={digitalIdsPage >= Math.ceil(digitalIds.length / adminPageSize) - 1}
                      style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: digitalIdsPage >= Math.ceil(digitalIds.length / adminPageSize) - 1 ? '#d5d3d4' : '#000d10', cursor: digitalIdsPage >= Math.ceil(digitalIds.length / adminPageSize) - 1 ? 'default' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', opacity: digitalIdsPage >= Math.ceil(digitalIds.length / adminPageSize) - 1 ? 0.5 : 1 }}>Next →</button>
                    <select value={adminPageSize} onChange={e => { setAdminPageSize(Number(e.target.value)); setDigitalIdsPage(0); }}
                      style={{ padding: '4px 10px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: '#000d10', cursor: 'pointer', fontSize: 10, fontWeight: 700, outline: 'none', marginLeft: 8, appearance: 'none', paddingRight: 22, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%238e8e95'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                )}
                {!loading && digitalIds.length === 0 && <div style={{ padding: '48px', textAlign: 'center', color: '#8e8e95', fontSize: 14 }}>No digital ID pages yet. Create accounts to generate pages.</div>}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── SITE SETTINGS ── */}
        {activeTab === 'site_settings' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase' }}>Site Settings</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {settingsSaveMsg && <span style={{ fontSize: 13, color: settingsSaveMsg === 'Saved!' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{settingsSaveMsg}</span>}
                <button onClick={handleSaveSettings} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}><Check size={14} /> Save All</button>
              </div>
            </div>
            <div style={{ background: 'white', padding: 32, border: '1px solid rgba(0,13,16,0.1)' }}>
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}><LoaderCircle size={24} color="#bc7155" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div> : (
                <>
                {(() => {
                  const entries = Object.entries(siteSettings);
                  const st = Math.max(1, Math.ceil(entries.length / adminPageSize));
                  const ss = Math.min(siteSettingsPage, st - 1);
                  const paginatedEntries = entries.slice(ss * adminPageSize, (ss + 1) * adminPageSize);
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))', gap: '0 40px' }}>
                      {paginatedEntries.map(([key, val]) => (
                        <div key={key} style={{ marginBottom: 24 }}>
                          <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.2em', color: '#8e8e95', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>{key.replace(/_/g, ' ')}</label>
                          <input type="text" value={val} onChange={e => setSiteSettings(prev => ({ ...prev, [key]: e.target.value }))} style={{ width: '100%', padding: '8px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.12)', background: 'transparent', fontSize: 13, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
                        </div>
                      ))}
                    </div>
                  );
                })()}
                {Object.entries(siteSettings).length > adminPageSize && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 0 0' }}>
                    <button onClick={() => setSiteSettingsPage(p => Math.max(0, p - 1))} disabled={siteSettingsPage === 0}
                      style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: siteSettingsPage === 0 ? '#d5d3d4' : '#000d10', cursor: siteSettingsPage === 0 ? 'default' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', opacity: siteSettingsPage === 0 ? 0.5 : 1 }}>← Prev</button>
                    {Array.from({ length: Math.ceil(Object.entries(siteSettings).length / adminPageSize) }, (_, i) => (
                      <button key={i} onClick={() => setSiteSettingsPage(i)}
                        style={{ padding: '6px 12px', border: `1px solid ${i === siteSettingsPage ? '#000d10' : 'rgba(0,13,16,0.15)'}`, borderRadius: 9999, background: i === siteSettingsPage ? '#000d10' : 'transparent', color: i === siteSettingsPage ? 'white' : '#8e8e95', cursor: 'pointer', fontSize: 11, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{i + 1}</button>
                    ))}
                    <button onClick={() => setSiteSettingsPage(p => Math.min(Math.ceil(Object.entries(siteSettings).length / adminPageSize) - 1, p + 1))} disabled={siteSettingsPage >= Math.ceil(Object.entries(siteSettings).length / adminPageSize) - 1}
                      style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: siteSettingsPage >= Math.ceil(Object.entries(siteSettings).length / adminPageSize) - 1 ? '#d5d3d4' : '#000d10', cursor: siteSettingsPage >= Math.ceil(Object.entries(siteSettings).length / adminPageSize) - 1 ? 'default' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', opacity: siteSettingsPage >= Math.ceil(Object.entries(siteSettings).length / adminPageSize) - 1 ? 0.5 : 1 }}>Next →</button>
                    <span style={{ fontSize: 11, color: '#8e8e95', fontWeight: 500, marginLeft: 8 }}>{Object.entries(siteSettings).length} total</span>
                    <select value={adminPageSize} onChange={e => { setAdminPageSize(Number(e.target.value)); setSiteSettingsPage(0); }}
                      style={{ padding: '4px 10px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: '#000d10', cursor: 'pointer', fontSize: 10, fontWeight: 700, outline: 'none', marginLeft: 8, appearance: 'none', paddingRight: 22, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%238e8e95'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                )}
                </>
              )}
            </div>
          </div>
        )}
        {/* ── CHANGE PASSWORD ── */}
        <div style={{ maxWidth: 560, marginTop: 40 }}>
          <div style={{ background: 'white', padding: 32, border: '1px solid rgba(0,13,16,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase' }}>Change Password</div>
              <button onClick={() => { setShowChangePw(!showChangePw); setPwMsg(''); setPwCurrent(''); setPwNew(''); setPwConfirm(''); }}
                style={{ padding: '8px 16px', background: showChangePw ? 'transparent' : '#000d10', color: showChangePw ? '#000d10' : 'white', border: `1px solid ${showChangePw ? 'rgba(0,13,16,0.15)' : '#000d10'}`, borderRadius: 9999, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {showChangePw ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            {showChangePw && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Current Password</label>
                  <input type="password" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} placeholder="Enter current password"
                    style={{ width: '100%', padding: '12px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 15, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>New Password</label>
                  <input type="password" value={pwNew} onChange={e => setPwNew(e.target.value)} placeholder="Min 8 characters"
                    style={{ width: '100%', padding: '12px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 15, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Confirm New Password</label>
                  <input type="password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} placeholder="Re-enter new password"
                    style={{ width: '100%', padding: '12px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 15, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
                </div>
                {pwMsg && (
                  <div style={{ padding: '10px 16px', background: pwMsg.startsWith('✓') || pwMsg.includes('successfully') ? '#f0fdf4' : '#fef2f2', border: '1px solid', borderColor: pwMsg.startsWith('✓') || pwMsg.includes('successfully') ? '#bbf7d0' : '#fecaca', marginBottom: 20, fontSize: 13, color: pwMsg.startsWith('✓') || pwMsg.includes('successfully') ? '#15803d' : '#dc2626', fontWeight: 500 }}>{pwMsg}</div>
                )}
                <button onClick={handleChangePassword} disabled={pwLoading}
                  style={{ padding: '12px 24px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: pwLoading ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 700, opacity: pwLoading ? 0.6 : 1, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {pwLoading ? <><LoaderCircle size={14} style={{ animation: 'spin 1s linear infinite' }} /> Updating...</> : 'Update Password'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      {modal?.type === 'circular' && (
        <Modal title={modal.data ? 'Edit Circular' : 'Add Circular'} onClose={closeModal}>
          <Field label="Country" name="country" value={form.country || ''} onChange={v => setForm(p => ({ ...p, country: v }))} placeholder="e.g. Saudi Arabia" />
          <Field label="Flag Emoji" name="flag" value={form.flag || ''} onChange={v => setForm(p => ({ ...p, flag: v }))} placeholder="🇸🇦" />
          <Field label="Job Title" name="title" value={form.title || ''} onChange={v => setForm(p => ({ ...p, title: v }))} placeholder="e.g. Construction Worker" />
          <Field label="Salary" name="salary" value={form.salary || ''} onChange={v => setForm(p => ({ ...p, salary: v }))} placeholder="e.g. SAR 1,200/mo" />
          <Field label="Requirements" name="requirements" value={form.requirements || ''} onChange={v => setForm(p => ({ ...p, requirements: v }))} type="textarea" placeholder="Requirements and notes..." />
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="checkbox" id="is_active" checked={form.is_active === 'true'} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked ? 'true' : 'false' }))} />
            <label htmlFor="is_active" style={{ fontSize: 13, fontWeight: 600, color: '#000d10' }}>Show on homepage (Active)</label>
          </div>
          {formMsg && <div style={{ padding: '10px 16px', background: formMsg.includes('Error') ? '#fef2f2' : '#f0fdf4', border: '1px solid', borderColor: formMsg.includes('Error') ? '#fecaca' : '#bbf7d0', marginBottom: 20, fontSize: 13, color: formMsg.includes('Error') ? '#dc2626' : '#15803d', fontWeight: 500 }}>{formMsg}</div>}
          <button onClick={handleFormSubmit} style={{ width: '100%', padding: '14px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Save Circular</button>
        </Modal>
      )}
      {modal?.type === 'flight' && (
        <Modal title={modal.data ? 'Edit Flight' : 'Add Flight'} onClose={closeModal}>
          <Field label="Group Name" name="group_name" value={form.group_name || ''} onChange={v => setForm(p => ({ ...p, group_name: v }))} placeholder="e.g. Group 47" />
          <Field label="Job Role" name="role" value={form.role || ''} onChange={v => setForm(p => ({ ...p, role: v }))} placeholder="e.g. Welding Technician" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Origin (IATA)" name="origin" value={form.origin || ''} onChange={v => setForm(p => ({ ...p, origin: v }))} placeholder="DAC" />
            <Field label="Destination (IATA)" name="destination" value={form.destination || ''} onChange={v => setForm(p => ({ ...p, destination: v }))} placeholder="RUH" />
          </div>
          <Field label="Route" name="route" value={form.route || ''} onChange={v => setForm(p => ({ ...p, route: v }))} placeholder="e.g. Dhaka → Riyadh via Dubai" />
          <Field label="Flight Date" name="flight_date" value={form.flight_date || ''} onChange={v => setForm(p => ({ ...p, flight_date: v }))} type="date" />
          {formMsg && <div style={{ padding: '10px 16px', background: formMsg.includes('Error') ? '#fef2f2' : '#f0fdf4', border: '1px solid', borderColor: formMsg.includes('Error') ? '#fecaca' : '#bbf7d0', marginBottom: 20, fontSize: 13, color: formMsg.includes('Error') ? '#dc2626' : '#15803d', fontWeight: 500 }}>{formMsg}</div>}
          <button onClick={handleFormSubmit} style={{ width: '100%', padding: '14px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Save Flight</button>
        </Modal>
      )}
      {modal?.type === 'award' && (
        <Modal title={modal.data ? 'Edit Award' : 'Add Award'} onClose={closeModal}>
          <Field label="Award Title" name="title" value={form.title || ''} onChange={v => setForm(p => ({ ...p, title: v }))} placeholder="e.g. Best Recruitment Agency" />
          <Field label="Issuer" name="issuer" value={form.issuer || ''} onChange={v => setForm(p => ({ ...p, issuer: v }))} placeholder="e.g. BAIRA" />
          <Field label="Year" name="year" value={form.year || ''} onChange={v => setForm(p => ({ ...p, year: v }))} placeholder="e.g. 2023" />
          <Field label="Description" name="description" value={form.description || ''} onChange={v => setForm(p => ({ ...p, description: v }))} type="textarea" placeholder="Brief description..." />
          <Field label="Sort Order" name="sort_order" value={form.sort_order || '0'} onChange={v => setForm(p => ({ ...p, sort_order: v }))} type="number" placeholder="0" />
          {formMsg && <div style={{ padding: '10px 16px', background: formMsg.includes('Error') ? '#fef2f2' : '#f0fdf4', border: '1px solid', borderColor: formMsg.includes('Error') ? '#fecaca' : '#bbf7d0', marginBottom: 20, fontSize: 13, color: formMsg.includes('Error') ? '#dc2626' : '#15803d', fontWeight: 500 }}>{formMsg}</div>}
          <button onClick={handleFormSubmit} style={{ width: '100%', padding: '14px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Save Award</button>
        </Modal>
      )}
      {modal?.type === 'testimonial' && (
        <Modal title={modal.data ? 'Edit Testimonial' : 'Add Testimonial'} onClose={closeModal}>
          <Field label="Quote" name="quote" value={form.quote || ''} onChange={v => setForm(p => ({ ...p, quote: v }))} type="textarea" placeholder="Worker's testimonial..." />
          <Field label="Name" name="name" value={form.name || ''} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="Full name" />
          <Field label="Role / Job" name="role" value={form.role || ''} onChange={v => setForm(p => ({ ...p, role: v }))} placeholder="e.g. Electrician" />
          <Field label="Country" name="country" value={form.country || ''} onChange={v => setForm(p => ({ ...p, country: v }))} placeholder="e.g. Saudi Arabia" />
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="checkbox" id="is_featured" checked={form.is_featured === 'true'} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked ? 'true' : 'false' }))} />
            <label htmlFor="is_featured" style={{ fontSize: 13, fontWeight: 600, color: '#000d10' }}>Featured (show on homepage)</label>
          </div>
          {formMsg && <div style={{ padding: '10px 16px', background: formMsg.includes('Error') ? '#fef2f2' : '#f0fdf4', border: '1px solid', borderColor: formMsg.includes('Error') ? '#fecaca' : '#bbf7d0', marginBottom: 20, fontSize: 13, color: formMsg.includes('Error') ? '#dc2626' : '#15803d', fontWeight: 500 }}>{formMsg}</div>}
          <button onClick={handleFormSubmit} style={{ width: '100%', padding: '14px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Save Testimonial</button>
        </Modal>
      )}
      {modal?.type === 'account' && (
        <Modal title="Create Account" onClose={closeModal}>
          <Field label="Full Name" name="full_name" value={form.full_name || ''} onChange={v => setForm(p => ({ ...p, full_name: v }))} placeholder="Full name" />
          <Field label="Email Address" name="email" value={form.email || ''} onChange={v => setForm(p => ({ ...p, email: v }))} type="email" placeholder="email@example.com" />
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Role</label>
            <select value={form.role || 'TEAM_MEMBER'} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={{ width: '100%', padding: '10px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 14, color: '#000d10', fontWeight: 500, appearance: 'none' }}>
              <option value="ADMIN">Admin</option>
              <option value="TEAM_MEMBER">Team Member (Staff)</option>
              <option value="INFLUENCER">Influencer (Ambassador)</option>
            </select>
          </div>
          {form.role === 'INFLUENCER' && teamOptions.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Assign to Team Member</label>
              <select value={form.assigned_to || ''} onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))} style={{ width: '100%', padding: '10px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 14, color: '#000d10', fontWeight: 500, appearance: 'none' }}>
                <option value="">— No assignment —</option>
                {teamOptions.map((t: Record<string, unknown>) => <option key={t.id as string} value={t.id as string}>{t.full_name as string}</option>)}
              </select>
            </div>
          )}
          <Field label="Temporary Password *" name="temp_password" value={form.temp_password || ''} onChange={v => setForm(p => ({ ...p, temp_password: v }))} placeholder="Min 8 characters" />
          {formMsg && <div style={{ padding: '10px 16px', background: formMsg.includes('Error') || formMsg.includes('error') ? '#fef2f2' : '#f0fdf4', border: '1px solid', borderColor: formMsg.includes('Error') || formMsg.includes('error') ? '#fecaca' : '#bbf7d0', marginBottom: 20, fontSize: 13, color: formMsg.includes('Error') || formMsg.includes('error') ? '#dc2626' : '#15803d', fontWeight: 500, wordBreak: 'break-all' }}>{formMsg}</div>}
          <button onClick={handleFormSubmit} style={{ width: '100%', padding: '14px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Create Account</button>
        </Modal>
      )}
      {modal?.type === 'transfer_lead' && (
        <Modal title="Transfer Lead" onClose={closeModal}>
          <p style={{ fontSize: 14, color: '#8e8e95', fontWeight: 500, marginBottom: 24 }}>Transfer &ldquo;{form.lead_name}&rdquo; to a team member.</p>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Transfer To</label>
            <select value={form.new_owner_id || ''} onChange={e => setForm(p => ({ ...p, new_owner_id: e.target.value }))} style={{ width: '100%', padding: '10px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 14, color: '#000d10', fontWeight: 500, appearance: 'none' }}>
              <option value="">— Select team member —</option>
              {teamOptions.map((t: Record<string, unknown>) => <option key={t.id as string} value={t.id as string}>{t.full_name as string}</option>)}
            </select>
          </div>
          {formMsg && <div style={{ padding: '10px 16px', background: formMsg.includes('Error') ? '#fef2f2' : '#f0fdf4', border: '1px solid', borderColor: formMsg.includes('Error') ? '#fecaca' : '#bbf7d0', marginBottom: 20, fontSize: 13, color: formMsg.includes('Error') ? '#dc2626' : '#15803d', fontWeight: 500 }}>{formMsg}</div>}
          <button onClick={handleFormSubmit} style={{ width: '100%', padding: '14px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Transfer Lead</button>
        </Modal>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </main>
  );
}
