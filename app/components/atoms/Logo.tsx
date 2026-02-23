"use client";

import React, { useEffect, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";

type LogoVariant = "static" | "entrance" | "loading";

interface LogoProps {
  variant?: LogoVariant;
  onAnimationEnd?: () => void;
  scale?: number;
}

const SvgIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    fill="none"
    viewBox="0 0 252 252"
    {...props}
  >
    <circle cx="126" cy="126" r="126" fill="#24A136" />
    <path fill="#24A136" d="M0 119h126v133H45c-24.853 0-45-20.147-45-45z" />
    <path
      fill="#fff"
      d="M233.156 58.672c-5.858-8.646-16.619-21.468-24.656-28.172-1.12 1.074-4.697 4.937-5.925 6.1-.205.082-.303.072-.332.054-.142.337-.342.675-.824 1.095-.157.045-.238.025-.269 0-.134.337-.342.667-.82 1.07-.295.078-.3-.03-.252-.005-2.974 3.18-5.996 6.333-9.355 9.616-.214.082-.307.077-.335.062-.125.353-.3.707-.754 1.152-.16.051-.24.033-.269.008-.151.32-.374.633-.869 1.01-.296.07-.301-.025-.257-.006-4.733 5.014-9.51 10.008-14.625 15.127-.216.078-.31.07-.337.054-.131.346-.313.695-.773 1.134-.159.051-.239.033-.267.009-.15.322-.369.638-.861 1.02-.166.041-.235.034-.259.025l-1.021 1.048c-9.74 10.006-19.479 20.01-29.283 29.95a2787 2787 0 0 1-29.444 29.401c-.831.789-1.326 1.453-2.122 2.217-.671.587-1.042 1.075-1.715 1.638-.303.074-.479.078-.399.116.063.386-.087.66-.591.957-1.701 3.099-3.276 2.688-5.045-.072-1.071-1.219-2.003-2.136-3.034-3.372-.1-.319-.186-.308-.181-.352-4.946-4.819-9.897-9.593-14.95-14.716-5.14-5.155-10-10.173-15.254-14.724-13.935-12.073-36.146-4.254-40.917 13.633-3.173 11.895.259 20.523 9.063 28.17 5.247 4.558 9.85 9.876 14.9 15.166.525.371.829.543 1.188 1.073 1.06 1.12 2 2 3.087 3.168.504.549.86.81 1.31 1.395.044.154.03.238.008.274.35.121.68.32 1.089.789.087.294-.091.305-.014.259.67.471 1.262.988 1.969 1.786 1.14 1.216 2.165 2.151 3.34 3.405.785.808 1.422 1.296 2.152 2.078.062.196.047.309.027.342.326.132.659.333 1.071.817.05.174.02.268-.012.299.336.143.675.368 1.125.867.43.272.67.389.892.857.727.796 1.406 1.386 2.184 2.306.063.208.043.306.02.336.327.14.658.345 1.072.828.088.295-.023.295.005.246 3.623 3.352 7.219 6.752 10.98 10.495 1.667 1.584 3.169 2.825 4.816 4.365.513.469.88.638 1.356 1.103.045.123.047.19.038.222 3.11 1.232 6.176 2.521 9.42 4.158.178.35.63.335.845.4.916.141 1.615.218 2.479.643.166.349.576.309.76.404 9.495-2.313 17.702-5.84 24.917-13.239 37.131-38.08 74.865-75.558 112.397-113.237.239-.24.602-.541 1.355-1.024-2.302-4.89-4.855-9.415-7.844-13.828"
    />
  </svg>
);

// ─── Wave letter — safe loop with cancelled ref ───────────────────────────────

