import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function RobotBrandLoader({ onComplete, duration = 3.2, mode = "entry" }) {
  const containerRef = useRef(null);
  const robotRef = useRef(null);
  const eyesRef = useRef(null);
  const antennaRef = useRef(null);
  const coreRef = useRef(null);
  const brandRef = useRef(null);
  const progressRef = useRef(null);
  const shadowRef = useRef(null);

  // Orbital Ring Refs
  const orbitRing1Ref = useRef(null);
  const orbitRing2Ref = useRef(null);
  const orbitRing3Ref = useRef(null);
  const orbitNodesRef = useRef(null);
  const ambientGlowRef = useRef(null);

  const [progressVal, setProgressVal] = useState(0);
  const [statusText, setStatusText] = useState(
    mode === "auth" ? "Authenticating Session..." : "Initializing JobVault AI..."
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // 1. Initial State
      gsap.set(containerRef.current, { opacity: 0 });
      gsap.set(robotRef.current, { y: -24, opacity: 0, scale: 0.92 });
      gsap.set(brandRef.current, { y: 16, opacity: 0 });

      // 2. Entrance Sequence
      tl.to(containerRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      })
        .to(
          robotRef.current,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.65,
            ease: "back.out(1.5)",
          },
          "-=0.15"
        )
        .to(
          brandRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            ease: "power2.out",
          },
          "-=0.25"
        );

      // 3. Continuous Gentle Levitation for Robot
      gsap.to(robotRef.current, {
        y: -9,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Subtle Breathing Shadow
      gsap.to(shadowRef.current, {
        scaleX: 0.82,
        opacity: 0.18,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 4. Enhanced Orbital Rings Animations
      // Orbit Ring 1 (Smooth continuous 3D rotation)
      gsap.to(orbitRing1Ref.current, {
        rotation: 360,
        duration: 12,
        repeat: -1,
        ease: "none",
        transformOrigin: "center center",
      });

      // Orbit Ring 2 (Counter continuous rotation for depth)
      gsap.to(orbitRing2Ref.current, {
        rotation: -360,
        duration: 18,
        repeat: -1,
        ease: "none",
        transformOrigin: "center center",
      });

      // Orbit Ring 3 (Pulsing 3D Elliptical Energy Ring)
      gsap.to(orbitRing3Ref.current, {
        scale: 1.06,
        opacity: 0.9,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "center center",
      });

      // Orbit Nodes (Smooth orbital travel around the robot)
      gsap.to(orbitNodesRef.current, {
        rotation: 360,
        duration: 7,
        repeat: -1,
        ease: "none",
        transformOrigin: "center center",
      });

      // Ambient Golden Aura Breathing
      gsap.to(ambientGlowRef.current, {
        scale: 1.18,
        opacity: 0.55,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 5. Golden Core Reactor Pulse
      gsap.to(coreRef.current, {
        scale: 1.25,
        opacity: 1,
        duration: 0.85,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        transformOrigin: "center center",
      });

      // 6. Antenna Beacon Pulse
      gsap.to(antennaRef.current, {
        scale: 1.4,
        opacity: 0.5,
        duration: 0.7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "center center",
      });

      // 7. Expressive Eye Blinking Cycle
      const blinkTl = gsap.timeline({ repeat: -1, repeatDelay: 2.2 });
      blinkTl
        .to(eyesRef.current, { scaleY: 0.1, duration: 0.1, transformOrigin: "center center" })
        .to(eyesRef.current, { scaleY: 1, duration: 0.12, transformOrigin: "center center" });

      // 8. Progress Animation
      const progObj = { val: 0 };
      gsap.to(progObj, {
        val: 100,
        duration: duration - 0.4,
        ease: "power1.inOut",
        onUpdate: () => {
          const v = Math.round(progObj.val);
          setProgressVal(v);
          if (progressRef.current) {
            progressRef.current.style.width = `${v}%`;
          }
          if (mode === "auth") {
            if (v < 35) {
              setStatusText("Verifying Credentials...");
            } else if (v < 80) {
              setStatusText("Authenticating Workspace...");
            } else {
              setStatusText("Access Granted!");
            }
          } else {
            if (v < 35) {
              setStatusText("Initializing AI Engine...");
            } else if (v < 75) {
              setStatusText("Preparing Workspace...");
            } else {
              setStatusText("Ready!");
            }
          }
        },
        onComplete: () => {
          // 9. Smooth exit fade into login page
          gsap.to(containerRef.current, {
            opacity: 0,
            scale: 1.015,
            duration: 0.45,
            delay: 0.15,
            ease: "power2.inOut",
            onComplete: () => {
              if (onComplete) onComplete();
            },
          });
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [duration, mode, onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#FAF7F2] select-none"
    >
      {/* ------------------------------------------------------------- */}
      {/* BACKGROUND LAYER 1: Dreamy Workspace Backdrop matching Login */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <img
          src="/Login image up.png"
          onError={(e) => {
            if (!e.currentTarget.src.includes("login image next.png")) {
              e.currentTarget.src = "/login image next.png";
            }
          }}
          alt=""
          className="w-full h-full object-cover object-center scale-105 blur-[28px] opacity-20"
          aria-hidden="true"
        />
        {/* Soft luxury champagne overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-[#FAF7F2]/90 to-[#FDF8EE]/95" />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BACKGROUND LAYER 2: Signature Golden Wave Curves matching Login */}
      {/* ------------------------------------------------------------- */}
      {/* Top-Right Soft Champagne Ribbon Wave */}
      <div className="absolute top-0 right-0 w-80 sm:w-96 md:w-[440px] h-48 sm:h-60 pointer-events-none select-none z-0 overflow-hidden">
        <svg
          viewBox="0 0 360 180"
          fill="none"
          className="w-full h-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="loaderTopGoldWave" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#DF9F2D" stopOpacity="0.22" />
              <stop offset="50%" stopColor="#F5DFB3" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M360 0 C240 15, 160 70, 80 180 L360 180 Z" fill="url(#loaderTopGoldWave)" />
        </svg>
      </div>

      {/* Bottom-Left Ambient Soft Gold Glow */}
      <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-[#DF9F2D]/12 blur-[80px] pointer-events-none" />

      {/* Center Ambient Golden Radial Bloom behind Robot */}
      <div
        ref={ambientGlowRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[58%] w-72 h-72 sm:w-84 sm:h-84 rounded-full bg-gradient-to-tr from-[#F59E0B]/25 via-[#DF9F2D]/20 to-[#FDE68A]/15 blur-[60px] pointer-events-none"
      />

      {/* ------------------------------------------------------------- */}
      {/* MAIN STAGE: Robot Mascot & Enhanced Holographic Orbital Rings */}
      {/* ------------------------------------------------------------- */}
      <div className="relative flex flex-col items-center justify-center z-10">
        {/* Robot & Orbital Rings Container */}
        <div className="relative w-56 h-56 flex items-center justify-center">
          {/* ======================================================== */}
          {/* ENHANCED ORBITAL ENERGY SYSTEM (Rich, Multi-layer, 3D)  */}
          {/* ======================================================== */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Layer A: 3D Tilted Elliptical Energy Ring (Matches the loop around robot in Login art) */}
            <div
              ref={orbitRing3Ref}
              className="absolute w-52 h-28 border-2 border-[#DF9F2D]/60 rounded-[100%] rotate-[-22deg] shadow-[0_0_18px_rgba(223,159,45,0.45)] pointer-events-none"
              style={{
                boxShadow: "0 0 16px rgba(223,159,45,0.35), inset 0 0 12px rgba(245,158,11,0.25)",
              }}
            />

            {/* Layer B: Outer Precision Tech Orbit (Rotating counter-clockwise with dash accents) */}
            <svg
              ref={orbitRing2Ref}
              className="absolute w-52 h-52 pointer-events-none"
              viewBox="0 0 200 200"
              fill="none"
            >
              <circle
                cx="100"
                cy="100"
                r="92"
                stroke="#C68A1E"
                strokeWidth="1.2"
                strokeOpacity="0.32"
                strokeDasharray="4 8"
              />
              {/* Tech tick marks */}
              <circle cx="100" cy="8" r="2.5" fill="#C68A1E" fillOpacity="0.8" />
              <circle cx="192" cy="100" r="2.5" fill="#C68A1E" fillOpacity="0.8" />
              <circle cx="100" cy="192" r="2.5" fill="#C68A1E" fillOpacity="0.8" />
              <circle cx="8" cy="100" r="2.5" fill="#C68A1E" fillOpacity="0.8" />
            </svg>

            {/* Layer C: Primary Inner Golden Hologram Ring (Smooth glowing gradient) */}
            <svg
              ref={orbitRing1Ref}
              className="absolute w-44 h-44 pointer-events-none"
              viewBox="0 0 180 180"
              fill="none"
            >
              <defs>
                <linearGradient id="orbitGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE194" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="#DF9F2D" stopOpacity="0.85" />
                  <stop offset="70%" stopColor="#C68A1E" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.1" />
                </linearGradient>
                <filter id="goldGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle
                cx="90"
                cy="90"
                r="82"
                stroke="url(#orbitGoldGrad)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeDasharray="140 18"
                filter="url(#goldGlowFilter)"
              />
            </svg>

            {/* Layer D: Orbiting Energy Satellites / Glowing Nodes */}
            <svg
              ref={orbitNodesRef}
              className="absolute w-48 h-48 pointer-events-none"
              viewBox="0 0 190 190"
              fill="none"
            >
              {/* Golden Satellite Node 1 with Glow */}
              <circle
                cx="95"
                cy="11"
                r="4.5"
                fill="#FBBF24"
                className="drop-shadow-[0_0_8px_#DF9F2D]"
              />
              <circle cx="95" cy="11" r="2" fill="#FFFFFF" />

              {/* Cyan Secondary Energy Spark (matching robot eyes) */}
              <circle
                cx="95"
                cy="179"
                r="3.5"
                fill="#00F5FF"
                className="drop-shadow-[0_0_8px_#00F5FF]"
              />
              <circle cx="95" cy="179" r="1.5" fill="#FFFFFF" />
            </svg>
          </div>

          {/* ======================================================== */}
          {/* HIGH-FIDELITY VECTOR ROBOT MASCOT                       */}
          {/* ======================================================== */}
          <div ref={robotRef} className="relative z-10 flex flex-col items-center">
            <svg
              className="w-36 h-36 drop-shadow-[0_16px_30px_rgba(198,138,30,0.24)] drop-shadow-[0_6px_14px_rgba(21,32,44,0.12)]"
              viewBox="0 0 160 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Metallic Glossy Body Gradient */}
                <linearGradient id="robotBodyGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#F8FAFC" />
                  <stop offset="100%" stopColor="#E2E8F0" />
                </linearGradient>

                {/* Dark Visor Screen */}
                <linearGradient id="visorGlassDark" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0B111E" />
                  <stop offset="100%" stopColor="#050811" />
                </linearGradient>

                {/* Rich Gold Tech Accent */}
                <linearGradient id="goldTechGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFDF88" />
                  <stop offset="50%" stopColor="#DF9F2D" />
                  <stop offset="100%" stopColor="#A86E12" />
                </linearGradient>

                {/* Cyan Neon Glow Filter */}
                <filter id="cyanGlowLight" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Antenna Stem */}
              <rect x="78" y="14" width="4" height="18" rx="2" fill="url(#goldTechGradLight)" />
              <circle cx="80" cy="30" r="6" fill="#64748B" />

              {/* Pulsing Golden Beacon Bulb */}
              <circle
                ref={antennaRef}
                cx="80"
                cy="12"
                r="6"
                fill="#FBBF24"
                className="drop-shadow-[0_0_8px_#F59E0B]"
              />
              <circle cx="80" cy="12" r="2.5" fill="#FFFFFF" />

              {/* Robot Head Outer Shell */}
              <rect
                x="35"
                y="28"
                width="90"
                height="68"
                rx="34"
                fill="url(#robotBodyGradLight)"
                stroke="#CBD5E1"
                strokeWidth="1.8"
              />

              {/* Gold Side Ear Discs */}
              <rect x="28" y="46" width="7" height="28" rx="3.5" fill="url(#goldTechGradLight)" />
              <rect x="125" y="46" width="7" height="28" rx="3.5" fill="url(#goldTechGradLight)" />
              <circle cx="31.5" cy="60" r="2" fill="#1E293B" />
              <circle cx="128.5" cy="60" r="2" fill="#1E293B" />

              {/* Dark Visor Screen */}
              <rect
                x="44"
                y="38"
                width="72"
                height="44"
                rx="20"
                fill="url(#visorGlassDark)"
                stroke="rgba(0,245,255,0.4)"
                strokeWidth="1.2"
              />

              {/* Visor Specular Highlight */}
              <path
                d="M52 44 C66 44, 98 44, 108 51 C96 47, 68 47, 52 51 Z"
                fill="#FFFFFF"
                fillOpacity="0.25"
              />

              {/* Expressive Cyan Glowing Eyes */}
              <g ref={eyesRef}>
                {/* Left Eye */}
                <circle cx="64" cy="58" r="7.5" fill="#00F5FF" filter="url(#cyanGlowLight)" />
                <circle cx="64" cy="58" r="4" fill="#FFFFFF" />
                <circle cx="62.5" cy="56.5" r="1.5" fill="#0284C7" />

                {/* Right Eye */}
                <circle cx="96" cy="58" r="7.5" fill="#00F5FF" filter="url(#cyanGlowLight)" />
                <circle cx="96" cy="58" r="4" fill="#FFFFFF" />
                <circle cx="94.5" cy="56.5" r="1.5" fill="#0284C7" />
              </g>

              {/* Cheerful Golden Smile */}
              <path
                d="M74 72 Q80 77 86 72"
                stroke="#FBBF24"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />

              {/* Neck Joint */}
              <rect x="71" y="94" width="18" height="7" rx="2.5" fill="#64748B" />

              {/* Robot Torso */}
              <path
                d="M48 100 C48 100, 60 98, 80 98 C100 98, 112 100, 112 100 C118 100, 122 106, 118 114 L112 136 C110 140, 104 143, 98 143 L62 143 C56 143, 50 140, 48 136 L42 114 C38 106, 42 100, 48 100 Z"
                fill="url(#robotBodyGradLight)"
                stroke="#CBD5E1"
                strokeWidth="1.8"
              />

              {/* Gold Shoulder Trim */}
              <rect x="36" y="104" width="10" height="15" rx="5" fill="url(#goldTechGradLight)" />
              <rect x="114" y="104" width="10" height="15" rx="5" fill="url(#goldTechGradLight)" />

              {/* Central Golden JV Reactor Core */}
              <circle
                cx="80"
                cy="120"
                r="13"
                fill="#1E293B"
                stroke="url(#goldTechGradLight)"
                strokeWidth="1.8"
              />
              <circle
                ref={coreRef}
                cx="80"
                cy="120"
                r="7"
                fill="#FBBF24"
                className="drop-shadow-[0_0_6px_#F59E0B]"
              />
              <text
                x="80"
                y="123"
                textAnchor="middle"
                fontSize="6"
                fontWeight="bold"
                fontFamily="sans-serif"
                fill="#FFFFFF"
              >
                JV
              </text>
            </svg>

            {/* Hover Floor Shadow */}
            <div
              ref={shadowRef}
              className="w-28 h-3.5 bg-[#C68A1E]/20 rounded-full blur-[6px] mt-1"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* BRAND IDENTITY & PROGRESS: Matching Login Typography & Colors */}
        {/* ------------------------------------------------------------- */}
        <div ref={brandRef} className="flex flex-col items-center mt-5 text-center">
          {/* Brand Logo & Name (Exact match to Login.jsx header) */}
          <div className="flex items-center gap-3">
            <div className="w-[42px] h-[42px] rounded-[11px] bg-[#C68A1E] text-white flex items-center justify-center font-['Bricolage_Grotesque',sans-serif] font-bold text-[1.2rem] shadow-[0_4px_14px_rgba(198,138,30,0.35)] shrink-0">
              JV
            </div>
            <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-[1.65rem] text-[#15202C] tracking-tight leading-none">
              JobVault AI
            </span>
          </div>

          {/* Subtitle Badge with hairline lines (matching Login portal badge) */}
          <div className="flex items-center gap-2 mt-2.5">
            <div className="h-[1px] bg-[#E2E8F0] w-8 sm:w-14" />
            <span className="bg-[#FDF4E2] text-[#8A5C14] text-[0.66rem] font-bold tracking-[0.08em] px-2.5 py-0.5 rounded-[5px] uppercase border border-[#F5EAD3] inline-block shrink-0 shadow-2xs">
              INTELLIGENT RECRUITMENT AUTOMATION
            </span>
            <div className="h-[1px] bg-[#E2E8F0] w-8 sm:w-14" />
          </div>

          {/* Golden Progress Bar & Real-time Status */}
          <div className="mt-5 w-60 sm:w-64 flex flex-col gap-2">
            {/* Progress Track */}
            <div className="w-full h-[5px] rounded-full bg-[#EFE8DD] border border-[#E5DAC8] overflow-hidden relative shadow-inner">
              <div
                ref={progressRef}
                className="h-full rounded-full bg-gradient-to-r from-[#C68A1E] via-[#DF9F2D] to-[#F59E0B] shadow-[0_0_10px_rgba(198,138,30,0.5)] transition-all duration-75"
                style={{ width: "0%" }}
              />
            </div>

            {/* Status & Percentage */}
            <div className="flex items-center justify-between text-[0.78rem] font-mono">
              <span className="text-[#8A5C14] font-bold">{progressVal}%</span>
              <span className="text-[#5A6777] font-medium truncate text-right">{statusText}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
