import { getSupabaseClient } from './supabase';

export const DEFAULT_SETTINGS: Record<string, string> = {
  hero_badge: 'BAIRA LICENSED · REG. NO. RL-2716',
  hero_heading: 'Your trusted gateway to ',
  hero_heading_accent: 'global opportunity',
  hero_paragraph: 'BAIRA-licensed overseas recruitment for Bangladeshi workers. Saudi Arabia, Malaysia, UAE, Qatar, Kuwait — handled end to end with verified employers, sharp execution, and full compliance.',
  hero_cta_primary: 'Get Free Consultation',
  hero_cta_secondary: 'View Active Circulars',
  stat_1_value: '12,000+', stat_1_label: 'Workers Placed',
  stat_2_value: '15+', stat_2_label: 'Years of Trust',
  stat_3_value: '8', stat_3_label: 'Countries Served',
  stat_4_value: '98%', stat_4_label: 'Visa Success Rate',
  slide_1_label: 'OUR MISSION',
  slide_1_title: 'Empowering dreams through global opportunities',
  slide_1_subtitle: 'Trusted recruitment for skilled workers across the Gulf, Southeast Asia, and beyond.',
  slide_2_label: 'PROVEN TRACK RECORD',
  slide_2_title: 'Over 12,000 workers placed since 2009',
  slide_2_subtitle: 'BAIRA-licensed and globally connected with verified employers.',
  slide_3_label: 'END-TO-END SUPPORT',
  slide_3_title: 'Visa, training, and deployment under one roof',
  slide_3_subtitle: 'From medical tests to airport handover — we handle every step.',
  slide_4_label: 'COUNTRY COVERAGE',
  slide_4_title: 'Saudi Arabia, Malaysia, UAE, Qatar, Kuwait',
  slide_4_subtitle: 'Direct demand letters from licensed Gulf and ASEAN employers.',
  about_heading: 'Built on trust,',
  about_heading_accent: 'since 2009',
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
  contact_visit_heading: 'Schedule a visit',
  contact_visit_desc: "Enter your phone and pick a date — we'll register you as a hot lead instantly.",
  contact_form_label: 'REQUEST FORM',
  contact_form_title: 'Start your journey',
};

export const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS);

export async function loadSiteSettings(): Promise<Record<string, string>> {
  const out: Record<string, string> = { ...DEFAULT_SETTINGS };
  const client = getSupabaseClient();
  if (!client) return out;
  try {
    const keys = SETTING_KEYS.map(k => `site_settings:${k}`);
    const { data } = await client.from('settings').select('key,value').in('key', keys);
    for (const row of data || []) {
      const short = row.key.replace('site_settings:', '');
      if (short in DEFAULT_SETTINGS && row.value) {
        const cleaned = cleanValue(row.value);
        const defaultVal = DEFAULT_SETTINGS[short];
        // If loaded value differs from default ONLY by case, keep the default's casing.
        // This prevents a flash when DB has uppercase values (e.g. 'GLOBAL OPPORTUNITY')
        // while DEFAULT_SETTINGS has the desired casing (e.g. 'global opportunity').
        if (cleaned.toLowerCase() === defaultVal.toLowerCase()) {
          out[short] = defaultVal;
        } else {
          out[short] = cleaned;
        }
      }
    }
  } catch {}
  return out;
}

function cleanValue(v: string): string {
  return v.replace(/\\/g, '').replace(/^["']+|["']+$/g, '').trim();
}

export async function saveSiteSettings(data: Record<string, string>): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const rows = SETTING_KEYS.map(key => ({
      key: `site_settings:${key}`,
      value: cleanValue(data[key] || DEFAULT_SETTINGS[key] || '').slice(0, 255),
    }));
    await client.from('settings').upsert(rows, { onConflict: 'key' });
    return true;
  } catch { return false; }
}
