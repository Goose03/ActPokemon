import { useState } from "react";

const POKEMON = [
  { id: 1, name: "Bulbasaur", maxHp: 45, hp: 45, type: "grass", color: "#78C850" },
  { id: 4, name: "Charmander", maxHp: 39, hp: 39, type: "fire", color: "#F08030" },
  { id: 7, name: "Squirtle", maxHp: 44, hp: 44, type: "water", color: "#6890F0" },
  { id: 25, name: "Pikachu", maxHp: 35, hp: 35, type: "electric", color: "#F8D030" },
  { id: 39, name: "Jigglypuff", maxHp: 115, hp: 115, type: "normal", color: "#F4A0A0" },
  { id: 52, name: "Meowth", maxHp: 40, hp: 40, type: "normal", color: "#F8D030" },
];

const TYPE_COLORS = {
  grass: { bg: "#1a2e1a", accent: "#4ade80", glow: "#22c55e" },
  fire: { bg: "#2e1a0e", accent: "#fb923c", glow: "#f97316" },
  water: { bg: "#0e1a2e", accent: "#60a5fa", glow: "#3b82f6" },
  electric: { bg: "#2e2a0e", accent: "#facc15", glow: "#eab308" },
  normal: { bg: "#1e1e1e", accent: "#d1d5db", glow: "#9ca3af" },
};

const typeIcons = {
  grass: "🌿", fire: "🔥", water: "💧", electric: "⚡", normal: "⭐",
};

const BATTLE_LOG = [
  "Choose your fighter!",
  "Click a Pokémon to attack it!",
  "Reduce HP to zero to knock it out!",
];

