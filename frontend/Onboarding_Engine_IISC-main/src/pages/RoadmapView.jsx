// RoadmapView.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Personalised skill-gap roadmap view for PathForge.
// Renders the RoadmapTimeline returned by POST /roadmap.
//
// Props:
//   timeline  : RoadmapTimeline dict from the backend
//   onBack    : () => void  — back to analyze view
//
// Design: dark editorial — deep navy base, amber/coral/teal priority accents,
// IBM Plex Mono for week labels, Fraunces for the header.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

// ── Style constants ───────────────────────────────────────────────────────────
const PRIORITY_COLOR = {
  high:   { bg: "#3D1A0E", border: "#D85A30", text: "#F0997B", badge: "#D85A30", badgeText: "#fff" },
  medium: { bg: "#2D2208", border: "#BA7517", text: "#EF9F27", badge: "#BA7517", badgeText: "#fff" },
  low:    { bg: "#062420", border: "#0F6E56", text: "#5DCAA5", badge: "#0F6E56", badgeText: "#fff" },
};

const PRIORITY_LABEL = { high: "Must learn", medium: "Bridge gap", low: "Nice to have" };

// ── Inject fonts ──────────────────────────────────────────────────────────────
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;1,400&family=IBM+Plex+Mono:wght@400;500&family=DM+Sans:wght@400;500&display=swap";

// ── Sub-components ────────────────────────────────────────────────────────────

function WeekBar({ node, totalWeeks }) {
  const pct    = (n) => `${((n - 1) / totalWeeks) * 100}%`;
  const width  = `${(node.duration_weeks / totalWeeks) * 100}%`;
  const colors = PRIORITY_COLOR[node.priority] || PRIORITY_COLOR.low;

  return (
    <div style={{ position: "relative", height: 6, background: "#1a1f2e", borderRadius: 3, margin: "6px 0 0" }}>
      <div style={{
        position:    "absolute",
        left:        pct(node.week_start),
        width,
        height:      "100%",
        background:  colors.border,
        borderRadius: 3,
        opacity:     0.85,
      }} />
    </div>
  );
}

function NodeCard({ node, totalWeeks, isSelected, onClick }) {
  const colors  = PRIORITY_COLOR[node.priority] || PRIORITY_COLOR.low;
  const weeks   = node.duration_weeks === 1
    ? `1 week`
    : `${node.duration_weeks} weeks`;
  const weekRange = node.week_start === node.week_end
    ? `Week ${node.week_start}`
    : `Weeks ${node.week_start}–${node.week_end}`;

  return (
    <div
      onClick={onClick}
      style={{
        background:   isSelected ? colors.bg : "#0f1320",
        border:       `1px solid ${isSelected ? colors.border : "#1e2436"}`,
        borderLeft:   `3px solid ${colors.border}`,
        borderRadius: 8,
        padding:      "14px 16px",
        cursor:       "pointer",
        transition:   "all 0.18s ease",
        marginBottom: 8,
      }}
      onMouseEnter={e => {
        if (!isSelected) e.currentTarget.style.borderColor = colors.border;
      }}
      onMouseLeave={e => {
        if (!isSelected) e.currentTarget.style.borderColor = "#1e2436";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize:   15,
              fontWeight: 500,
              color:      "#e8eaf0",
            }}>
              {node.skill}
            </span>
            {node.is_prerequisite_only && (
              <span style={{
                fontSize:   10,
                fontFamily: "'IBM Plex Mono', monospace",
                color:      "#4a5068",
                border:     "1px solid #2a3048",
                borderRadius: 3,
                padding:    "1px 5px",
                letterSpacing: "0.05em",
              }}>PREREQ</span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <span style={{
              fontFamily:  "'IBM Plex Mono', monospace",
              fontSize:    11,
              color:       "#4a5068",
              letterSpacing: "0.04em",
            }}>
              {weekRange}  ·  {weeks}
            </span>
            <span style={{
              fontSize:    10,
              background:  colors.badge,
              color:       colors.badgeText,
              borderRadius: 3,
              padding:     "1px 6px",
              fontFamily:  "'IBM Plex Mono', monospace",
              letterSpacing: "0.05em",
            }}>
              {PRIORITY_LABEL[node.priority]}
            </span>
            {node.category && (
              <span style={{
                fontSize:  10,
                color:     "#3a4060",
                fontFamily: "'IBM Plex Mono', monospace",
                letterSpacing: "0.05em",
              }}>
                {node.category}
              </span>
            )}
          </div>
        </div>

        {node.gap_score > 0 && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize:   13,
              color:      colors.text,
              fontWeight: 500,
            }}>
              {Math.round((1 - node.gap_score) * 100)}%
            </div>
            <div style={{ fontSize: 9, color: "#3a4060", fontFamily: "'IBM Plex Mono', monospace" }}>
              match
            </div>
          </div>
        )}
      </div>

      <WeekBar node={node} totalWeeks={totalWeeks} />
    </div>
  );
}

