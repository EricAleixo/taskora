"use client";

import { toast } from "sonner";

const TrashAnimStyles = () => (
  <style>{`
    @keyframes t-item {
      0%   { opacity: 0; transform: translateY(-12px) scale(0.8); }
      8%   { opacity: 1; transform: translateY(-12px) scale(1);   }
      18%  { opacity: 1; transform: translateY(4px)   scale(1);   }
      30%  { opacity: 0; transform: translateY(20px)  scale(0.3); }
      100% { opacity: 0; transform: translateY(20px)  scale(0.3); }
    }

    @keyframes t-lid {
      0%   { transform: translate(-20px, -6px) rotate(-28deg); opacity: 0; }
      35%  { transform: translate(-20px, -6px) rotate(-28deg); opacity: 0; }
      42%  { transform: translate(-20px, -6px) rotate(-28deg); opacity: 1; }
      65%  { transform: translate(0px,  -14px) rotate(-28deg); }
      70%  { transform: translate(0px,  -14px) rotate(-28deg); }
      85%  { transform: translate(0px,    0px) rotate(0deg);   }
      100% { transform: translate(0px,    0px) rotate(0deg);   }
    }

    @keyframes t-shake {
      0%   { transform: rotate(0deg);  }
      85%  { transform: rotate(0deg);  }
      88%  { transform: rotate(-5deg); }
      91%  { transform: rotate(5deg);  }
      94%  { transform: rotate(-3deg); }
      97%  { transform: rotate(3deg);  }
      100% { transform: rotate(0deg);  }
    }

    .t-lid-anim {
      animation: t-lid   3.8s cubic-bezier(0.4,0,0.2,1) forwards;
      transform-origin: 30px 24px;
    }
    .t-item-anim {
      animation: t-item  3.8s cubic-bezier(0.4,0,0.2,1) forwards;
      transform-origin: 20px 8px;
    }
    .t-can-anim {
      animation: t-shake 3.8s cubic-bezier(0.4,0,0.2,1) forwards;
      transform-origin: 20px 32px;
    }
  `}</style>
);

const TrashToastIcon = () => (
  <div style={{ position: "relative", width: 44, height: 52, flexShrink: 0 }}>
    <TrashAnimStyles />
    <svg
      viewBox="0 0 40 48"
      width="44"
      height="52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      overflow="visible"
    >
      <g className="t-can-anim">
        <rect x="11" y="24" width="18" height="2" rx="0" fill="#b91c1c" />
        <rect x="11" y="24" width="18" height="19" rx="3" fill="#dc2626" />
        <line x1="16.5" y1="27" x2="15.5" y2="41" stroke="#ef4444" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="20"   y1="27" x2="20"   y2="41" stroke="#ef4444" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="23.5" y1="27" x2="24.5" y2="41" stroke="#ef4444" strokeWidth="1.3" strokeLinecap="round" />
        <rect x="9" y="41" width="22" height="3.5" rx="1.75" fill="#b91c1c" />
      </g>

      <g className="t-item-anim">
        <rect x="13" y="4" width="14" height="10" rx="2.5" fill="#94a3b8" />
        <line x1="17" y1="7"  x2="17" y2="13" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="20" y1="7"  x2="20" y2="13" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="23" y1="7"  x2="23" y2="13" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M16 4 Q20 1 24 4" stroke="#94a3b8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>

      <g className="t-lid-anim">
        <rect x="17" y="18" width="6" height="2.5" rx="1.2" fill="#b91c1c" />
        <rect x="10" y="20" width="20" height="4" rx="2" fill="#b91c1c" />
      </g>
    </svg>
  </div>
);

export const toastDeleteProject = (projectTitle?: string) => {
  toast.custom(
    (t) => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "#fff1f2",
          border: "1px solid #fecaca",
          borderRadius: 14,
          padding: "12px 18px 12px 14px",
          boxShadow: "0 4px 20px rgba(220, 38, 38, 0.12)",
          minWidth: 270,
          maxWidth: 380,
          cursor: "pointer",
        }}
        onClick={() => toast.dismiss(t)}
      >
        <TrashToastIcon />
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#b91c1c",
              lineHeight: 1.3,
            }}
          >
            Projeto excluído
          </span>
          {projectTitle && (
            <span
              style={{
                fontSize: 12,
                color: "#6b7280",
                lineHeight: 1.4,
              }}
            >
              "{projectTitle}" foi removido permanentemente.
            </span>
          )}
        </div>
      </div>
    ),
    { duration: 5500 },
  );
};