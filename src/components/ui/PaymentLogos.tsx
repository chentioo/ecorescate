import React from "react";

export function VisaLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="32" rx="4" fill="#0E4595" />
      <path
        d="M18.8 21.5H16.2L17.8 10.5H20.4L18.8 21.5ZM29.2 10.7C28.7 10.5 27.8 10.3 26.8 10.3C24.1 10.3 22.2 11.7 22.2 13.8C22.2 15.3 23.6 16.1 24.6 16.6C25.7 17.1 26 17.5 26 18C26 18.7 25.1 19.1 24.3 19.1C23.3 19.1 22.7 18.9 22 18.6L21.6 18.4L21.2 21.1C21.9 21.4 23 21.7 24.1 21.7C27 21.7 28.8 20.3 28.8 18.1C28.8 16.9 28 15.9 26.3 15.1C25.4 14.6 24.8 14.3 24.8 13.7C24.8 13.2 25.4 12.7 26.5 12.7C27.4 12.7 28.1 12.9 28.6 13.1L28.9 13.2L29.2 10.7ZM36.7 10.5H34.7C34.1 10.5 33.6 10.7 33.3 11.3L28.5 21.5H31.2L31.7 20.1H35.1L35.4 21.5H37.8L35.7 10.5H36.7ZM32.5 17.9L33.9 13.7L34.7 17.9H32.5ZM14.6 10.5L12.1 18.1L11.8 16.7C11.3 15 9.8 13.2 8.1 12.2L10.5 21.5H13.2L17.3 10.5H14.6Z"
        fill="#FFFFFF"
      />
      <path
        d="M9.8 10.5H5.8L5.7 10.7C8.8 11.5 11.8 13.6 12.7 15.8L11.8 11.4C11.6 10.7 11.1 10.5 10.5 10.5H9.8Z"
        fill="#F7B600"
      />
    </svg>
  );
}

export function MastercardLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="32" rx="4" fill="#141414" />
      <circle cx="19" cy="16" r="9" fill="#EB001B" />
      <circle cx="29" cy="16" r="9" fill="#F79E1B" />
      <path
        d="M24 9.6C22.1 11.3 20.9 13.5 20.9 16C20.9 18.5 22.1 20.7 24 22.4C25.9 20.7 27.1 18.5 27.1 16C27.1 13.5 25.9 11.3 24 9.6Z"
        fill="#FF5F00"
      />
    </svg>
  );
}

export function AmexLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="32" rx="4" fill="#006FCF" />
      <rect x="3" y="3" width="42" height="26" rx="2" fill="#0077D7" stroke="#FFFFFF" strokeWidth="0.8" />
      <text
        x="24"
        y="18.5"
        fill="#FFFFFF"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="8.5"
        letterSpacing="0.8"
        textAnchor="middle"
      >
        AMEX
      </text>
    </svg>
  );
}

export function YapeLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="72" height="28" rx="7" fill="#742384" />
      {/* Icon Circle */}
      <circle cx="14" cy="14" r="9" fill="#882C9B" />
      {/* Yape Y symbol */}
      <path
        d="M10 9.5L13.5 15V19.5H15.5V15L19 9.5H16.8L14.5 13.2L12.2 9.5H10Z"
        fill="#00E5FF"
      />
      <circle cx="18" cy="9.5" r="1.5" fill="#00E5FF" />
      {/* Brand Text */}
      <text
        x="38"
        y="19"
        fill="#FFFFFF"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="14"
        letterSpacing="0.5"
      >
        yape
      </text>
    </svg>
  );
}