function DetailPanel({ node, onClose }) {
  if (!node) return null;
  const colors = PRIORITY_COLOR[node.priority] || PRIORITY_COLOR.low;

  return (
    <div style={{
      position:   "sticky",
      top:        16,
      background: "#0a0d18",
      border:     `1px solid ${colors.border}`,
      borderRadius: 10,
      padding:    24,
      minHeight:  200,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{
            fontFamily: "'Fraunces', serif",
            fontSize:   22,
            color:      "#e8eaf0",
            lineHeight: 1.2,
          }}>{node.skill}</div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize:   11,
            color:      colors.text,
            marginTop:  4,
            letterSpacing: "0.05em",
          }}>
            {node.week_start === node.week_end ? `Week ${node.week_start}` : `Weeks ${node.week_start}–${node.week_end}`}
            &nbsp;·&nbsp;{node.duration_weeks} week{node.duration_weeks !== 1 ? "s" : ""}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none", border: "none", color: "#3a4060",
            cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0,
          }}
        >✕</button>
      </div>

      <div style={{
        margin:     "16px 0",
        padding:    "12px 14px",
        background: colors.bg,
        borderRadius: 6,
        fontFamily: "'DM Sans', sans-serif",
        fontSize:   14,
        color:      "#c8cad8",
        lineHeight: 1.6,
      }}>
        {node.description}
      </div>

      {node.course_id && (
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize:   10,
            color:      "#3a4060",
            letterSpacing: "0.08em",
            marginBottom: 6,
          }}>RECOMMENDED COURSE</div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize:   14,
            color:      "#e8eaf0",
            background: "#141826",
            border:     "1px solid #1e2436",
            borderRadius: 6,
            padding:    "10px 12px",
          }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize:   10,
              color:      colors.text,
              marginRight: 8,
            }}>{node.course_id.toUpperCase()}</span>
            {node.course_title}
          </div>
        </div>
      )}

      {node.prerequisites && node.prerequisites.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize:   10,
            color:      "#3a4060",
            letterSpacing: "0.08em",
            marginBottom: 6,
          }}>PREREQUISITES</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {node.prerequisites.map(p => (
              <span key={p} style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize:   11,
                color:      "#6870a0",
                background: "#0f1320",
                border:     "1px solid #1e2436",
                borderRadius: 4,
                padding:    "3px 8px",
              }}>{p}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{
        display:    "flex",
        alignItems: "center",
        gap:        8,
        marginTop:  16,
        paddingTop: 14,
        borderTop:  "1px solid #1e2436",
      }}>
        <div style={{
          flex:       1,
          height:     6,
          background: "#1a1f2e",
          borderRadius: 3,
          overflow:   "hidden",
        }}>
          <div style={{
            width:      `${Math.round((1 - (node.gap_score || 0)) * 100)}%`,
            height:     "100%",
            background: colors.border,
            borderRadius: 3,
          }} />
        </div>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize:   11,
          color:      colors.text,
          minWidth:   36,
          textAlign:  "right",
        }}>
          {node.gap_score > 0
            ? `${Math.round((1 - node.gap_score) * 100)}% match`
            : "prereq"}
        </span>
      </div>
    </div>
  );
}