export default function PokemonBattle() {
  const [pokemon, setPokemon] = useState(POKEMON);
  const [log, setLog] = useState(BATTLE_LOG);
  const [shaking, setShaking] = useState(null);
  const [flashing, setFlashing] = useState(null);

  const handleAttack = (id) => {
    const target = pokemon.find((p) => p.id === id);
    if (!target || target.hp <= 0) return;

    const damage = Math.floor(Math.random() * 15) + 5;
    const newHp = Math.max(0, target.hp - damage);

    setShaking(id);
    setFlashing(id);
    setTimeout(() => setShaking(null), 400);
    setTimeout(() => setFlashing(null), 200);

    setPokemon((prev) =>
      prev.map((p) => (p.id === id ? { ...p, hp: newHp } : p))
    );

    const msg =
      newHp === 0
        ? `💀 ${target.name} fainted!`
        : `⚔️ ${target.name} took ${damage} damage! (${newHp}/${target.maxHp} HP)`;

    setLog((prev) => [msg, ...prev.slice(0, 4)]);
  };

  const resetBattle = () => {
    setPokemon(POKEMON);
    setLog(BATTLE_LOG);
  };

  const faintedCount = pokemon.filter((p) => p.hp <= 0).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323:wght@400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0a0f;
          min-height: 100vh;
        }

        .battle-root {
          font-family: 'VT323', monospace;
          background: #0a0a0f;
          min-height: 100vh;
          color: #e2e8f0;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
        }

        .battle-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(239,68,68,0.06) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        .scanlines {
          position: fixed;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.03) 2px,
            rgba(0,0,0,0.03) 4px
          );
          pointer-events: none;
          z-index: 1;
        }

        .content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 32px;
        }

        .title {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(14px, 3vw, 22px);
          color: #facc15;
          text-shadow:
            0 0 20px rgba(250,204,21,0.6),
            3px 3px 0 #92400e,
            6px 6px 0 rgba(146,64,14,0.4);
          letter-spacing: 2px;
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .subtitle {
          font-size: 20px;
          color: #94a3b8;
          letter-spacing: 3px;
        }

        .score-bar {
          display: flex;
          justify-content: center;
          gap: 32px;
          margin-bottom: 24px;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
        }

        .score-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .score-label { color: #64748b; }
        .score-value { color: #e2e8f0; font-size: 14px; }
        .score-value.danger { color: #ef4444; }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .card {
          background: #111118;
          border: 2px solid #1e1e2e;
          border-radius: 4px;
          padding: 16px;
          cursor: pointer;
          transition: transform 0.1s, border-color 0.2s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
          user-select: none;
        }

        .card::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.2s;
          border-radius: 2px;
        }

        .card:hover:not(.fainted) {
          transform: translateY(-2px) scale(1.01);
          border-color: var(--accent);
          box-shadow: 0 0 20px var(--glow), 0 8px 24px rgba(0,0,0,0.4);
        }

        .card:hover:not(.fainted)::before {
          opacity: 1;
          background: radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%);
        }

        .card:active:not(.fainted) {
          transform: translateY(0) scale(0.99);
        }

        .card.fainted {
          cursor: not-allowed;
          opacity: 0.4;
          filter: grayscale(1);
        }

        .card.shaking {
          animation: shake 0.4s ease;
        }

        .card.flashing {
          animation: flash 0.2s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px) rotate(-1deg); }
          40% { transform: translateX(6px) rotate(1deg); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }

        @keyframes flash {
          0%, 100% { background: #111118; }
          50% { background: rgba(239,68,68,0.3); }
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .pokemon-name {
          font-family: 'Press Start 2P', monospace;
          font-size: 9px;
          color: #e2e8f0;
          line-height: 1.4;
        }

        .type-badge {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 2px;
          background: var(--bg);
          border: 1px solid var(--accent);
          color: var(--accent);
          letter-spacing: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .sprite-area {
          display: flex;
          justify-content: center;
          margin: 8px 0 12px;
          position: relative;
          height: 80px;
        }

        .sprite-area::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 10px;
          background: radial-gradient(ellipse, rgba(255,255,255,0.1) 0%, transparent 70%);
          border-radius: 50%;
        }

        .sprite {
          image-rendering: pixelated;
          height: 80px;
          width: 80px;
          object-fit: contain;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
          transition: filter 0.3s;
        }

        .card:hover:not(.fainted) .sprite {
          filter: drop-shadow(0 0 12px var(--glow)) drop-shadow(0 4px 8px rgba(0,0,0,0.5));
        }

        .fainted .sprite {
          transform: rotate(90deg);
        }

        .hp-section { margin-top: 4px; }

        .hp-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 4px;
          color: #94a3b8;
        }

        .hp-numbers {
          font-family: 'Press Start 2P', monospace;
          font-size: 8px;
        }

        .hp-bar-track {
          height: 8px;
          background: #1e1e2e;
          border-radius: 2px;
          overflow: hidden;
          border: 1px solid #2d2d3e;
        }

        .hp-bar-fill {
          height: 100%;
          border-radius: 1px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .hp-bar-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255,255,255,0.3);
          border-radius: 1px;
        }

        .hp-high { background: #22c55e; }
        .hp-mid  { background: #eab308; }
        .hp-low  { background: #ef4444; animation: pulse-red 1s ease infinite; }

        @keyframes pulse-red {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .fainted-label {
          font-family: 'Press Start 2P', monospace;
          font-size: 8px;
          color: #ef4444;
          text-align: center;
          margin-top: 8px;
          letter-spacing: 2px;
        }

        .attack-hint {
          font-size: 13px;
          color: #475569;
          text-align: center;
          margin-top: 6px;
          letter-spacing: 1px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .card:hover:not(.fainted) .attack-hint {
          opacity: 1;
          color: var(--accent);
        }

        .log-panel {
          background: #0d0d12;
          border: 2px solid #1e1e2e;
          border-radius: 4px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .log-title {
          font-family: 'Press Start 2P', monospace;
          font-size: 8px;
          color: #475569;
          letter-spacing: 3px;
          margin-bottom: 12px;
        }

        .log-entries {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .log-entry {
          font-size: 18px;
          color: #94a3b8;
          padding: 4px 0;
          border-bottom: 1px solid #1a1a24;
          transition: opacity 0.3s;
        }

        .log-entry:first-child {
          color: #e2e8f0;
          font-size: 20px;
        }

        .log-entry:nth-child(n+3) {
          opacity: 0.5;
        }

        .reset-btn {
          display: block;
          width: 100%;
          padding: 12px;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          background: transparent;
          border: 2px solid #3d3d5c;
          color: #94a3b8;
          border-radius: 4px;
          cursor: pointer;
          letter-spacing: 3px;
          transition: all 0.2s;
          text-transform: uppercase;
        }

        .reset-btn:hover {
          border-color: #facc15;
          color: #facc15;
          text-shadow: 0 0 10px rgba(250,204,21,0.5);
          box-shadow: 0 0 20px rgba(250,204,21,0.1);
        }

        .victory-banner {
          text-align: center;
          padding: 16px;
          margin-bottom: 16px;
          border: 2px solid #ef4444;
          border-radius: 4px;
          background: rgba(239,68,68,0.05);
        }

        .victory-text {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(10px, 2vw, 14px);
          color: #ef4444;
          text-shadow: 0 0 20px rgba(239,68,68,0.6);
          letter-spacing: 2px;
          animation: flicker 2s ease infinite;
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.4; }
          94% { opacity: 1; }
          96% { opacity: 0.6; }
          97% { opacity: 1; }
        }

        .pixel-corner {
          position: absolute;
          width: 6px;
          height: 6px;
          border-color: var(--accent);
          border-style: solid;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .card:hover:not(.fainted) .pixel-corner { opacity: 0.6; }
        .pixel-corner.tl { top: 4px; left: 4px; border-width: 2px 0 0 2px; }
        .pixel-corner.tr { top: 4px; right: 4px; border-width: 2px 2px 0 0; }
        .pixel-corner.bl { bottom: 4px; left: 4px; border-width: 0 0 2px 2px; }
        .pixel-corner.br { bottom: 4px; right: 4px; border-width: 0 2px 2px 0; }
      `}</style>

      <div className="battle-root">
        <div className="scanlines" />
        <div className="content">

          <div className="header">
            <div className="title">⚔ POKÉMON BATTLE ⚔</div>
            <div className="subtitle">CLICK TO ATTACK</div>
          </div>

          <div className="score-bar">
            <div className="score-item">
              <span className="score-label">ALIVE</span>
              <span className="score-value">{pokemon.filter(p => p.hp > 0).length}</span>
            </div>
            <div className="score-item">
              <span className="score-label">FAINTED</span>
              <span className={`score-value ${faintedCount > 0 ? "danger" : ""}`}>{faintedCount}</span>
            </div>
            <div className="score-item">
              <span className="score-label">TOTAL</span>
              <span className="score-value">{pokemon.length}</span>
            </div>
          </div>

          {faintedCount === pokemon.length && (
            <div className="victory-banner">
              <div className="victory-text">ALL POKÉMON FAINTED!</div>
            </div>
          )}

          <div className="grid">
            {pokemon.map((p) => {
              const colors = TYPE_COLORS[p.type];
              const hpPct = (p.hp / p.maxHp) * 100;
              const hpClass = hpPct > 50 ? "hp-high" : hpPct > 20 ? "hp-mid" : "hp-low";
              const isFainted = p.hp <= 0;

              return (
                <div
                  key={p.id}
                  className={`card ${isFainted ? "fainted" : ""} ${shaking === p.id ? "shaking" : ""} ${flashing === p.id ? "flashing" : ""}`}
                  style={{
                    "--accent": colors.accent,
                    "--glow": colors.glow,
                    "--bg": colors.bg,
                  }}
                  onClick={() => handleAttack(p.id)}
                >
                  <div className="pixel-corner tl" />
                  <div className="pixel-corner tr" />
                  <div className="pixel-corner bl" />
                  <div className="pixel-corner br" />

                  <div className="card-header">
                    <div className="pokemon-name">#{String(p.id).padStart(3, "0")}<br />{p.name.toUpperCase()}</div>
                    <div className="type-badge" style={{ "--accent": colors.accent, "--bg": colors.bg }}>
                      {typeIcons[p.type]} {p.type.toUpperCase()}
                    </div>
                  </div>

                  <div className="sprite-area">
                    <img
                      className="sprite"
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                      alt={p.name}
                    />
                  </div>

                  <div className="hp-section">
                    <div className="hp-label-row">
                      <span>HP</span>
                      <span className="hp-numbers">{p.hp}/{p.maxHp}</span>
                    </div>
                    <div className="hp-bar-track">
                      <div
                        className={`hp-bar-fill ${hpClass}`}
                        style={{ width: `${hpPct}%` }}
                      />
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

          <button className="reset-btn" onClick={resetBattle}>
            ↺ NEW BATTLE
          </button>

        </div>
      </div>
    </>
  );
}