"use client";
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface HZ { id: string; name: string; comment: string; count: number; }
interface Rec { id: string; hz_id: string; name: string; type: string; ttl: number; val: string; }

export default function Route53App() {
  const [zns, setZns] = useState<HZ[]>([]);
  const [sz, setSz] = useState<HZ | null>(null);
  const [rcs, setRcs] = useState<Rec[]>([]);
  const [q, setQ] = useState('');
  const [selIds, setSelIds] = useState<Set<string>>(new Set());
  
  const [sHzm, setSHzm] = useState(false);
  const [hzn, setHzn] = useState('');
  const [hzc, setHzc] = useState('');

  const [sRm, setSRm] = useState(false);
  const [rn, setRn] = useState('');
  const [rt, setRt] = useState('A');
  const [rtl, setRtl] = useState(300);
  const [rv, setRv] = useState('');

  useEffect(() => { 
    ldZns(); 
    
    const hkd = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSHzm(true);
      }
      if (e.key === 'Escape') {
        setSHzm(false);
        setSRm(false);
      }
    };
    window.addEventListener('keydown', hkd);
    return () => window.removeEventListener('keydown', hkd);
  }, []);

  const ldZns = async () => {
    try {
      const r = await fetch('http://localhost:8000/api/hz');
      const d = await r.json();
      setZns(d);
    } catch (err) {
      toast.error("Failed to connect to backend server");
    }
  };

  const ldRcs = async (id: string) => {
    const r = await fetch(`http://localhost:8000/api/hz/${id}/rec`);
    const d = await r.json();
    setRcs(d);
  };

  const crZn = async (e: React.FormEvent) => {
    e.preventDefault();
    const tId = toast.loading('Creating hosted zone...');
    const r = await fetch('http://localhost:8000/api/hz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: hzn, comment: hzc })
    });
    
    if (!r.ok) {
      toast.error('Domain name already exists!', { id: tId });
      return;
    }
    
    toast.success('Hosted zone created successfully', { id: tId });
    setHzn(''); setHzc(''); setSHzm(false);
    ldZns();
  };

  const delZn = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete zone? This will permanently delete all records inside it.")) {
      const r = await fetch(`http://localhost:8000/api/hz/${id}`, { method: 'DELETE' });
      if (r.ok) {
        toast.success('Hosted zone deleted');
        if (sz?.id === id) setSz(null);
        ldZns();
      }
    }
  };

  const blkDel = async () => {
    if (selIds.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selIds.size} zones?`)) {
      const tId = toast.loading('Deleting zones...');
      for (const id of Array.from(selIds)) {
        await fetch(`http://localhost:8000/api/hz/${id}`, { method: 'DELETE' });
      }
      toast.success('Bulk delete complete', { id: tId });
      setSelIds(new Set());
      ldZns();
    }
  };

  const expJs = () => {
    const dStr = JSON.stringify(zns, null, 2);
    const b = new Blob([dStr], { type: "application/json" });
    const u = URL.createObjectURL(b);
    const l = document.createElement("a");
    l.href = u;
    l.download = "route53_export.json";
    l.click();
    toast.success("Exported zones to JSON");
  };

  const crRc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sz) return;
    const tId = toast.loading('Creating record...');
    
    const r = await fetch(`http://localhost:8000/api/hz/${sz.id}/rec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: rn, type: rt, ttl: Number(rtl), val: rv })
    });

    if (r.ok) {
      toast.success('Record created successfully', { id: tId });
      setRn(''); setRv(''); setSRm(false);
      ldRcs(sz.id); ldZns();
    }
  };

  const delRc = async (id: string) => {
    if (confirm("Delete record?")) {
      await fetch(`http://localhost:8000/api/rec/${id}`, { method: 'DELETE' });
      toast.success('Record deleted');
      if (sz) { ldRcs(sz.id); ldZns(); }
    }
  };

  const tglSel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nx = new Set(selIds);
    if (nx.has(id)) nx.delete(id);
    else nx.add(id);
    setSelIds(nx);
  };

  const fZns = zns.filter(z => z.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      {!sz ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#111518]">Hosted zones</h2>
              <p className="text-sm text-[#545b64] mt-1">A hosted zone is a container for records, which define how you want to route traffic.</p>
            </div>
            <div className="flex gap-2">
              {selIds.size > 0 && (
                <button onClick={blkDel} className="bg-white border border-[#d13212] text-[#d13212] hover:bg-[#fff5f5] font-medium px-4 py-2 rounded text-sm shadow-sm transition">
                  Delete Selected ({selIds.size})
                </button>
              )}
              <button onClick={expJs} className="bg-white border border-[#aab7c4] hover:bg-[#f2f3f3] text-[#111518] font-medium px-4 py-2 rounded text-sm shadow-sm transition">
                Export JSON
              </button>
              <button onClick={() => setSHzm(true)} className="bg-[#ec7211] hover:bg-[#d8650c] text-white font-medium px-4 py-2 rounded text-sm shadow-sm transition flex items-center gap-2">
                Create hosted zone <span className="bg-[#d8650c] px-1.5 py-0.5 rounded text-[10px] opacity-80">Ctrl+K</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#eaeded] rounded shadow-sm">
            <div className="p-4 border-b border-[#eaeded] flex gap-4">
              <input type="text" placeholder="Find hosted zones by domain name" value={q} onChange={(e) => setQ(e.target.value)} className="border border-[#aab7c4] px-3 py-1.5 rounded text-sm w-80 focus:outline-none focus:border-[#ec7211]" />
            </div>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#fafafa] border-b border-[#eaeded] text-[#545b64] uppercase text-xs font-semibold">
                  <th className="p-4 w-10"></th>
                  <th className="p-4">Domain name</th>
                  <th className="p-4">Hosted zone ID</th>
                  <th className="p-4">Record count</th>
                  <th className="p-4">Comment</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fZns.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-[#545b64]">No hosted zones found.</td></tr>
                ) : fZns.map(z => (
                  <tr key={z.id} onClick={() => { setSz(z); ldRcs(z.id); }} className="border-b border-[#eaeded] hover:bg-[#f2f3f3] cursor-pointer transition">
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selIds.has(z.id)} onChange={(e) => {
                        const nx = new Set(selIds);
                        if (e.target.checked) nx.add(z.id); else nx.delete(z.id);
                        setSelIds(nx);
                      }} className="cursor-pointer" />
                    </td>
                    <td className="p-4 font-semibold text-[#0066cc] hover:underline">{z.name}</td>
                    <td className="p-4 text-[#545b64] font-mono">{z.id}</td>
                    <td className="p-4">{z.count}</td>
                    <td className="p-4 text-[#545b64]">{z.comment || '-'}</td>
                    <td className="p-4 text-right">
                      <button onClick={(e) => delZn(z.id, e)} className="text-[#d13212] hover:underline text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <span onClick={() => setSz(null)} className="text-[#0066cc] hover:underline cursor-pointer text-sm font-medium">&lt; Back to Hosted zones</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#111518] flex items-center gap-2">
                {sz.name} <span className="text-sm font-mono font-normal text-[#545b64]">({sz.id})</span>
              </h2>
            </div>
            <button onClick={() => setSRm(true)} className="bg-[#ec7211] hover:bg-[#d8650c] text-white font-medium px-4 py-2 rounded text-sm shadow-sm transition">
              Create record
            </button>
          </div>
          <div className="bg-white border border-[#eaeded] rounded shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#fafafa] border-b border-[#eaeded] text-[#545b64] uppercase text-xs font-semibold">
                  <th className="p-4">Record name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">TTL (Seconds)</th>
                  <th className="p-4">Value/Route traffic to</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rcs.map(r => (
                  <tr key={r.id} className="border-b border-[#eaeded] hover:bg-[#fafafa] transition">
                    <td className="p-4 font-semibold font-mono">{r.name || sz.name}</td>
                    <td className="p-4"><span className="bg-[#e1e4e6] px-2 py-0.5 rounded text-xs font-mono">{r.type}</span></td>
                    <td className="p-4 font-mono">{r.ttl}</td>
                    <td className="p-4 font-mono whitespace-pre-wrap text-xs text-[#545b64]">{r.val}</td>
                    <td className="p-4 text-right">
                      {r.type !== 'NS' && r.type !== 'SOA' && (
                        <button onClick={() => delRc(r.id)} className="text-[#d13212] hover:underline text-xs font-medium">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sHzm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-xs">
          <div className="bg-white rounded shadow-xl w-full max-w-md border border-[#eaeded]">
            <div className="p-4 border-b border-[#eaeded] flex justify-between items-center bg-[#fafafa]">
              <h3 className="font-bold text-[#232f3e]">Create hosted zone</h3>
              <button onClick={() => setSHzm(false)} className="text-[#545b64] hover:text-black font-bold">&times;</button>
            </div>
            <form onSubmit={crZn} className="p-4 flex flex-col gap-4 text-sm">
              <div>
                <label className="block font-medium mb-1 text-[#111518]">Domain name</label>
                <input autoFocus type="text" required placeholder="example.com" value={hzn} onChange={(e) => setHzn(e.target.value)} className="w-full border border-[#aab7c4] p-2 rounded focus:outline-none focus:border-[#ec7211]" />
              </div>
              <div>
                <label className="block font-medium mb-1 text-[#111518]">Comment</label>
                <textarea placeholder="Optional description" value={hzc} onChange={(e) => setHzc(e.target.value)} className="w-full border border-[#aab7c4] p-2 rounded h-20 resize-none focus:outline-none focus:border-[#ec7211]" />
              </div>
              <div className="flex justify-end gap-2 border-t border-[#eaeded] pt-4 mt-2">
                <button type="button" onClick={() => setSHzm(false)} className="px-4 py-2 border border-[#aab7c4] rounded font-medium hover:bg-[#f2f3f3]">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#ec7211] text-white rounded font-medium hover:bg-[#d8650c]">Create zone</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {sRm && sz && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-xs">
          <div className="bg-white rounded shadow-xl w-full max-w-lg border border-[#eaeded]">
            <div className="p-4 border-b border-[#eaeded] flex justify-between items-center bg-[#fafafa]">
              <h3 className="font-bold text-[#232f3e]">Create record</h3>
              <button onClick={() => setSRm(false)} className="text-[#545b64] hover:text-black font-bold">&times;</button>
            </div>
            <form onSubmit={crRc} className="p-4 flex flex-col gap-4 text-sm">
              <div>
                <label className="block font-medium mb-1 text-[#111518]">Record name</label>
                <div className="flex items-center gap-2">
                  <input autoFocus type="text" placeholder="subdomain" value={rn} onChange={(e) => setRn(e.target.value)} className="flex-1 border border-[#aab7c4] p-2 rounded focus:outline-none focus:border-[#ec7211] text-right font-mono" />
                  <span className="text-[#545b64] font-mono text-xs">.{sz.name}</span>
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1 text-[#111518]">Record type</label>
                <select value={rt} onChange={(e) => setRt(e.target.value)} className="w-full border border-[#aab7c4] p-2 rounded focus:outline-none focus:border-[#ec7211]">
                  {['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'PTR', 'SRV', 'CAA'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1 text-[#111518]">TTL (Seconds)</label>
                <input type="number" required value={rtl} onChange={(e) => setRtl(Number(e.target.value))} className="w-full border border-[#aab7c4] p-2 rounded focus:outline-none focus:border-[#ec7211] font-mono" />
              </div>
              <div>
                <label className="block font-medium mb-1 text-[#111518]">Value/Route traffic to</label>
                <textarea required placeholder="e.g. 192.0.2.1" value={rv} onChange={(e) => setRv(e.target.value)} className="w-full border border-[#aab7c4] p-2 rounded h-24 font-mono text-xs resize-none focus:outline-none focus:border-[#ec7211]" />
              </div>
              <div className="flex justify-end gap-2 border-t border-[#eaeded] pt-4 mt-2">
                <button type="button" onClick={() => setSRm(false)} className="px-4 py-2 border border-[#aab7c4] rounded font-medium hover:bg-[#f2f3f3]">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#ec7211] text-white rounded font-medium hover:bg-[#d8650c]">Create record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}