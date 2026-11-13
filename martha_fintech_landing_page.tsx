import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Wallet,
  Users,
  Lock,
  ArrowRight,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  FileText,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  Smartphone,
  Calendar,
  Layers,
  Download,
  Fingerprint,
  Plus,
  Scan,
  ArrowLeftRight,
  Bell,
  Star,
  ExternalLink,
  ChevronDown,
  Scale,
  Calculator,
  UserPlus,
  ArrowUpRight,
  Apple,
  QrCode,
  Shield,
  Clock,
  Check
} from 'lucide-react';

function useScrollAnimation() {
  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          // Removes on scroll out so animation re-triggers smoothly
          entry.target.classList.remove('is-visible');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    const animatedElements = document.querySelectorAll('.reveal-on-scroll');
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  });
}

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailer, setTrailer] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    let animId;
    const follow = () => {
      setTrailer((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.22,
        y: prev.y + (position.y - prev.y) * 0.22,
      }));
      animId = requestAnimationFrame(follow);
    };
    animId = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(animId);
  }, [position]);

  useEffect(() => {
    const handleHoverCheck = () => {
      const targets = document.querySelectorAll('button, a, input, select, [role="button"], .interactive-cursor');
      targets.forEach((el) => {
        el.addEventListener('mouseenter', () => setIsHovered(true));
        el.addEventListener('mouseleave', () => setIsHovered(false));
      });
    };
    handleHoverCheck();
    const obs = new MutationObserver(handleHoverCheck);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <div
        className="fixed pointer-events-none z-50 rounded-full transition-transform duration-75 mix-blend-difference hidden md:block"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.7 : isHovered ? 1.6 : 1})`,
          width: '10px',
          height: '10px',
          backgroundColor: '#CCFF00',
          boxShadow: '0 0 16px #CCFF00, 0 0 32px #B8E600',
        }}
      />
      <div
        className="fixed pointer-events-none z-50 rounded-full transition-all duration-300 ease-out border border-[#CCFF00]/80 bg-[#CCFF00]/10 backdrop-blur-[1px] hidden md:block"
        style={{
          left: `${trailer.x}px`,
          top: `${trailer.y}px`,
          transform: `translate(-50%, -50%) scale(${isClicking ? 1.3 : isHovered ? 2.4 : 1})`,
          width: '38px',
          height: '38px',
        }}
      />
    </>
  );
};

const InteractiveAppShowcase = () => {
  const [activeScreen, setActiveScreen] = useState('debts'); // 'home', 'debts', 'lending'
  const [activeAction, setActiveAction] = useState('scan');

  return (
    <div className="relative w-full max-w-[410px] mx-auto select-none">
      {/* Background ambient glow */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-[#CCFF00]/30 via-emerald-400/10 to-transparent rounded-[52px] blur-2xl opacity-70 pointer-events-none" />

      {/* Screen Selector Tab Switcher */}
      <div className="flex items-center justify-center gap-1.5 p-1.5 mb-4 bg-white/90 backdrop-blur-md rounded-full border border-neutral-300/80 shadow-md">
        <button
          onClick={() => setActiveScreen('home')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeScreen === 'home'
              ? 'bg-[#121316] text-[#CCFF00] shadow-sm'
              : 'text-neutral-600 hover:text-black'
          }`}
        >
          Home Flow
        </button>
        <button
          onClick={() => setActiveScreen('debts')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeScreen === 'debts'
              ? 'bg-[#121316] text-[#CCFF00] shadow-sm'
              : 'text-neutral-600 hover:text-black'
          }`}
        >
          Who Owes Whom
        </button>
        <button
          onClick={() => setActiveScreen('lending')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeScreen === 'lending'
              ? 'bg-[#121316] text-[#CCFF00] shadow-sm'
              : 'text-neutral-600 hover:text-black'
          }`}
        >
          Lent ₹6.85L
        </button>
      </div>

      {/* Phone Mockup Frame */}
      <div className="relative bg-[#F4F5F7] rounded-[44px] p-5 border-4 border-neutral-300 shadow-2xl shadow-neutral-500/20 text-[#121316] min-h-[640px] flex flex-col justify-between overflow-hidden">
        
        {/* Dynamic Island / Top Notch Bar */}
        <div className="w-24 h-4 bg-neutral-900 rounded-full mx-auto mb-3 shadow-inner" />

        {/* SCREEN 1: HOME OVERVIEW (Screenshot 1) */}
        {activeScreen === 'home' && (
          <div className="animate-fadeIn space-y-4">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-1">
              <div>
                <div className="text-[11px] font-medium text-neutral-500">Saturday, 26 September</div>
                <h3 className="text-xl font-black text-[#121316] tracking-tight">Hi, Aarav</h3>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-neutral-200 shadow-sm text-xs font-semibold text-neutral-800">
                  <TrendingUp className="w-3.5 h-3.5 text-[#121316]" /> Insights
                </button>
                <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shadow-sm">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-full bg-[#121316] text-[#CCFF00] font-black text-xs flex items-center justify-center shadow-sm">
                  A
                </div>
              </div>
            </div>

            {/* Primary Black Card */}
            <div className="relative bg-[#121316] text-white rounded-[32px] p-6 shadow-xl shadow-black/25">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-400 font-semibold">
                  THIS MONTH, KEPT
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#CCFF00] text-black">
                  +14%
                </span>
              </div>
              <div className="text-4xl font-black tracking-tight text-white mb-1">₹34,818</div>
              <div className="text-xs text-neutral-400 font-medium mb-6">₹1,00,000 in · ₹65,182 out</div>

              {/* 3 Circular Actions */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <button onClick={() => setActiveAction('record')} className="flex flex-col items-center">
                  <div className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
                    activeAction === 'record' ? 'bg-[#CCFF00] text-black scale-105 shadow-md' : 'bg-[#24262B] text-white'
                  }`}>
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] font-semibold text-neutral-300 mt-1.5">Record</span>
                </button>

                <button onClick={() => setActiveAction('scan')} className="flex flex-col items-center">
                  <div className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
                    activeAction === 'scan' ? 'bg-[#CCFF00] text-black scale-105 shadow-lg shadow-[#CCFF00]/40' : 'bg-[#24262B] text-white'
                  }`}>
                    <Scan className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] font-semibold text-neutral-200 mt-1.5">Scan</span>
                </button>

                <button onClick={() => setActiveAction('move')} className="flex flex-col items-center">
                  <div className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${
                    activeAction === 'move' ? 'bg-[#CCFF00] text-black scale-105 shadow-md' : 'bg-[#24262B] text-white'
                  }`}>
                    <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] font-semibold text-neutral-300 mt-1.5">Move</span>
                </button>
              </div>
            </div>

            {/* AI Observation */}
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#CCFF00] flex items-center justify-center text-black flex-shrink-0">
                  <Sparkles className="w-4 h-4 fill-black" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#121316]">Quiet observation</div>
                  <div className="text-[11px] text-neutral-500">Late-night orders → regret on 4 of 6 nights</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </div>

            {/* Accounts Preview */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white rounded-2xl p-3 border border-neutral-200 shadow-sm">
                <span className="text-[9px] font-mono uppercase text-neutral-400">BANK</span>
                <div className="text-xs font-bold text-neutral-800">HDFC</div>
                <div className="text-sm font-black text-[#121316]">₹2,10,881</div>
              </div>
              <div className="bg-white rounded-2xl p-3 border border-neutral-200 shadow-sm">
                <span className="text-[9px] font-mono uppercase text-neutral-400">CREDIT</span>
                <div className="text-xs font-bold text-neutral-800">Axis Card</div>
                <div className="text-sm font-black text-rose-600">-₹7,767</div>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: WHO OWES WHOM / DEBTS (Screenshot 2) */}
        {activeScreen === 'debts' && (
          <div className="animate-fadeIn space-y-3.5">
            {/* Header: Debts + Pill Segment */}
            <div className="flex items-start justify-between px-1">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">DEBTS</span>
                <h3 className="text-2xl font-black text-[#121316] leading-tight">Who owes<br />whom.</h3>
              </div>
              <div className="flex items-center bg-white p-1 rounded-full border border-neutral-200 text-[11px] font-semibold">
                <span className="px-2.5 py-1 rounded-full bg-[#121316] text-white">Home</span>
                <span className="px-2.5 py-1 text-neutral-500">People</span>
                <span className="px-2.5 py-1 text-neutral-500">Activity</span>
              </div>
            </div>

            {/* OVERALL Black Card with Lime Green "You owe ₹2,900" */}
            <div className="bg-[#121316] text-white rounded-[28px] p-5 shadow-lg">
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-neutral-400">OVERALL</span>
              <div className="text-3xl font-black tracking-tight text-white mt-1">
                You owe <span className="text-[#CCFF00]">₹2,900</span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">1 to receive · 2 to pay</div>
            </div>

            {/* Dual Cards: You'll receive (Green) vs You owe (Red) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-sm">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">YOU'LL RECEIVE</span>
                <div className="text-xl font-black text-emerald-600 mt-1">₹2,300</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">1 person</div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-sm">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">YOU OWE</span>
                <div className="text-xl font-black text-rose-600 mt-1">₹5,200</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">2 people</div>
              </div>
            </div>

            {/* 3 Circular Actions: Add Person, Add Txn, Settle */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-white rounded-2xl p-3 border border-neutral-200/80 shadow-sm flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-800 mb-1.5">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-neutral-800">Add Person</span>
              </div>

              <div className="bg-white rounded-2xl p-3 border border-neutral-200/80 shadow-sm flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-800 mb-1.5">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-bold text-neutral-800">Add Txn</span>
              </div>

              <div className="bg-white rounded-2xl p-3 border border-neutral-200/80 shadow-sm flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-800 mb-1.5">
                  <Scale className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-neutral-800">Settle</span>
              </div>
            </div>

            {/* Pending Settlements Card */}
            <div>
              <div className="text-xs font-black text-[#121316] mb-1.5 px-1">Pending Settlements</div>
              <div className="bg-white rounded-2xl p-3 border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#121316] text-white font-bold flex items-center justify-center text-xs">
                    A
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#121316]">Aman</div>
                    <div className="text-[10px] text-neutral-500">17 Aug</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-rose-600">-₹2,200</div>
                  <div className="text-[9px] text-neutral-400">you owe</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 3: TOTAL LENT ₹6,85,000 (Screenshot 3) */}
        {activeScreen === 'lending' && (
          <div className="animate-fadeIn space-y-3.5">
            {/* Primary Black Card with status pills */}
            <div className="bg-[#121316] text-white rounded-[28px] p-5 shadow-lg">
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-neutral-400">TOTAL LENT</span>
              <div className="text-3xl font-black tracking-tight text-white mt-1">₹6,85,000</div>
              
              <div className="my-3 border-t border-neutral-800" />

              <div className="grid grid-cols-2 gap-2 text-left mb-3">
                <div>
                  <span className="text-[9px] font-mono uppercase text-neutral-400">OUTSTANDING</span>
                  <div className="text-sm font-black text-white">₹5,96,701</div>
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase text-neutral-400">INTEREST EARNED</span>
                  <div className="text-sm font-black text-white">₹26,915</div>
                </div>
              </div>

              {/* Status Pills exact from screenshot */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-200">
                  Active 2
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#38311B] text-[#E0C068]">
                  Due 6
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3F1D24] text-[#F87171]">
                  Overdue 4
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-400">
                  Done 1
                </span>
              </div>
            </div>

            {/* 4 Square Action Buttons with Lime "+ New" Button */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-[#CCFF00] rounded-2xl p-2.5 flex flex-col items-center justify-center text-black font-extrabold shadow-md shadow-[#CCFF00]/30 cursor-pointer">
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span className="text-[10px] mt-1">New</span>
              </div>
              <div className="bg-white rounded-2xl p-2.5 border border-neutral-200 flex flex-col items-center justify-center text-neutral-800 font-bold shadow-sm">
                <ArrowUpRight className="w-5 h-5" />
                <span className="text-[10px] mt-1">Payment</span>
              </div>
              <div className="bg-white rounded-2xl p-2.5 border border-neutral-200 flex flex-col items-center justify-center text-neutral-800 font-bold shadow-sm">
                <Users className="w-5 h-5" />
                <span className="text-[10px] mt-1">People</span>
              </div>
              <div className="bg-white rounded-2xl p-2.5 border border-neutral-200 flex flex-col items-center justify-center text-neutral-800 font-bold shadow-sm">
                <Calculator className="w-5 h-5" />
                <span className="text-[10px] mt-1">Calc</span>
              </div>
            </div>

            {/* NEEDS ATTENTION Section */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold mb-1.5 px-1">
                NEEDS ATTENTION
              </div>
              <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden shadow-sm">
                <div className="p-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#121316]">Ramesh Kumar</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-600">Overdue</span>
                    </div>
                    <div className="text-[9px] text-neutral-400">Overdue · 2 Sept</div>
                  </div>
                  <div className="text-xs font-black text-rose-600">₹1,44,080</div>
                </div>

                <div className="p-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#121316]">Priya Sharma</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-600">Overdue</span>
                    </div>
                    <div className="text-[9px] text-neutral-400">Overdue · 19 Jun</div>
                  </div>
                  <div className="text-xs font-black text-rose-600">₹67,057</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Bottom App Dock matching real app */}
        <div className="mt-4 pt-3 border-t border-neutral-200/90 flex items-center justify-around text-neutral-500">
          <div className="flex flex-col items-center cursor-pointer text-black">
            <Wallet className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-0.5">Home</span>
          </div>
          <div className="flex flex-col items-center cursor-pointer hover:text-black">
            <Calendar className="w-4 h-4" />
            <span className="text-[9px] font-medium mt-0.5">Timeline</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#121316] text-[#CCFF00] flex items-center justify-center shadow-md">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col items-center cursor-pointer hover:text-black">
            <Users className="w-4 h-4" />
            <span className="text-[9px] font-medium mt-0.5">Debts</span>
          </div>
          <div className="flex flex-col items-center cursor-pointer hover:text-black">
            <Lock className="w-4 h-4" />
            <span className="text-[9px] font-medium mt-0.5">Vault</span>
          </div>
        </div>

      </div>
    </div>
  );
};

const BentoGridFeatures = () => {
  return (
    <section id="features" className="py-20 sm:py-28 relative z-10">
      <div className="text-center max-w-2xl mx-auto mb-16 px-4 reveal-on-scroll">
        <span className="text-xs font-bold uppercase tracking-widest text-[#121316] bg-[#CCFF00] px-3.5 py-1.5 rounded-full shadow-sm">
          Intelligent Architecture
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#121316] mt-4 tracking-tight leading-tight">
          Who owes whom, solved. <br className="hidden sm:block" />
          Zero spreadsheet fatigue.
        </h2>
        <p className="text-neutral-600 text-sm sm:text-base mt-3">
          Designed specifically for modern peers who manage day-to-day cash flow, split multi-party expenses, and lend money with calculated returns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* BENTO 1: Smart Lending CRM (7 cols) */}
        <div className="md:col-span-7 rounded-[32px] p-6 sm:p-9 bg-[#121316] text-white shadow-xl flex flex-col justify-between relative overflow-hidden group hover:ring-2 hover:ring-[#CCFF00] transition-all reveal-on-scroll">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#CCFF00]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#CCFF00]/20 transition-all" />

          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#CCFF00] text-black flex items-center justify-center font-bold mb-6 shadow-md shadow-[#CCFF00]/30">
              <DollarSign className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-[#CCFF00] tracking-wider uppercase">Lending CRM</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Smart Lending Portfolio</h3>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-lg">
              Manage personal notes with compound or flat interest schedules. Know who owes what and auto-generate overdue alerts with calculated interest penalties.
            </p>
          </div>

          {/* CRM Status Badges from user screenshot */}
          <div className="mt-8 space-y-3">
            <div className="p-3.5 rounded-2xl bg-[#1D1F24] border border-neutral-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center text-xs font-bold font-mono">
                  RK
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Ramesh Kumar</div>
                  <div className="text-[10px] text-neutral-400">Due 2 Sept • ₹1,44,080 Outstanding</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#3F1D24] text-[#F87171] border border-rose-500/40">
                Overdue
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1D1F24] border border-neutral-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center text-xs font-bold font-mono">
                  PS
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Priya Sharma</div>
                  <div className="text-[10px] text-neutral-400">Principal Installment Settled</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                Done 1 ✓
              </span>
            </div>
          </div>
        </div>

        {/* BENTO 2: Real AI Insights (5 cols) */}
        <div className="md:col-span-5 rounded-[32px] p-6 sm:p-9 bg-white border border-neutral-200/90 shadow-sm flex flex-col justify-between hover:border-[#CCFF00] hover:shadow-md transition-all reveal-on-scroll">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#CCFF00] text-black flex items-center justify-center mb-6 shadow-sm">
              <Sparkles className="w-6 h-6 fill-black" />
            </div>

            <span className="text-xs font-mono font-bold text-neutral-500 tracking-wider uppercase">Quiet Observations</span>
            <h3 className="text-2xl font-black text-[#121316] mt-1 mb-2">Real AI Insights</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Transform passive transactions into narrative observations. MARTHA spots recurring financial leakages and calculates safe lending reserves.
            </p>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-[#F4F5F7] border border-neutral-200 text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#121316]" />
              <span className="text-[11px] font-bold text-neutral-800 font-mono">MARTHA Intelligence</span>
            </div>
            <p className="text-xs text-neutral-700 italic leading-relaxed">
              "Your lending cash buffer is at 42%. You can safely allocate ₹30,000 for the new borrower note without compressing your monthly burn rate."
            </p>
          </div>
        </div>

        {/* BENTO 3: Group Trip Splitting (5 cols) */}
        <div className="md:col-span-5 rounded-[32px] p-6 sm:p-9 bg-white border border-neutral-200/90 shadow-sm flex flex-col justify-between hover:border-[#CCFF00] hover:shadow-md transition-all reveal-on-scroll">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#121316] text-[#CCFF00] flex items-center justify-center mb-6 shadow-sm">
              <Users className="w-6 h-6" />
            </div>

            <span className="text-xs font-mono font-bold text-neutral-500 tracking-wider uppercase">Multi-Payer Splitting</span>
            <h3 className="text-2xl font-black text-[#121316] mt-1 mb-2">Group Trip Splitting</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Perfect for weekend getaways, concert tickets, and flatmates. Split bills evenly or enter custom proportional balances with instant settlement.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between p-4 rounded-2xl bg-[#F4F5F7] border border-neutral-200">
            <div className="text-xs font-semibold text-neutral-600">Pending Settlements</div>
            <div className="text-base font-black font-mono text-[#121316]">₹5,200 (2 people)</div>
          </div>
        </div>

        {/* BENTO 4: Sovereign Privacy & Biometrics (7 cols) */}
        <div className="md:col-span-7 rounded-[32px] p-6 sm:p-9 bg-[#121316] text-white shadow-xl flex flex-col justify-between relative overflow-hidden group hover:ring-2 hover:ring-[#CCFF00] transition-all reveal-on-scroll">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#CCFF00] text-black flex items-center justify-center font-bold mb-6">
              <Lock className="w-6 h-6 stroke-[2.5]" />
            </div>

            <span className="text-xs font-mono font-bold text-[#CCFF00] tracking-wider uppercase">Zero-Knowledge Vault</span>
            <h3 className="text-2xl font-black text-white mt-1 mb-2">Biometrics & Sovereign Privacy</h3>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-lg">
              On-device encrypted local storage with FaceID / Biometric auto-lock. Your loans, contacts, and personal wealth statements never get monetized.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#1D1F24] border border-neutral-700/60 flex items-center gap-2.5">
              <Fingerprint className="w-4 h-4 text-[#CCFF00]" />
              <span className="text-xs font-semibold text-neutral-200">FaceID Lock</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#1D1F24] border border-neutral-700/60 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#CCFF00]" />
              <span className="text-xs font-semibold text-neutral-200">AES-256 Storage</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#1D1F24] border border-neutral-700/60 flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-[#CCFF00]" />
              <span className="text-xs font-semibold text-neutral-200">Offline First</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

const LendingDashboardDeepDive = () => {
  const [loanAmount, setLoanAmount] = useState(685000);
  const [termMonths, setTermMonths] = useState(12);
  const [interestRate, setInterestRate] = useState(14);
  const [interestType, setInterestType] = useState('reducing');
  const [frequency, setFrequency] = useState('monthly');
  const [exportNotice, setExportNotice] = useState(false);

  // Real Amortization Calculation
  const calculatedValues = useMemo(() => {
    const P = Number(loanAmount);
    const annualR = Number(interestRate) / 100;
    const n = Number(termMonths);

    let monthlyInstallment = 0;
    let totalInterest = 0;
    let totalPayment = 0;

    if (interestType === 'fixed') {
      totalInterest = P * annualR * (n / 12);
      totalPayment = P + totalInterest;
      monthlyInstallment = totalPayment / n;
    } else {
      const r = annualR / 12;
      if (r === 0) {
        monthlyInstallment = P / n;
        totalPayment = P;
        totalInterest = 0;
      } else {
        monthlyInstallment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        totalPayment = monthlyInstallment * n;
        totalInterest = totalPayment - P;
      }
    }

    const principalPercent = Math.round((P / totalPayment) * 100) || 80;
    const interestPercent = 100 - principalPercent;

    return {
      monthlyInstallment: Math.round(monthlyInstallment),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      principalPercent,
      interestPercent,
    };
  }, [loanAmount, termMonths, interestRate, interestType]);

  const handleExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 4000);
  };

  return (
    <section id="lending" className="py-20 sm:py-28 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-14 reveal-on-scroll">
          <span className="text-xs font-bold uppercase tracking-widest text-[#121316] bg-[#CCFF00] px-3.5 py-1.5 rounded-full shadow-sm">
            Lending, mathematically perfected
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#121316] mt-4 tracking-tight">
            The Smart Loan Engine.
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mt-3">
            Configure Daily, Monthly, or Yearly terms with transparent Fixed vs. Reducing balance schedules. Auto-calculates your exact interest yields.
          </p>
        </div>

        {/* Main Dashboard Card */}
        <div className="rounded-[36px] bg-white border border-neutral-200/90 p-6 sm:p-10 shadow-xl shadow-neutral-300/40 reveal-on-scroll">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Controls Column */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Loan Amount Slider */}
              <div className="p-4 rounded-2xl bg-[#F4F5F7] border border-neutral-200/80">
                <div className="flex justify-between items-baseline mb-2">
                  <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Loan Principal</label>
                  <span className="text-2xl font-black font-mono text-[#121316]">₹{loanAmount.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="1000000"
                  step="5000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2.5 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-[#121316]"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
                  <span>₹10,000</span>
                  <span>₹5,00,000</span>
                  <span>₹10,00,000</span>
                </div>
              </div>

              {/* Term Duration & Interest Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#F4F5F7] border border-neutral-200/80">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Duration</label>
                    <span className="text-sm font-bold text-[#121316] font-mono">{termMonths} Mo</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="36"
                    value={termMonths}
                    onChange={(e) => setTermMonths(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-[#121316]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#F4F5F7] border border-neutral-200/80">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Annual Interest</label>
                    <span className="text-sm font-bold text-[#121316] font-mono">{interestRate}% APY</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="0.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-300 rounded-lg appearance-none cursor-pointer accent-[#121316]"
                  />
                </div>
              </div>

              {/* Calculation Method Toggle */}
              <div>
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block mb-2">
                  Calculation Model
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setInterestType('reducing')}
                    className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all ${
                      interestType === 'reducing'
                        ? 'bg-[#121316] text-[#CCFF00] border-[#121316] shadow-md'
                        : 'bg-[#F4F5F7] text-neutral-600 border-neutral-200 hover:text-black'
                    }`}
                  >
                    Reducing Balance
                  </button>
                  <button
                    onClick={() => setInterestType('fixed')}
                    className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all ${
                      interestType === 'fixed'
                        ? 'bg-[#121316] text-[#CCFF00] border-[#121316] shadow-md'
                        : 'bg-[#F4F5F7] text-neutral-600 border-neutral-200 hover:text-black'
                    }`}
                  >
                    Fixed / Flat Rate
                  </button>
                </div>
              </div>

              {/* Cadence */}
              <div>
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block mb-2">
                  Compounding Cadence
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['daily', 'monthly', 'yearly'].map((cadence) => (
                    <button
                      key={cadence}
                      onClick={() => setFrequency(cadence)}
                      className={`py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                        frequency === cadence
                          ? 'border-[#121316] bg-[#121316] text-[#CCFF00]'
                          : 'border-neutral-200 bg-[#F4F5F7] text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {cadence}
                    </button>
                  ))}
                </div>
              </div>

              {/* PDF Statement Generator Button */}
              <div className="pt-2">
                <button
                  onClick={handleExport}
                  className="w-full py-3.5 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#CCFF00]/25 active:scale-95 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  Generate 1-Click PDF Amortization Statement
                </button>
                {exportNotice && (
                  <div className="mt-2 text-xs text-neutral-800 font-semibold flex items-center gap-1.5 p-2 rounded-xl bg-[#CCFF00]/30 border border-[#CCFF00]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PDF Statement Generated! Simulated download for loan ID #MRT-9831.
                  </div>
                )}
              </div>
            </div>

            {/* Right Results & Visuals Column */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              
              {/* Highlight Output Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-[#121316] text-white shadow-lg">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Monthly Installment</div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                    ₹{calculatedValues.monthlyInstallment.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1 font-mono">Auto-calculated per {frequency}</div>
                </div>

                <div className="p-5 rounded-3xl bg-[#121316] text-white shadow-lg">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Total Interest Earned</div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-[#CCFF00] mt-1">
                    +₹{calculatedValues.totalInterest.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-[#CCFF00] font-mono mt-1">Net ROI: +{((calculatedValues.totalInterest / loanAmount) * 100).toFixed(1)}%</div>
                </div>
              </div>

              {/* Principal vs Interest Distribution Bar */}
              <div className="p-5 rounded-3xl bg-[#F4F5F7] border border-neutral-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-neutral-800">Principal vs. Interest Distribution</span>
                  <span className="text-xs font-mono font-bold text-neutral-600">Total: ₹{calculatedValues.totalPayment.toLocaleString('en-IN')}</span>
                </div>

                <div className="w-full h-4 bg-neutral-300 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${calculatedValues.principalPercent}%` }}
                    className="bg-[#121316] h-full transition-all duration-300"
                    title={`Principal: ${calculatedValues.principalPercent}%`}
                  />
                  <div
                    style={{ width: `${calculatedValues.interestPercent}%` }}
                    className="bg-[#CCFF00] h-full transition-all duration-300"
                    title={`Interest: ${calculatedValues.interestPercent}%`}
                  />
                </div>

                <div className="flex justify-between items-center text-xs mt-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#121316]" />
                    <span className="text-neutral-600">Principal: <b className="text-black font-mono">₹{loanAmount.toLocaleString('en-IN')} ({calculatedValues.principalPercent}%)</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00]" />
                    <span className="text-neutral-600">Interest: <b className="text-[#121316] font-mono">₹{calculatedValues.totalInterest.toLocaleString('en-IN')} ({calculatedValues.interestPercent}%)</b></span>
                  </div>
                </div>
              </div>

              {/* Monthly Payment Calendar Grid (Paid: Green, Upcoming: Gray) */}
              <div className="p-5 rounded-3xl bg-[#F4F5F7] border border-neutral-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-black" />
                    Installment Payment Calendar Preview
                  </span>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1 text-black font-bold">
                      <span className="w-2.5 h-2.5 rounded bg-[#CCFF00] border border-black" /> Paid
                    </span>
                    <span className="flex items-center gap-1 text-neutral-500 font-medium">
                      <span className="w-2.5 h-2.5 rounded bg-neutral-300" /> Upcoming
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-1">
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const isPaid = idx < 6;
                    return (
                      <div
                        key={idx}
                        className={`h-11 rounded-xl border flex flex-col items-center justify-center p-1 transition-all ${
                          isPaid
                            ? 'bg-[#CCFF00] border-black text-black font-bold'
                            : 'bg-white border-neutral-300 text-neutral-400'
                        }`}
                      >
                        <span className="text-[9px] font-mono font-bold leading-none">M{idx + 1}</span>
                        <span className="text-[8px] mt-1 font-mono">{isPaid ? '✓ Paid' : 'Due'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

const AppDownloadSection = ({ onOpenModal }) => {
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [linkSent, setLinkSent] = useState(false);

  const handleSendLink = (e) => {
    e.preventDefault();
    if (phoneOrEmail.trim()) {
      setLinkSent(true);
      setTimeout(() => setLinkSent(false), 5000);
      setPhoneOrEmail('');
    }
  };

  return (
    <section id="download" className="py-20 sm:py-28 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-[40px] bg-[#121316] text-white p-8 sm:p-14 md:p-16 relative overflow-hidden shadow-2xl reveal-on-scroll">
          
          {/* Neon Lime Radial Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#CCFF00]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Copy & Store Buttons */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#CCFF00] text-black">
                <Download className="w-3.5 h-3.5" /> Mobile App Available
              </span>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Download MARTHA for iOS and Android.
              </h2>

              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Track personal loans, split group bills with QR codes, and monitor daily liquidity wherever you go with our zero-knowledge biometric mobile app.
              </p>

              {/* Direct Store Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={onOpenModal}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-black font-extrabold text-sm flex items-center justify-center gap-3 hover:bg-neutral-100 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Apple className="w-5 h-5 fill-black" />
                  <div className="text-left leading-none">
                    <div className="text-[10px] text-neutral-500 uppercase font-mono">Download on the</div>
                    <div className="text-sm font-black">App Store</div>
                  </div>
                </button>

                <button
                  onClick={onOpenModal}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#1D1F24] border border-neutral-700 text-white font-extrabold text-sm flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <div className="text-left leading-none">
                    <div className="text-[10px] text-neutral-400 uppercase font-mono">Get it on</div>
                    <div className="text-sm font-black">Google Play</div>
                  </div>
                </button>
              </div>

              {/* SMS Direct Link Form */}
              <div className="pt-4 max-w-md mx-auto lg:mx-0">
                <div className="text-xs text-neutral-400 mb-2 font-medium">Or receive a direct download link via SMS:</div>
                <form onSubmit={handleSendLink} className="flex gap-2">
                  <input
                    type="tel"
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="bg-[#1D1F24] border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#CCFF00] flex-1 font-mono"
                    required
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Send Link
                  </button>
                </form>
                {linkSent && (
                  <div className="text-xs text-[#CCFF00] mt-2 flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Link sent! Check your messages.
                  </div>
                )}
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-3 text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[#CCFF00] fill-[#CCFF00]" /> 4.9 Rating (24K+ reviews)
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#CCFF00]" /> AES-256 On-Device
                </span>
              </div>
            </div>

            {/* Right QR Code & Quick Scan Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-white text-[#121316] rounded-3xl p-6 sm:p-8 text-center shadow-2xl max-w-xs w-full border border-neutral-200">
                <div className="w-10 h-10 rounded-2xl bg-[#121316] text-[#CCFF00] font-black text-lg flex items-center justify-center mx-auto mb-3">
                  M
                </div>

                <div className="text-base font-black text-[#121316]">Scan with your phone</div>
                <div className="text-xs text-neutral-500 mt-0.5 mb-4">Point your camera to download MARTHA immediately</div>

                {/* Styled QR Visual */}
                <div className="p-3 bg-[#F4F5F7] rounded-2xl border border-neutral-200 inline-block mb-4 shadow-inner">
                  <div className="w-44 h-44 bg-white p-2 rounded-xl border border-neutral-300 flex flex-col items-center justify-center relative">
                    <QrCode className="w-36 h-36 text-[#121316]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-lg bg-[#CCFF00] border-2 border-black flex items-center justify-center font-black text-xs text-black shadow-sm">
                        M
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-neutral-500">
                  Compatible with iOS 16+ & Android 10+
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

const DemoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#121316] text-white border border-neutral-800 rounded-[36px] p-6 sm:p-8 max-w-xl w-full relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#CCFF00]">MARTHA Walkthrough</span>
        </div>

        <h3 className="text-2xl font-black text-white mb-2">Simplicity meets sovereign control</h3>
        <p className="text-xs text-neutral-400 mb-6">
          See how easy it is to issue an interest-bearing personal loan, split weekend trip expenses, and monitor monthly cash reserves.
        </p>

        {/* Video Placeholder Container */}
        <div className="w-full aspect-video rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="w-14 h-14 rounded-full bg-[#CCFF00] text-black flex items-center justify-center shadow-lg shadow-[#CCFF00]/30 cursor-pointer group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 fill-black ml-1" />
          </div>
          <span className="text-xs font-semibold text-neutral-300 mt-3">Watch 60-Second Walkthrough</span>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <a
            href="#download"
            onClick={onClose}
            className="text-xs text-[#CCFF00] font-bold hover:underline"
          >
            Jump to App Downloads →
          </a>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#CCFF00] text-black font-extrabold text-xs hover:bg-[#b8e600] transition-colors cursor-pointer"
          >
            Got it, Let's Try Free
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Initialize Smooth In/Out Scroll Observers
  useScrollAnimation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#121316] font-sans selection:bg-[#CCFF00] selection:text-black overflow-x-hidden relative">
      
      {/* Inline styles for Butter-smooth scroll transitions and keyframes */}
      <style>{`
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }
        .reveal-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.35s ease-out forwards;
        }
      `}</style>

      {/* Custom Trailing Neon Cursor */}
      <CustomCursor />

      {/* Demo Modal */}
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />

      {/* ================= 1. HEADER / NAVBAR ================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-4 sm:px-6 ${
          scrolled
            ? 'bg-[#F4F5F7]/90 backdrop-blur-md border-b border-neutral-300/80 py-3 shadow-sm'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-[#121316] flex items-center justify-center text-[#CCFF00] font-black text-base shadow-sm">
              M
            </div>
            <span className="text-xl font-black tracking-tight text-[#121316] font-sans">
              MARTHA<span className="text-[#CCFF00] font-black">.</span>
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-neutral-600">
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#screens" className="hover:text-black transition-colors">App Screens</a>
            <a href="#lending" className="hover:text-black transition-colors">Lending CRM</a>
            <a href="#download" className="hover:text-black transition-colors">Download</a>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <a
              href="#download"
              className="px-5 py-2.5 rounded-full bg-[#121316] hover:bg-black text-[#CCFF00] font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              Get App <ArrowRight className="w-3.5 h-3.5 text-[#CCFF00]" />
            </a>
          </div>
        </div>
      </header>

      {/* ================= 2. HERO SECTION ================= */}
      <main className="relative pt-32 sm:pt-40 pb-16 px-4 sm:px-6 max-w-6xl mx-auto z-10">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-24">
          
          {/* Left Hero Text Column */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left reveal-on-scroll">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-neutral-300 shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CCFF00] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#CCFF00]" />
              </span>
              <span className="text-xs font-mono font-bold text-neutral-700">
                v2.6 Live: Who Owes Whom & Smart Loan CRM
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#121316] leading-[1.08]">
              Master Your Wealth.{' '}
              <span className="underline decoration-[#CCFF00] decoration-wavy decoration-2">
                Simplify Your Lending.
              </span>
            </h1>

            <p className="text-neutral-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              The all-in-one personal finance app that tracks your daily cash flow, splits group expenses, and manages your lending portfolio with smart calculators and AI insights.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#download"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#121316] text-[#CCFF00] font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
              >
                Try MARTHA Free <ArrowRight className="w-4 h-4 text-[#CCFF00]" />
              </a>

              <button
                onClick={() => setDemoOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-neutral-300 bg-white text-[#121316] font-bold text-sm flex items-center justify-center gap-2.5 transition-all hover:bg-neutral-100 shadow-sm cursor-pointer"
              >
                <Play className="w-4 h-4 text-black fill-black" /> See How It Works
              </button>
            </div>

            {/* Feature reassurance pills */}
            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 border-t border-neutral-200 text-neutral-600 text-xs font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Zero Spreadsheet Fatigue</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>On-Device Biometric Vault</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-black" />
                <span>Quiet AI Observations</span>
              </div>
            </div>
          </div>

          {/* Right Mobile App Mockup Switcher (Exact from screenshots) */}
          <div id="screens" className="lg:col-span-6 flex justify-center reveal-on-scroll">
            <InteractiveAppShowcase />
          </div>
        </section>

        {/* ================= 3. BENTO GRID SECTION ================= */}
        <BentoGridFeatures />

        {/* ================= 4. DEEP DIVE LENDING DASHBOARD ================= */}
        <LendingDashboardDeepDive />

        {/* ================= 5. METRICS & SOCIAL PROOF ================= */}
        <section className="py-20 border-y border-neutral-200 relative z-10 reveal-on-scroll">
          <div className="max-w-6xl mx-auto px-4">
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center mb-16">
              <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-sm">
                <div className="text-3xl sm:text-4xl font-black text-[#121316] font-mono">₹18.4 Cr+</div>
                <div className="text-xs text-neutral-500 mt-1 uppercase tracking-wider font-bold">Loan Volume Tracked</div>
              </div>
              <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-sm">
                <div className="text-3xl sm:text-4xl font-black text-[#121316] font-mono">99.4%</div>
                <div className="text-xs text-neutral-500 mt-1 uppercase tracking-wider font-bold">On-Time Repayment</div>
              </div>
              <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-sm">
                <div className="text-3xl sm:text-4xl font-black text-[#121316] font-mono">120K+</div>
                <div className="text-xs text-neutral-500 mt-1 uppercase tracking-wider font-bold">Active Group Splitters</div>
              </div>
              <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-sm">
                <div className="text-3xl sm:text-4xl font-black text-rose-600 font-mono">0.00%</div>
                <div className="text-xs text-neutral-500 mt-1 uppercase tracking-wider font-bold">Data Trackers or Ads</div>
              </div>
            </div>

            {/* Testimonial Card */}
            <div className="max-w-3xl mx-auto p-8 sm:p-10 rounded-[36px] bg-[#121316] text-white shadow-2xl text-center relative">
              <div className="flex justify-center gap-1 text-[#CCFF00] mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#CCFF00]" />
                ))}
              </div>
              <p className="text-base sm:text-lg text-neutral-200 italic font-light leading-relaxed mb-6">
                "Before MARTHA, keeping track of who owed what after trips and managing private loans in WhatsApp was pure chaos. The automated installment reminders and reducing-balance calculations saved my sanity and earned me over ₹26,000 in interest this year alone."
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#CCFF00] text-black font-black flex items-center justify-center text-xs">
                  SK
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Soren Kjeldsen</div>
                  <div className="text-[10px] text-neutral-400">Angel Investor & Multi-Unit Landlord</div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ================= 6. APP STORE & GOOGLE PLAY DOWNLOAD SECTION ================= */}
        <AppDownloadSection onOpenModal={() => setDemoOpen(true)} />

        {/* ================= 7. BOTTOM CALL TO ACTION ================= */}
        <section className="my-20 relative rounded-[40px] overflow-hidden p-8 sm:p-14 text-center bg-[#121316] text-white shadow-2xl reveal-on-scroll">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#CCFF00]/15 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#121316] bg-[#CCFF00] px-4 py-1.5 rounded-full shadow-sm">
              Start Free • No Credit Card Required
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Take control of your cash flow today.
            </h2>

            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              Join thousands of private lenders, travelers, and disciplined budgeters who manage their wealth with sovereign clarity.
            </p>

            <div className="pt-2 flex justify-center">
              <a
                href="#download"
                className="px-8 py-4 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-sm uppercase tracking-wider flex items-center gap-2 transition-all shadow-xl shadow-[#CCFF00]/25 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Start Tracking Now <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ================= 8. FOOTER ================= */}
      <footer className="border-t border-neutral-200 bg-white pt-16 pb-12 px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#121316] flex items-center justify-center text-[#CCFF00] font-black text-sm">
                M
              </div>
              <span className="text-xl font-black tracking-tight text-[#121316] font-sans">
                MARTHA<span className="text-[#CCFF00]">.</span>
              </span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-sm">
              The modern personal finance, peer-to-peer lending CRM, and multi-payer group expense splitting platform. Built for sovereign financial discipline.
            </p>
            {/* Lovable Source Attribution Pill */}
            <div className="pt-2">
              <a 
                href="https://lovable.dev/projects/4331d2df-9606-4363-a1d7-0783b22046a9?utm_source=lovable-badge&utm_campaign=badge-wording-disabled"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4F5F7] border border-neutral-300 text-xs font-semibold text-neutral-700 hover:border-black transition-all"
              >
                <span>Built with Lovable UI aesthetic</span>
                <ExternalLink className="w-3.5 h-3.5 text-black" />
              </a>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">Platform</div>
            <ul className="space-y-2 text-xs text-neutral-600">
              <li><a href="#features" className="hover:text-black transition-colors">Features</a></li>
              <li><a href="#screens" className="hover:text-black transition-colors">App Screens</a></li>
              <li><a href="#lending" className="hover:text-black transition-colors">Lending Engine</a></li>
              <li><a href="#download" className="hover:text-black transition-colors">Download App</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">Trust & Security</div>
            <ul className="space-y-2 text-xs text-neutral-600">
              <li><span className="text-neutral-600">Zero Knowledge</span></li>
              <li><span className="text-neutral-600">Biometric Lock</span></li>
              <li><span className="text-neutral-600">Local Data Storage</span></li>
              <li><span className="text-neutral-600">PDF Export</span></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider font-mono">Stay Connected</div>
            <p className="text-xs text-neutral-600">
              Get updates on lending regulation, compound interest formulas, and product releases.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="name@domain.com"
                className="bg-[#F4F5F7] border border-neutral-300 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-black flex-1 font-mono"
              />
              <button
                onClick={() => setDemoOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#121316] hover:bg-black text-[#CCFF00] font-bold text-xs transition-colors cursor-pointer"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-center text-[11px] text-neutral-500 gap-4">
          <div>
            © {new Date().getFullYear()} MARTHA Technologies Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-neutral-900 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-neutral-900 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-neutral-900 cursor-pointer transition-colors">Security Disclosures</span>
          </div>
        </div>
      </footer>
    </div>
  );
}