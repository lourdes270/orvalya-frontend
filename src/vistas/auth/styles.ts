import type { CSSProperties } from 'react'

export const s: Record<string, CSSProperties> = {
  page: { minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
  card: { background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '40px 32px', width: '100%', maxWidth: '400px' },
  logo: { textAlign: 'center', marginBottom: '32px' },
  logoSub: { fontSize: '13px', color: '#8C96A3', marginTop: '4px' },
  divider: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
  dividerLine: { flex: 1, height: '1px', background: '#E9ECEF' },
  dividerText: { fontSize: '12px', color: '#8C96A3', whiteSpace: 'nowrap' },
  tabs: { display: 'flex', borderBottom: '1.5px solid #E9ECEF', marginBottom: '28px' },
  tab: { flex: 1, padding: '10px 0', background: 'none', border: 'none', fontSize: '15px', cursor: 'pointer', color: '#8C96A3', fontWeight: '500', borderBottom: '2.5px solid transparent', marginBottom: '-1.5px' },
  tabActive: { color: '#2E75B6', borderBottomColor: '#2E75B6' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '500', color: '#495057' },
  input: { padding: '10px 14px', border: '1.5px solid #DEE2E6', borderRadius: '8px', fontSize: '15px', outline: 'none', color: '#212529', background: '#FFFFFF' },
  inputError: { borderColor: '#DC3545' },
  error: { fontSize: '12px', color: '#DC3545', margin: '0' },
  btn: { marginTop: '8px', padding: '12px', background: '#2E75B6', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
}