export function PlinLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 68 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="68" height="28" rx="7" fill="#00D2D3" />
      <circle cx="14" cy="14" r="8.5" fill="#00B4D8" />
      <path
        d="M11 9H14.5C16.5 9 17.5 10 17.5 11.5C17.5 13 16.5 14 14.5 14H12.8V19H11V9ZM12.8 12.5H14.3C15.2 12.5 15.7 12.1 15.7 11.5C15.7 10.9 15.2 10.5 14.3 10.5H12.8V12.5Z"
        fill="#FFFFFF"
      />
      <text
        x="35"
        y="18.5"
        fill="#0A3644"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="13"
        letterSpacing="0.5"
      >
        plin
      </text>
    </svg>
  );
}

export function YapePlinQR({ amount }: { amount: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative size-36 bg-white rounded-2xl p-3 shadow-md border-2 border-purple-200 flex flex-col items-center justify-center">
        {/* Dynamic Pattern simulating Peruvian QR */}
        <div className="absolute inset-2 border-2 border-dashed border-purple-300/60 rounded-xl" />
        
        <svg viewBox="0 0 100 100" className="w-full h-full p-1" fill="#742384">
          {/* Top Left Marker */}
          <rect x="6" y="6" width="24" height="24" rx="4" fill="#742384" />
          <rect x="10" y="10" width="16" height="16" rx="2" fill="#FFFFFF" />
          <rect x="14" y="14" width="8" height="8" rx="1" fill="#742384" />

          {/* Top Right Marker */}
          <rect x="70" y="6" width="24" height="24" rx="4" fill="#742384" />
          <rect x="74" y="10" width="16" height="16" rx="2" fill="#FFFFFF" />
          <rect x="78" y="14" width="8" height="8" rx="1" fill="#742384" />

          {/* Bottom Left Marker */}
          <rect x="6" y="70" width="24" height="24" rx="4" fill="#742384" />
          <rect x="10" y="74" width="16" height="16" rx="2" fill="#FFFFFF" />
          <rect x="14" y="78" width="8" height="8" rx="1" fill="#742384" />

          {/* QR data matrix bits */}
          <rect x="36" y="8" width="5" height="5" />
          <rect x="46" y="12" width="6" height="6" />
          <rect x="56" y="8" width="5" height="5" />
          <rect x="36" y="20" width="6" height="6" />
          <rect x="48" y="24" width="5" height="5" />
          <rect x="8" y="36" width="6" height="6" />
          <rect x="20" y="42" width="5" height="5" />
          <rect x="36" y="36" width="5" height="5" />
          <rect x="44" y="42" width="5" height="5" />
          <rect x="56" y="36" width="6" height="6" />
          <rect x="72" y="40" width="6" height="6" />
          <rect x="84" y="36" width="5" height="5" />
          <rect x="80" y="48" width="6" height="6" />
          <rect x="38" y="56" width="6" height="6" />
          <rect x="48" y="52" width="5" height="5" />
          <rect x="56" y="60" width="5" height="5" />
          <rect x="70" y="72" width="6" height="6" />
          <rect x="82" y="76" width="6" height="6" />
          <rect x="74" y="84" width="6" height="6" />
          <rect x="36" y="72" width="5" height="5" />
          <rect x="46" y="80" width="6" height="6" />
          <rect x="56" y="74" width="5" height="5" />
        </svg>

        {/* Center Badge */}
        <div className="absolute inset-0 m-auto size-10 bg-white rounded-xl shadow-lg border border-purple-200 flex items-center justify-center p-1">
          <div className="size-full rounded-lg bg-gradient-to-br from-[#742384] to-[#00D2D3] flex items-center justify-center text-white font-black text-[9px] tracking-tight">
            Y/P
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <YapeLogo className="h-5 w-auto shadow-sm" />
        <span className="text-slate-300 text-xs font-bold">•</span>
        <PlinLogo className="h-5 w-auto shadow-sm" />
      </div>

      <p className="text-xs text-slate-600 text-center mt-2">
        Escanea con tu app o yapea al <strong className="text-slate-900 font-bold">987 654 321</strong>
      </p>
      <p className="text-[11px] text-slate-400">Titular: EcoRescate Perú S.A.C.</p>
    </div>
  );
}
