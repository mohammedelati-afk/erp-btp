import { useState, useEffect, useCallback, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import * as XLSX from "xlsx";

// ─── FIREBASE ─────────────────────────────────────────────────────────────────
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

// ─── ICONS ────────────────────────────────────────────────────────────────────
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
  upload:    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  download:  "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  excel:     "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
  pdf:       "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h3",
  calendar:  "M3 4h18v18H3z M16 2v4 M8 2v4 M3 10h18",
  congé:     "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
};
const Ic = ({ d, s = 17, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d={d} /></svg>
);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt  = n => new Intl.NumberFormat("fr-MA").format(n) + " DH";
const fmtM = n => { if (n >= 1e6) return (n / 1e6).toFixed(2) + " M DH"; if (n >= 1e3) return (n / 1e3).toFixed(0) + " K DH"; return n + " DH"; };
const now  = () => new Date().toLocaleString("fr-MA");

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

// Sous-catégories par catégorie
const SOUS_CATS = {
  "Main d'œuvre": ["Maçonnerie","Ferraillage","Coffrage","Finition","Manœuvre","Autre"],
  "Matériaux":    ["Ciment","Fer / Acier","Sable","Gravier","Tout-venant","Parpaing","Bois","Carrelage","Peinture","Autre"],
  "Électricité":  ["Câblage","Tableau électrique","Luminaires","Prises / Interrupteurs","Autre"],
  "Plomberie":    ["Tuyauterie","Sanitaires","Robinetterie","Chauffe-eau","Autre"],
  "Équipement":   ["Location grue","Location engin","Outillage","Échafaudage","Autre"],
  "Transport":    ["Camion","Livraison matériaux","Autre"],
  "Sous-traitance":["Gros œuvre","Second œuvre","Étanchéité","Menuiserie","Autre"],
  "Divers":       ["Frais administratifs","Assurance","Taxes","Autre"],
};
const CATS = Object.keys(SOUS_CATS);

const SEED = {
  marches: [
    { id:1, ref:"MRC-2024-001", titre:"Construction immeuble résidentiel A", maitreOuvrage:"Ville de Casablanca", maitreOuvrageDelegue:"", montant:85000000, statut:"En cours", dateDebut:"2024-01-15", dateFin:"2025-06-30", dateOuverturePlis:"2023-12-01", delaiExecution:18, cautionProvisoire:850000, cautionDefinitive:1700000, responsable:"Karim Boudiaf", avancement:45 },
    { id:2, ref:"MRC-2024-002", titre:"Réhabilitation route nationale RN5",  maitreOuvrage:"Direction des Travaux Publics", maitreOuvrageDelegue:"", montant:42000000, statut:"Terminé",  dateDebut:"2023-06-01", dateFin:"2024-03-31", dateOuverturePlis:"2023-04-15", delaiExecution:10, cautionProvisoire:420000, cautionDefinitive:840000, responsable:"Samir Merabti", avancement:100 },
  ],
  decomptes: [
    { id:1, marcheId:1, numero:"DC-001", periode:"Janvier 2025", montant:3800000, dateDepot:"2025-01-31", statut:"Payé" },
    { id:2, marcheId:1, numero:"DC-002", periode:"Février 2025", montant:4200000, dateDepot:"2025-02-28", statut:"En attente" },
  ],
  depenses: [
    { id:1, marcheId:1, categorie:"Main d'œuvre", sousCat:"Maçonnerie", description:"Salaires équipe - Janvier", montant:12000, date:"2025-01-31", fournisseur:"Interne", modePaiement:"Virement", datePaiement:"2025-01-31", statut:"Payé" },
    { id:2, marcheId:1, categorie:"Matériaux", sousCat:"Ciment", description:"500 sacs ciment CEM II", montant:8500, date:"2025-01-15", fournisseur:"SCIMAT", modePaiement:"Chèque", datePaiement:"2025-02-15", statut:"Chèque déposé" },
    { id:3, marcheId:1, categorie:"Équipement", sousCat:"Location grue", description:"Location grue mobile", montant:4500, date:"2025-01-20", fournisseur:"TechLoc BTP", modePaiement:"Espèces", datePaiement:"2025-01-20", statut:"Payé" },
  ],
  employes: [
    { id:1, matricule:"EMP-001", nom:"Boudiaf", prenom:"Karim",   poste:"Chef de chantier",   salaire:9500, dateEmbauche:"2020-03-01", statut:"Actif", affectation:"MRC-2024-001", conges:[], historiquesSalaires:[] },
    { id:2, matricule:"EMP-002", nom:"Merabti", prenom:"Samir",   poste:"Conducteur travaux", salaire:8500, dateEmbauche:"2019-07-15", statut:"Actif", affectation:"MRC-2025-001", conges:[], historiquesSalaires:[] },
    { id:3, matricule:"EMP-003", nom:"Hamdi",   prenom:"Leila",   poste:"Comptable",          salaire:7200, dateEmbauche:"2021-01-10", statut:"Actif", affectation:"Siège",        conges:[], historiquesSalaires:[] },
  ],
  log: [],
};

// ─── FIREBASE ─────────────────────────────────────────────────────────────────
async function fbLoad() { try { const s = await getDoc(DATA_DOC); return s.exists() ? s.data() : null; } catch { return null; } }
async function fbSave(data) { try { await setDoc(DATA_DOC, data); } catch (e) { console.error(e); } }

// ─── EXPORT HELPERS ───────────────────────────────────────────────────────────
function exportCSV(rows, headers, filename) {
  const sep = ";";
  const lines = [headers.join(sep), ...rows.map(r => r.map(c => `"${String(c||"").replace(/"/g,'""')}"`).join(sep))];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename + ".csv"; a.click();
}

function exportHTML(title, tableHTML, filename) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
  <style>body{font-family:Arial,sans-serif;padding:20px}h2{color:#1e293b}table{width:100%;border-collapse:collapse;font-size:13px}
  th{background:#2563eb;color:#fff;padding:8px 10px;text-align:left}td{padding:7px 10px;border-bottom:1px solid #e2e8f0}
  tr:nth-child(even){background:#f8fafc}.total{font-weight:bold;background:#f1f5f9}</style>
  </head><body><h2>${title}</h2>${tableHTML}</body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename + ".html"; a.click();
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
const stColors = {
  "En cours":    { bg:"#dbeafe",tx:"#1d4ed8" }, "Terminé":      { bg:"#dcfce7",tx:"#15803d" },
  "Signé":       { bg:"#fef9c3",tx:"#a16207" }, "Brouillon":    { bg:"#f3f4f6",tx:"#6b7280" },
  "Payé":        { bg:"#dcfce7",tx:"#15803d" }, "En attente":   { bg:"#fef9c3",tx:"#a16207" },
  "Soumis":      { bg:"#dbeafe",tx:"#1d4ed8" }, "Actif":        { bg:"#dcfce7",tx:"#15803d" },
  "Inactif":     { bg:"#fee2e2",tx:"#dc2626" }, "Chèque déposé":{ bg:"#f3e8ff",tx:"#7c3aed" },
  "Non payé":    { bg:"#fee2e2",tx:"#dc2626" },
};
const Badge = ({ s }) => { const c = stColors[s]||{bg:"#f3f4f6",tx:"#374151"}; return <span style={{ background:c.bg,color:c.tx,padding:"2px 10px",borderRadius:99,fontSize:12,fontWeight:600,whiteSpace:"nowrap" }}>{s}</span>; };

const Modal = ({ title, onClose, children, wide }) => (
  <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
    <div style={{ background:"#fff",borderRadius:14,padding:28,width:wide?660:500,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,0.22)" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h3 style={{ margin:0,fontSize:17,fontWeight:700,color:"#1e293b" }}>{title}</h3>
        <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"#94a3b8" }}><Ic d={IC.close}/></button>
      </div>
      {children}
    </div>
  </div>
);
const Field = ({ label, children }) => (
  <div style={{ marginBottom:13 }}>
    <label style={{ display:"block",fontSize:11,fontWeight:700,color:"#64748b",marginBottom:4,textTransform:"uppercase",letterSpacing:0.4 }}>{label}</label>
    {children}
  </div>
);
const Inp = ({ ...p }) => <input {...p} style={{ width:"100%",padding:"7px 10px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:13,color:"#1e293b",boxSizing:"border-box",outline:"none",background:"#fff",...p.style }}/>;
const Sel = ({ children, ...p }) => <select {...p} style={{ width:"100%",padding:"7px 10px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:13,color:"#1e293b",boxSizing:"border-box",background:"#fff",...p.style }}>{children}</select>;
const Btn = ({ children, onClick, v="primary", sm, sx }) => {
  const vs = { primary:{bg:"#2563eb",c:"#fff"},danger:{bg:"#dc2626",c:"#fff"},ghost:{bg:"#f1f5f9",c:"#374151"},success:{bg:"#16a34a",c:"#fff"},warning:{bg:"#f59e0b",c:"#fff"} };
  const st = vs[v]||vs.primary;
  return <button onClick={onClick} style={{ background:st.bg,color:st.c,border:"none",borderRadius:8,padding:sm?"4px 10px":"7px 15px",fontSize:sm?11:13,fontWeight:600,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:5,...sx }}>{children}</button>;
};
const G2 = ({ children }) => <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:11 }}>{children}</div>;
const G3 = ({ children }) => <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11 }}>{children}</div>;
const Toast = ({ msg, type }) => {
  const bg = type==="success"?"#16a34a":type==="error"?"#dc2626":"#2563eb";
  return <div style={{ position:"fixed",bottom:24,right:24,background:bg,color:"#fff",padding:"11px 18px",borderRadius:10,fontSize:13,fontWeight:600,zIndex:2000,display:"flex",alignItems:"center",gap:8,boxShadow:"0 8px 30px rgba(0,0,0,0.18)" }}><Ic d={type==="success"?IC.check:IC.alert} s={15} c="#fff"/> {msg}</div>;
};

// ─── TABLE ────────────────────────────────────────────────────────────────────
const TH = ({ children }) => <th style={{ padding:"10px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:0.5,background:"#f8fafc" }}>{children}</th>;
const TD = ({ children, bold, color }) => <td style={{ padding:"10px 12px",fontSize:13,color:color||"#374151",fontWeight:bold?700:400,borderBottom:"1px solid #f8fafc" }}>{children}</td>;

// ─── LOGIN ────────────────────────────────────────────────────────────────────
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
          <h2 style={{ margin:0,fontSize:20,fontWeight:800,color:"#1e293b" }}>ERP BTP Maroc</h2>
          <p style={{ margin:"5px 0 0",fontSize:12,color:"#94a3b8" }}>Gestion de chantiers · Firebase</p>
        </div>
        {!sel ? (
          <>
            <p style={{ fontSize:13,color:"#64748b",marginBottom:12 }}>Choisissez votre compte :</p>
            {USERS.map(u => (
              <button key={u.id} onClick={() => setSel(u)} style={{ width:"100%",display:"flex",alignItems:"center",gap:12,padding:"11px 14px",border:"1px solid #e2e8f0",borderRadius:10,background:"#fafafa",cursor:"pointer",marginBottom:7,textAlign:"left" }}>
                <div style={{ width:36,height:36,borderRadius:99,background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center" }}><Ic d={IC.user} s={17} c="#2563eb"/></div>
                <div><div style={{ fontSize:13,fontWeight:600,color:"#1e293b" }}>{u.name}</div><div style={{ fontSize:11,color:"#94a3b8" }}>{ROLES[u.role]}</div></div>
              </button>
            ))}
          </>
        ) : (
          <>
            <div style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 13px",background:"#eff6ff",borderRadius:10,marginBottom:18 }}>
              <Ic d={IC.user} s={17} c="#2563eb"/>
              <div><div style={{ fontSize:13,fontWeight:600,color:"#1e293b" }}>{sel.name}</div><div style={{ fontSize:11,color:"#64748b" }}>{ROLES[sel.role]}</div></div>
              <button onClick={() => { setSel(null); setPin(""); setErr(""); }} style={{ marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:11 }}>Changer</button>
            </div>
            <Field label="Code PIN"><Inp type="password" maxLength={4} value={pin} onChange={e => { setPin(e.target.value); setErr(""); }} onKeyDown={e => e.key==="Enter" && tryLogin()} placeholder="• • • •" style={{ letterSpacing:8,fontSize:22,textAlign:"center" }}/></Field>
            {err && <p style={{ color:"#dc2626",fontSize:12,margin:"6px 0" }}>{err}</p>}
            <Btn onClick={tryLogin} sx={{ width:"100%",justifyContent:"center",marginTop:6 }}><Ic d={IC.lock} s={14} c="#fff"/> Se connecter</Btn>
            <p style={{ fontSize:10,color:"#94a3b8",textAlign:"center",marginTop:10 }}>admin:0000 | chef:1111 | compta:2222 | rh:3333</p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ data, user }) {
  // Marchés en cours
  const marchesEnCours = data.marches.filter(m => m.statut==="En cours");
  const nbEnCours      = marchesEnCours.length;
  const montantEnCours = marchesEnCours.reduce((s,m) => s+m.montant, 0);

  // Dépenses liées aux marchés en cours
  const idsEnCours   = marchesEnCours.map(m => m.id);
  const depEnCours   = data.depenses.filter(d => idsEnCours.includes(d.marcheId)).reduce((s,d) => s+d.montant, 0);

  // Décomptes non payés des marchés réceptionnés (Terminé)
  const marchesTermines = data.marches.filter(m => m.statut==="Terminé").map(m => m.id);
  const dcNonPayes      = data.decomptes.filter(d => marchesTermines.includes(d.marcheId) && d.statut!=="Payé").reduce((s,d) => s+d.montant, 0);

  const recentLog = [...(data.log||[])].reverse().slice(0,8);
  const cards = [
    { label:"Marchés en cours",              val:nbEnCours,            ic:IC.building,  c:"#2563eb",bg:"#eff6ff", sub:"marchés actifs" },
    { label:"Montant marchés en cours",      val:fmtM(montantEnCours), ic:IC.marches,   c:"#7c3aed",bg:"#f5f3ff", sub:"valeur totale" },
    { label:"Dépenses marchés en cours",     val:fmtM(depEnCours),     ic:IC.depenses,  c:"#dc2626",bg:"#fef2f2", sub:"charges en cours" },
    { label:"Décomptes non payés (clôturés)",val:fmtM(dcNonPayes),     ic:IC.decomptes, c:"#f59e0b",bg:"#fffbeb", sub:"à encaisser" },
  ];
  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h2 style={{ margin:0,color:"#1e293b",fontSize:20,fontWeight:800 }}>Tableau de bord</h2>
        <p style={{ margin:"3px 0 0",fontSize:12,color:"#94a3b8" }}>Bienvenue, {user.name} — {ROLES[user.role]}</p>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:22 }}>
        {cards.map((c,i) => (
          <div key={i} style={{ background:"#fff",borderRadius:12,padding:17,border:"1px solid #f1f5f9",boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:11,color:"#94a3b8",marginBottom:5 }}>{c.label}</div>
                <div style={{ fontSize:19,fontWeight:800,color:"#1e293b" }}>{c.val}</div>
                <div style={{ fontSize:10,color:"#94a3b8",marginTop:3 }}>{c.sub}</div>
              </div>
              <div style={{ background:c.bg,borderRadius:9,padding:9 }}><Ic d={c.ic} c={c.c} s={19}/></div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:14 }}>
        <div style={{ background:"#fff",borderRadius:12,padding:18,border:"1px solid #f1f5f9" }}>
          <h3 style={{ margin:"0 0 15px",fontSize:13,fontWeight:700,color:"#1e293b" }}>Avancement des marchés</h3>
          {data.marches.map(m => (
            <div key={m.id} style={{ marginBottom:13 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                <span style={{ fontSize:12,color:"#374151",fontWeight:600 }}>{m.ref} — {m.titre.substring(0,30)}</span>
                <span style={{ fontSize:11,color:"#94a3b8" }}>{m.avancement}%</span>
              </div>
              <div style={{ background:"#f1f5f9",borderRadius:99,height:6 }}>
                <div style={{ width:`${m.avancement}%`,background:m.avancement===100?"#16a34a":"#2563eb",borderRadius:99,height:"100%",transition:"width .5s" }}/>
              </div>
              <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>{m.maitreOuvrage} · Resp: {m.responsable}</div>
            </div>
          ))}
        </div>
        <div style={{ background:"#fff",borderRadius:12,padding:18,border:"1px solid #f1f5f9" }}>
          <h3 style={{ margin:"0 0 13px",fontSize:13,fontWeight:700,color:"#1e293b",display:"flex",alignItems:"center",gap:6 }}><Ic d={IC.history} s={14} c="#2563eb"/> Journal Firebase</h3>
          {recentLog.length===0 && <p style={{ fontSize:12,color:"#94a3b8" }}>Aucune modification.</p>}
          {recentLog.map((l,i) => (
            <div key={i} style={{ padding:"6px 0",borderBottom:"1px solid #f8fafc",fontSize:11 }}>
              <span style={{ fontWeight:600,color:"#2563eb" }}>{l.user}</span>
              <span style={{ color:"#64748b" }}> — {l.action}</span>
              <div style={{ color:"#cbd5e1",fontSize:10 }}>{l.at}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MARCHÉS ──────────────────────────────────────────────────────────────────
function FicheMarche({ marche, data, onClose }) {
  const depenses = data.depenses.filter(d => d.marcheId === marche.id);
  const decomptes = data.decomptes.filter(d => d.marcheId === marche.id);
  const totalDep = depenses.reduce((s,d) => s+d.montant, 0);
  const totalDC  = decomptes.filter(d => d.statut==="Payé").reduce((s,d) => s+d.montant, 0);
  const today = new Date();
  const dateFin = new Date(marche.dateFin);
  const joursRestants = Math.ceil((dateFin - today) / (1000*60*60*24));
  const catC = { "Main d'œuvre":"#7c3aed","Matériaux":"#2563eb","Électricité":"#f59e0b","Plomberie":"#0891b2","Équipement":"#06b6d4","Transport":"#16a34a","Sous-traitance":"#ea580c","Divers":"#64748b" };

  return (
    <Modal title={`Fiche marché — ${marche.ref}`} onClose={onClose} wide>
      {/* Alerte délai */}
      {joursRestants <= 30 && marche.statut !== "Terminé" && (
        <div style={{ background: joursRestants <= 0 ? "#fee2e2" : "#fef9c3", border:`1px solid ${joursRestants<=0?"#dc2626":"#f59e0b"}`, borderRadius:8, padding:"10px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
          <Ic d={IC.alert} s={16} c={joursRestants<=0?"#dc2626":"#a16207"}/>
          <span style={{ fontSize:13, fontWeight:600, color: joursRestants<=0?"#dc2626":"#a16207" }}>
            {joursRestants <= 0 ? `Délai dépassé de ${Math.abs(joursRestants)} jours !` : `Délai expire dans ${joursRestants} jours !`}
          </span>
        </div>
      )}

      {/* Infos générales */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
        {[
          ["Intitulé", marche.titre],
          ["Maître d'ouvrage", marche.maitreOuvrage],
          ["MOD", marche.maitreOuvrageDelegue||"—"],
          ["Responsable", marche.responsable],
          ["Montant marché", fmt(marche.montant)],
          ["Statut", marche.statut],
          ["Date ouverture plis", marche.dateOuverturePlis],
          ["Délai d'exécution", marche.delaiExecution+" mois"],
          ["Date début", marche.dateDebut],
          ["Date fin", marche.dateFin],
          ["Caution provisoire", fmt(marche.cautionProvisoire||0)],
          ["Caution définitive", fmt(marche.cautionDefinitive||0)],
        ].map(([l,v]) => (
          <div key={l} style={{ background:"#f8fafc", borderRadius:7, padding:"8px 12px" }}>
            <div style={{ fontSize:10, color:"#94a3b8", fontWeight:700, textTransform:"uppercase" }}>{l}</div>
            <div style={{ fontSize:13, fontWeight:600, color:"#1e293b", marginTop:2 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
        <div style={{ background:"#fef2f2", borderRadius:8, padding:12 }}>
          <div style={{ fontSize:10, color:"#94a3b8" }}>Total dépenses</div>
          <div style={{ fontSize:16, fontWeight:800, color:"#dc2626" }}>{fmtM(totalDep)}</div>
        </div>
        <div style={{ background:"#f0fdf4", borderRadius:8, padding:12 }}>
          <div style={{ fontSize:10, color:"#94a3b8" }}>Acomptes encaissés</div>
          <div style={{ fontSize:16, fontWeight:800, color:"#16a34a" }}>{fmtM(totalDC)}</div>
        </div>
        <div style={{ background:"#eff6ff", borderRadius:8, padding:12 }}>
          <div style={{ fontSize:10, color:"#94a3b8" }}>Avancement</div>
          <div style={{ fontSize:16, fontWeight:800, color:"#2563eb" }}>{marche.avancement}%</div>
        </div>
      </div>

      {/* Historique décomptes */}
      <h4 style={{ margin:"0 0 8px", fontSize:13, color:"#1e293b" }}>📋 Historique des décomptes</h4>
      {decomptes.length === 0 ? <p style={{ fontSize:12, color:"#94a3b8", marginBottom:16 }}>Aucun décompte.</p> :
        <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:18, fontSize:12 }}>
          <thead><tr style={{ background:"#f8fafc" }}><TH>N°</TH><TH>Période</TH><TH>Montant</TH><TH>Date dépôt</TH><TH>Statut</TH></tr></thead>
          <tbody>{decomptes.map(dc=><tr key={dc.id}><TD bold color="#2563eb">{dc.numero}</TD><TD>{dc.periode}</TD><TD bold color="#16a34a">{fmt(dc.montant)}</TD><TD>{dc.dateDepot}</TD><td style={{ padding:"8px 12px" }}><Badge s={dc.statut}/></td></tr>)}</tbody>
        </table>
      }

      {/* Historique dépenses */}
      <h4 style={{ margin:"0 0 8px", fontSize:13, color:"#1e293b" }}>💸 Historique des dépenses</h4>
      {depenses.length === 0 ? <p style={{ fontSize:12, color:"#94a3b8" }}>Aucune dépense.</p> :
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ background:"#f8fafc" }}><TH>Date</TH><TH>Catégorie</TH><TH>Description</TH><TH>Fournisseur</TH><TH>Montant</TH><TH>Statut</TH></tr></thead>
          <tbody>{depenses.map(dep=>(
            <tr key={dep.id}>
              <TD>{dep.date}</TD>
              <td style={{ padding:"8px 12px" }}><span style={{ background:(catC[dep.categorie]||"#64748b")+"22", color:catC[dep.categorie]||"#64748b", padding:"2px 7px", borderRadius:99, fontSize:11, fontWeight:600 }}>{dep.categorie}</span></td>
              <TD>{dep.description}</TD>
              <TD>{dep.fournisseur}</TD>
              <TD bold color="#dc2626">{fmt(dep.montant)}</TD>
              <td style={{ padding:"8px 12px" }}><Badge s={dep.statut}/></td>
            </tr>
          ))}</tbody>
          <tfoot><tr style={{ background:"#f8fafc" }}>
            <td colSpan={4} style={{ padding:"8px 12px", fontWeight:700, fontSize:12 }}>TOTAL</td>
            <td style={{ padding:"8px 12px", fontWeight:700, fontSize:12, color:"#dc2626" }}>{fmt(totalDep)}</td>
            <td/>
          </tr></tfoot>
        </table>
      }
    </Modal>
  );
}

function Marches({ data, setData, user, addLog, showToast }) {
  const canEdit = user.role==="admin"||user.role==="chef";
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [fiche, setFiche] = useState(null);
  const sf = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  // Alertes délai
  useEffect(() => {
    const today = new Date();
    data.marches.forEach(m => {
      if (m.statut === "Terminé") return;
      const fin = new Date(m.dateFin);
      const jours = Math.ceil((fin - today) / (1000*60*60*24));
      if (jours <= 30) {
        console.log(`ALERTE: Marché ${m.ref} expire dans ${jours} jours`);
      }
    });
  }, [data.marches]);

  const blank = { ref:"",titre:"",maitreOuvrage:"",maitreOuvrageDelegue:"",responsable:"",montant:"",statut:"Signé",dateDebut:"",dateFin:"",dateOuverturePlis:"",delaiExecution:"",cautionProvisoire:"",cautionDefinitive:"",avancement:0 };
  const openNew  = () => { setForm(blank); setModal("new"); };
  const openEdit = m => { setForm({...m}); setModal("edit"); };
  const save = () => {
    const isNew = modal==="new";
    const item = { ...form, id:isNew?Date.now():form.id, montant:+form.montant, avancement:+form.avancement, delaiExecution:+form.delaiExecution, cautionProvisoire:+form.cautionProvisoire, cautionDefinitive:+form.cautionDefinitive };
    setData(d => ({ ...d, marches:isNew?[...d.marches,item]:d.marches.map(m=>m.id===item.id?item:m) }));
    addLog(isNew?`Ajout marché ${form.ref}`:`Modif marché ${form.ref}`);
    showToast(isNew?"Marché ajouté !":"Marché modifié !"); setModal(null);
  };
  const del = id => { const m=data.marches.find(x=>x.id===id); if(window.confirm("Supprimer ce marché ?")){ setData(d=>({...d,marches:d.marches.filter(x=>x.id!==id)})); addLog(`Suppression marché ${m?.ref}`); } };

  const exportMarches = () => {
    exportCSV(
      data.marches.map(m => [m.ref,m.titre,m.maitreOuvrage,m.maitreOuvrageDelegue||"—",m.responsable,m.montant,m.statut,m.dateOuverturePlis,m.delaiExecution+" mois",m.cautionProvisoire,m.cautionDefinitive,m.avancement+"%"]),
      ["Référence","Intitulé","Maître d'ouvrage","MOD","Responsable","Montant (DH)","Statut","Date ouverture plis","Délai","Caution prov.","Caution déf.","Avancement"],
      "marchés"
    );
    showToast("Export CSV réussi !");
  };

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h2 style={{ margin:0,fontSize:19,fontWeight:800,color:"#1e293b" }}>Marchés & Contrats</h2>
        <div style={{ display:"flex",gap:8 }}>
          <Btn v="ghost" onClick={exportMarches}><Ic d={IC.download} s={14}/> Export CSV</Btn>
          {canEdit && <Btn onClick={openNew}><Ic d={IC.plus} s={14} c="#fff"/> Nouveau marché</Btn>}
        </div>
      </div>
      <div style={{ background:"#fff",borderRadius:12,overflow:"hidden",border:"1px solid #f1f5f9" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead><tr>
            <TH>Référence</TH><TH>Intitulé</TH><TH>Maître d'ouvrage</TH><TH>Responsable</TH><TH>Montant</TH><TH>Délai</TH><TH>Avancement</TH><TH>Statut</TH><TH>Actions</TH>
          </tr></thead>
          <tbody>{data.marches.map(m => (
            <tr key={m.id}>
              <TD bold color="#2563eb">{m.ref}</TD>
              <TD>{m.titre.substring(0,28)}</TD>
              <TD>{m.maitreOuvrage}</TD>
              <TD>{m.responsable}</TD>
              <TD bold>{fmtM(m.montant)}</TD>
              <TD>{m.delaiExecution} mois</TD>
              <td style={{ padding:"10px 12px" }}>
                <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <div style={{ width:70,background:"#f1f5f9",borderRadius:99,height:5 }}><div style={{ width:`${m.avancement}%`,background:"#2563eb",borderRadius:99,height:"100%" }}/></div>
                  <span style={{ fontSize:11,color:"#94a3b8" }}>{m.avancement}%</span>
                </div>
              </td>
              <td style={{ padding:"10px 12px" }}><Badge s={m.statut}/></td>
              <td style={{ padding:"10px 12px" }}>
                <div style={{ display:"flex", gap:4 }}>
                  <Btn sm v="primary" onClick={()=>setFiche(m)} title="Voir fiche"><Ic d={IC.history} s={12} c="#fff"/></Btn>
                  {canEdit&&<><Btn sm v="ghost" onClick={()=>openEdit(m)}><Ic d={IC.edit} s={12}/></Btn>
                  <Btn sm v="danger" onClick={()=>del(m.id)}><Ic d={IC.trash} s={12}/></Btn></>}
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {fiche && <FicheMarche marche={fiche} data={data} onClose={()=>setFiche(null)}/>}

      {modal&&canEdit&&(
        <Modal title={modal==="new"?"Nouveau marché":"Modifier le marché"} onClose={()=>setModal(null)} wide>
          <G2>
            <Field label="Référence"><Inp value={form.ref} onChange={sf("ref")} placeholder="MRC-2025-XXX"/></Field>
            <Field label="Statut"><Sel value={form.statut} onChange={sf("statut")}>{["Brouillon","Signé","En cours","Terminé"].map(s=><option key={s}>{s}</option>)}</Sel></Field>
          </G2>
          <Field label="Intitulé du marché"><Inp value={form.titre} onChange={sf("titre")}/></Field>
          <G2>
            <Field label="Maître d'ouvrage"><Inp value={form.maitreOuvrage} onChange={sf("maitreOuvrage")}/></Field>
            <Field label="Maître d'ouvrage délégué"><Inp value={form.maitreOuvrageDelegue} onChange={sf("maitreOuvrageDelegue")} placeholder="Optionnel"/></Field>
          </G2>
          <G2>
            <Field label="Responsable du chantier"><Inp value={form.responsable} onChange={sf("responsable")}/></Field>
            <Field label="Montant (DH)"><Inp type="number" value={form.montant} onChange={sf("montant")}/></Field>
          </G2>
          <G3>
            <Field label="Date ouverture des plis"><Inp type="date" value={form.dateOuverturePlis} onChange={sf("dateOuverturePlis")}/></Field>
            <Field label="Date début"><Inp type="date" value={form.dateDebut} onChange={sf("dateDebut")}/></Field>
            <Field label="Date fin"><Inp type="date" value={form.dateFin} onChange={sf("dateFin")}/></Field>
          </G3>
          <G3>
            <Field label="Délai d'exécution (mois)"><Inp type="number" value={form.delaiExecution} onChange={sf("delaiExecution")}/></Field>
            <Field label="Caution provisoire (DH)"><Inp type="number" value={form.cautionProvisoire} onChange={sf("cautionProvisoire")}/></Field>
            <Field label="Caution définitive (DH)"><Inp type="number" value={form.cautionDefinitive} onChange={sf("cautionDefinitive")}/></Field>
          </G3>
          <Field label="Avancement (%)"><Inp type="number" min="0" max="100" value={form.avancement} onChange={sf("avancement")}/></Field>
          <div style={{ display:"flex",justifyContent:"flex-end",gap:8,marginTop:16 }}>
            <Btn v="ghost" onClick={()=>setModal(null)}>Annuler</Btn>
            <Btn onClick={save}><Ic d={IC.check} s={13} c="#fff"/> Enregistrer</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── DÉCOMPTES ────────────────────────────────────────────────────────────────
function Decomptes({ data, setData, user, addLog, showToast }) {
  const canEdit = user.role==="admin"||user.role==="comptable";
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const sf = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const blank = { marcheId:data.marches[0]?.id||"", numero:"", periode:"", montant:"", dateDepot:"", statut:"Soumis" };
  const openNew  = () => { setForm(blank); setModal("new"); };
  const openEdit = dc => { setForm({...dc}); setModal("edit"); };
  const save = () => {
    const isNew = modal==="new";
    const item = { ...form, id:isNew?Date.now():form.id, marcheId:+form.marcheId, montant:+form.montant };
    setData(d => ({ ...d, decomptes:isNew?[...d.decomptes,item]:d.decomptes.map(x=>x.id===item.id?item:x) }));
    addLog(isNew?`Ajout décompte ${form.numero}`:`Modif décompte ${form.numero}`);
    showToast(isNew?"Décompte ajouté !":"Décompte modifié !"); setModal(null);
  };
  const del = id => { const dc=data.decomptes.find(x=>x.id===id); if(window.confirm("Supprimer ?")){ setData(d=>({...d,decomptes:d.decomptes.filter(x=>x.id!==id)})); addLog(`Suppression décompte ${dc?.numero}`); } };
  const updSt = (id,s) => { const dc=data.decomptes.find(x=>x.id===id); setData(d=>({...d,decomptes:d.decomptes.map(x=>x.id===id?{...x,statut:s}:x)})); addLog(`Statut décompte ${dc?.numero} → ${s}`); };

  const exportDecomptes = () => {
    exportCSV(
      data.decomptes.map(dc => { const m=data.marches.find(x=>x.id===dc.marcheId); return [dc.numero,m?.ref||"",dc.periode,dc.montant,dc.dateDepot,dc.statut]; }),
      ["N° Décompte","Marché","Période","Montant (DH)","Date dépôt","Statut"],
      "décomptes"
    );
    showToast("Export CSV réussi !");
  };

  const total = data.decomptes.reduce((s,d)=>s+d.montant,0);
  const totalPayé = data.decomptes.filter(d=>d.statut==="Payé").reduce((s,d)=>s+d.montant,0);

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h2 style={{ margin:0,fontSize:19,fontWeight:800,color:"#1e293b" }}>Décomptes & Acomptes</h2>
        <div style={{ display:"flex",gap:8 }}>
          <Btn v="ghost" onClick={exportDecomptes}><Ic d={IC.download} s={14}/> Export CSV</Btn>
          {canEdit && <Btn onClick={openNew}><Ic d={IC.plus} s={14} c="#fff"/> Nouveau décompte</Btn>}
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16 }}>
        <div style={{ background:"#fff",borderRadius:10,padding:14,border:"1px solid #f1f5f9" }}>
          <div style={{ fontSize:11,color:"#94a3b8" }}>Total décomptes</div>
          <div style={{ fontSize:18,fontWeight:800,color:"#2563eb" }}>{fmtM(total)}</div>
        </div>
        <div style={{ background:"#fff",borderRadius:10,padding:14,border:"1px solid #f1f5f9" }}>
          <div style={{ fontSize:11,color:"#94a3b8" }}>Total encaissé</div>
          <div style={{ fontSize:18,fontWeight:800,color:"#16a34a" }}>{fmtM(totalPayé)}</div>
        </div>
      </div>
      <div style={{ background:"#fff",borderRadius:12,overflow:"hidden",border:"1px solid #f1f5f9" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead><tr><TH>N°</TH><TH>Marché</TH><TH>Période</TH><TH>Montant</TH><TH>Date dépôt</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>{data.decomptes.map(dc => {
            const m = data.marches.find(x=>x.id===dc.marcheId);
            return (
              <tr key={dc.id}>
                <TD bold color="#2563eb">{dc.numero}</TD>
                <TD>{m?.ref||"—"}</TD>
                <TD>{dc.periode}</TD>
                <TD bold color="#16a34a">{fmtM(dc.montant)}</TD>
                <TD>{dc.dateDepot}</TD>
                <td style={{ padding:"10px 12px" }}>
                  {canEdit
                    ? <Sel value={dc.statut} onChange={e=>updSt(dc.id,e.target.value)} style={{ width:"auto",padding:"3px 7px",fontSize:12 }}>{["Soumis","En attente","Payé"].map(s=><option key={s}>{s}</option>)}</Sel>
                    : <Badge s={dc.statut}/>}
                </td>
                <td style={{ padding:"10px 12px" }}>{canEdit&&<div style={{ display:"flex",gap:4 }}>
                  <Btn sm v="ghost" onClick={()=>openEdit(dc)}><Ic d={IC.edit} s={12}/></Btn>
                  <Btn sm v="danger" onClick={()=>del(dc.id)}><Ic d={IC.trash} s={12}/></Btn>
                </div>}</td>
              </tr>
            );
          })}</tbody>
          <tfoot><tr style={{ background:"#f8fafc" }}>
            <td colSpan={3} style={{ padding:"10px 12px",fontWeight:700,fontSize:13 }}>TOTAL</td>
            <td style={{ padding:"10px 12px",fontWeight:700,fontSize:13,color:"#16a34a" }}>{fmtM(total)}</td>
            <td colSpan={3}/>
          </tr></tfoot>
        </table>
      </div>

      {modal&&canEdit&&(
        <Modal title={modal==="new"?"Nouveau décompte":"Modifier le décompte"} onClose={()=>setModal(null)}>
          <Field label="Marché"><Sel value={form.marcheId} onChange={sf("marcheId")}>{data.marches.map(m=><option key={m.id} value={m.id}>{m.ref} — {m.titre.substring(0,28)}</option>)}</Sel></Field>
          <G2>
            <Field label="Numéro"><Inp value={form.numero} onChange={sf("numero")} placeholder="DC-003"/></Field>
            <Field label="Période"><Inp value={form.periode} onChange={sf("periode")} placeholder="Mars 2025"/></Field>
          </G2>
          <G2>
            <Field label="Montant de l'acompte (DH)"><Inp type="number" value={form.montant} onChange={sf("montant")}/></Field>
            <Field label="Date de dépôt"><Inp type="date" value={form.dateDepot} onChange={sf("dateDepot")}/></Field>
          </G2>
          <Field label="Statut"><Sel value={form.statut} onChange={sf("statut")}>{["Soumis","En attente","Payé"].map(s=><option key={s}>{s}</option>)}</Sel></Field>
          <div style={{ display:"flex",justifyContent:"flex-end",gap:8,marginTop:16 }}>
            <Btn v="ghost" onClick={()=>setModal(null)}>Annuler</Btn>
            <Btn onClick={save}><Ic d={IC.check} s={13} c="#fff"/> Enregistrer</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── DÉPENSES ─────────────────────────────────────────────────────────────────
function Depenses({ data, setData, user, addLog, showToast }) {
  const canEdit = user.role==="admin"||user.role==="comptable";
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [filtreCat, setFiltreCat] = useState("Tous");
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const [filtreMarche, setFiltreMarche] = useState("Tous");
  const importRef = useRef();
  const sf = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const blank = { marcheId:data.marches[0]?.id||"", categorie:"Matériaux", sousCat:"Ciment", description:"", montant:"", date:"", fournisseur:"", modePaiement:"Virement", datePaiement:"", statut:"Non payé", observation:"" };
  const openNew  = () => { setForm(blank); setModal("new"); };
  const openEdit = dep => { setForm({...dep}); setModal("edit"); };
  const save = () => {
    const isNew = modal==="new";
    const item = { ...form, id:isNew?Date.now():form.id, marcheId:+form.marcheId, montant:+form.montant };
    setData(d => ({ ...d, depenses:isNew?[...d.depenses,item]:d.depenses.map(x=>x.id===item.id?item:x) }));
    addLog(isNew?`Ajout dépense ${form.categorie}`:`Modif dépense ${form.description}`);
    showToast(isNew?"Dépense ajoutée !":"Dépense modifiée !"); setModal(null);
  };
  const del = id => { const dep=data.depenses.find(x=>x.id===id); if(window.confirm("Supprimer ?")){ setData(d=>({...d,depenses:d.depenses.filter(x=>x.id!==id)})); addLog(`Suppression dépense — ${dep?.description}`); } };

  // Import Excel/CSV avec SheetJS
  const handleImport = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data_wb = new Uint8Array(ev.target.result);
        const workbook = XLSX.read(data_wb, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header:1, defval:"" });
        const dataRows = rows.slice(1).filter(r => r.some(c => c !== ""));
        const imported = dataRows.map((cols, i) => {
          const montantRaw = String(cols[2]||"").replace(/\s/g,"").replace(",",".");
          return {
            id: Date.now() + i,
            marcheId: data.marches[0]?.id || 1,
            date: cols[0] ? String(cols[0]) : "",
            description: String(cols[1]||""),
            montant: parseFloat(montantRaw) || 0,
            modePaiement: String(cols[3]||"—"),
            observation: String(cols[4]||""),
            categorie: "Matériaux",
            sousCat: "Autre",
            fournisseur: "—",
            statut: "Non payé",
            datePaiement: "",
          };
        }).filter(r => r.montant > 0);
        setData(d => ({ ...d, depenses: [...d.depenses, ...imported] }));
        addLog(`Import Excel : ${imported.length} dépenses`);
        showToast(`${imported.length} dépenses importées !`);
      } catch(err) {
        showToast("Erreur lecture fichier Excel", "error");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const filtered = data.depenses
    .filter(d => filtreMarche==="Tous" || d.marcheId===+filtreMarche)
    .filter(d => filtreCat==="Tous" || d.categorie===filtreCat)
    .filter(d => filtreStatut==="Tous" || d.statut===filtreStatut);

  const exportDep = () => {
    exportCSV(
      filtered.map(dep => { const m=data.marches.find(x=>x.id===dep.marcheId); return [dep.date,m?.ref||"",dep.categorie,dep.sousCat,dep.description,dep.fournisseur,dep.montant,dep.modePaiement,dep.datePaiement||"",dep.statut,dep.observation||""]; }),
      ["Date","Marché","Catégorie","Sous-catégorie","Description","Fournisseur","Montant (DH)","Mode paiement","Date paiement","Statut","Observation"],
      "dépenses"
    );
    showToast("Export CSV réussi !");
  };

  const catC = { "Main d'œuvre":"#7c3aed","Matériaux":"#2563eb","Électricité":"#f59e0b","Plomberie":"#0891b2","Équipement":"#06b6d4","Transport":"#16a34a","Sous-traitance":"#ea580c","Divers":"#64748b" };

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h2 style={{ margin:0,fontSize:19,fontWeight:800,color:"#1e293b" }}>Dépenses & Comptabilité</h2>
        <div style={{ display:"flex",gap:7 }}>
          <input type="file" ref={importRef} accept=".csv,.txt,.xls,.xlsx" onChange={handleImport} style={{ display:"none" }}/>
          <Btn v="success" onClick={()=>importRef.current.click()}><Ic d={IC.upload} s={13} c="#fff"/> Import Excel</Btn>
          <Btn v="ghost" onClick={exportDep}><Ic d={IC.download} s={13}/> Export CSV</Btn>
          {canEdit && <Btn onClick={openNew}><Ic d={IC.plus} s={13} c="#fff"/> Nouvelle dépense</Btn>}
        </div>
      </div>

      {/* Summary */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:11,marginBottom:16 }}>
        <div style={{ background:"#fef2f2",borderRadius:9,padding:14,border:"1px solid #fee2e2" }}>
          <div style={{ fontSize:11,color:"#94a3b8",marginBottom:4 }}>Total dépenses</div>
          <div style={{ fontSize:18,fontWeight:800,color:"#dc2626" }}>{fmtM(data.depenses.reduce((s,d)=>s+d.montant,0))}</div>
        </div>
        <div style={{ background:"#f0fdf4",borderRadius:9,padding:14,border:"1px solid #dcfce7" }}>
          <div style={{ fontSize:11,color:"#94a3b8",marginBottom:4 }}>Total payé</div>
          <div style={{ fontSize:18,fontWeight:800,color:"#16a34a" }}>{fmtM(data.depenses.filter(d=>d.statut==="Payé").reduce((s,d)=>s+d.montant,0))}</div>
        </div>
        <div style={{ background:"#f5f3ff",borderRadius:9,padding:14,border:"1px solid #ede9fe" }}>
          <div style={{ fontSize:11,color:"#94a3b8",marginBottom:4 }}>Chèques en attente</div>
          <div style={{ fontSize:18,fontWeight:800,color:"#7c3aed" }}>{fmtM(data.depenses.filter(d=>d.statut==="Chèque déposé").reduce((s,d)=>s+d.montant,0))}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:"flex",gap:6,marginBottom:8,flexWrap:"wrap",alignItems:"center" }}>
        <span style={{ fontSize:11,color:"#94a3b8",fontWeight:600 }}>Marché:</span>
        {["Tous",...data.marches.map(m=>m.id)].map(id => {
          const m = data.marches.find(x=>x.id===id);
          const label = id==="Tous" ? "Tous" : m?.ref||id;
          return <button key={id} onClick={()=>setFiltreMarche(id)} style={{ padding:"3px 11px",borderRadius:99,border:"1px solid",fontSize:11,cursor:"pointer",fontWeight:filtreMarche===id?700:400,background:filtreMarche===id?"#0f172a":"#fff",color:filtreMarche===id?"#fff":"#64748b",borderColor:filtreMarche===id?"#0f172a":"#e2e8f0" }}>{label}</button>;
        })}
      </div>
      <div style={{ display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center" }}>
        <span style={{ fontSize:11,color:"#94a3b8",fontWeight:600 }}>Catégorie:</span>
        {["Tous",...CATS].map(c=><button key={c} onClick={()=>setFiltreCat(c)} style={{ padding:"3px 11px",borderRadius:99,border:"1px solid",fontSize:11,cursor:"pointer",fontWeight:filtreCat===c?700:400,background:filtreCat===c?"#2563eb":"#fff",color:filtreCat===c?"#fff":"#64748b",borderColor:filtreCat===c?"#2563eb":"#e2e8f0" }}>{c}</button>)}
        <span style={{ fontSize:11,color:"#94a3b8",fontWeight:600,marginLeft:10 }}>Statut:</span>
        {["Tous","Payé","Chèque déposé","Non payé"].map(s=><button key={s} onClick={()=>setFiltreStatut(s)} style={{ padding:"3px 11px",borderRadius:99,border:"1px solid",fontSize:11,cursor:"pointer",fontWeight:filtreStatut===s?700:400,background:filtreStatut===s?"#7c3aed":"#fff",color:filtreStatut===s?"#fff":"#64748b",borderColor:filtreStatut===s?"#7c3aed":"#e2e8f0" }}>{s}</button>)}
      </div>

      <div style={{ background:"#fff",borderRadius:12,overflow:"hidden",border:"1px solid #f1f5f9" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead><tr><TH>Date</TH><TH>Marché</TH><TH>Catégorie</TH><TH>Description</TH><TH>Fournisseur</TH><TH>Montant</TH><TH>Paiement</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>{filtered.map(dep => {
            const m = data.marches.find(x=>x.id===dep.marcheId);
            return (
              <tr key={dep.id}>
                <TD>{dep.date}</TD>
                <TD>{m?.ref||"—"}</TD>
                <td style={{ padding:"10px 12px" }}>
                  <span style={{ background:(catC[dep.categorie]||"#64748b")+"22",color:catC[dep.categorie]||"#64748b",padding:"2px 8px",borderRadius:99,fontSize:11,fontWeight:600 }}>{dep.categorie}</span>
                  {dep.sousCat && <div style={{ fontSize:10,color:"#94a3b8",marginTop:2 }}>{dep.sousCat}</div>}
                </td>
                <TD>{dep.description}</TD>
                <TD>{dep.fournisseur}</TD>
                <TD bold color="#dc2626">{fmt(dep.montant)}</TD>
                <td style={{ padding:"10px 12px" }}>
                  <div style={{ fontSize:12,color:"#374151" }}>{dep.modePaiement}</div>
                  {dep.datePaiement && <div style={{ fontSize:10,color:"#94a3b8" }}>{dep.datePaiement}</div>}
                </td>
                <td style={{ padding:"10px 12px" }}><Badge s={dep.statut}/></td>
                <td style={{ padding:"10px 12px" }}>
                  <div style={{ display:"flex",gap:4 }}>
                    {canEdit && <>
                      <Btn sm v="ghost" onClick={()=>openEdit(dep)}><Ic d={IC.edit} s={12}/></Btn>
                      <Btn sm v="danger" onClick={()=>del(dep.id)}><Ic d={IC.trash} s={12}/></Btn>
                    </>}
                  </div>
                </td>
              </tr>
            );
          })}</tbody>
          <tfoot><tr style={{ background:"#f8fafc" }}>
            <td colSpan={5} style={{ padding:"10px 12px",fontWeight:700,fontSize:13 }}>TOTAL ({filtered.length} entrées)</td>
            <td style={{ padding:"10px 12px",fontWeight:700,fontSize:13,color:"#dc2626" }}>{fmt(filtered.reduce((s,d)=>s+d.montant,0))}</td>
            <td colSpan={3}/>
          </tr></tfoot>
        </table>
      </div>

      {modal&&canEdit&&(
        <Modal title={modal==="new"?"Nouvelle dépense":"Modifier la dépense"} onClose={()=>setModal(null)} wide>
          <G2>
            <Field label="Marché"><Sel value={form.marcheId} onChange={sf("marcheId")}>{data.marches.map(m=><option key={m.id} value={m.id}>{m.ref}</option>)}</Sel></Field>
            <Field label="Date"><Inp type="date" value={form.date} onChange={sf("date")}/></Field>
          </G2>
          <G2>
            <Field label="Catégorie"><Sel value={form.categorie} onChange={e=>{setForm(f=>({...f,categorie:e.target.value,sousCat:SOUS_CATS[e.target.value]?.[0]||""}))}}>{CATS.map(c=><option key={c}>{c}</option>)}</Sel></Field>
            <Field label="Sous-catégorie"><Sel value={form.sousCat} onChange={sf("sousCat")}>{(SOUS_CATS[form.categorie]||[]).map(s=><option key={s}>{s}</option>)}</Sel></Field>
          </G2>
          <Field label="Description"><Inp value={form.description} onChange={sf("description")}/></Field>
          <G2>
            <Field label="Fournisseur"><Inp value={form.fournisseur} onChange={sf("fournisseur")}/></Field>
            <Field label="Montant (DH)"><Inp type="number" value={form.montant} onChange={sf("montant")}/></Field>
          </G2>
          <G3>
            <Field label="Mode de paiement"><Sel value={form.modePaiement} onChange={sf("modePaiement")}>{["Virement","Chèque","Espèces","Autre"].map(s=><option key={s}>{s}</option>)}</Sel></Field>
            <Field label="Date de paiement"><Inp type="date" value={form.datePaiement} onChange={sf("datePaiement")}/></Field>
            <Field label="Statut"><Sel value={form.statut} onChange={sf("statut")}>{["Non payé","Chèque déposé","Payé"].map(s=><option key={s}>{s}</option>)}</Sel></Field>
          </G3>
          <Field label="Observation"><Inp value={form.observation||""} onChange={sf("observation")}/></Field>
          <div style={{ display:"flex",justifyContent:"flex-end",gap:8,marginTop:16 }}>
            <Btn v="ghost" onClick={()=>setModal(null)}>Annuler</Btn>
            <Btn onClick={save}><Ic d={IC.check} s={13} c="#fff"/> Enregistrer</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── RH ───────────────────────────────────────────────────────────────────────
function RH({ data, setData, user, addLog, showToast }) {
  const canEdit = user.role==="admin"||user.role==="rh";
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [detail, setDetail] = useState(null); // employé sélectionné pour historique
  const [congeForm, setCongeForm] = useState({ dateDebut:"", dateFin:"", type:"Congé annuel", motif:"" });
  const [salForm, setSalForm] = useState({ mois:"", montant:"", note:"" });
  const sf = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const blank = { matricule:"", nom:"", prenom:"", poste:"", salaire:"", dateEmbauche:"", statut:"Actif", affectation:"Siège", conges:[], historiquesSalaires:[] };
  const openNew  = () => { setForm(blank); setModal("new"); };
  const openEdit = e => { setForm({...e}); setModal("edit"); };
  const save = () => {
    const isNew = modal==="new";
    const item = { ...form, id:isNew?Date.now():form.id, salaire:+form.salaire, conges:form.conges||[], historiquesSalaires:form.historiquesSalaires||[] };
    setData(d=>({...d,employes:isNew?[...d.employes,item]:d.employes.map(e=>e.id===item.id?item:e)}));
    addLog(isNew?`Ajout employé ${form.prenom} ${form.nom}`:`Modif employé ${form.prenom} ${form.nom}`);
    showToast(isNew?"Employé ajouté !":"Employé modifié !"); setModal(null);
  };
  const del = id => { const emp=data.employes.find(x=>x.id===id); if(window.confirm("Supprimer ?")){ setData(d=>({...d,employes:d.employes.filter(e=>e.id!==id)})); addLog(`Suppression employé ${emp?.prenom} ${emp?.nom}`); } };

  const addConge = empId => {
    const jours = Math.round((new Date(congeForm.dateFin)-new Date(congeForm.dateDebut))/(1000*60*60*24))+1;
    const c = { ...congeForm, id:Date.now(), jours };
    setData(d => ({ ...d, employes:d.employes.map(e=>e.id===empId?{...e,conges:[...(e.conges||[]),c]}:e) }));
    setDetail(d => ({ ...d, conges:[...(d.conges||[]),c] }));
    addLog(`Congé ajouté pour ${detail?.prenom} ${detail?.nom}`);
    showToast("Congé enregistré !"); setCongeForm({ dateDebut:"",dateFin:"",type:"Congé annuel",motif:"" });
  };

  const addSalaire = empId => {
    const s = { ...salForm, id:Date.now(), montant:+salForm.montant };
    setData(d => ({ ...d, employes:d.employes.map(e=>e.id===empId?{...e,historiquesSalaires:[...(e.historiquesSalaires||[]),s]}:e) }));
    setDetail(d => ({ ...d, historiquesSalaires:[...(d.historiquesSalaires||[]),s] }));
    addLog(`Salaire enregistré pour ${detail?.prenom} ${detail?.nom}`);
    showToast("Salaire enregistré !"); setSalForm({ mois:"",montant:"",note:"" });
  };

  const exportRH = () => {
    exportCSV(
      data.employes.map(e=>[e.matricule,e.nom,e.prenom,e.poste,e.salaire,e.dateEmbauche,e.statut,e.affectation,(e.conges||[]).reduce((s,c)=>s+c.jours,0)]),
      ["Matricule","Nom","Prénom","Poste","Salaire (DH)","Date embauche","Statut","Affectation","Total jours congé"],
      "employes"
    );
    showToast("Export CSV réussi !");
  };

  const masse = data.employes.filter(e=>e.statut==="Actif").reduce((s,e)=>s+e.salaire,0);

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h2 style={{ margin:0,fontSize:19,fontWeight:800,color:"#1e293b" }}>Ressources Humaines</h2>
        <div style={{ display:"flex",gap:7 }}>
          <Btn v="ghost" onClick={exportRH}><Ic d={IC.download} s={13}/> Export CSV</Btn>
          {canEdit && <Btn onClick={openNew}><Ic d={IC.plus} s={13} c="#fff"/> Nouvel employé</Btn>}
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20 }}>
        {[["Total employés",data.employes.length,"#2563eb"],["Actifs",data.employes.filter(e=>e.statut==="Actif").length,"#16a34a"],["Masse salariale/mois",fmtM(masse),"#7c3aed"]].map(([l,v,c])=>(
          <div key={l} style={{ background:"#fff",borderRadius:10,padding:14,border:"1px solid #f1f5f9" }}>
            <div style={{ fontSize:11,color:"#94a3b8" }}>{l}</div>
            <div style={{ fontSize:typeof v==="number"&&v<100?24:17,fontWeight:800,color:c }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ background:"#fff",borderRadius:12,overflow:"hidden",border:"1px solid #f1f5f9" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead><tr><TH>Matricule</TH><TH>Nom & Prénom</TH><TH>Poste</TH><TH>Affectation</TH>{canEdit&&<TH>Salaire</TH>}<TH>Embauche</TH><TH>Congés</TH><TH>Statut</TH><TH>Actions</TH></tr></thead>
          <tbody>{data.employes.map(emp=>{
            const totalConges = (emp.conges||[]).reduce((s,c)=>s+c.jours,0);
            return (
              <tr key={emp.id}>
                <TD bold color="#2563eb">{emp.matricule}</TD>
                <TD bold>{emp.nom} {emp.prenom}</TD>
                <TD>{emp.poste}</TD>
                <TD>{emp.affectation}</TD>
                {canEdit&&<TD bold color="#7c3aed">{fmt(emp.salaire)}</TD>}
                <TD>{emp.dateEmbauche}</TD>
                <td style={{ padding:"10px 12px" }}>
                  <span style={{ fontSize:12,color:"#64748b" }}>{totalConges} j</span>
                </td>
                <td style={{ padding:"10px 12px" }}><Badge s={emp.statut}/></td>
                <td style={{ padding:"10px 12px" }}>
                  <div style={{ display:"flex",gap:4 }}>
                    <Btn sm v="ghost" onClick={()=>setDetail(emp)} title="Historique"><Ic d={IC.history} s={12}/></Btn>
                    {canEdit&&<><Btn sm v="ghost" onClick={()=>openEdit(emp)}><Ic d={IC.edit} s={12}/></Btn>
                    <Btn sm v="danger" onClick={()=>del(emp.id)}><Ic d={IC.trash} s={12}/></Btn></>}
                  </div>
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>

      {/* Modal employé */}
      {modal&&canEdit&&(
        <Modal title={modal==="new"?"Nouvel employé":"Modifier l'employé"} onClose={()=>setModal(null)}>
          <G2><Field label="Matricule"><Inp value={form.matricule} onChange={sf("matricule")} placeholder="EMP-005"/></Field>
          <Field label="Poste"><Inp value={form.poste} onChange={sf("poste")}/></Field></G2>
          <G2><Field label="Nom"><Inp value={form.nom} onChange={sf("nom")}/></Field>
          <Field label="Prénom"><Inp value={form.prenom} onChange={sf("prenom")}/></Field></G2>
          <G2><Field label="Salaire (DH)"><Inp type="number" value={form.salaire} onChange={sf("salaire")}/></Field>
          <Field label="Date embauche"><Inp type="date" value={form.dateEmbauche} onChange={sf("dateEmbauche")}/></Field></G2>
          <G2><Field label="Affectation"><Inp value={form.affectation} onChange={sf("affectation")} placeholder="Siège / MRC-XXX"/></Field>
          <Field label="Statut"><Sel value={form.statut} onChange={sf("statut")}><option>Actif</option><option>Inactif</option></Sel></Field></G2>
          <div style={{ display:"flex",justifyContent:"flex-end",gap:8,marginTop:16 }}>
            <Btn v="ghost" onClick={()=>setModal(null)}>Annuler</Btn>
            <Btn onClick={save}><Ic d={IC.check} s={13} c="#fff"/> Enregistrer</Btn>
          </div>
        </Modal>
      )}

      {/* Modal historique */}
      {detail&&(
        <Modal title={`Historique — ${detail.prenom} ${detail.nom}`} onClose={()=>setDetail(null)} wide>
          {/* Congés */}
          <h4 style={{ margin:"0 0 10px",fontSize:14,color:"#1e293b" }}>🏖️ Congés</h4>
          {canEdit&&(
            <div style={{ background:"#f8fafc",borderRadius:8,padding:12,marginBottom:12 }}>
              <G2>
                <Field label="Date début"><Inp type="date" value={congeForm.dateDebut} onChange={e=>setCongeForm(f=>({...f,dateDebut:e.target.value}))}/></Field>
                <Field label="Date fin"><Inp type="date" value={congeForm.dateFin} onChange={e=>setCongeForm(f=>({...f,dateFin:e.target.value}))}/></Field>
              </G2>
              <G2>
                <Field label="Type"><Sel value={congeForm.type} onChange={e=>setCongeForm(f=>({...f,type:e.target.value}))}>
                  {["Congé annuel","Congé maladie","Congé sans solde","Autre"].map(t=><option key={t}>{t}</option>)}
                </Sel></Field>
                <Field label="Motif"><Inp value={congeForm.motif} onChange={e=>setCongeForm(f=>({...f,motif:e.target.value}))}/></Field>
              </G2>
              <Btn v="success" onClick={()=>addConge(detail.id)}><Ic d={IC.plus} s={13} c="#fff"/> Ajouter congé</Btn>
            </div>
          )}
          {(detail.conges||[]).length===0 ? <p style={{ fontSize:12,color:"#94a3b8" }}>Aucun congé enregistré.</p> :
            <table style={{ width:"100%",borderCollapse:"collapse",marginBottom:20,fontSize:12 }}>
              <thead><tr style={{ background:"#f8fafc" }}><TH>Début</TH><TH>Fin</TH><TH>Jours</TH><TH>Type</TH><TH>Motif</TH></tr></thead>
              <tbody>{(detail.conges||[]).map(c=><tr key={c.id}><TD>{c.dateDebut}</TD><TD>{c.dateFin}</TD><TD bold>{c.jours} j</TD><TD>{c.type}</TD><TD>{c.motif}</TD></tr>)}</tbody>
            </table>
          }

          {/* Historique salaires */}
          <h4 style={{ margin:"16px 0 10px",fontSize:14,color:"#1e293b" }}>💰 Historique des salaires</h4>
          {canEdit&&(
            <div style={{ background:"#f8fafc",borderRadius:8,padding:12,marginBottom:12 }}>
              <G3>
                <Field label="Mois"><Inp type="month" value={salForm.mois} onChange={e=>setSalForm(f=>({...f,mois:e.target.value}))}/></Field>
                <Field label="Montant (DH)"><Inp type="number" value={salForm.montant} onChange={e=>setSalForm(f=>({...f,montant:e.target.value}))}/></Field>
                <Field label="Note"><Inp value={salForm.note} onChange={e=>setSalForm(f=>({...f,note:e.target.value}))}/></Field>
              </G3>
              <Btn v="success" onClick={()=>addSalaire(detail.id)}><Ic d={IC.plus} s={13} c="#fff"/> Ajouter salaire</Btn>
            </div>
          )}
          {(detail.historiquesSalaires||[]).length===0 ? <p style={{ fontSize:12,color:"#94a3b8" }}>Aucun salaire enregistré.</p> :
            <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
              <thead><tr style={{ background:"#f8fafc" }}><TH>Mois</TH><TH>Montant</TH><TH>Note</TH></tr></thead>
              <tbody>{(detail.historiquesSalaires||[]).map(s=><tr key={s.id}><TD>{s.mois}</TD><TD bold color="#7c3aed">{fmt(s.montant)}</TD><TD>{s.note}</TD></tr>)}</tbody>
            </table>
          }
          <div style={{ display:"flex",justifyContent:"flex-end",marginTop:16 }}>
            <Btn v="ghost" onClick={()=>{ exportCSV((detail.conges||[]).map(c=>[c.dateDebut,c.dateFin,c.jours,c.type,c.motif]),["Début","Fin","Jours","Type","Motif"],`conges_${detail.nom}`); showToast("Export congés !"); }}>
              <Ic d={IC.download} s={12}/> Export congés
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]     = useState(null);
  const [data, setData]     = useState(null);
  const [page, setPage]     = useState("dashboard");
  const [toast, setToast]   = useState(null);
  const [online, setOnline] = useState(true);
  const [lastSync, setLastSync] = useState(null);

  const showToast = useCallback((msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); }, []);

  useEffect(() => {
    if (!user) return;
    fbLoad().then(d => { if(d){ setData(d); setLastSync(new Date().toLocaleTimeString("fr-MA")); } else { setData(SEED); fbSave(SEED); } setOnline(true); }).catch(()=>{ setData(SEED); setOnline(false); });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(DATA_DOC, snap => { if(snap.exists()){ setData(snap.data()); setLastSync(new Date().toLocaleTimeString("fr-MA")); setOnline(true); } }, ()=>setOnline(false));
    return ()=>unsub();
  }, [user]);

  const setDataAndSave = useCallback(updater => {
    setData(prev => { const next=typeof updater==="function"?updater(prev):updater; fbSave(next).then(()=>setLastSync(new Date().toLocaleTimeString("fr-MA"))); return next; });
  }, []);

  const addLog = useCallback(action => {
    setDataAndSave(d => ({ ...d, log:[...(d.log||[]).slice(-99),{ user:user?.name||"?",action,at:now() }] }));
  }, [user, setDataAndSave]);

  if (!user) return <Login onLogin={u=>{ setUser(u); setPage("dashboard"); }}/>;
  if (!data) return <div style={{ minHeight:"100vh",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8",fontSize:14 }}>Connexion à Firebase…</div>;

  const allowed = ACCESS[user.role]||["dashboard"];
  const navItems = [
    { id:"dashboard",label:"Tableau de bord",    ic:IC.dashboard },
    { id:"marches",  label:"Marchés",             ic:IC.marches   },
    { id:"decomptes",label:"Décomptes",           ic:IC.decomptes },
    { id:"depenses", label:"Dépenses",            ic:IC.depenses  },
    { id:"rh",       label:"Ressources Humaines", ic:IC.rh        },
  ].filter(n=>allowed.includes(n.id));

  const roleColors = { admin:"#2563eb",chef:"#7c3aed",comptable:"#16a34a",rh:"#ea580c" };
  const rc = roleColors[user.role]||"#64748b";
  const activePage = allowed.includes(page)?page:allowed[0];
  const props = { data, setData:setDataAndSave, user, addLog, showToast };
  const pages = {
    dashboard:<Dashboard {...props}/>,
    marches:  <Marches   {...props}/>,
    decomptes:<Decomptes {...props}/>,
    depenses: <Depenses  {...props}/>,
    rh:       <RH        {...props}/>,
  };

  return (
    <div style={{ display:"flex",height:"100vh",fontFamily:"'Inter',-apple-system,sans-serif",background:"#f8fafc" }}>
      <div style={{ width:230,background:"#0f172a",display:"flex",flexDirection:"column",flexShrink:0 }}>
        <div style={{ padding:"18px 14px 14px",borderBottom:"1px solid #1e293b" }}>
          <div style={{ display:"flex",alignItems:"center",gap:9 }}>
            <div style={{ background:"#2563eb",borderRadius:8,padding:7 }}><Ic d={IC.building} c="#fff" s={18}/></div>
            <div><div style={{ color:"#fff",fontWeight:800,fontSize:13 }}>ERP BTP Maroc</div><div style={{ color:"#475569",fontSize:10 }}>Gestion de chantiers</div></div>
          </div>
        </div>
        <nav style={{ padding:"8px 7px",flex:1 }}>
          {navItems.map(n=>(
            <button key={n.id} onClick={()=>setPage(n.id)} style={{ width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:7,border:"none",cursor:"pointer",marginBottom:2,background:activePage===n.id?"#2563eb":"transparent",color:activePage===n.id?"#fff":"#94a3b8",fontWeight:activePage===n.id?600:400,fontSize:12,textAlign:"left" }}>
              <Ic d={n.ic} s={15} c={activePage===n.id?"#fff":"#64748b"}/> {n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding:"12px 12px 14px",borderTop:"1px solid #1e293b" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
            <div style={{ width:30,height:30,borderRadius:99,background:rc+"33",display:"flex",alignItems:"center",justifyContent:"center" }}><Ic d={IC.user} s={14} c={rc}/></div>
            <div><div style={{ fontSize:11,fontWeight:600,color:"#e2e8f0" }}>{user.name}</div><div style={{ fontSize:10,color:"#475569" }}>{ROLES[user.role]}</div></div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 8px",background:"#1e293b",borderRadius:6,marginBottom:7 }}>
            <div style={{ width:6,height:6,borderRadius:99,background:online?"#22c55e":"#dc2626",flexShrink:0 }}/>
            <span style={{ fontSize:10,color:"#64748b" }}>{online?(lastSync?`Firebase · ${lastSync}`:"Connecté"):"Hors ligne"}</span>
          </div>
          <button onClick={()=>setUser(null)} style={{ width:"100%",background:"#1e293b",border:"none",borderRadius:6,padding:"6px 0",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5,color:"#94a3b8",fontSize:11 }}>
            <Ic d={IC.logout} s={13} c="#94a3b8"/> Déconnexion
          </button>
        </div>
      </div>
      <div style={{ flex:1,overflow:"auto",padding:24 }}>{pages[activePage]}</div>
      {toast&&<Toast msg={toast.msg} type={toast.type}/>}
    </div>
  );
}
