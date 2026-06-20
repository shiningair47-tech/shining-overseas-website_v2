'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, ArrowRight, LogOut, Users, Target, TrendingUp, Copy, CheckCheck, Plus, X, LoaderCircle, Link2, Phone, Info, Search } from 'lucide-react';

interface User { id: string; email: string; role: string; full_name: string; phone_number: string; referral_code: string; status: string; tier: string; assigned_to: string; facebook_page: string }
interface Lead { id: string; name: string; phone: string; is_hot: boolean; status: string; source: string; created: string; country: string; sourceLabel?: string; transferLabel?: string }
interface Influencer { id: string; full_name: string; email: string; phone: string; referral_code: string; status: string; tier: string; public_link: string; total_leads: number; hot_leads: number; cold_leads: number; converted: number }

export default function PortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editFb, setEditFb] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [showAddInf, setShowAddInf] = useState(false);
  const [newInfEmail, setNewInfEmail] = useState('');
  const [newInfName, setNewInfName] = useState('');
  const [newInfPass, setNewInfPass] = useState('');
  const [addInfLoading, setAddInfLoading] = useState(false);
  const [addInfMsg, setAddInfMsg] = useState('');
  const [coldLeadCount, setColdLeadCount] = useState(0);
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [leadPage, setLeadPage] = useState(0);
  const [leadPageSize, setLeadPageSize] = useState(20);
  const [recentPage, setRecentPage] = useState(0);
  const [recentPageSize, setRecentPageSize] = useState(10);

  useEffect(() => {
    const stored = localStorage.getItem('so_user');
    if (!stored) { router.replace('/login'); return; }
    try {
      const u = JSON.parse(stored);
      if (u.role === 'ADMIN') { router.replace('/site-admin'); return; }
      setUser(u);
      setEditName(u.full_name || ''); setEditPhone(u.phone_number || ''); setEditFb(u.facebook_page || '');
    } catch { router.replace('/login'); }
  }, [router]);

  const loadData = useCallback(async (u: User) => {
    if (!u) return;
    setLoading(true);
    try {
      const [leadsRes, infRes, coldRes] = await Promise.all([
        fetch(`/api/leads?my=${u.id}`),
        u.role === 'TEAM_MEMBER' ? fetch(`/api/leads?influencers=${u.id}`) : Promise.resolve(null),
        u.referral_code ? fetch(`/api/leads?cold_count=${u.referral_code}`).then(r => r.json()) : Promise.resolve(null),
      ]);
      const leadsData = await leadsRes.json();
      setLeads(Array.isArray(leadsData) ? leadsData : []);
      if (infRes) { const infData = await infRes.json(); setInfluencers(Array.isArray(infData) ? infData : []); }
      if (coldRes) setColdLeadCount((coldRes as { count: number }).count || 0);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { if (user) loadData(user); }, [user, loadData]);

  const handleLogout = () => { localStorage.removeItem('so_user'); router.replace('/'); };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(''), 2000); });
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaveMsg('Saving...');
    try {
      const res = await fetch('/api/digital-id', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_user', user_id: user.id, full_name: editName, phone_number: editPhone, facebook_page: editFb }),
      });
      const data = await res.json();
      if (data.ok) {
        const updated = { ...user, full_name: editName, phone_number: editPhone, facebook_page: editFb };
        localStorage.setItem('so_user', JSON.stringify(updated));
        setUser(updated); setSaveMsg('Saved!'); setEditMode(false); setTimeout(() => setSaveMsg(''), 2000);
      } else setSaveMsg('Error saving.');
    } catch { setSaveMsg('Network error.'); }
  };

  const handleAddInfluencer = async () => {
    if (!user || !newInfEmail || !newInfName) { setAddInfMsg('Email and name are required.'); return; }
    setAddInfLoading(true); setAddInfMsg('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_influencer', email: newInfEmail, full_name: newInfName, temp_password: newInfPass, team_member_id: user.id }),
      });
      const data = await res.json();
      if (data.ok) {
        setAddInfMsg(`✓ Created! Email: ${data.email} | Temp password: ${data.temp_password}`);
        setNewInfEmail(''); setNewInfName(''); setNewInfPass('');
        await loadData(user);
      } else setAddInfMsg(`Error: ${data.msg}`);
    } catch { setAddInfMsg('Network error.'); }
    setAddInfLoading(false);
  };

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoaderCircle size={32} color="#bc7155" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const isTeam = user.role === 'TEAM_MEMBER';
  const tier = (user.tier || '').toUpperCase();
  const hotLeads = leads.filter(l => l.is_hot);
  const coldLeads = isTeam ? leads.filter(l => !l.is_hot) : [];
  const converted = leads.filter(l => l.status === 'DEPLOYED');
  const publicLink = user.referral_code ? `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${user.referral_code}` : '';

  const tabs = isTeam
    ? [['overview', 'Overview'], ['leads', `Leads (${leads.length})`], ['influencers', `My Influencers (${influencers.length})`], ['profile', 'My Profile']]
    : [['overview', 'Overview'], ['leads', `My Leads (${leads.length})`], ['profile', 'My Profile']];

  const Stat = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
    <div style={{ padding: 32, border: '1px solid rgba(0,13,16,0.1)', background: 'white' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#8e8e95', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>{label}</div>
      <div style={{ fontSize: 'clamp(36px,5vw,48px)', fontWeight: 700, color: '#000d10', letterSpacing: '-0.03em' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#bc7155', fontWeight: 600, marginTop: 8 }}>{sub}</div>}
    </div>
  );

  const uniqueStatuses = useMemo(() => {
    const set = new Set(leads.map(l => l.status).filter(Boolean));
    return Array.from(set).sort();
  }, [leads]);

  const isWithinDays = (created: string, days: number) => {
    if (!created) return false;
    const diff = Date.now() - new Date(created).getTime();
    return diff < days * 24 * 60 * 60 * 1000;
  };

  const filteredLeads = useMemo(() => {
    let result = [...leads];
    // Filter by date
    if (dateFilter === '7d') result = result.filter(l => isWithinDays(l.created, 7));
    else if (dateFilter === '30d') result = result.filter(l => isWithinDays(l.created, 30));
    else if (dateFilter === '90d') result = result.filter(l => isWithinDays(l.created, 90));
    // Filter by status
    if (statusFilter !== 'all') result = result.filter(l => l.status === statusFilter);
    // Search by name or phone
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(l => (l.name || '').toLowerCase().includes(q) || (l.phone || '').includes(q));
    }
    // Sort
    result.sort((a, b) => {
      const da = a.created ? new Date(a.created).getTime() : 0;
      const db = b.created ? new Date(b.created).getTime() : 0;
      return sortOrder === 'newest' ? db - da : da - db;
    });
    return result;
  }, [leads, dateFilter, statusFilter, searchQuery, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / leadPageSize));
  const safePage = Math.min(leadPage, totalPages - 1);
  const paginatedLeads = filteredLeads.slice(safePage * leadPageSize, (safePage + 1) * leadPageSize);

  // Reset pages when filters change
  useEffect(() => { setLeadPage(0); }, [dateFilter, statusFilter, searchQuery]);

  const isNewLead = (created: string) => {
    if (!created) return false;
    const diff = Date.now() - new Date(created).getTime();
    return diff < 24 * 60 * 60 * 1000; // within 24 hours
  };

  const LeadBadge = ({ hot }: { hot: boolean }) => (
    <span style={{ padding: '4px 10px', borderRadius: 9999, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', background: hot ? '#fef3c7' : '#f1f5f9', color: hot ? '#92400e' : '#64748b', textTransform: 'uppercase' }}>{hot ? '🔥 HOT' : 'COLD'}</span>
  );

  const formatLeadDate = (created: string) => {
    if (!created) return '—';
    const d = new Date(created);
    const day = d.getDate();
    const suffix = day >= 11 && day <= 13 ? 'th' : ['st','nd','rd'][(day - 1) % 10] || 'th';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${day}${suffix} ${months[d.getMonth()]}`;
  };

  const downloadCSV = () => {
    const headers = ['Name','Phone','Country','Status','Lead Type','Source','Source Label','Transfer Label','Created'];
    const rows = filteredLeads.map(l => [
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.country || '').replace(/"/g, '""')}"`,
      `"${(l.status || '').replace(/"/g, '""')}"`,
      l.is_hot ? 'HOT' : 'COLD',
      `"${(l.source || '').replace(/"/g, '""')}"`,
      `"${(l.sourceLabel || '').replace(/"/g, '""')}"`,
      `"${(l.transferLabel || '').replace(/"/g, '""')}"`,
      l.created ? formatLeadDate(l.created) : '—'
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `leads-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const NewBadge = () => (
    <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', background: '#dc2626', color: 'white', textTransform: 'uppercase', lineHeight: 1.4 }}>NEW</span>
  );

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#f8f8f9', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid rgba(0,13,16,0.08)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1280, margin: '0 auto', padding: '16px 24px' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <Plane size={16} color="#bc7155" />
              <span style={{ fontWeight: 700, color: '#000d10', fontSize: 16 }}>SHINING</span>
              <span style={{ fontWeight: 300, color: '#000d10', letterSpacing: '0.2em', fontSize: 11, marginLeft: 4 }}>OVERSEAS</span>
            </div>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#000d10' }}>{user.full_name}</div>
              <div style={{ fontSize: 11, color: '#8e8e95', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{isTeam ? 'Staff Member' : `Ambassador · ${tier || 'STANDARD'}`}</div>
            </div>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid rgba(0,13,16,0.15)', background: 'transparent', borderRadius: 9999, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#000d10', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section style={{ background: '#0f0f1c' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px 64px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 24 }}>
                <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
                <span style={{ fontSize: 11, letterSpacing: '0.25em', color: 'white', fontWeight: 700 }}>{isTeam ? 'STAFF PORTAL' : 'AMBASSADOR PORTAL'}</span>
              </div>
              <h1 style={{ fontSize: 'clamp(28px,5vw,56px)', fontWeight: 700, color: 'white', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
                Welcome back,<br /><span style={{ color: '#bc7155' }}>{user.full_name.split(' ')[0]}.</span>
              </h1>
            </div>
            {publicLink && (
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '20px 24px' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Your Public Link</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, color: 'white', fontWeight: 500, wordBreak: 'break-all' }}>{publicLink}</span>
                  <button onClick={() => handleCopy(publicLink, 'link')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === 'link' ? '#34d399' : '#bc7155', flexShrink: 0 }}>
                    {copied === 'link' ? <CheckCheck size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid rgba(0,13,16,0.1)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 0, overflowX: 'auto' }}>
          {tabs.map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{ padding: '20px 24px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === key ? '#000d10' : 'transparent'}`, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: activeTab === key ? '#000d10' : '#8e8e95', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px 96px' }}>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,220px),1fr))', gap: 1, background: 'rgba(0,13,16,0.1)', marginBottom: 48 }}>
              <Stat label="Total Leads" value={isTeam ? leads.length : hotLeads.length + coldLeadCount} />
              <Stat label="Hot Leads" value={hotLeads.length} sub="Office visit requested" />
              <Stat label="Cold Leads" value={coldLeads.length || coldLeadCount} sub={!isTeam ? 'Routed to your team' : undefined} />
              <Stat label="Converted" value={converted.length} sub="Successfully deployed" />
              {isTeam && <Stat label="My Influencers" value={influencers.length} />}
            </div>
            {publicLink && (
              <div style={{ padding: 32, border: '1px solid rgba(0,13,16,0.1)', background: 'white', marginBottom: 32 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#8e8e95', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Your Digital ID Page</div>
                    <div style={{ fontSize: 15, color: '#000d10', fontWeight: 600, wordBreak: 'break-all' }}>{publicLink}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => handleCopy(publicLink, 'link2')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', border: '1px solid rgba(0,13,16,0.15)', background: 'transparent', borderRadius: 9999, cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#000d10', letterSpacing: '0.1em' }}>
                      {copied === 'link2' ? <CheckCheck size={14} color="#16a34a" /> : <Copy size={14} />} {copied === 'link2' ? 'Copied!' : 'Copy Link'}
                    </button>
                    <a href={`/builder`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#000d10', color: 'white', borderRadius: 9999, fontSize: 11, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.1em' }}>
                      Edit Profile <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              </div>
            )}
            {/* Recent leads preview */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase' }}>Recent Leads</div>
                <button onClick={() => setActiveTab('leads')} style={{ fontSize: 12, color: '#bc7155', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
              </div>
              {leads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#8e8e95', fontSize: 14 }}>No leads yet. Share your public link to start receiving enquiries.</div>
              ) : (
                <>
                {(() => {
                  const recentTotal = Math.max(1, Math.ceil(leads.length / recentPageSize));
                  const recentSafe = Math.min(recentPage, recentTotal - 1);
                  return leads.slice(recentSafe * recentPageSize, (recentSafe + 1) * recentPageSize).map(lead => (
                <div key={lead.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '20px 0', borderTop: '1px solid rgba(0,13,16,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <LeadBadge hot={lead.is_hot} />                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#000d10', display: 'flex', alignItems: 'center', gap: 8 }}>
                          {lead.name || '—'}
                          {isNewLead(lead.created) && <NewBadge />}
                        </div>
                        <div style={{ fontSize: 12, color: '#8e8e95', fontWeight: 500, marginTop: 2 }}>{lead.phone} · {lead.country || '—'}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                          {lead.sourceLabel && (
                            <span title="This lead was sent from an influencer's digital ID page" style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 9, fontWeight: 700, background: '#eef2ff', color: '#4338ca', letterSpacing: '0.05em', lineHeight: 1.4 }}>
                              {lead.sourceLabel}
                            </span>
                          )}
                          {lead.transferLabel && (
                            <span title="This lead was transferred from another team member by an admin" style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 9, fontWeight: 700, background: '#fef3c7', color: '#92400e', letterSpacing: '0.05em', lineHeight: 1.4 }}>
                              {lead.transferLabel}
                            </span>
                          )}
                        </div>
                      </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#8e8e95', fontWeight: 500 }}>{formatLeadDate(lead.created)}</div>
                </div>
                  ));
                })()}
                  {/* Recent leads pagination */}
                  {leads.length > recentPageSize && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 16 }}>
                      <button onClick={() => setRecentPage(p => Math.max(0, p - 1))} disabled={recentPage === 0}
                        style={{ padding: '4px 12px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: recentPage === 0 ? '#d5d3d4' : '#000d10', cursor: recentPage === 0 ? 'default' : 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', opacity: recentPage === 0 ? 0.5 : 1 }}>← Prev</button>
                      {Array.from({ length: Math.ceil(leads.length / recentPageSize) }, (_, i) => (
                        <button key={i} onClick={() => setRecentPage(i)}
                          style={{ padding: '4px 10px', border: `1px solid ${i === recentPage ? '#000d10' : 'rgba(0,13,16,0.15)'}`, borderRadius: 9999, background: i === recentPage ? '#000d10' : 'transparent', color: i === recentPage ? 'white' : '#8e8e95', cursor: 'pointer', fontSize: 10, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>{i + 1}</button>
                      ))}
                      <button onClick={() => setRecentPage(p => Math.min(Math.ceil(leads.length / recentPageSize) - 1, p + 1))} disabled={recentPage >= Math.ceil(leads.length / recentPageSize) - 1}
                        style={{ padding: '4px 12px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: recentPage >= Math.ceil(leads.length / recentPageSize) - 1 ? '#d5d3d4' : '#000d10', cursor: recentPage >= Math.ceil(leads.length / recentPageSize) - 1 ? 'default' : 'pointer', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', opacity: recentPage >= Math.ceil(leads.length / recentPageSize) - 1 ? 0.5 : 1 }}>Next →</button>
                    <select value={recentPageSize} onChange={e => { setRecentPageSize(Number(e.target.value)); setRecentPage(0); }}
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

        {/* LEADS TAB */}
        {activeTab === 'leads' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                All My Leads
                <span title="Indigo badge = lead from influencer · Amber badge = transferred from team member" style={{ display: 'inline-flex', cursor: 'help' }}>
                  <Info size={13} color="#8e8e95" />
                </span>
              </div>
              <p style={{ fontSize: 14, color: '#8e8e95', fontWeight: 500 }}>Leads routed to you from your digital ID page and direct submissions.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12, padding: '10px 14px', background: '#f8f8f9', border: '1px solid rgba(0,13,16,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 9, fontWeight: 700, background: '#eef2ff', color: '#4338ca', letterSpacing: '0.05em', lineHeight: 1.4 }}>Influencer: Jane</span>
                  <span style={{ fontSize: 12, color: '#8e8e95', fontWeight: 500 }}>= from an influencer</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 9, fontWeight: 700, background: '#fef3c7', color: '#92400e', letterSpacing: '0.05em', lineHeight: 1.4 }}>Transferred from: Mark</span>
                  <span style={{ fontSize: 12, color: '#8e8e95', fontWeight: 500 }}>= transferred by admin</span>
                </div>
              </div>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '64px 0' }}><LoaderCircle size={24} color="#bc7155" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>
            ) : (
              <div>
                {/* Filter & Sort Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={14} color="#8e8e95" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search name or phone..."
                        style={{ padding: '6px 12px 6px 34px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: '#000d10', fontSize: 11, fontWeight: 500, outline: 'none', width: 180, boxSizing: 'border-box' }} />
                    </div>
                    {[['all', 'All time'], ['7d', '7 days'], ['30d', '30 days'], ['90d', '90 days']].map(([key, label]) => (
                      <button key={key} onClick={() => setDateFilter(key)} style={{ padding: '6px 14px', border: `1px solid ${dateFilter === key ? '#000d10' : 'rgba(0,13,16,0.15)'}`, borderRadius: 9999, background: dateFilter === key ? '#000d10' : 'transparent', color: dateFilter === key ? 'white' : '#8e8e95', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', transition: 'all 0.15s' }}>{label}</button>
                    ))}
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                      style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: statusFilter === 'all' ? '#8e8e95' : '#000d10', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', outline: 'none', appearance: 'none', paddingRight: 28, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238e8e95'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                      <option value="all">All Status</option>
                      {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setSortOrder(s => s === 'newest' ? 'oldest' : 'newest')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: '#000d10', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
                      {sortOrder === 'newest' ? '↓ Newest' : '↑ Oldest'}
                    </button>
                    <button onClick={downloadCSV} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: '1px solid #bc7155', borderRadius: 9999, background: 'transparent', color: '#bc7155', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
                      ↓ CSV
                    </button>
                  </div>
                </div>
                {filteredLeads.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '96px 0', border: '1px solid rgba(0,13,16,0.1)' }}>
                    <Target size={32} color="#8e8e95" style={{ margin: '0 auto 16px' }} />
                    <p style={{ fontSize: 14, color: '#8e8e95', fontWeight: 500 }}>No leads match this filter.</p>
                  </div>
                ) : (
                <div style={{ background: 'white', border: '1px solid rgba(0,13,16,0.1)' }}>
                {paginatedLeads.map((lead, i) => (
                  <div key={lead.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '20px 24px', borderTop: i > 0 ? '1px solid rgba(0,13,16,0.07)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <LeadBadge hot={lead.is_hot} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#000d10', display: 'flex', alignItems: 'center', gap: 8 }}>
                          {lead.name || '—'}
                          {isNewLead(lead.created) && <NewBadge />}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <Phone size={11} color="#8e8e95" />
                          <span style={{ fontSize: 12, color: '#8e8e95', fontWeight: 500 }}>{lead.phone}</span>
                          {lead.country && <span style={{ fontSize: 12, color: '#8e8e95' }}>· {lead.country}</span>}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                          {lead.sourceLabel && (
                            <span title="This lead was sent from an influencer's digital ID page" style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 9, fontWeight: 700, background: '#eef2ff', color: '#4338ca', letterSpacing: '0.05em', lineHeight: 1.4 }}>
                              {lead.sourceLabel}
                            </span>
                          )}
                          {lead.transferLabel && (
                            <span title="This lead was transferred from another team member by an admin" style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 9, fontWeight: 700, background: '#fef3c7', color: '#92400e', letterSpacing: '0.05em', lineHeight: 1.4 }}>
                              {lead.transferLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontSize: 11, padding: '4px 10px', background: lead.status === 'DEPLOYED' ? '#f0fdf4' : '#f8f8f9', color: lead.status === 'DEPLOYED' ? '#16a34a' : '#8e8e95', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 9999 }}>{lead.status}</span>
                      <span style={{ fontSize: 11, color: '#8e8e95', fontWeight: 500 }}>{formatLeadDate(lead.created)}</span>
                      <button onClick={() => handleCopy(lead.phone, lead.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === lead.id ? '#16a34a' : '#8e8e95' }}>
                        {copied === lead.id ? <CheckCheck size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
                )}
                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px 24px', borderTop: '1px solid rgba(0,13,16,0.07)' }}>
                    <button onClick={() => setLeadPage(p => Math.max(0, p - 1))} disabled={safePage === 0}
                      style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: safePage === 0 ? '#d5d3d4' : '#000d10', cursor: safePage === 0 ? 'default' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', opacity: safePage === 0 ? 0.5 : 1 }}>← Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i} onClick={() => setLeadPage(i)}
                        style={{ padding: '6px 12px', border: `1px solid ${i === safePage ? '#000d10' : 'rgba(0,13,16,0.15)'}`, borderRadius: 9999, background: i === safePage ? '#000d10' : 'transparent', color: i === safePage ? 'white' : '#8e8e95', cursor: 'pointer', fontSize: 11, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{i + 1}</button>
                    ))}
                    <button onClick={() => setLeadPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage === totalPages - 1}
                      style={{ padding: '6px 14px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: safePage === totalPages - 1 ? '#d5d3d4' : '#000d10', cursor: safePage === totalPages - 1 ? 'default' : 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', opacity: safePage === totalPages - 1 ? 0.5 : 1 }}>Next →</button>
                    <span style={{ fontSize: 11, color: '#8e8e95', fontWeight: 500, marginLeft: 8 }}>{filteredLeads.length} total</span>
                    <select value={leadPageSize} onChange={e => { setLeadPageSize(Number(e.target.value)); setLeadPage(0); }}
                      style={{ padding: '4px 10px', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, background: 'transparent', color: '#000d10', cursor: 'pointer', fontSize: 10, fontWeight: 700, outline: 'none', marginLeft: 8, appearance: 'none', paddingRight: 22, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%238e8e95'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* INFLUENCERS TAB (team only) */}
        {activeTab === 'influencers' && isTeam && (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>My Influencers</div>
                <p style={{ fontSize: 14, color: '#8e8e95', fontWeight: 500 }}>Ambassadors assigned to you. You receive their cold leads.</p>
              </div>
              <button onClick={() => setShowAddInf(!showAddInf)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                <Plus size={14} /> Add Influencer
              </button>
            </div>
            {showAddInf && (
              <div style={{ padding: 32, border: '1px solid rgba(0,13,16,0.1)', background: 'white', marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid rgba(0,13,16,0.08)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#000d10' }}>Add New Influencer</div>
                  <button onClick={() => { setShowAddInf(false); setAddInfMsg(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} color="#8e8e95" /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 20, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Full Name</label>
                    <input type="text" value={newInfName} onChange={e => setNewInfName(e.target.value)} placeholder="Ambassador full name" style={{ width: '100%', padding: '10px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 14, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Email Address</label>
                    <input type="email" value={newInfEmail} onChange={e => setNewInfEmail(e.target.value)} placeholder="email@example.com" style={{ width: '100%', padding: '10px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 14, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Temp Password (optional)</label>
                    <input type="text" value={newInfPass} onChange={e => setNewInfPass(e.target.value)} placeholder="Leave blank to auto-generate" style={{ width: '100%', padding: '10px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 14, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
                  </div>
                </div>
                {addInfMsg && <div style={{ padding: '12px 16px', background: addInfMsg.startsWith('✓') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${addInfMsg.startsWith('✓') ? '#bbf7d0' : '#fecaca'}`, marginBottom: 20, fontSize: 13, color: addInfMsg.startsWith('✓') ? '#15803d' : '#dc2626', fontWeight: 500, wordBreak: 'break-all' }}>{addInfMsg}</div>}
                <button onClick={handleAddInfluencer} disabled={addInfLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 24px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: addInfLoading ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 700, opacity: addInfLoading ? 0.6 : 1, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {addInfLoading ? <LoaderCircle size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />} Create Account
                </button>
              </div>
            )}
            {influencers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '96px 0', border: '1px solid rgba(0,13,16,0.1)' }}>
                <Users size={32} color="#8e8e95" style={{ margin: '0 auto 16px' }} />
                <p style={{ fontSize: 14, color: '#8e8e95', fontWeight: 500 }}>No influencers yet. Add one to get started.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,320px),1fr))', gap: 1, background: 'rgba(0,13,16,0.08)' }}>
                {influencers.map(inf => (
                  <div key={inf.id} style={{ background: 'white', padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(0,13,16,0.08)' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#000d10' }}>{inf.full_name}</div>
                        <div style={{ fontSize: 12, color: '#8e8e95', fontWeight: 500, marginTop: 2 }}>{inf.email}</div>
                      </div>
                      <span style={{ fontSize: 10, padding: '4px 10px', background: inf.status === 'ACTIVE' ? '#f0fdf4' : '#f1f5f9', color: inf.status === 'ACTIVE' ? '#16a34a' : '#64748b', fontWeight: 700, borderRadius: 9999, textTransform: 'uppercase' }}>{inf.status}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
                      {[['Total', inf.total_leads], ['Hot', inf.hot_leads], ['Converted', inf.converted]].map(([label, val]) => (
                        <div key={label as string} style={{ textAlign: 'center', padding: '8px', background: '#f8f8f9' }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#000d10' }}>{val}</div>
                          <div style={{ fontSize: 10, color: '#8e8e95', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                        </div>
                      ))}
                    </div>
                    {inf.public_link && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Link2 size={12} color="#8e8e95" />
                        <span style={{ fontSize: 11, color: '#8e8e95', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inf.public_link}</span>
                        <button onClick={() => handleCopy(inf.public_link, `inf_${inf.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === `inf_${inf.id}` ? '#16a34a' : '#8e8e95' }}>
                          {copied === `inf_${inf.id}` ? <CheckCheck size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: 560 }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>My Profile</div>
              <p style={{ fontSize: 14, color: '#8e8e95', fontWeight: 500 }}>Your name, phone, and Facebook link are shown on your public Digital ID page.</p>
            </div>
            <div style={{ background: 'white', padding: 32, border: '1px solid rgba(0,13,16,0.1)' }}>
              {!editMode ? (
                <div>
                  {[['Full Name', user.full_name], ['Email', user.email], ['Phone Number', user.phone_number || '—'], ['Facebook Page', user.facebook_page || '—'], ['Referral Code', user.referral_code || '—'], ['Role', user.role], ['Status', user.status]].map(([label, val]) => (
                    <div key={label as string} style={{ display: 'flex', gap: 16, padding: '16px 0', borderTop: '1px solid rgba(0,13,16,0.08)' }}>
                      <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#8e8e95', fontWeight: 700, textTransform: 'uppercase', width: 140, flexShrink: 0 }}>{label}</div>
                      <div style={{ fontSize: 14, color: '#000d10', fontWeight: 600, wordBreak: 'break-all' }}>{val as string}</div>
                    </div>
                  ))}
                  <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                    <button onClick={() => setEditMode(true)} style={{ padding: '12px 24px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Edit Profile</button>
                    {user.referral_code && (
                      <a href="/builder" style={{ padding: '12px 24px', background: 'transparent', color: '#000d10', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        Edit Digital ID <ArrowRight size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Full Name</label>
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '12px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 15, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Phone Number</label>
                    <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} style={{ width: '100%', padding: '12px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 15, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Facebook Page URL</label>
                    <input type="text" value={editFb} onChange={e => setEditFb(e.target.value)} style={{ width: '100%', padding: '12px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 15, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
                  </div>
                  {saveMsg && <div style={{ padding: '10px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: 20, fontSize: 13, color: '#15803d', fontWeight: 500 }}>{saveMsg}</div>}
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button onClick={handleSaveProfile} style={{ padding: '12px 24px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Save Changes</button>
                    <button onClick={() => { setEditMode(false); setEditName(user.full_name); setEditPhone(user.phone_number || ''); setEditFb(user.facebook_page || ''); }} style={{ padding: '12px 24px', background: 'transparent', color: '#000d10', border: '1px solid rgba(0,13,16,0.15)', borderRadius: 9999, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}