const WaveLetter: React.FC<{
  char: string;
  color: string;
  delay: number;
  infinite: boolean;
}> = ({ char, color, delay, infinite }) => {
  const controls = useAnimationControls();
  const cancelled = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    cancelled.current = false;

    const safeStart = async (props: Parameters<typeof controls.start>[0]) => {
      if (cancelled.current || !mounted.current) return;
      try {
        await controls.start(props);
      } catch {
        // component unmounted mid-animation
      }
    };

    const wave = async () => {
      if (!mounted.current) return;

      await safeStart({
        y: -6,
        transition: { duration: 0.25, ease: "easeOut", delay },
      });
      await safeStart({
        y: 0,
        transition: { duration: 0.3, ease: "easeIn" },
      });

      while (infinite && !cancelled.current && mounted.current) {
        await new Promise((r) => setTimeout(r, 1200 + delay * 300));
        await safeStart({
          y: -6,
          transition: { duration: 0.25, ease: "easeOut" },
        });
        await safeStart({
          y: 0,
          transition: { duration: 0.3, ease: "easeIn" },
        });
      }
    };

    wave();

    return () => {
      cancelled.current = true;
      controls.stop(); // para qualquer animação em andamento
    };
  }, []);

  return (
    <motion.span animate={controls} style={{ display: "inline-block", color }}>
      {char === " " ? "\u00a0" : char}
    </motion.span>
  );
};

const WaveText: React.FC<{
  text: string;
  color: string;
  baseDelay: number;
  infinite: boolean;
}> = ({ text, color, baseDelay, infinite }) => (
  <>
    {text.split("").map((char, i) => (
      <WaveLetter
        key={i}
        char={char}
        color={color}
        delay={baseDelay + i * 0.07}
        infinite={infinite}
      />
    ))}
  </>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const Logo: React.FC<LogoProps> = ({
  variant = "static",
  onAnimationEnd,
  scale = 1,
}) => {
  const iconSize = 40 * scale;
  const slideX = -(iconSize * 0.15 + 2 * scale);

  const iconControls = useAnimationControls();
  const textControls = useAnimationControls();

  const isAnimated = variant !== "static";
  const isLoading = variant === "loading";

  useEffect(() => {
    if (!isAnimated) return;

    const run = async () => {
      // 1. Icon fades + scales in from center
      await iconControls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] },
      });

      // 2. Icon glides left + text reveals (overlapping)
      iconControls.start({
        x: slideX,
        transition: { duration: 0.55, ease: [0.65, 0, 0.35, 1] },
      });

      await new Promise((r) => setTimeout(r, 160));

      await textControls.start({
        opacity: 1,
        clipPath: "inset(0 0% 0 0)",
        x: 0,
        transition: { duration: 0.55, ease: [0.65, 0, 0.35, 1] },
      });

      onAnimationEnd?.();
    };

    run();
  }, [variant]);

  // ── Static ────────────────────────────────────────────────────────────────
  if (!isAnimated) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 * scale }}>
        <SvgIcon width={iconSize} height={iconSize} />
        <h2
          style={{
            margin: 0,
            fontSize: `${2.25 * scale}rem`,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          <span className="text-[#1f2937] dark:text-gray-50">Task</span>
          <span style={{ color: "#22c55e" }}>ora</span>
        </h2>
      </div>
    );
  }

  // ── Animated ──────────────────────────────────────────────────────────────
  return (
    <div
      style={{ display: "flex", alignItems: "center", height: iconSize + 8 }}
    >
      <motion.div
        animate={iconControls}
        initial={{ opacity: 0, scale: 0.4, x: 0 }}
        style={{ zIndex: 2, flexShrink: 0 }}
      >
        <SvgIcon width={iconSize} height={iconSize} />
      </motion.div>

      <motion.h2
        animate={textControls}
        initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)", x: -8 }}
        style={{
          margin: 0,
          marginLeft: 12 * scale,
          fontSize: `${2.25 * scale}rem`,
          fontWeight: 700,
          letterSpacing: "-0.025em",
          lineHeight: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <WaveText
          text="Task"
          color="currentColor" // branco suave no dark
          baseDelay={isLoading ? 0.3 : 0.7}
          infinite={isLoading}
        />
        <WaveText
          text="ora"
          color="#22c55e"
          baseDelay={isLoading ? 0.3 + 4 * 0.07 : 0.7 + 4 * 0.07}
          infinite={isLoading}
        />
      </motion.h2>
    </div>
  );
};

export default Logo;