function TimelineRuler({ totalWeeks }) {
  const ticks = [];
  const step  = totalWeeks <= 8 ? 1 : totalWeeks <= 16 ? 2 : 4;
  for (let w = 1; w <= totalWeeks; w += step) ticks.push(w);

  return (
    <div style={{ position: "relative", height: 24, marginBottom: 2 }}>
      {ticks.map(w => (
        <span key={w} style={{
          position:   "absolute",
          left:       `${((w - 1) / totalWeeks) * 100}%`,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize:   10,
          color:      "#2a3048",
          transform:  "translateX(-50%)",
          letterSpacing: "0.04em",
        }}>
          W{w}
        </span>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RoadmapView({ timeline, onBack }) {
  const [selected,    setSelected]    = useState(null);
  const [filterPri,   setFilterPri]   = useState("all");
  const [showPrereqs, setShowPrereqs] = useState(true);

  // Inject Google Fonts
  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_LINK}"]`)) {
      const link = document.createElement("link");
      link.rel  = "stylesheet";
      link.href = FONT_LINK;
      document.head.appendChild(link);
    }
  }, []);

  if (!timeline) return null;

  const { nodes = [], total_weeks = 1, high_weeks = 0, medium_weeks = 0,
          low_weeks = 0, candidate_name, target_role, match_score, summary,
          known_skills = [] } = timeline;

  const filtered = nodes.filter(n => {
    if (!showPrereqs && n.is_prerequisite_only) return false;
    if (filterPri !== "all" && n.priority !== filterPri) return false;
    return true;
  });

  const selectedNode = selected ? nodes.find(n => n.id === selected) : null;

  const StatBox = ({ label, value, color }) => (
    <div style={{
      background: "#0f1320",
      border:     `1px solid #1e2436`,
      borderTop:  `2px solid ${color}`,
      borderRadius: 8,
      padding:    "12px 16px",
      minWidth:   90,
    }}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize:   22,
        fontWeight: 500,
        color,
        lineHeight: 1,
      }}>{value}</div>
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize:   11,
        color:      "#3a4060",
        marginTop:  4,
      }}>{label}</div>
    </div>
  );

  const PillBtn = ({ label, value, color }) => (
    <button
      onClick={() => setFilterPri(value)}
      style={{
        fontFamily:  "'IBM Plex Mono', monospace",
        fontSize:    11,
        letterSpacing: "0.05em",
        padding:     "5px 12px",
        borderRadius: 20,
        border:      `1px solid ${filterPri === value ? color : "#1e2436"}`,
        background:  filterPri === value ? color + "22" : "transparent",
        color:       filterPri === value ? color : "#3a4060",
        cursor:      "pointer",
        transition:  "all 0.15s",
      }}
    >{label}</button>
  );

  return (
    <div style={{
      background: "#080b14",
      minHeight:  "100vh",
      padding:    "0 0 48px",
      fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* ── Header ── */}
      <div style={{
        background:   "#0a0d18",
        borderBottom: "1px solid #1a1f2e",
        padding:      "20px 28px 18px",
      }}>
        <button
          onClick={onBack}
          style={{
            background:  "none",
            border:      "1px solid #1e2436",
            borderRadius: 6,
            color:       "#4a5068",
            fontFamily:  "'IBM Plex Mono', monospace",
            fontSize:    11,
            padding:     "5px 12px",
            cursor:      "pointer",
            marginBottom: 16,
            letterSpacing: "0.05em",
          }}
        >← back to analysis</button>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{
              fontFamily: "'Fraunces', serif",
              fontSize:   28,
              color:      "#e8eaf0",
              lineHeight: 1.1,
            }}>
              {candidate_name}'s learning roadmap
            </div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize:   12,
              color:      "#3a4060",
              marginTop:  6,
              letterSpacing: "0.05em",
            }}>
              target → {target_role}  ·  current match {match_score}%
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <StatBox label={`total weeks`}    value={total_weeks}  color="#6870a0" />
            <StatBox label={`high priority`}  value={high_weeks}   color={PRIORITY_COLOR.high.border} />
            <StatBox label={`medium priority`} value={medium_weeks} color={PRIORITY_COLOR.medium.border} />
            <StatBox label={`skills known`}   value={known_skills.length} color="#1D9E75" />
          </div>
        </div>

        {summary && (
          <div style={{
            marginTop:  14,
            fontFamily: "'DM Sans', sans-serif",
            fontSize:   13,
            color:      "#4a5068",
            lineHeight: 1.5,
            maxWidth:   640,
          }}>
            {summary}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{
        display:   "grid",
        gridTemplateColumns: "1fr 320px",
        gap:       20,
        padding:   "20px 28px",
        maxWidth:  1100,
        margin:    "0 auto",
      }}>

        {/* ── Left: node list ── */}
        <div>
          {/* Filter bar */}
          <div style={{
            display:       "flex",
            alignItems:    "center",
            gap:           8,
            marginBottom:  16,
            flexWrap:      "wrap",
          }}>
            <PillBtn label="all"           value="all"    color="#6870a0" />
            <PillBtn label="high"          value="high"   color={PRIORITY_COLOR.high.border} />
            <PillBtn label="medium"        value="medium" color={PRIORITY_COLOR.medium.border} />
            <PillBtn label="low"           value="low"    color={PRIORITY_COLOR.low.border} />

            <div style={{ flex: 1 }} />

            <label style={{
              display:    "flex",
              alignItems: "center",
              gap:        6,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize:   11,
              color:      "#3a4060",
              cursor:     "pointer",
              letterSpacing: "0.05em",
            }}>
              <input
                type="checkbox"
                checked={showPrereqs}
                onChange={e => setShowPrereqs(e.target.checked)}
                style={{ accentColor: "#6870a0" }}
              />
              show prerequisites
            </label>
          </div>

          {/* Timeline ruler */}
          <TimelineRuler totalWeeks={total_weeks} />

          {/* Nodes */}
          {filtered.length === 0 ? (
            <div style={{
              textAlign:  "center",
              padding:    "40px 0",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize:   12,
              color:      "#2a3048",
            }}>
              no skills match this filter
            </div>
          ) : (
            filtered.map(n => (
              <NodeCard
                key={n.id}
                node={n}
                totalWeeks={total_weeks}
                isSelected={selected === n.id}
                onClick={() => setSelected(selected === n.id ? null : n.id)}
              />
            ))
          )}

          {/* Known skills */}
          {known_skills.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <div style={{
                fontFamily:    "'IBM Plex Mono', monospace",
                fontSize:      10,
                color:         "#2a3048",
                letterSpacing: "0.08em",
                marginBottom:  10,
              }}>ALREADY KNOWN — {known_skills.length} SKILLS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {known_skills.map(s => (
                  <span key={s} style={{
                    fontFamily:  "'IBM Plex Mono', monospace",
                    fontSize:    11,
                    color:       "#1D9E75",
                    background:  "#062420",
                    border:      "1px solid #0F6E56",
                    borderRadius: 4,
                    padding:     "3px 8px",
                  }}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: detail panel ── */}
        <div>
          {selectedNode ? (
            <DetailPanel
              node={selectedNode}
              onClose={() => setSelected(null)}
            />
          ) : (
            <div style={{
              background:   "#0a0d18",
              border:       "1px solid #1a1f2e",
              borderRadius: 10,
              padding:      24,
              textAlign:    "center",
            }}>
              <div style={{
                fontFamily: "'Fraunces', serif",
                fontSize:   16,
                color:      "#2a3048",
                fontStyle:  "italic",
                lineHeight: 1.5,
              }}>
                click any skill to see<br />details and course
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
