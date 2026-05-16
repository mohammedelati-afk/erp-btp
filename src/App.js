import { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRIyedgLE2VMC1k5cV54sykm2MvoSbY2Q",
  authDomain: "erp-btp-b6544.firebaseapp.com",
  projectId: "erp-btp-b6544",
  storageBucket: "erp-btp-b6544.firebasestorage.app",
  messagingSenderId: "200399416176",
  appId: "1:200399416176:web:9df5b25eb957938b58bdb5",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const DATA_DOC = doc(db, "erp", "data");

const IC = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  marches:   "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  decomptes: "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  depenses:  "M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  rh:        "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0",
  plus:      "M12 5v14 M5 12h14",
  edit:      "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:     "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  close:     "M18 6L6 18 M6 6l12 12",
  check:     "M20 6L9 17l-5-5",
  lock:      "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
  user:      "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0",
  logout:    "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  history:   "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  building:  "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2 M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 0-2 2h-2 M10 6h4 M10 10h4 M10 14h4 M10 18h4",
  alert:     "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
};
const Ic = ({ d, s = 17, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d={d} /></svg>
);

const fmt  = n => new Intl.NumberFormat("fr-DZ").format(n) + " DA";
const fmtM = n => { if (n >= 1e6) return (n / 1e6).toFixed(1) + " M DA"; if (n >= 1e3) return (n / 1e3).toFixed(0) + " K DA"; return n + " DA"; };
const now  = () => new Date().toLocaleString("fr-DZ");

const ROLES = { admin: "Administrateur", chef: "Chef de projet", comptable: "Comptable", rh: "RH" };
const USERS = [
  { id: "admin",   name: "Mohammed (Admin)", role: "admin",     pin: "0000" },
  { id: "chef1",   name: "Karim Boudiaf",    role: "chef",      pin: "1111" },
  { id: "compta1", name: "Leila Hamdi",      role: "comptable", pin: "2222" },
  { id: "rh1",     name: "Samir Merabti",    role: "rh",        pin: "3333" },
];
const ACCESS = {
  admin:     ["dashboard","marches","decomptes","depenses","rh"],
  chef:      ["dashboard","marches","decomptes"],
  comptable: ["dashboard","decomptes","depenses"],
  rh:        ["dashboard","rh"],
};
const SEED = {
  marches: [
    { id:1, ref:"MRC-2024-001", titre:"Construction immeuble résidentiel A", client:"Ville d'Alger",                 montant:85000000,  statut:"En cours", dateDebut:"2024-01-15", dateFin:"2025-06-30", avancement:45  },
    { id:2, ref:"MRC-2024-002", titre:"Réhabilitation route nationale RN5",  client:"Direction des Travaux Publics", montant:42000000,  statut:"Terminé",  dateDebut:"2023-06-01", dateFin:"2024-03-31", avancement:100 },
    { id:3, ref:"MRC-2025-001", titre:"Aménagement parc industriel",         client:"Ministère de l'Industrie",     montant:120000000, statut:"Signé",     dateDebut:"2025-02-01", dateFin:"2026-12-31", avancement:12  },
  ],
  decomptes: [
    { id:1, marcheId:1, numero:"DC-001", periode:"Janvier 2025",  montantBrut:3800000, retenue:190000, montantNet:3610000, statut:"Payé",       date:"2025-01-31" },
    { id:2, marcheId:1, numero:"DC-002", periode:"Février 2025",  montantBrut:4200000, retenue:210000, montantNet:3990000, statut:"En attente", date:"2025-02-28" },
    { id:3, marcheId:3, numero:"DC-001", periode:"Février 2025",  montantBrut:2500000, retenue:125000, montantNet:2375000, statut:"Soumis",     date:"2025-02-28" },
  ],
  depenses: [
    { id:1, marcheId:1, categorie:"Main d'œuvre", description:"Salaires équipe chantier A - Janvier", montant:1200000, date:"2025-01-31", fournisseur:"Interne"         },
    { id:2, marcheId:1, categorie:"Matériaux",    description:"Achat ciment CEM II (500 sacs)",       montant:850000,  date:"2025-01-15", fournisseur:"SCIMAT SARL"      },
    { id:3, marcheId:1, categorie:"Équipement",   description:"Location grue mobile",                montant:450000,  date:"2025-01-20", fournisseur:"TechLoc BTP"      },
    { id:4, marcheId:3, categorie:"Matériaux",    description:"Gravier et sable (200 m³)",           montant:320000,  date:"2025-02-10", fournisseur:"Carrière du Nord" },
  ],
  employes: [
    { id:1, matricule:"EMP-001", nom:"Boudiaf", prenom:"Karim",   poste:"Chef de chantier",   salaire:95000, dateEmbauche:"2020-03-01", statut:"Actif", affectation:"MRC-2024-001" },
    { id:2, matricule:"EMP-002", nom:"Merabti", prenom:"Samir",   poste:"Conducteur travaux", salaire:85000, dateEmbauche:"2019-07-15", statut:"Actif", affectation:"MRC-2025-001" },
    { id:3, matricule:"EMP-003", nom:"Hamdi",   prenom:"Leila",   poste:"Comptable",          salaire:72000, dateEmbauche:"2021-01-10", statut:"Actif", affectation:"Siège"        },
    { id:4, matricule:"EMP-004", nom:"Ziani",   prenom:"Mohamed", poste:"Technicien",         salaire:65000, dateEmbauche:"2022-05-01", statut:"Actif", affectation:"MRC-2024-001" },
  ],
  log: [],
};

async function fbLoad() {
  try { const s = await getDoc(DATA_DOC); return s.exists() ? s.data() : null; } catch { return null; }
}
async function fbSave(data) {
  try { await setDoc(DATA_DOC, data); } catch (e) { console.error(e); }
}

const stColors = {
  "En cours":{ bg:"#dbeafe",tx:"#1d4ed8" },"Terminé":{ bg:"#dcfce7",tx:"#15803d" },
  "Signé":   { bg:"#fef9c3",tx:"#a16207" },"Brouillon":{ bg:"#f3f4f6",tx:"#6b7280" },
  "Payé":    { bg:"#dcfce7",tx:"#15803d" },"En attente":{ bg:"#fef9c3",tx:"#a16207" },
  "Soumis":  { bg:"#dbeafe",tx:"#1d4ed8" },"Actif":{ bg:"#dcfce7",tx:"#15803d" },
  "Inactif": { bg:"#fee2e2",tx:"#dc2626" },
};
const Badge = ({ s }) => { const c = stColors[s]||{bg:"#f3f4f6",tx:"#374151"}; return <span style={{ background:c.bg,color:c.tx,padding:"2px 10px",borderRadius:99,fontSize:12,fontWeight:600 }}>{s}</span>; };
const Modal = ({ title, onClose, children }) => (
  <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
    <div style={{ background:"#fff",borderRadius:14,padding:28,width:500,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,0.22)" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h3 style={{ margin:0,fontSize:17,fontWeight:700,color:"#1e293b" }}>{title}</h3>
        <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"#94a3b8" }}><Ic d={IC.close}/></button>
      </div>
      {children}
    </div>
  </div>
);
const Field = ({ label, children }) => (
  <div style={{ marginBottom:14 }}>
    <label style={{ display:"block",fontSize:12,fontWeight:600,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:0.4 }}>{label}</label>
    {children}
  </div>
);
const Inp = ({ ...p }) => <input {...p} style={{ width:"100%",padding:"8px 11px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:14,color:"#1e293b",boxSizing:"border-box",outline:"none",background:"#fff",...p.style }}/>;
const Sel = ({ children, ...p }) => <select {...p} style={{ width:"100%",padding:"8px 11px",border:"1px solid #e2e8f0",borderRadius:8,fontSize:14,color:"#1e293b",boxSizing:"border-box",background:"#fff",...p.style }}>{children}</select>;
const Btn = ({ children, onClick, v="primary", sm, sx }) => {
  const vs = { primary:{bg:"#2563eb",c:"#fff"},danger:{bg:"#dc2626",c:"#fff"},ghost:{bg:"#f1f5f9",c:"#374151"} };
  const st = vs[v]||vs.primary;
  return <button onClick={onClick} style={{ background:st.bg,color:st.c,border:"none",borderRadius:8,padding:sm?"4px 11px":"8px 17px",fontSize:sm?12:14,fontWeight:600,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6,...sx }}>{children}</button>;
};
const G2 = ({ children }) => <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>{children}</div>;
const Toast = ({ msg, type }) => {
  const bg = type==="success"?"#16a34a":type==="error"?"#dc2626":"#2563eb";
  return <div style={{ position:"fixed",bottom:24,right:24,background:bg,color:"#fff",padding:"12px 20px",borderRadius:10,fontSize:14,fontWeight:600,zIndex:2000,display:"flex",alignItems:"center",gap:8,boxShadow:"0 8px 30px rgba(0,0,0,0.18)" }}><Ic d={type==="success"?IC.check:IC.alert} s={16} c="#fff"/> {msg}</div>;
};

function Login({ onLogin }) {
  const [sel, setSel] = useState(null);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const tryLogin = () => { if (sel && sel.pin === pin) onLogin(sel); else { setErr("Code PIN incorrect"); setPin(""); } };
  return (
    <div style={{ minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ background:"#fff",borderRadius:16,padding:36,width:420,boxShadow:"0 30px 80px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign:"center",marginBottom:28 }}>
          <div style={{ background:"#2563eb",borderRadius:12,width:52,height:52,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:14 }}><Ic d={IC.building} s={26} c="#fff"/></div>
          <h2 style={{ margin:0,fontSize:20,fontWeight:800,color:"#1e293b" }}>ERP BTP</h2>
          <p style={{ margin:"6px 0 0",fontSize:13,color:"#94a3b8" }}>Connexion sécurisée · Firebase</p>
        </div>
        {!sel ? (
          <>
            <p style={{ fontSize:13,color:"#64748b",marginBottom:12 }}>Choisissez votre compte :</p>
            {USERS.map(u => (
              <button key={u.id} onClick={() => setSel(u)} style={{ width:"100%",display:"flex",alignItems:"center",gap:12,padding:"12px 14px",border:"1px solid #e2e8f0",borderRadius:10,background:"#fafafa",cursor:"pointer",marginBottom:8,textAlign:"left" }}>
                <div style={{ width:38,height:38,borderRadius:99,background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center" }}><Ic d={IC.user} s={18} c="#2563eb"/></div>
                <div><div style={{ fontSize:14,fontWeight:600,color:"#1e293b" }}>{u.name}</div><div style={{ fontSize:12,color:"#94a3b8" }}>{ROLES[u.role]}</div></div>
              </button>
            ))}
          </>
        ) : (
          <>
            <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#eff6ff",borderRadius:10,marginBottom:20 }}>
              <Ic d={IC.user} s={18} c="#2563eb"/>
              <div><div style={{ fontSize:14,fontWeight:600,color:"#1e293b" }}>{sel.name}</div><div style={{ fontSize:12,color:"#64748b" }}>{ROLES[sel.role]}</div></div>
              <button onClick={() => { setSel(null); setPin(""); setErr(""); }} style={{ marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:12 }}>Changer</button>
            </div>
            <Field label="Code PIN"><Inp type="password" maxLength={4} value={pin} onChange={e => { setPin(e.target.value); setErr(""); }} onKeyDown={e => e.key==="Enter" && tryLogin()} placeholder="• • • •" style={{ letterSpacing:8,fontSize:20,textAlign:"center" }}/></Field>
            {err && <p style={{ color:"#dc2626",fontSize:13,marginBottom:10 }}>{err}</p>}
            <Btn onClick={tryLogin} sx={{ width:"100%",justifyContent:"center",marginTop:4 }}><Ic d={IC.lock} s={15} c="#fff"/> Se connecter</Btn>
            <p style={{ fontSize:11,color:"#94a3b8",textAlign:"center",marginTop:12 }}>admin:0000 | chef:1111 | compta:2222 | rh:3333</p>
          </>
        )}
      </div>
    </div>
  );
}

function Dashboard({ data, user }) {
  const totalM  = data.marches.reduce((s,m)=>s+m.montant,0);
  const totalD  = data.depenses.reduce((s,d)=>s+d.montant,0);
  const totalDC = data.decomptes.filter(d=>d.statut==="Payé").reduce((s,d)=>s+d.montantNet,0);
  const actifs  = data.marches.filter(m=>m.statut==="En cours").length;
  const recentLog = [...(data.log||[])].reverse().slice(0,7);
  const cards = [
    { label:"Volume marchés",      val:fmtM(totalM),  ic:IC.marches,   c:"#2563eb",bg:"#eff6ff" },
    { label:"Décomptes encaissés", val:fmtM(totalDC), ic:IC.decomptes, c:"#16a34a",bg:"#f0fdf4" },
    { label:"Dépenses totales",    val:fmtM(totalD),  ic:IC.depenses,  c:"#dc2626",bg:"#fef2f2" },
    { label:"Marchés actifs",      val:actifs,         ic:IC.building,  c:"#7c3aed",bg:"#f5f3ff" },
  ];
  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ margin:0,color:"#1e293b",fontSize:20,fontWeight:800 }}>Tableau de bord</h2>
        <p style={{ margin:"4px 0 0",fontSize:13,color:"#94a3b8" }}>Bienvenue, {user.name} — {ROLES[user.role]}</p>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24 }}>
        {cards.map((c,i) => (
          <div key={i} style={{ background:"#fff",borderRadius:12,padding:18,border:"1px solid #f1f5f9",boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
              <div><div style={{ fontSize:12,color:"#94a3b8",marginBottom:6 }}>{c.label}</div><div style={{ fontSize:20,fontWeight:800,color:"#1e293b" }}>{c.val}</div></div>
              <div style={{ background:c.bg,borderRadius:10,padding:10 }}><Ic d={c.ic} c={c.c} s={20}/></div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:16 }}>
        <div style={{ background:"#fff",borderRadius:12,padding:20,border:"1px solid #f1f5f9" }}>
          <h3 style={{ margin:"0 0 16px",fontSize:14,fontWeight:700,color:"#1e293b" }}>Avancement des marchés</h3>
          {data.marches.map(m => (
            <div key={m.id} style={{ marginBottom:14 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                <span style={{ fontSize:13,color:"#374151",fontWeight:600 }}>{m.ref}</span>
                <span style={{ fontSize:12,color:"#94a3b8" }}>{m.avancement}%</span>
              </div>
              <div style={{ background:"#f1f5f9",borderRadius:99,height:7 }}>
                <div style={{ width:`${m.avancement}%`,background:m.avancement===100?"#16a34a":"#2563eb",borderRadius:99,height:"100%",transition:"width .5s" }}/>
              </div>
              <div style={{ fontSize:11,color:"#94a3b8",marginTop:3 }}>{m.client}</div>
            </div>
          ))}
        </div>
        <div style={{ background:"#fff",borderRadius:12,padding:20,border:"1px solid #f1f5f9" }}>
          <h3 style={{ margin:"0 0 14px",fontSize:14,fontWeight:700,color:"#1e293b",display:"flex",alignItems:"center",gap:7 }}><Ic d={IC.history} s={15} c="#2563eb"/> Journal Firebase</h3>
          {recentLog.length===0 && <p style={{ fontSize:13,color:"#94a3b8" }}>Aucune modification.</p>}
          {recentLog.map((l,i) => (
            <div key={i} style={{ padding:"7px 0",borderBottom:"1px solid #f8fafc",fontSize:12 }}>
              <span style={{ fontWeight:600,color:"#2563eb" }}>{l.user}</span>
              <span style={{ color:"#64748b" }}> — {l.action}</span>
              <div style={{ color:"#cbd5e1",fontSize:11 }}>{l.at}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Marches({ data, setData, user, addLog }) {
  const canEdit = user.role==="admin"||user.role==="chef";
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const openNew = () => { setForm({ ref:"",titre:"",client:"",montant:"",statut:"Signé",dateDebut:"",dateFin:"",avancement:0 }); setModal("new"); };
  const openEdit = m => { setForm({...m}); setModal("edit"); };
  const save = () => {
    const isNew = modal==="new";
    const item = { ...form,id:isNew?Date.now():form.id,montant:+form.montant,avancement:+form.avancement };
    setData(d => ({ ...d,marches:isNew?[...d.marches,item]:d.marches.map(m=>m.id===item.id?item:m) }));
    addLog(isNew?`Ajout marché ${form.ref}`:`Modif marché ${form.ref}`);
    setModal(null);
  };
  const del = id => { const m=data.marches.find(x=>x.id===id); if(window.confirm("Supprimer ce marché ?")){ setData(d=>({...d,marches:d.marches.filter(x=>x.id!==id)})); addLog(`Suppression marché ${m?.ref}`); } };
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
        <h2 style={{ margin:0,fontSize:20,fontWeight:800,color:"#1e293b" }}>Marchés & Contrats</h2>
        {canEdit && <Btn onClick={openNew}><Ic d={IC.plus} s={15} c="#fff"/> Nouveau marché</Btn>}
      </div>
      <div style={{ background:"#fff",borderRadius:12,overflow:"hidden",border:"1px solid #f1f5f9" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#f8fafc" }}>
            {["Référence","Intitulé","Client","Montant","Avancement","Statut","Actions"].map(h=><th key={h} style={{ padding:"11px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:0.5 }}>{h}</th>)}
          </tr></thead>
          <tbody>{data.marches.map((m,i)=>(
            <tr key={m.id} style={{ borderTop:"1px solid #f8fafc",background:i%2===0?"#fff":"#fafafa" }}>
              <td style={{ padding:"11px 14px",fontSize:13,fontWeight:700,color:"#2563eb" }}>{m.ref}</td>
              <td style={{ padding:"11px 14px",fontSize:13,color:"#374151",maxWidth:180 }}>{m.titre}</td>
              <td style={{ padding:"11px 14px",fontSize:12,color:"#64748b" }}>{m.client}</td>
              <td style={{ padding:"11px 14px",fontSize:13,fontWeight:700,color:"#1e293b" }}>{fmtM(m.montant)}</td>
              <td style={{ padding:"11px 14px",minWidth:100 }}>
                <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                  <div style={{ flex:1,background:"#f1f5f9",borderRadius:99,height:6 }}><div style={{ width:`${m.avancement}%`,background:"#2563eb",borderRadius:99,height:"100%" }}/></div>
                  <span style={{ fontSize:12,color:"#94a3b8" }}>{m.avancement}%</span>
                </div>
              </td>
              <td style={{ padding:"11px 14px" }}><Badge s={m.statut}/></td>
              <td style={{ padding:"11px 14px" }}>{canEdit&&<div style={{ display:"flex",gap:5 }}><Btn sm v="ghost" onClick={()=>openEdit(m)}><Ic d={IC.edit} s={13}/></Btn><Btn sm v="danger" onClick={()=>del(m.id)}><Ic d={IC.trash} s={13}/></Btn></div>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {modal&&canEdit&&(
        <Modal title={modal==="new"?"Nouveau marché":"Modifier le marché"} onClose={()=>setModal(null)}>
          <G2><Field label="Référence"><Inp value={form.ref} onChange={e=>setForm(f=>({...f,ref:e.target.value}))} placeholder="MRC-2025-XXX"/></Field>
          <Field label="Statut"><Sel value={form.statut} onChange={e=>setForm(f=>({...f,statut:e.target.value}))}>
            {["Brouillon","Signé","En cours","Terminé"].map(s=><option key={s}>{s}</option>)}
          </Sel></Field></G2>
          <Field label="Intitulé"><Inp value={form.titre} onChange={e=>setForm(f=>({...f,titre:e.target.value}))}/></Field>
          <Field label="Client"><Inp value={form.client} onChange={e=>setForm(f=>({...f,client:e.target.value}))}/></Field>
          <G2><Field label="Montant (DA)"><Inp type="number" value={form.montant} onChange={e=>setForm(f=>({...f,montant:e.target.value}))}/></Field>
          <Field label="Avancement (%)"><Inp type="number" min="0" max="100" value={form.avancement} onChange={e=>setForm(f=>({...f,avancement:e.target.value}))}/></Field></G2>
          <G2><Field label="Date début"><Inp type="date" value={form.dateDebut} onChange={e=>setForm(f=>({...f,dateDebut:e.target.value}))}/></Field>
          <Field label="Date fin"><Inp type="date" value={form.dateFin} onChange={e=>setForm(f=>({...f,dateFin:e.target.value}))}/></Field></G2>
          <div style={{ display:"flex",justifyContent:"flex-end",gap:9,marginTop:18 }}>
            <Btn v="ghost" onClick={()=>setModal(null)}>Annuler</Btn>
            <Btn onClick={save}><Ic d={IC.check} s={14} c="#fff"/> Enregistrer</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Decomptes({ data, setData, user, addLog }) {
  const canEdit = user.role==="admin"||user.role==="comptable";
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const openNew = () => { setForm({ marcheId:data.marches[0]?.id||"",numero:"",periode:"",montantBrut:"",retenue:"",statut:"Soumis",date:"" }); setModal(true); };
  const save = () => {
    const brut=+form.montantBrut, ret=+form.retenue||Math.round(brut*0.05);
    const item={ ...form,id:Date.now(),marcheId:+form.marcheId,montantBrut:brut,retenue:ret,montantNet:brut-ret };
    setData(d=>({...d,decomptes:[...d.decomptes,item]})); addLog(`Ajout décompte ${form.numero}`); setModal(false);
  };
  const del = id => { const dc=data.decomptes.find(x=>x.id===id); if(window.confirm("Supprimer ?")){ setData(d=>({...d,decomptes:d.decomptes.filter(x=>x.id!==id)})); addLog(`Suppression décompte ${dc?.numero}`); } };
  const updSt = (id,s) => { const dc=data.decomptes.find(x=>x.id===id); setData(d=>({...d,decomptes:d.decomptes.map(x=>x.id===id?{...x,statut:s}:x)})); addLog(`Statut décompte ${dc?.numero} → ${s}`); };
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
        <h2 style={{ margin:0,fontSize:20,fontWeight:800,color:"#1e293b" }}>Décomptes & Facturation</h2>
        {canEdit&&<Btn onClick={openNew}><Ic d={IC.plus} s={15} c="#fff"/> Nouveau décompte</Btn>}
      </div>
      <div style={{ background:"#fff",borderRadius:12,overflow:"hidden",border:"1px solid #f1f5f9" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#f8fafc" }}>
            {["N°","Marché","Période","Brut","Retenue","Net","Statut","Actions"].map(h=><th key={h} style={{ padding:"11px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:0.5 }}>{h}</th>)}
          </tr></thead>
          <tbody>{data.decomptes.map((dc,i)=>{ const m=data.marches.find(x=>x.id===dc.marcheId); return(
            <tr key={dc.id} style={{ borderTop:"1px solid #f8fafc",background:i%2===0?"#fff":"#fafafa" }}>
              <td style={{ padding:"11px 14px",fontSize:13,fontWeight:700,color:"#2563eb" }}>{dc.numero}</td>
              <td style={{ padding:"11px 14px",fontSize:12,color:"#64748b" }}>{m?.ref||"—"}</td>
              <td style={{ padding:"11px 14px",fontSize:13,color:"#374151" }}>{dc.periode}</td>
              <td style={{ padding:"11px 14px",fontSize:13,color:"#374151" }}>{fmtM(dc.montantBrut)}</td>
              <td style={{ padding:"11px 14px",fontSize:13,color:"#dc2626" }}>-{fmtM(dc.retenue)}</td>
              <td style={{ padding:"11px 14px",fontSize:13,fontWeight:700,color:"#16a34a" }}>{fmtM(dc.montantNet)}</td>
              <td style={{ padding:"11px 14px" }}>{canEdit?<Sel value={dc.statut} onChange={e=>updSt(dc.id,e.target.value)} style={{ width:"auto",padding:"3px 7px",fontSize:12 }}>{["Soumis","En attente","Payé"].map(s=><option key={s}>{s}</option>)}</Sel>:<Badge s={dc.statut}/>}</td>
              <td style={{ padding:"11px 14px" }}>{canEdit&&<Btn sm v="danger" onClick={()=>del(dc.id)}><Ic d={IC.trash} s={13}/></Btn>}</td>
            </tr>
          )})}</tbody>
          <tfoot><tr style={{ background:"#f8fafc",borderTop:"2px solid #e2e8f0" }}>
            <td colSpan={3} style={{ padding:"11px 14px",fontWeight:700,fontSize:13 }}>TOTAL</td>
            <td style={{ padding:"11px 14px",fontWeight:700,fontSize:13 }}>{fmtM(data.decomptes.reduce((s,d)=>s+d.montantBrut,0))}</td>
            <td style={{ padding:"11px 14px",fontWeight:700,fontSize:13,color:"#dc2626" }}>-{fmtM(data.decomptes.reduce((s,d)=>s+d.retenue,0))}</td>
            <td style={{ padding:"11px 14px",fontWeight:700,fontSize:13,color:"#16a34a" }}>{fmtM(data.decomptes.reduce((s,d)=>s+d.montantNet,0))}</td>
            <td colSpan={2}/>
          </tr></tfoot>
        </table>
      </div>
      {modal&&canEdit&&(
        <Modal title="Nouveau décompte" onClose={()=>setModal(false)}>
          <Field label="Marché"><Sel value={form.marcheId} onChange={e=>setForm(f=>({...f,marcheId:e.target.value}))}>{data.marches.map(m=><option key={m.id} value={m.id}>{m.ref}</option>)}</Sel></Field>
          <G2><Field label="Numéro"><Inp value={form.numero} onChange={e=>setForm(f=>({...f,numero:e.target.value}))} placeholder="DC-004"/></Field>
          <Field label="Période"><Inp value={form.periode} onChange={e=>setForm(f=>({...f,periode:e.target.value}))} placeholder="Mars 2025"/></Field></G2>
          <G2><Field label="Montant brut (DA)"><Inp type="number" value={form.montantBrut} onChange={e=>setForm(f=>({...f,montantBrut:e.target.value}))}/></Field>
          <Field label="Retenue (DA)"><Inp type="number" value={form.retenue} onChange={e=>setForm(f=>({...f,retenue:e.target.value}))} placeholder="Auto 5%"/></Field></G2>
          <G2><Field label="Date"><Inp type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></Field>
          <Field label="Statut"><Sel value={form.statut} onChange={e=>setForm(f=>({...f,statut:e.target.value}))}>{["Soumis","En attente","Payé"].map(s=><option key={s}>{s}</option>)}</Sel></Field></G2>
          <div style={{ display:"flex",justifyContent:"flex-end",gap:9,marginTop:18 }}>
            <Btn v="ghost" onClick={()=>setModal(false)}>Annuler</Btn>
            <Btn onClick={save}><Ic d={IC.check} s={14} c="#fff"/> Enregistrer</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Depenses({ data, setData, user, addLog }) {
  const canEdit = user.role==="admin"||user.role==="comptable";
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [filtre, setFiltre] = useState("Tous");
  const cats = ["Tous","Main d'œuvre","Matériaux","Équipement","Transport","Sous-traitance","Divers"];
  const catC = { "Main d'œuvre":"#7c3aed","Matériaux":"#2563eb","Équipement":"#0891b2","Transport":"#16a34a","Sous-traitance":"#ea580c","Divers":"#64748b" };
  const filtered = filtre==="Tous"?data.depenses:data.depenses.filter(d=>d.categorie===filtre);
  const openNew = () => { setForm({ marcheId:data.marches[0]?.id||"",categorie:"Matériaux",description:"",montant:"",date:"",fournisseur:"" }); setModal(true); };
  const save = () => { const item={...form,id:Date.now(),marcheId:+form.marcheId,montant:+form.montant}; setData(d=>({...d,depenses:[...d.depenses,item]})); addLog(`Ajout dépense ${form.categorie} — ${fmt(form.montant)}`); setModal(false); };
  const del = id => { const dep=data.depenses.find(x=>x.id===id); if(window.confirm("Supprimer ?")){ setData(d=>({...d,depenses:d.depenses.filter(x=>x.id!==id)})); addLog(`Suppression dépense — ${dep?.description}`); } };
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
        <h2 style={{ margin:0,fontSize:20,fontWeight:800,color:"#1e293b" }}>Dépenses & Comptabilité</h2>
        {canEdit&&<Btn onClick={openNew}><Ic d={IC.plus} s={15} c="#fff"/> Nouvelle dépense</Btn>}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:18 }}>
        {["Main d'œuvre","Matériaux","Équipement"].map(cat=>(
          <div key={cat} style={{ background:"#fff",borderRadius:10,padding:14,border:"1px solid #f1f5f9" }}>
            <div style={{ fontSize:11,color:"#94a3b8",marginBottom:4 }}>{cat}</div>
            <div style={{ fontSize:18,fontWeight:800,color:catC[cat]||"#374151" }}>{fmtM(data.depenses.filter(d=>d.categorie===cat).reduce((s,d)=>s+d.montant,0))}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex",gap:7,marginBottom:14,flexWrap:"wrap" }}>
        {cats.map(c=><button key={c} onClick={()=>setFiltre(c)} style={{ padding:"4px 13px",borderRadius:99,border:"1px solid",fontSize:12,cursor:"pointer",fontWeight:filtre===c?700:400,background:filtre===c?"#2563eb":"#fff",color:filtre===c?"#fff":"#64748b",borderColor:filtre===c?"#2563eb":"#e2e8f0" }}>{c}</button>)}
      </div>
      <div style={{ background:"#fff",borderRadius:12,overflow:"hidden",border:"1px solid #f1f5f9" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#f8fafc" }}>
            {["Date","Marché","Catégorie","Description","Fournisseur","Montant","Actions"].map(h=><th key={h} style={{ padding:"11px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:0.5 }}>{h}</th>)}
          </tr></thead>
          <tbody>{filtered.map((dep,i)=>{ const m=data.marches.find(x=>x.id===dep.marcheId); return(
            <tr key={dep.id} style={{ borderTop:"1px solid #f8fafc",background:i%2===0?"#fff":"#fafafa" }}>
              <td style={{ padding:"11px 14px",fontSize:12,color:"#94a3b8" }}>{dep.date}</td>
              <td style={{ padding:"11px 14px",fontSize:12,color:"#64748b" }}>{m?.ref||"—"}</td>
              <td style={{ padding:"11px 14px" }}><span style={{ background:(catC[dep.categorie]||"#64748b")+"20",color:catC[dep.categorie]||"#64748b",padding:"2px 9px",borderRadius:99,fontSize:11,fontWeight:600 }}>{dep.categorie}</span></td>
              <td style={{ padding:"11px 14px",fontSize:13,color:"#374151" }}>{dep.description}</td>
              <td style={{ padding:"11px 14px",fontSize:12,color:"#64748b" }}>{dep.fournisseur}</td>
              <td style={{ padding:"11px 14px",fontSize:13,fontWeight:700,color:"#dc2626" }}>{fmt(dep.montant)}</td>
              <td style={{ padding:"11px 14px" }}>{canEdit&&<Btn sm v="danger" onClick={()=>del(dep.id)}><Ic d={IC.trash} s={13}/></Btn>}</td>
            </tr>
          )})}</tbody>
          <tfoot><tr style={{ background:"#f8fafc",borderTop:"2px solid #e2e8f0" }}>
            <td colSpan={5} style={{ padding:"11px 14px",fontWeight:700,fontSize:13 }}>TOTAL {filtre!=="Tous"?filtre:""}</td>
            <td style={{ padding:"11px 14px",fontWeight:700,fontSize:13,color:"#dc2626" }}>{fmt(filtered.reduce((s,d)=>s+d.montant,0))}</td>
            <td/>
          </tr></tfoot>
        </table>
      </div>
      {modal&&canEdit&&(
        <Modal title="Nouvelle dépense" onClose={()=>setModal(false)}>
          <Field label="Marché"><Sel value={form.marcheId} onChange={e=>setForm(f=>({...f,marcheId:e.target.value}))}>{data.marches.map(m=><option key={m.id} value={m.id}>{m.ref}</option>)}</Sel></Field>
          <G2><Field label="Catégorie"><Sel value={form.categorie} onChange={e=>setForm(f=>({...f,categorie:e.target.value}))}>{cats.filter(c=>c!=="Tous").map(c=><option key={c}>{c}</option>)}</Sel></Field>
          <Field label="Date"><Inp type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></Field></G2>
          <Field label="Description"><Inp value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></Field>
          <G2><Field label="Fournisseur"><Inp value={form.fournisseur} onChange={e=>setForm(f=>({...f,fournisseur:e.target.value}))}/></Field>
          <Field label="Montant (DA)"><Inp type="number" value={form.montant} onChange={e=>setForm(f=>({...f,montant:e.target.value}))}/></Field></G2>
          <div style={{ display:"flex",justifyContent:"flex-end",gap:9,marginTop:18 }}>
            <Btn v="ghost" onClick={()=>setModal(false)}>Annuler</Btn>
            <Btn onClick={save}><Ic d={IC.check} s={14} c="#fff"/> Enregistrer</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function RH({ data, setData, user, addLog }) {
  const canEdit = user.role==="admin"||user.role==="rh";
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const openNew = () => { setForm({ matricule:"",nom:"",prenom:"",poste:"",salaire:"",dateEmbauche:"",statut:"Actif",affectation:"Siège" }); setModal("new"); };
  const openEdit = e => { setForm({...e}); setModal("edit"); };
  const save = () => {
    const isNew=modal==="new";
    const item={...form,id:isNew?Date.now():form.id,salaire:+form.salaire};
    setData(d=>({...d,employes:isNew?[...d.employes,item]:d.employes.map(e=>e.id===item.id?item:e)}));
    addLog(isNew?`Ajout employé ${form.prenom} ${form.nom}`:`Modif employé ${form.prenom} ${form.nom}`);
    setModal(null);
  };
  const del = id => { const emp=data.employes.find(x=>x.id===id); if(window.confirm("Supprimer ?")){ setData(d=>({...d,employes:d.employes.filter(e=>e.id!==id)})); addLog(`Suppression employé ${emp?.prenom} ${emp?.nom}`); } };
  const masse = data.employes.filter(e=>e.statut==="Actif").reduce((s,e)=>s+e.salaire,0);
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
        <h2 style={{ margin:0,fontSize:20,fontWeight:800,color:"#1e293b" }}>Ressources Humaines</h2>
        {canEdit&&<Btn onClick={openNew}><Ic d={IC.plus} s={15} c="#fff"/> Nouvel employé</Btn>}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22 }}>
        {[["Total employés",data.employes.length,"#2563eb"],["Actifs",data.employes.filter(e=>e.statut==="Actif").length,"#16a34a"],["Masse salariale/mois",fmtM(masse),"#7c3aed"]].map(([l,v,c])=>(
          <div key={l} style={{ background:"#fff",borderRadius:10,padding:16,border:"1px solid #f1f5f9" }}>
            <div style={{ fontSize:12,color:"#94a3b8" }}>{l}</div>
            <div style={{ fontSize:typeof v==="number"&&v<1000?28:19,fontWeight:800,color:c }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ background:"#fff",borderRadius:12,overflow:"hidden",border:"1px solid #f1f5f9" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#f8fafc" }}>
            {["Matricule","Nom & Prénom","Poste","Affectation",canEdit?"Salaire":null,"Embauche","Statut","Actions"].filter(Boolean).map(h=><th key={h} style={{ padding:"11px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:0.5 }}>{h}</th>)}
          </tr></thead>
          <tbody>{data.employes.map((emp,i)=>(
            <tr key={emp.id} style={{ borderTop:"1px solid #f8fafc",background:i%2===0?"#fff":"#fafafa" }}>
              <td style={{ padding:"11px 14px",fontSize:13,fontWeight:700,color:"#2563eb" }}>{emp.matricule}</td>
              <td style={{ padding:"11px 14px",fontSize:13,fontWeight:600,color:"#1e293b" }}>{emp.nom} {emp.prenom}</td>
              <td style={{ padding:"11px 14px",fontSize:12,color:"#64748b" }}>{emp.poste}</td>
              <td style={{ padding:"11px 14px",fontSize:12,color:"#64748b" }}>{emp.affectation}</td>
              {canEdit&&<td style={{ padding:"11px 14px",fontSize:13,fontWeight:700,color:"#7c3aed" }}>{fmt(emp.salaire)}</td>}
              <td style={{ padding:"11px 14px",fontSize:12,color:"#94a3b8" }}>{emp.dateEmbauche}</td>
              <td style={{ padding:"11px 14px" }}><Badge s={emp.statut}/></td>
              <td style={{ padding:"11px 14px" }}>{canEdit&&<div style={{ display:"flex",gap:5 }}><Btn sm v="ghost" onClick={()=>openEdit(emp)}><Ic d={IC.edit} s={13}/></Btn><Btn sm v="danger" onClick={()=>del(emp.id)}><Ic d={IC.trash} s={13}/></Btn></div>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {modal&&canEdit&&(
        <Modal title={modal==="new"?"Nouvel employé":"Modifier l'employé"} onClose={()=>setModal(null)}>
          <G2><Field label="Matricule"><Inp value={form.matricule} onChange={e=>setForm(f=>({...f,matricule:e.target.value}))} placeholder="EMP-005"/></Field>
          <Field label="Poste"><Inp value={form.poste} onChange={e=>setForm(f=>({...f,poste:e.target.value}))}/></Field></G2>
          <G2><Field label="Nom"><Inp value={form.nom} onChange={e=>setForm(f=>({...f,nom:e.target.value}))}/></Field>
          <Field label="Prénom"><Inp value={form.prenom} onChange={e=>setForm(f=>({...f,prenom:e.target.value}))}/></Field></G2>
          <G2><Field label="Salaire (DA)"><Inp type="number" value={form.salaire} onChange={e=>setForm(f=>({...f,salaire:e.target.value}))}/></Field>
          <Field label="Date embauche"><Inp type="date" value={form.dateEmbauche} onChange={e=>setForm(f=>({...f,dateEmbauche:e.target.value}))}/></Field></G2>
          <G2><Field label="Affectation"><Inp value={form.affectation} onChange={e=>setForm(f=>({...f,affectation:e.target.value}))} placeholder="Siège / MRC-XXX"/></Field>
          <Field label="Statut"><Sel value={form.statut} onChange={e=>setForm(f=>({...f,statut:e.target.value}))}><option>Actif</option><option>Inactif</option></Sel></Field></G2>
          <div style={{ display:"flex",justifyContent:"flex-end",gap:9,marginTop:18 }}>
            <Btn v="ghost" onClick={()=>setModal(null)}>Annuler</Btn>
            <Btn onClick={save}><Ic d={IC.check} s={14} c="#fff"/> Enregistrer</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser]     = useState(null);
  const [data, setData]     = useState(null);
  const [page, setPage]     = useState("dashboard");
  const [toast, setToast]   = useState(null);
  const [online, setOnline] = useState(true);
  const [lastSync, setLastSync] = useState(null);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  useEffect(() => {
    if (!user) return;
    fbLoad().then(d => {
      if (d) { setData(d); setLastSync(new Date().toLocaleTimeString("fr-DZ")); }
      else { setData(SEED); fbSave(SEED); }
      setOnline(true);
    }).catch(() => { setData(SEED); setOnline(false); });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(DATA_DOC, snap => {
      if (snap.exists()) { setData(snap.data()); setLastSync(new Date().toLocaleTimeString("fr-DZ")); setOnline(true); }
    }, () => setOnline(false));
    return () => unsub();
  }, [user]);

  const setDataAndSave = useCallback(updater => {
    setData(prev => {
      const next = typeof updater==="function" ? updater(prev) : updater;
      fbSave(next).then(() => setLastSync(new Date().toLocaleTimeString("fr-DZ")));
      return next;
    });
  }, []);

  const addLog = useCallback(action => {
    setDataAndSave(d => ({ ...d, log:[...(d.log||[]).slice(-99),{ user:user?.name||"?",action,at:now() }] }));
  }, [user, setDataAndSave]);

  if (!user) return <Login onLogin={u=>{ setUser(u); setPage("dashboard"); }}/>;
  if (!data) return (
    <div style={{ minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ color:"#94a3b8",fontSize:14,marginBottom:12 }}>Connexion à Firebase…</div>
        <div style={{ width:48,height:4,background:"#2563eb",borderRadius:99,margin:"0 auto" }}/>
      </div>
    </div>
  );

  const allowed = ACCESS[user.role]||["dashboard"];
  const navItems = [
    { id:"dashboard",label:"Tableau de bord",   ic:IC.dashboard },
    { id:"marches",  label:"Marchés",            ic:IC.marches   },
    { id:"decomptes",label:"Décomptes",          ic:IC.decomptes },
    { id:"depenses", label:"Dépenses",           ic:IC.depenses  },
    { id:"rh",       label:"Ressources Humaines",ic:IC.rh        },
  ].filter(n=>allowed.includes(n.id));

  const roleColors = { admin:"#2563eb",chef:"#7c3aed",comptable:"#16a34a",rh:"#ea580c" };
  const rc = roleColors[user.role]||"#64748b";
  const activePage = allowed.includes(page)?page:allowed[0];
  const pages = {
    dashboard:<Dashboard data={data} user={user}/>,
    marches:  <Marches   data={data} setData={setDataAndSave} user={user} addLog={addLog}/>,
    decomptes:<Decomptes data={data} setData={setDataAndSave} user={user} addLog={addLog}/>,
    depenses: <Depenses  data={data} setData={setDataAndSave} user={user} addLog={addLog}/>,
    rh:       <RH        data={data} setData={setDataAndSave} user={user} addLog={addLog}/>,
  };

  return (
    <div style={{ display:"flex",height:"100vh",fontFamily:"'Inter',-apple-system,sans-serif",background:"#f8fafc" }}>
      <div style={{ width:236,background:"#0f172a",display:"flex",flexDirection:"column",flexShrink:0 }}>
        <div style={{ padding:"20px 16px 16px",borderBottom:"1px solid #1e293b" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ background:"#2563eb",borderRadius:8,padding:8 }}><Ic d={IC.building} c="#fff" s={19}/></div>
            <div><div style={{ color:"#fff",fontWeight:800,fontSize:14 }}>ERP BTP</div><div style={{ color:"#475569",fontSize:11 }}>Gestion d'entreprise</div></div>
          </div>
        </div>
        <nav style={{ padding:"10px 8px",flex:1 }}>
          {navItems.map(n=>(
            <button key={n.id} onClick={()=>setPage(n.id)} style={{ width:"100%",display:"flex",alignItems:"center",gap:9,padding:"9px 11px",borderRadius:8,border:"none",cursor:"pointer",marginBottom:2,background:activePage===n.id?"#2563eb":"transparent",color:activePage===n.id?"#fff":"#94a3b8",fontWeight:activePage===n.id?600:400,fontSize:13,textAlign:"left" }}>
              <Ic d={n.ic} s={16} c={activePage===n.id?"#fff":"#64748b"}/> {n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding:"14px 14px 16px",borderTop:"1px solid #1e293b" }}>
          <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:10 }}>
            <div style={{ width:32,height:32,borderRadius:99,background:rc+"33",display:"flex",alignItems:"center",justifyContent:"center" }}><Ic d={IC.user} s={15} c={rc}/></div>
            <div><div style={{ fontSize:12,fontWeight:600,color:"#e2e8f0" }}>{user.name}</div><div style={{ fontSize:11,color:"#475569" }}>{ROLES[user.role]}</div></div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 10px",background:"#1e293b",borderRadius:7,marginBottom:8 }}>
            <div style={{ width:7,height:7,borderRadius:99,background:online?"#22c55e":"#dc2626",flexShrink:0 }}/>
            <span style={{ fontSize:11,color:"#64748b" }}>{online?(lastSync?`Firebase · ${lastSync}`:"Firebase connecté"):"Hors ligne"}</span>
          </div>
          <button onClick={()=>setUser(null)} style={{ width:"100%",background:"#1e293b",border:"none",borderRadius:7,padding:"7px 0",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,color:"#94a3b8",fontSize:12 }}>
            <Ic d={IC.logout} s={14} c="#94a3b8"/> Déconnexion
          </button>
        </div>
      </div>
      <div style={{ flex:1,overflow:"auto",padding:26 }}>{pages[activePage]}</div>
      {toast&&<Toast msg={toast.msg} type={toast.type}/>}
    </div>
  );
}