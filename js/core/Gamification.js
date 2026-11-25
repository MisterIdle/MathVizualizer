import { MATH_CATALOG } from "../data/catalog.js";
import { RANKS, MILESTONES } from "../data/categories.js";

const STORE_KEY = "mv_progress_v2";

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export class Gamification {
  static load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          explored: parsed.explored || {},
          mastered: parsed.mastered || {},
          pinned: parsed.pinned || {},
          activeDays: parsed.activeDays || [],
          preferredEngine: parsed.preferredEngine || "unity"
        };
      }
    } catch (_) {
      // Fallback cleanly if storage is unavailable
    }
    return { explored: {}, mastered: {}, pinned: {}, activeDays: [], preferredEngine: "unity" };
  }

  static save(data) {
    try {
      const today = todayIso();
      if (!data.activeDays.includes(today)) {
        data.activeDays.push(today);
        if (data.activeDays.length > 90) data.activeDays.shift();
      }
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  static markExplored(conceptId) {
    const data = this.load();
    if (data.explored[conceptId]) return { newlyAwarded: false, xpGained: 0 };
    data.explored[conceptId] = Date.now();
    this.save(data);
    return { newlyAwarded: true, xpGained: 15 };
  }

  static toggleMastered(conceptId) {
    const data = this.load();
    const isNow = !data.mastered[conceptId];
    if (isNow) {
      data.mastered[conceptId] = Date.now();
      if (!data.explored[conceptId]) data.explored[conceptId] = Date.now();
    } else {
      delete data.mastered[conceptId];
    }
    this.save(data);
    return { mastered: isNow, xpDelta: isNow ? 35 : -35 };
  }

  static togglePinned(conceptId) {
    const data = this.load();
    const isNow = !data.pinned[conceptId];
    if (isNow) data.pinned[conceptId] = Date.now();
    else delete data.pinned[conceptId];
    this.save(data);
    return isNow;
  }

  static setPreferredEngine(engineId) {
    const data = this.load();
    data.preferredEngine = engineId;
    this.save(data);
  }

  static getPreferredEngine() {
    return this.load().preferredEngine || "unity";
  }

  static getConceptLevel(conceptId) {
    const data = this.load();
    if (data.mastered[conceptId]) return 3;
    if (data.explored[conceptId]) return 1;
    return 0;
  }

  static isPinned(conceptId) {
    return Boolean(this.load().pinned[conceptId]);
  }

  static computeStreak(days) {
    if (!days || days.length === 0) return 0;
    const set = new Set(days);
    let streak = 0;
    const cur = new Date();
    for (let i = 0; i < 90; i++) {
      const iso = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
      if (set.has(iso)) {
        streak++;
        cur.setDate(cur.getDate() - 1);
      } else if (i === 0) {
        cur.setDate(cur.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  static getStats() {
    const data = this.load();
    const totalCount = MATH_CATALOG.length;
    const exploredCount = MATH_CATALOG.filter((c) => data.explored[c.id]).length;
    const masteredCount = MATH_CATALOG.filter((c) => data.mastered[c.id]).length;
    const pinnedCount = MATH_CATALOG.filter((c) => data.pinned[c.id]).length;
    const xp = exploredCount * 15 + masteredCount * 35;

    let rank = RANKS[0];
    let nextRank = RANKS[1] || null;
    for (let i = 0; i < RANKS.length; i++) {
      if (xp >= RANKS[i].minXp) {
        rank = RANKS[i];
        nextRank = RANKS[i + 1] || null;
      }
    }

    const rankProgress = nextRank
      ? Math.min(1, (xp - rank.minXp) / Math.max(1, nextRank.minXp - rank.minXp))
      : 1;

    const categoryRatio = (catId) => {
      const items = MATH_CATALOG.filter((c) => c.categoryId === catId);
      if (items.length === 0) return 0;
      return items.filter((c) => data.mastered[c.id]).length / items.length;
    };

    const stats = {
      totalCount,
      exploredCount,
      masteredCount,
      pinnedCount,
      xp,
      rank,
      nextRank,
      rankProgress,
      streak: this.computeStreak(data.activeDays),
      categoryRatio,
      data
    };

    stats.milestones = MILESTONES.map((m) => ({ ...m, unlocked: m.check(stats) }));
    stats.unlockedMilestones = stats.milestones.filter((m) => m.unlocked).length;
    return stats;
  }

  static showToast(message, xpBadge = "") {
    let stack = document.getElementById("mv-toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.id = "mv-toast-stack";
      stack.className = "mv-toast-stack";
      document.body.appendChild(stack);
    }
    const toast = document.createElement("div");
    toast.className = "mv-toast mv-toast-success";
    toast.innerHTML = `<span>${message}</span>${xpBadge ? `<span class="mv-toast-xp">${xpBadge}</span>` : ""}`;
    stack.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.25s ease";
      setTimeout(() => toast.remove(), 260);
    }, 2800);
  }

  static renderHeaderPill(pillEl) {
    if (!pillEl) return;
    const stats = this.getStats();
    const circ = 2 * Math.PI * 6;
    const offset = circ * (1 - stats.rankProgress);
    pillEl.innerHTML = `
      <svg class="mv-xp-ring" viewBox="0 0 16 16">
        <circle class="mv-xp-ring-bg" cx="8" cy="8" r="6"></circle>
        <circle class="mv-xp-ring-fill" cx="8" cy="8" r="6" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"></circle>
      </svg>
      <span class="mv-xp-meta">
        <span class="mv-xp-rank">Niv.${stats.rank.level} ${stats.rank.name}</span>
        <span class="mv-xp-val">${stats.xp} XP</span>
      </span>
    `;
  }

  static openProfileModal(basePath = "./") {
    let backdrop = document.getElementById("mv-profile-modal");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "mv-profile-modal";
      backdrop.className = "mv-modal-backdrop";
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) backdrop.classList.remove("is-open");
      });
      document.body.appendChild(backdrop);
    }

    const stats = this.getStats();
    const pct = Math.round((stats.masteredCount / Math.max(1, stats.totalCount)) * 100);
    backdrop.innerHTML = `
      <div class="mv-modal" role="dialog" aria-modal="true" aria-label="Progression">
        <div class="mv-modal-head">
          <h2>Progression — Math Vizualizer</h2>
          <button class="mv-btn mv-btn-ghost mv-btn-icon" id="mv-profile-close" type="button">✕</button>
        </div>
        <div class="mv-modal-body">
          <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap">
            <div>
              <div class="mv-dash-rank-label">Rang actuel · Niveau ${stats.rank.level}</div>
              <div class="mv-dash-rank-name">${stats.rank.name}</div>
            </div>
            <div class="mv-dash-xp">
              <div class="mv-dash-xp-big">${stats.xp} XP</div>
              <div class="mv-dash-xp-sub">${stats.nextRank ? `${stats.nextRank.minXp - stats.xp} XP avant ${stats.nextRank.name}` : "Rang maximal atteint"}</div>
            </div>
          </div>
          <div class="mv-progress-track">
            <div class="mv-progress-fill is-green" style="width:${Math.round(stats.rankProgress * 100)}%"></div>
          </div>
          <div class="mv-dash-metrics">
            <div class="mv-metric-box"><span class="mv-metric-val">${stats.masteredCount}/${stats.totalCount}</span><span class="mv-metric-lbl">Assimilés (${pct}%)</span></div>
            <div class="mv-metric-box"><span class="mv-metric-val">${stats.exploredCount}</span><span class="mv-metric-lbl">Playgrounds testés</span></div>
            <div class="mv-metric-box"><span class="mv-metric-val">${stats.pinnedCount}</span><span class="mv-metric-lbl">Épinglés</span></div>
            <div class="mv-metric-box"><span class="mv-metric-val">${stats.streak}j</span><span class="mv-metric-lbl">Série active</span></div>
          </div>
          <div>
            <div class="mv-dash-rank-label" style="margin-bottom:10px">Paliers & Badges (${stats.unlockedMilestones}/${stats.milestones.length})</div>
            <div class="mv-trophy-grid">
              ${stats.milestones
                .map(
                  (m) => `
                  <div class="mv-trophy-card ${m.unlocked ? "is-unlocked" : ""}">
                    <div class="mv-trophy-title">${m.unlocked ? "✓ " : ""}${m.title}</div>
                    <div class="mv-trophy-desc">${m.desc}</div>
                  </div>
                `
                )
                .join("")}
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding-top:10px;border-top:1px solid var(--border-muted)">
            <span style="font-size:12px;color:var(--text-muted)">Sauvegardé localement dans ce navigateur.</span>
            <div style="display:flex;gap:8px">
              <button type="button" class="mv-btn mv-btn-sm" id="mv-export-btn">Exporter JSON</button>
              <button type="button" class="mv-btn mv-btn-sm" id="mv-reset-btn">Réinitialiser</button>
            </div>
          </div>
        </div>
      </div>
    `;

    backdrop.classList.add("is-open");
    backdrop.querySelector("#mv-profile-close")?.addEventListener("click", () => backdrop.classList.remove("is-open"));
    backdrop.querySelector("#mv-export-btn")?.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(this.load(), null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "math-vizualizer-progress.json";
      a.click();
    });
    backdrop.querySelector("#mv-reset-btn")?.addEventListener("click", () => {
      if (confirm("Réinitialiser toute votre progression locale ?")) {
        localStorage.removeItem(STORE_KEY);
        window.location.reload();
      }
    });
  }
}
