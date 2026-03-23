import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import "./App.css";

const firebaseConfig = {
  apiKey: "AIzaSyDc0qzbuLO_wo4q05xcydW1NpIbfC-41cY",
  authDomain: "example-af691.firebaseapp.com",
  projectId: "example-af691",
  storageBucket: "example-af691.firebasestorage.app",
  messagingSenderId: "810297078163",
  appId: "1:810297078163:web:aab0989da1356acf7b7866",
  measurementId: "G-25Z98WLRNF",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// Matches your Firestore: pokebattles → Pokebattle1
const BATTLE_DOC = doc(db, "pokebattles", "Pokebattle1");

// Each pokemon maps to its vida field in Firestore
const POKEMON_META = [
  { id: 1,  name: "Bulbasaur",  type: "grass",    field: "vida1" },
  { id: 4,  name: "Charmander", type: "fire",     field: "vida2" },
  { id: 7,  name: "Squirtle",   type: "water",    field: "vida3" },
  { id: 25, name: "Pikachu",    type: "electric", field: "vida4" },
  { id: 39, name: "Jigglypuff", type: "normal",   field: "vida5" },
  { id: 52, name: "Meowth",     type: "normal",   field: "vida6" },
];

const MAX_HP = 100;

const TYPE_COLORS = {
  grass:    { accent: "#4ade80", glow: "#22c55e", bg: "#1a2e1a" },
  fire:     { accent: "#fb923c", glow: "#f97316", bg: "#2e1a0e" },
  water:    { accent: "#60a5fa", glow: "#3b82f6", bg: "#0e1a2e" },
  electric: { accent: "#facc15", glow: "#eab308", bg: "#2e2a0e" },
  normal:   { accent: "#d1d5db", glow: "#9ca3af", bg: "#1e1e1e" },
};

const typeIcons = { grass: "🌿", fire: "🔥", water: "💧", electric: "⚡", normal: "⭐" };

const DEFAULT_HP = { vida1:100, vida2:100, vida3:100, vida4:100, vida5:100, vida6:100 };

export default function PokemonBattle() {
  const [hpMap, setHpMap]       = useState(DEFAULT_HP);
  const [shaking, setShaking]   = useState(null);
  const [flashing, setFlashing] = useState(null);
  const [log, setLog]           = useState(["🔥 Connecting to Firebase...", "Click a Pokémon to attack it!"]);
  const [status, setStatus]     = useState("connecting"); // connecting | live | error

  // ── Real-time listener — keeps hpMap in sync with Firestore ───────────────
  useEffect(() => {
    const unsub = onSnapshot(
      BATTLE_DOC,
      (snap) => {
        if (snap.exists()) {
          setHpMap(snap.data());
          setStatus("live");
          setLog(prev =>
            prev[0].includes("Connecting") ? ["🔥 Firebase connected! Battle ready.", prev[1]] : prev
          );
        } else {
          // First run: create the document
          setDoc(BATTLE_DOC, DEFAULT_HP);
        }
      },
      (err) => {
        console.error(err);
        setStatus("error");
        setLog(prev => [`❌ Firebase error: ${err.code}`, ...prev]);
      }
    );
    return () => unsub();
  }, []);

  // ── Attack — deducts HP and writes to Firestore ───────────────────────────
  const handleAttack = async (meta) => {
    const currentHp = hpMap[meta.field] ?? 0;
    if (currentHp <= 0) return;

    const damage = Math.floor(Math.random() * 15) + 5;
    const newHp  = Math.max(0, currentHp - damage);

    setShaking(meta.id);
    setFlashing(meta.id);
    setTimeout(() => setShaking(null), 400);
    setTimeout(() => setFlashing(null), 200);

    try {
      await updateDoc(BATTLE_DOC, { [meta.field]: newHp });
      const msg = newHp === 0
        ? `💀 ${meta.name} fainted!`
        : `⚔️ ${meta.name} took ${damage} dmg! (${newHp}/${MAX_HP} HP)`;
      setLog(prev => [msg, ...prev.slice(0, 6)]);
    } catch (err) {
      setLog(prev => [`❌ Write failed: ${err.message}`, ...prev.slice(0, 6)]);
    }
  };

  // ── Reset — restores all vida fields to 100 ───────────────────────────────
  const handleReset = async () => {
    try {
      await setDoc(BATTLE_DOC, DEFAULT_HP);
      setLog(["🔄 Battle reset! All HP restored.", "Click a Pokémon to attack it!"]);
    } catch (err) {
      setLog(prev => [`❌ Reset failed: ${err.message}`, ...prev]);
    }
  };

  const faintedCount = POKEMON_META.filter(p => (hpMap[p.field] ?? 0) <= 0).length;
  const allFainted   = faintedCount === POKEMON_META.length;

  return (
    <div className="root">
        <div className="scanlines" />
        <div className="content">

          <div className="status-bar">
            <div className={`status-pill ${status}`}>
              <span className={`dot ${status}`} />
              {status === "connecting" && "CONNECTING TO FIREBASE..."}
              {status === "live"       && "FIREBASE LIVE · pokebattles/Pokebattle1"}
              {status === "error"      && "FIREBASE ERROR — CHECK CONFIG"}
            </div>
          </div>

          <div className="header">
            <div className="title">⚔ POKÉMON BATTLE ⚔</div>
            <div className="subtitle">CLICK TO ATTACK</div>
          </div>

          <div className="score-bar">
            <div className="score-item">
              <span className="score-label">ALIVE</span>
              <span className="score-value">{POKEMON_META.filter(p => (hpMap[p.field] ?? 0) > 0).length}</span>
            </div>
            <div className="score-item">
              <span className="score-label">FAINTED</span>
              <span className={`score-value ${faintedCount > 0 ? "danger" : ""}`}>{faintedCount}</span>
            </div>
            <div className="score-item">
              <span className="score-label">TOTAL</span>
              <span className="score-value">{POKEMON_META.length}</span>
            </div>
          </div>

          {allFainted && (
            <div className="victory-banner">
              <div className="victory-text">ALL POKÉMON FAINTED!</div>
            </div>
          )}

          <div className="grid">
            {POKEMON_META.map((meta) => {
              const colors    = TYPE_COLORS[meta.type];
              const hp        = hpMap[meta.field] ?? 0;
              const hpPct     = (hp / MAX_HP) * 100;
              const hpClass   = hpPct > 50 ? "hp-high" : hpPct > 20 ? "hp-mid" : "hp-low";
              const isFainted = hp <= 0;

              return (
                <div
                  key={meta.id}
                  className={[
                    "card",
                    isFainted   ? "fainted" : "",
                    shaking === meta.id  ? "shaking"  : "",
                    flashing === meta.id ? "flashing" : "",
                  ].join(" ")}
                  style={{ "--accent": colors.accent, "--glow": colors.glow, "--bg": colors.bg }}
                  onClick={() => handleAttack(meta)}
                >
                  <div className="pixel-corner tl"/><div className="pixel-corner tr"/>
                  <div className="pixel-corner bl"/><div className="pixel-corner br"/>

                  <div className="card-header">
                    <div className="pokemon-name">
                      #{String(meta.id).padStart(3, "0")}<br />{meta.name.toUpperCase()}
                    </div>
                    <div className="type-badge">
                      {typeIcons[meta.type]} {meta.type.toUpperCase()}
                    </div>
                  </div>

                  <div className="sprite-area">
                    <img
                      className="sprite"
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${meta.id}.png`}
                      alt={meta.name}
                    />
                  </div>

                  <div className="hp-section">
                    <div className="hp-label-row">
                      <span>HP <span className="hp-field-tag">({meta.field})</span></span>
                      <span className="hp-numbers">{hp}/{MAX_HP}</span>
                    </div>
                    <div className="hp-bar-track">
                      <div className={`hp-bar-fill ${hpClass}`} style={{ width: `${hpPct}%` }} />
                    </div>
                  </div>

                  {isFainted
                    ? <div className="fainted-label">✕ FAINTED</div>
                    : <div className="attack-hint">▶ CLICK TO ATTACK</div>
                  }
                </div>
              );
            })}
          </div>

          <div className="log-panel">
            <div className="log-title">▌ BATTLE LOG</div>
            <div className="log-entries">
              {log.map((entry, i) => (
                <div key={i} className="log-entry">{entry}</div>
              ))}
            </div>
          </div>

      <button className="reset-btn" onClick={handleReset}>↺ NEW BATTLE</button>
        </div>
      </div>
  );
}