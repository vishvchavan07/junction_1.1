import React, { useState, useEffect, useRef } from 'react';
import { TrainEntity, MaintenanceBlock, FixedAsset, DepartmentType } from '../../types';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Wrench,
  Zap,
  Radio,
  AlertTriangle,
  ArrowRight,
  Layers,
  Train as TrainIcon,
  Video,
  Eye,
  Sparkles,
  X,
  Clock,
  Activity
} from 'lucide-react';

// ─────────────────────────────────────────────────────────
// Physical Corridor Mapping Helpers (KM 100 to 160)
// ─────────────────────────────────────────────────────────
const KM_MIN = 100;
const KM_MAX = 160;

const kmToPercent = (km: number): number =>
  ((Math.max(KM_MIN, Math.min(KM_MAX, km)) - KM_MIN) / (KM_MAX - KM_MIN)) * 100;

const kmToX = (km: number, width = 1200): number =>
  (kmToPercent(km) / 100) * width;

export type CameraPreset = 'WIDE' | 'TRAIN' | 'CIVIL' | 'SIGNAL' | 'TRACTION' | 'ROUTE';

export interface SignalInfo {
  id: string;
  km: number;
  track: 'UP' | 'DN';
  aspect: 'GREEN' | 'YELLOW' | 'RED';
  interlockingRule: string;
  trackCircuit: string;
  nextClearanceKm: number;
}

export interface TrackSectionInfo {
  sectionId: string;
  kmStart: number;
  kmEnd: number;
  track: 'UP' | 'DN' | 'LOOP_1';
  railType: string;
  tgiScore: number;
  omsPeakG: number;
  speedLimitKmph: number;
  activeWork: boolean;
}

export interface LiveTrainPhysics {
  id: string;
  trainNumber: string;
  trainName: string;
  currentKm: number;
  speedKmH: number;
  targetSpeedKmH: number;
  accelState: 'ACCELERATING' | 'CRUISING' | 'BRAKING' | 'STOPPED';
  wheelAngle: number;
  suspensionOffset: number;
  pitchAngle: number;
  assignedTrack: 'UP' | 'DN' | 'LOOP_1' | 'LOOP_2';
  nextSignalAspect: 'GREEN' | 'YELLOW' | 'RED';
  nextSignalDistanceKm: number;
  entity: TrainEntity;
}

export interface DemoStepInfo {
  id: number;
  phaseName: string;
  shortTitle: string;
  narrative: string;
  cameraPreset: CameraPreset;
  signalAspect: 'GREEN' | 'YELLOW' | 'RED';
  activeDept: 'CIVIL' | 'SIGNAL' | 'TRACTION' | null;
  durationMs: number;
}

export const DEMO_STORY_STEPS: DemoStepInfo[] = [
  {
    id: 0, phaseName: 'NORMAL OPERATION', shortTitle: 'Normal Line Speed',
    narrative: 'Corridor operating under full line speed (130 km/h). Signals GREEN, automatic headway clearance normal.',
    cameraPreset: 'WIDE', signalAspect: 'GREEN', activeDept: null, durationMs: 3500,
  },
  {
    id: 1, phaseName: 'TASK DETECTED', shortTitle: 'Flaw Detected (KM 126)',
    narrative: 'TMS ultrasonic sensor detects lateral wear and TGI degradation on Turnout PT-227 at KM 126.',
    cameraPreset: 'CIVIL', signalAspect: 'GREEN', activeDept: 'CIVIL', durationMs: 3000,
  },
  {
    id: 2, phaseName: 'TRACK RESTRICTED', shortTitle: 'Section Restricted',
    narrative: 'AI Block Planner establishes a possession zone. Up line track possession locked.',
    cameraPreset: 'ROUTE', signalAspect: 'YELLOW', activeDept: 'CIVIL', durationMs: 2500,
  },
  {
    id: 3, phaseName: 'SIGNAL RED', shortTitle: 'Protection Signal Red',
    narrative: 'Protection Signal S-126 flips to RED aspect to safeguard maintenance crews.',
    cameraPreset: 'SIGNAL', signalAspect: 'RED', activeDept: 'CIVIL', durationMs: 2500,
  },
  {
    id: 4, phaseName: 'TRAIN BRAKING', shortTitle: 'Kavach Braking Applied',
    narrative: 'Approaching Vande Bharat 20901 detects downstream red aspect. Automatic service air brakes engage.',
    cameraPreset: 'TRAIN', signalAspect: 'RED', activeDept: 'CIVIL', durationMs: 3500,
  },
  {
    id: 5, phaseName: 'TRAIN STOPPED', shortTitle: 'Train Halted',
    narrative: 'Train comes to a complete halt 150m ahead of Signal S-126. Wheels stop rotating (0 RPM).',
    cameraPreset: 'TRAIN', signalAspect: 'RED', activeDept: 'CIVIL', durationMs: 2500,
  },
  {
    id: 6, phaseName: 'CIVIL WORK IN PROGRESS', shortTitle: 'Civil Track Tamping (0-100%)',
    narrative: 'Civil maintenance lines drawn. Safety barricades, track crew, and hydraulic tamping tools active.',
    cameraPreset: 'CIVIL', signalAspect: 'RED', activeDept: 'CIVIL', durationMs: 5000,
  },
  {
    id: 7, phaseName: 'TRACTION CLEARANCE', shortTitle: 'OHE Catenary Verified',
    narrative: 'TRD electrical linesman inspects 25kV catenary droppers and cantilever. Power re-energized.',
    cameraPreset: 'TRACTION', signalAspect: 'RED', activeDept: 'TRACTION', durationMs: 3500,
  },
  {
    id: 8, phaseName: 'SIGNAL VERIFICATION', shortTitle: 'Route Interlocked',
    narrative: 'S&T electronic interlocking verifies track circuit TC-126A and point machine lock. Signal clears to GREEN.',
    cameraPreset: 'SIGNAL', signalAspect: 'GREEN', activeDept: 'SIGNAL', durationMs: 3000,
  },
  {
    id: 9, phaseName: 'TRAIN ACCELERATES', shortTitle: 'Operations Resumed',
    narrative: 'Brakes release. Vande Bharat 20901 accelerates smoothly back to 130 km/h. Normal headway restored.',
    cameraPreset: 'WIDE', signalAspect: 'GREEN', activeDept: null, durationMs: 4000,
  },
];

const STATIONS = [
  { name: 'SANJAN',  km: 104, code: 'SJN', primary: false },
  { name: 'BHILAD',  km: 112, code: 'BLD', primary: false },
  { name: 'VAPI',    km: 125, code: 'VAPI', primary: true  },
  { name: 'UDVADA',  km: 131, code: 'UVD', primary: false },
  { name: 'VALSAD',  km: 145, code: 'BL',  primary: true  },
  { name: 'DUNGRI',  km: 154, code: 'DGI', primary: false },
];

const INITIAL_SIGNALS: SignalInfo[] = [
  { id: 'SIG-UP-106', km: 106, track: 'UP', aspect: 'GREEN',  interlockingRule: 'SSI-KAVACH-AUTO-01', trackCircuit: 'TC-106A (12.4V)', nextClearanceKm: 114 },
  { id: 'SIG-UP-114', km: 114, track: 'UP', aspect: 'GREEN',  interlockingRule: 'SSI-KAVACH-AUTO-02', trackCircuit: 'TC-114A (12.2V)', nextClearanceKm: 122 },
  { id: 'SIG-UP-122', km: 122, track: 'UP', aspect: 'YELLOW', interlockingRule: 'SSI-VAPI-APPROACH',  trackCircuit: 'TC-122A (11.8V)', nextClearanceKm: 126 },
  { id: 'SIG-UP-126', km: 126, track: 'UP', aspect: 'GREEN',  interlockingRule: 'SSI-VAPI-HOMESIG',   trackCircuit: 'TC-126A (12.1V)', nextClearanceKm: 130 },
  { id: 'SIG-UP-130', km: 130, track: 'UP', aspect: 'GREEN',  interlockingRule: 'SSI-UDVADA-ADV',    trackCircuit: 'TC-130A (12.3V)', nextClearanceKm: 138 },
  { id: 'SIG-UP-138', km: 138, track: 'UP', aspect: 'GREEN',  interlockingRule: 'SSI-KAVACH-AUTO-03', trackCircuit: 'TC-138A (12.5V)', nextClearanceKm: 146 },
  { id: 'SIG-UP-146', km: 146, track: 'UP', aspect: 'GREEN',  interlockingRule: 'SSI-VALSAD-APP',     trackCircuit: 'TC-146A (12.0V)', nextClearanceKm: 154 },
  { id: 'SIG-UP-154', km: 154, track: 'UP', aspect: 'GREEN',  interlockingRule: 'SSI-DUNGRI-AUTO',    trackCircuit: 'TC-154A (12.4V)', nextClearanceKm: 160 },
];

// ─────────────────────────────────────────────────────────
// LOCOMOTIVE MECHANICAL DRAWINGS
// ─────────────────────────────────────────────────────────

interface LocoWheelProps {
  cx: number;
  cy: number;
  r: number;
  angle: number;
  variant?: 'driving' | 'bogie';
}

const LocoWheel: React.FC<LocoWheelProps> = ({ cx, cy, r, angle, variant = 'bogie' }) => {
  const spoke = variant === 'driving' ? 8 : 6;
  const spokeAngles = Array.from({ length: spoke }, (_, i) => (i * 360) / spoke);
  return (
    <g transform={`rotate(${angle}, ${cx}, ${cy})`}>
      <circle cx={cx} cy={cy} r={r} fill="#1E293B" stroke="#0F172A" strokeWidth="1.4" />
      <circle cx={cx} cy={cy} r={r * 0.72} fill="#334155" stroke="#0F172A" strokeWidth="0.8" />
      {spokeAngles.map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const x2 = cx + Math.cos(rad) * r * 0.68;
        const y2 = cy + Math.sin(rad) * r * 0.68;
        return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="#0F172A" strokeWidth={variant === 'driving' ? '0.9' : '0.7'} strokeOpacity="0.85" />;
      })}
      {variant === 'driving' && (
        <ellipse cx={cx + r * 0.35} cy={cy} rx={r * 0.28} ry={r * 0.18} fill="#0F172A" opacity="0.7" />
      )}
      <circle cx={cx} cy={cy} r={r * 0.18} fill="#64748B" stroke="#0F172A" strokeWidth="0.9" />
      <circle cx={cx} cy={cy} r={r * 0.07} fill="#0F172A" />
    </g>
  );
};

interface BogieFrameProps {
  x: number;
  y: number;
  wheelR: number;
  wheelAngle: number;
  wheelCount?: 2 | 4;
  compact?: boolean;
}

const BogieFrame: React.FC<BogieFrameProps> = ({ x, y, wheelR, wheelAngle, wheelCount = 4, compact = false }) => {
  const spacing = compact ? 18 : 22;
  const half = ((wheelCount - 1) * spacing) / 2;
  const bogieBaseY = y - wheelR - 2;
  const frameH = compact ? 5 : 7;
  const frameW = half * 2 + 14;

  const wheelXs = Array.from({ length: wheelCount }, (_, i) => x - half + i * spacing);

  return (
    <g>
      <rect
        x={x - frameW / 2} y={bogieBaseY - frameH}
        width={frameW} height={frameH}
        fill="#334155" stroke="#0F172A" strokeWidth="0.9" rx="1"
      />
      <rect
        x={x - 4} y={bogieBaseY - frameH - 4}
        width={8} height={5}
        fill="#1E293B" stroke="#0F172A" strokeWidth="0.8" rx="0.5"
      />
      {wheelXs.map((wx, i) => (
        <g key={i}>
          <rect x={wx - 4} y={bogieBaseY - frameH - 2} width={8} height={3}
            fill="#94A3B8" stroke="#0F172A" strokeWidth="0.6" rx="0.5" />
        </g>
      ))}
      {wheelXs.map((wx, i) => (
        <g key={`spring-${i}`}>
          <line x1={wx - 1.5} y1={bogieBaseY - 1} x2={wx - 1.5} y2={bogieBaseY + 4}
            stroke="#64748B" strokeWidth="0.8" strokeDasharray="1.5 1" />
          <line x1={wx + 1.5} y1={bogieBaseY - 1} x2={wx + 1.5} y2={bogieBaseY + 4}
            stroke="#64748B" strokeWidth="0.8" strokeDasharray="1.5 1" />
        </g>
      ))}
      {wheelXs.map((wx, i) => (
        <LocoWheel
          key={i}
          cx={wx} cy={y - wheelR}
          r={wheelR}
          angle={wheelAngle}
          variant={wheelCount === 4 ? 'driving' : 'bogie'}
        />
      ))}
      {wheelXs.length > 1 && wheelXs.slice(0, -1).map((wx, i) => (
        <line key={`rig-${i}`}
          x1={wx + wheelR * 0.6} y1={y - wheelR * 0.5}
          x2={wheelXs[i + 1] - wheelR * 0.6} y2={y - wheelR * 0.5}
          stroke="#334155" strokeWidth="0.8" strokeOpacity="0.7"
        />
      ))}
    </g>
  );
};

interface PantographProps {
  x: number;
  baseY: number;
  height: number;
  wireY: number;
  extended?: boolean;
}

const Pantograph: React.FC<PantographProps> = ({ x, baseY, height, wireY, extended = true }) => {
  const ph = extended ? height : height * 0.4;
  const armSpread = 14;
  const baseWidth = 20;
  const midY = baseY - ph * 0.55;
  const topY = wireY + 1;

  return (
    <g>
      <rect x={x - baseWidth / 2} y={baseY - 3} width={baseWidth} height={4}
        fill="#1E293B" stroke="#0F172A" strokeWidth="0.8" />
      <line x1={x - armSpread / 2} y1={baseY - 3}   x2={x} y2={midY}
        stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
      <line x1={x + armSpread / 2} y1={baseY - 3}   x2={x} y2={midY}
        stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
      <line x1={x - armSpread * 0.6} y1={midY} x2={x - 4} y2={topY}
        stroke="#0F172A" strokeWidth="1.3" strokeLinecap="round" />
      <line x1={x + armSpread * 0.6} y1={midY} x2={x + 4} y2={topY}
        stroke="#0F172A" strokeWidth="1.3" strokeLinecap="round" />
      <line x1={x - 8} y1={topY} x2={x + 8} y2={topY}
        stroke="#EA580C" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx={x - armSpread / 2} cy={baseY - 3} r="1.8" fill="#94A3B8" stroke="#0F172A" strokeWidth="0.7" />
      <circle cx={x + armSpread / 2} cy={baseY - 3} r="1.8" fill="#94A3B8" stroke="#0F172A" strokeWidth="0.7" />
      <circle cx={x} cy={midY}                      r="2.2" fill="#94A3B8" stroke="#0F172A" strokeWidth="0.7" />
    </g>
  );
};

// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
// AUTHENTIC INDIAN RAILWAYS BLUE LOCOMOTIVE (WAP-7 / WAG-9 / VB)
// ─────────────────────────────────────────────────────────
interface LocoBodyProps {
  x: number;
  railY: number;
  compact: boolean;
  wheelAngle: number;
  suspensionOffset: number;
  pitchAngle: number;
  accelState: string;
  speed: number;
  direction?: 1 | -1;
  trainType?: string;
  locoNumber?: string;
  isSelected?: boolean;
}

const LocoBody: React.FC<LocoBodyProps> = ({
  x, railY, compact, wheelAngle, suspensionOffset, pitchAngle, accelState, speed,
  direction = 1, trainType = 'MAIL_EXPRESS', locoNumber = '30488', isSelected = false,
}) => {
  const isVandeBharat = trainType === 'VANDE_BHARAT';
  const isFreight     = trainType.includes('BOXN') || trainType.includes('BTPN') || trainType.includes('FREIGHT');

  // Professional Uncompressed Proportions (Sleek ~5.3:1 Ratio)
  const locoW  = compact ? 82 : 116;
  const locoH  = compact ? 16 : 22;
  const wheelR = compact ? 3.5 : 4.8;
  const bogieH = wheelR * 2 + 5;

  const bogieBaseY  = railY;
  const underframeY = bogieBaseY - bogieH;
  const bodyY       = underframeY - locoH;
  const roofY       = bodyY - 3;
  const leftX       = x - locoW / 2;

  const isMoving = speed > 0;

  // Authentic Indian Railways Blue Authority Palette
  const irNavyDark    = '#091E3A'; // Deep Indian Railways Navy
  const irRoyalBlue   = '#1A365D'; // Official IR Royal Blue Body
  const irSkyBlue     = '#3B82F6'; // Sky Blue Accent
  const irYellow      = '#F59E0B'; // Safety Golden Yellow Chevron
  const charcoalRoof  = '#1E293B'; // Equipment Roof
  const darkStroke    = '#0F172A'; // Crisp CAD outline

  const bogie1X = leftX + (compact ? 18 : 26);
  const bogie2X = leftX + locoW - (compact ? 18 : 26);

  const pantoX   = leftX + (compact ? 22 : 32);
  const oheWireY = roofY - (compact ? 18 : 26);
  const sparking = isMoving && (Math.sin(speed * 0.15) > 0.7);

  return (
    <g>
      {/* ── DYNAMIC FORWARD HEADLIGHT BEAM ── */}
      {isMoving && (
        <polygon
          points={`
            ${leftX + locoW},${bodyY + 8}
            ${leftX + locoW + (compact ? 80 : 130)},${bodyY - 6}
            ${leftX + locoW + (compact ? 85 : 135)},${railY + 3}
            ${leftX + locoW},${bodyY + 14}
          `}
          fill="url(#headlight-beam-gradient)"
          opacity="0.6"
        />
      )}

      {/* ── BOGIES (Seated Dead-Flat on Rail) ── */}
      <BogieFrame x={bogie1X} y={bogieBaseY} wheelR={wheelR} wheelAngle={wheelAngle} wheelCount={2} compact={compact} />
      <BogieFrame x={bogie2X} y={bogieBaseY} wheelR={wheelR} wheelAngle={wheelAngle} wheelCount={2} compact={compact} />

      {/* ── UNDERFRAME & TRANSFORMER RESERVOIR ── */}
      <rect x={leftX + 4} y={underframeY} width={locoW - 8} height={4} fill="#0F172A" stroke={darkStroke} strokeWidth="0.8" />
      <rect x={leftX + locoW * 0.35} y={underframeY + 1} width={locoW * 0.3} height={3.5} fill="#1E293B" stroke="#475569" strokeWidth="0.6" rx="0.5" />

      {/* Heavy Duty Pilot / Cowcatcher with Warning Chevrons */}
      <polygon
        points={`
          ${leftX + locoW},${underframeY}
          ${leftX + locoW + 5},${underframeY + 3}
          ${leftX + locoW + 3},${bogieBaseY - 1}
          ${leftX + locoW - 2},${bogieBaseY - 1}
        `}
        fill="#0F172A"
        stroke={darkStroke}
        strokeWidth="0.8"
      />
      <line x1={leftX + locoW + 1} y1={underframeY + 1} x2={leftX + locoW + 4} y2={underframeY + 4} stroke={irYellow} strokeWidth="1" />

      {/* Center Buffers */}
      <rect x={leftX - 4} y={underframeY + 1} width={4} height={2.5} fill="#475569" stroke={darkStroke} strokeWidth="0.5" />
      <rect x={leftX + locoW} y={underframeY + 1} width={4} height={2.5} fill="#475569" stroke={darkStroke} strokeWidth="0.5" />

      {/* ── LOCOMOTIVE BODY ── */}
      {isVandeBharat ? (
        // Sleek Aerodynamic Vande Bharat Bullet Trainset Nose
        <g>
          <path
            d={`
              M ${leftX} ${bodyY + locoH}
              L ${leftX + locoW - 16} ${bodyY + locoH}
              Q ${leftX + locoW + 8} ${bodyY + locoH} ${leftX + locoW + 10} ${bodyY + locoH - 7}
              Q ${leftX + locoW + 12} ${bodyY + 4} ${leftX + locoW - 10} ${bodyY}
              L ${leftX} ${bodyY}
              Z
            `}
            fill="#F8FAFC"
            stroke={darkStroke}
            strokeWidth="0.9"
          />
          <path
            d={`
              M ${leftX} ${bodyY + 11}
              L ${leftX + locoW - 10} ${bodyY + 11}
              Q ${leftX + locoW + 4} ${bodyY + 11} ${leftX + locoW + 6} ${bodyY + 14}
              L ${leftX + locoW + 8} ${bodyY + locoH - 2}
              L ${leftX} ${bodyY + locoH - 2}
              Z
            `}
            fill="#1D4ED8"
          />
          {/* Flush Aerodynamic Panoramic Cockpit Visor */}
          <path
            d={`
              M ${leftX + locoW - 28} ${bodyY + 2}
              L ${leftX + locoW - 10} ${bodyY + 2}
              Q ${leftX + locoW + 6} ${bodyY + 4} ${leftX + locoW + 5} ${bodyY + 9}
              L ${leftX + locoW - 28} ${bodyY + 9}
              Z
            `}
            fill="#0F172A"
            stroke="#38BDF8"
            strokeWidth="0.5"
          />
          <ellipse cx={leftX + locoW + 3} cy={bodyY + 14} rx="2.5" ry="1.4" fill="#FEF08A" />
          <g transform={direction === -1 ? `scale(-1, 1) translate(${-(leftX + 10) * 2 - 38}, 0)` : undefined}>
            <text x={leftX + 10} y={bodyY + 8} fontSize="4" fontFamily="'Space Grotesk', sans-serif" fontWeight="700" fill="#1D4ED8">
              VANDE BHARAT · 20901
            </text>
          </g>
        </g>
      ) : (
        // Authentic Indian Railways WAP-7 / WAG-9 Blue Livery
        <g>
          {/* Main Navy Body */}
          <rect x={leftX} y={bodyY} width={locoW} height={locoH} fill={irRoyalBlue} stroke={darkStroke} strokeWidth="1" rx="0.8" />
          {/* Lower deep navy skirt band */}
          <rect x={leftX} y={bodyY + locoH - 4.5} width={locoW} height={4.5} fill={irNavyDark} />
          {/* Crisp White cheatline */}
          <rect x={leftX} y={bodyY + locoH - 6.5} width={locoW} height={1.6} fill="#FFFFFF" />

          {/* Aerodynamic Front Cab Rake */}
          <polygon
            points={`
              ${leftX + locoW},${bodyY}
              ${leftX + locoW + 4},${bodyY + 5}
              ${leftX + locoW + 4},${bodyY + locoH}
              ${leftX + locoW},${bodyY + locoH}
            `}
            fill={irNavyDark}
            stroke={darkStroke}
            strokeWidth="0.8"
          />

          {/* Signature Indian Railways Golden Yellow Chevrons (Tiger Face) */}
          <polygon
            points={`
              ${leftX + locoW - 16},${bodyY + 7}
              ${leftX + locoW + 2},${bodyY + 10}
              ${leftX + locoW + 2},${bodyY + 13}
              ${leftX + locoW - 16},${bodyY + 10}
            `}
            fill={irYellow}
          />
          <polygon
            points={`
              ${leftX + locoW - 16},${bodyY + 13}
              ${leftX + locoW + 2},${bodyY + 16}
              ${leftX + locoW + 2},${bodyY + locoH - 2}
              ${leftX + locoW - 16},${bodyY + locoH - 5}
            `}
            fill={irYellow}
          />

          {/* Dual Windshields with Center Pillar */}
          <rect x={leftX + locoW - 16} y={bodyY + 2.5} width={13} height={5.5} fill="#0F172A" stroke="#94A3B8" strokeWidth="0.5" rx="0.4" />
          <line x1={leftX + locoW - 9.5} y1={bodyY + 2.5} x2={leftX + locoW - 9.5} y2={bodyY + 8} stroke="#94A3B8" strokeWidth="0.5" />

          {/* High-Intensity Dual Sealed-Beam Headlights */}
          <circle cx={leftX + locoW + 2} cy={bodyY + 10} r="2.8" fill="#0F172A" stroke="#CBD5E1" strokeWidth="0.6" />
          <circle cx={leftX + locoW + 2} cy={bodyY + 10} r="1.8" fill="#FEF08A" />
          {/* Red Marker Light */}
          <circle cx={leftX + locoW - 1} cy={bodyY + 16} r="1.2" fill="#EF4444" />

          {/* Stainless Steel Side Louver Grilles */}
          <rect x={leftX + 22} y={bodyY + 3} width={36} height={8} fill="#0F172A" stroke="#475569" strokeWidth="0.4" rx="0.4" />
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={i}
              x1={leftX + 25 + i * 3.6}
              y1={bodyY + 4}
              x2={leftX + 25 + i * 3.6}
              y2={bodyY + 10}
              stroke="#94A3B8"
              strokeWidth="0.6"
            />
          ))}

          {/* Authority Technical Stencils */}
          <g transform={direction === -1 ? `scale(-1, 1) translate(${-(leftX + 66) * 2 - 28}, 0)` : undefined}>
            <text x={leftX + 66} y={bodyY + 6.5} fontSize="4" fontFamily="'JetBrains Mono', monospace" fontWeight="700" fill="#FFFFFF">
              {isFreight ? 'WAG-9' : 'WAP-7'}
            </text>
            <text x={leftX + 66} y={bodyY + 11.5} fontSize="3" fontFamily="'Inter', sans-serif" fontWeight="600" fill="#CBD5E1">
              IR · #{locoNumber}
            </text>
          </g>
        </g>
      )}

      {/* Roof Sill and Machinery Hood */}
      <rect x={leftX + 2} y={roofY} width={locoW - 4} height={3} fill={charcoalRoof} stroke={darkStroke} strokeWidth="0.7" rx="0.4" />

      {/* High-Voltage 25kV Catenary Pantograph */}
      <Pantograph x={pantoX} baseY={roofY} height={compact ? 18 : 25} wireY={oheWireY} extended={true} />

      {/* Micro Contact Arc Sparks */}
      {sparking && (
        <g>
          <circle cx={pantoX} cy={oheWireY + 1} r="3" fill="#38BDF8" opacity="0.9" />
          <circle cx={pantoX} cy={oheWireY + 1} r="6" fill="#60A5FA" opacity="0.4" />
          <line x1={pantoX - 2} y1={oheWireY} x2={pantoX + 3} y2={oheWireY + 2} stroke="#FFFFFF" strokeWidth="0.9" />
        </g>
      )}

      {/* Selection outline */}
      {isSelected && (
        <rect
          x={leftX - 3} y={roofY - 4}
          width={locoW + 8} height={bogieBaseY - roofY + 6}
          fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="4 2" rx="2"
        />
      )}
    </g>
  );
};

// ─────────────────────────────────────────────────────────
// AUTHENTIC SLEEK INDIAN RAILWAYS ICF BLUE PASSENGER COACH
// ─────────────────────────────────────────────────────────
interface CoachProps {
  x: number;
  railY: number;
  compact: boolean;
  wheelAngle: number;
  suspensionOffset: number;
  index: number;
}

const Coach: React.FC<CoachProps> = ({ x, railY, compact, wheelAngle, index }) => {
  // Proportional Sleek Coach Dimensions (~5.4:1 Aspect Ratio)
  const coachW = compact ? 74 : 104;
  const coachH = compact ? 14 : 19;
  const wheelR = compact ? 3.5 : 4.8;
  const bogieH = wheelR * 2 + 5;

  const bogieBaseY  = railY;
  const underframeY = bogieBaseY - bogieH;
  const bodyY       = underframeY - coachH;
  const roofY       = bodyY - 2.5;
  const leftX       = x - coachW / 2;

  // Authentic Indian Railways ICF Blue Palette
  const icfDarkNavy = '#091E3A'; // Deep base & skirt
  const icfBodyNavy = '#1A365D'; // Upper & lower navy bands
  const icfSkyBlue  = '#3B82F6'; // Iconic Sky Blue window band
  const icfYellow   = '#F59E0B'; // Crisp Golden Yellow cheatlines
  const icfRoofGrey = '#475569'; // Galvanized steel roof
  const darkStroke  = '#0F172A';

  const bogie1X = leftX + (compact ? 16 : 22);
  const bogie2X = leftX + coachW - (compact ? 16 : 22);

  const coachCodes = ['A1', 'B2', 'S4', 'S5'];
  const coachCode  = coachCodes[(index - 1) % coachCodes.length] || 'S1';

  return (
    <g>
      {/* Bogies (resting precisely on the railhead, zero bounce) */}
      <BogieFrame x={bogie1X} y={bogieBaseY} wheelR={wheelR} wheelAngle={wheelAngle} wheelCount={2} compact={compact} />
      <BogieFrame x={bogie2X} y={bogieBaseY} wheelR={wheelR} wheelAngle={wheelAngle} wheelCount={2} compact={compact} />

      {/* Underframe, Battery Boxes & Brake Equipment */}
      <rect x={leftX} y={underframeY} width={coachW} height={3} fill="#0F172A" stroke={darkStroke} strokeWidth="0.7" />
      <rect x={leftX + coachW * 0.28} y={underframeY + 0.8} width={coachW * 0.44} height={2.4} fill="#1E293B" rx="0.4" />

      {/* ── COACH BODY ── */}
      {/* Lower Navy section */}
      <rect x={leftX} y={bodyY + coachH * 0.58} width={coachW} height={coachH * 0.42} fill={icfBodyNavy} stroke={darkStroke} strokeWidth="0.8" />
      {/* Lower Golden Yellow Cheatline */}
      <rect x={leftX} y={bodyY + coachH * 0.58 - 1} width={coachW} height={1.2} fill={icfYellow} />

      {/* Middle Sky Blue Window Band */}
      <rect x={leftX} y={bodyY + coachH * 0.18} width={coachW} height={coachH * 0.40} fill={icfSkyBlue} stroke={darkStroke} strokeWidth="0.6" />

      {/* Upper Golden Yellow Cheatline */}
      <rect x={leftX} y={bodyY + coachH * 0.18 - 1} width={coachW} height={1.2} fill={icfYellow} />
      {/* Upper Navy section */}
      <rect x={leftX} y={bodyY} width={coachW} height={coachH * 0.18} fill={icfBodyNavy} stroke={darkStroke} strokeWidth="0.8" />

      {/* 8 Panoramic Passenger Windows with Security Bars */}
      {Array.from({ length: compact ? 6 : 8 }, (_, i) => {
        const wCount = compact ? 6 : 8;
        const wSpacing = (coachW - (compact ? 18 : 24)) / wCount;
        const wx = leftX + (compact ? 9 : 12) + i * wSpacing;
        const ww = wSpacing * 0.74;
        const wh = coachH * 0.28;
        const wy = bodyY + coachH * 0.24;
        return (
          <g key={i}>
            <rect x={wx} y={wy} width={ww} height={wh} fill="#0F172A" stroke="#1E3A8A" strokeWidth="0.4" rx="0.4" />
            <rect x={wx + 0.5} y={wy + 0.5} width={ww - 1} height={wh - 1} fill="#FEF3C7" opacity="0.35" />
            {/* Safety Window Grill Bar */}
            <line x1={wx + 1} y1={wy + wh / 2} x2={wx + ww - 1} y2={wy + wh / 2} stroke="#94A3B8" strokeWidth="0.4" />
          </g>
        );
      })}

      {/* Authority Destination Nameboard Badge on Coach Waist */}
      <rect x={leftX + coachW * 0.42} y={bodyY + coachH * 0.64} width={coachW * 0.16} height={2.4} fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.4" rx="0.3" />
      <text x={leftX + coachW * 0.50} y={bodyY + coachH * 0.64 + 1.8} textAnchor="middle" fontSize="2" fontFamily="'JetBrains Mono', monospace" fontWeight="700" fill="#0F172A">
        {coachCode} · IR
      </text>

      {/* Passenger Entry Doors with Yellow Grab Handles */}
      <rect x={leftX + 2} y={bodyY + 2.5} width={compact ? 4 : 5} height={coachH - 3.5} fill="#1A365D" stroke={darkStroke} strokeWidth="0.5" rx="0.3" />
      <line x1={leftX + 3.2} y1={bodyY + 5} x2={leftX + 3.2} y2={bodyY + coachH - 2} stroke={icfYellow} strokeWidth="0.6" />

      <rect x={leftX + coachW - (compact ? 6 : 7)} y={bodyY + 2.5} width={compact ? 4 : 5} height={coachH - 3.5} fill="#1A365D" stroke={darkStroke} strokeWidth="0.5" rx="0.3" />
      <line x1={leftX + coachW - (compact ? 4.8 : 5.8)} y1={bodyY + 5} x2={leftX + coachW - (compact ? 4.8 : 5.8)} y2={bodyY + coachH - 2} stroke={icfYellow} strokeWidth="0.6" />

      {/* Curved Roof with Torpedo Extractor Vents */}
      <rect x={leftX} y={roofY} width={coachW} height={2.5} fill={icfRoofGrey} stroke={darkStroke} strokeWidth="0.7" rx="0.5" />
      <circle cx={leftX + coachW * 0.25} cy={roofY} r="0.8" fill="#CBD5E1" />
      <circle cx={leftX + coachW * 0.50} cy={roofY} r="0.8" fill="#CBD5E1" />
      <circle cx={leftX + coachW * 0.75} cy={roofY} r="0.8" fill="#CBD5E1" />

      {/* Articulated Gangway Rubber Vestibule Bellows */}
      <rect x={leftX - 2.5} y={bodyY + 1.5} width={2.5} height={coachH - 3} fill="#0F172A" stroke="#334155" strokeWidth="0.5" />
      <rect x={leftX + coachW} y={bodyY + 1.5} width={2.5} height={coachH - 3} fill="#0F172A" stroke="#334155" strokeWidth="0.5" />
    </g>
  );
};

// ─────────────────────────────────────────────────────────
// BOXN COAL HOPPER WAGON (Sleek & Proportional)
// ─────────────────────────────────────────────────────────
const BOXNWagon: React.FC<{ x: number; railY: number; compact: boolean; wheelAngle: number }> = ({ x, railY, compact, wheelAngle }) => {
  const wW = compact ? 62 : 88;
  const wH = compact ? 12 : 16;
  const wheelR = compact ? 3.5 : 4.8;
  const bogieH = wheelR * 2 + 5;

  const bogieBaseY  = railY;
  const underframeY = bogieBaseY - bogieH;
  const bodyY       = underframeY - wH;
  const leftX       = x - wW / 2;

  return (
    <g>
      <BogieFrame x={leftX + (compact ? 14 : 18)} y={bogieBaseY} wheelR={wheelR} wheelAngle={wheelAngle} wheelCount={2} compact={compact} />
      <BogieFrame x={leftX + wW - (compact ? 14 : 18)} y={bogieBaseY} wheelR={wheelR} wheelAngle={wheelAngle} wheelCount={2} compact={compact} />
      <rect x={leftX} y={underframeY} width={wW} height={3} fill="#0F172A" stroke="#0F172A" strokeWidth="0.8" />

      {/* Heaped Coal inside open hopper */}
      <path
        d={`M ${leftX + 4} ${bodyY + 2} Q ${leftX + wW / 2} ${bodyY - (compact ? 3 : 5)} ${leftX + wW - 4} ${bodyY + 2} Z`}
        fill="#0F172A"
      />

      {/* Steel Ribbed Hopper Wagon Body (IR Freight Blue-Steel) */}
      <rect x={leftX} y={bodyY} width={wW} height={wH} fill="#1E3A8A" stroke="#0F172A" strokeWidth="0.9" rx="0.5" />
      {Array.from({ length: 7 }, (_, i) => (
        <line
          key={i}
          x1={leftX + 8 + i * (wW - 16) / 6}
          y1={bodyY + 1}
          x2={leftX + 8 + i * (wW - 16) / 6}
          y2={bodyY + wH - 1}
          stroke="#93C5FD"
          strokeWidth="0.75"
        />
      ))}
      <text x={leftX + 8} y={bodyY + wH - 3} fontSize="3.5" fontFamily="'JetBrains Mono', monospace" fontWeight="700" fill="#FDE047">
        BOXN-CR · COAL
      </text>
    </g>
  );
};

// ─────────────────────────────────────────────────────────
// BTPN PETROLEUM TANKER WAGON (Sleek & Proportional)
// ─────────────────────────────────────────────────────────
const BTPNWagon: React.FC<{ x: number; railY: number; compact: boolean; wheelAngle: number }> = ({ x, railY, compact, wheelAngle }) => {
  const wW = compact ? 62 : 88;
  const wH = compact ? 12 : 16;
  const wheelR = compact ? 3.5 : 4.8;
  const bogieH = wheelR * 2 + 5;

  const bogieBaseY  = railY;
  const underframeY = bogieBaseY - bogieH;
  const bodyY       = underframeY - wH;
  const leftX       = x - wW / 2;

  return (
    <g>
      <BogieFrame x={leftX + (compact ? 14 : 18)} y={bogieBaseY} wheelR={wheelR} wheelAngle={wheelAngle} wheelCount={2} compact={compact} />
      <BogieFrame x={leftX + wW - (compact ? 14 : 18)} y={bogieBaseY} wheelR={wheelR} wheelAngle={wheelAngle} wheelCount={2} compact={compact} />
      <rect x={leftX} y={underframeY} width={wW} height={3} fill="#0F172A" stroke="#0F172A" strokeWidth="0.8" />

      {/* Cylindrical Pressure Tank (IR Blue/Silver) */}
      <rect x={leftX + 4} y={bodyY} width={wW - 8} height={wH} rx={compact ? 5 : 7} fill="#1E40AF" stroke="#0F172A" strokeWidth="1" />
      <line x1={leftX + 4} y1={bodyY + wH / 2} x2={leftX + wW - 4} y2={bodyY + wH / 2} stroke="#60A5FA" strokeWidth="0.9" />
      <rect x={leftX + wW / 2 - 5} y={bodyY - 2} width={10} height={2.5} fill="#CBD5E1" stroke="#0F172A" strokeWidth="0.5" rx="0.4" />
      <text x={leftX + 8} y={bodyY + wH - 3} fontSize="3.5" fontFamily="'JetBrains Mono', monospace" fontWeight="700" fill="#FDE047">
        BTPN · POL HAZMAT
      </text>
    </g>
  );
};

// ─────────────────────────────────────────────────────────
// PROPORTIONAL CONSIST WITH ORIENTATION (ZERO BOUNCING)
// ─────────────────────────────────────────────────────────
interface IRTrainProps {
  centerX: number;
  railY: number;
  compact: boolean;
  wheelAngle: number;
  suspensionOffset: number;
  pitchAngle: number;
  accelState: string;
  speed: number;
  isSelected?: boolean;
  direction?: 1 | -1;
  isSecondary?: boolean;
  trainType?: string;
  locoNumber?: string;
}

const IRTrain: React.FC<IRTrainProps> = ({
  centerX, railY, compact, wheelAngle, suspensionOffset, pitchAngle,
  accelState, speed, isSelected = false, direction = 1, isSecondary = false,
  trainType = 'MAIL_EXPRESS', locoNumber = '30488',
}) => {
  const isFreightCoal = trainType.includes('BOXN');
  const isFreightPol  = trainType.includes('BTPN');

  // Consist dimensions (Uncompressed):
  // Loco (116px) + gap (4px) + Coach 1 (104px) + gap (4px) + Coach 2 (104px)
  // UP (direction 1): Loco is at FRONT (right side), pulling coaches behind it (left side).
  // DN (direction -1): Loco is at FRONT (left side), pulling coaches behind it (right side).
  const locoLeadOffset = direction === 1 ? (compact ? 44 : 64) : (compact ? -44 : -64);
  const locoX = centerX + locoLeadOffset;

  const coach1Offset = direction === 1 ? (compact ? -36 : -52) : (compact ? 36 : 52);
  const coach2Offset = direction === 1 ? (compact ? -114 : -160) : (compact ? 114 : 160);
  const coach1X = centerX + coach1Offset;
  const coach2X = centerX + coach2Offset;

  return (
    <g opacity={isSecondary ? 0.9 : 1.0}>
      {/* Coaches / Wagons (trailing behind the locomotive, Seated Rock-Solid on Rail) */}
      <g>
        {isFreightCoal ? (
          <>
            <BOXNWagon x={coach2X} railY={railY} compact={compact} wheelAngle={wheelAngle} />
            <BOXNWagon x={coach1X} railY={railY} compact={compact} wheelAngle={wheelAngle} />
          </>
        ) : isFreightPol ? (
          <>
            <BTPNWagon x={coach2X} railY={railY} compact={compact} wheelAngle={wheelAngle} />
            <BTPNWagon x={coach1X} railY={railY} compact={compact} wheelAngle={wheelAngle} />
          </>
        ) : (
          <>
            <Coach x={coach2X} railY={railY} compact={compact} wheelAngle={wheelAngle} suspensionOffset={0} index={2} />
            <Coach x={coach1X} railY={railY} compact={compact} wheelAngle={wheelAngle} suspensionOffset={0} index={1} />
          </>
        )}
      </g>

      {/* Blue Locomotive facing forward in direction of travel */}
      <g transform={direction === -1 ? `scale(-1, 1) translate(${-locoX * 2}, 0)` : undefined}>
        <LocoBody
          x={locoX}
          railY={railY}
          compact={compact}
          wheelAngle={wheelAngle}
          suspensionOffset={0}
          pitchAngle={0}
          accelState={accelState}
          speed={speed}
          direction={direction}
          trainType={trainType}
          locoNumber={locoNumber}
          isSelected={isSelected}
        />
      </g>
    </g>
  );
};


// ─────────────────────────────────────────────────────────
// Main Canvas Component
// ─────────────────────────────────────────────────────────
interface RailwaySceneCanvasProps {
  trains: TrainEntity[];
  blocks: MaintenanceBlock[];
  assets: FixedAsset[];
  onSelectTrain?: (train: TrainEntity, physics?: LiveTrainPhysics) => void;
  onSelectBlock?: (block: MaintenanceBlock) => void;
  onSelectAsset?: (asset: FixedAsset) => void;
  onSelectSignal?: (signal: SignalInfo) => void;
  onSelectTrack?: (track: TrackSectionInfo) => void;
  departmentFilter?: 'ALL' | DepartmentType;
  compact?: boolean;
  externalDemoTrigger?: number;
}

export const RailwaySceneCanvas: React.FC<RailwaySceneCanvasProps> = ({
  trains,
  blocks,
  assets,
  onSelectTrain,
  onSelectBlock,
  onSelectAsset,
  onSelectSignal,
  onSelectTrack,
  departmentFilter = 'ALL',
  compact = false,
  externalDemoTrigger,
}) => {
  const W = 1200;
  const H = compact ? 280 : 460;

  const SKY_H       = compact ? 70  : 110;
  const TERRAIN_Y   = SKY_H;
  const UP_Y        = compact ? 160 : 260;
  const DN_Y        = compact ? 210 : 345;
  const LOOP_Y      = compact ? 248 : 410;
  const TRACK_H     = compact ? 10  : 14;
  const OHE_MAST_H  = compact ? 44  : 64;

  const defaultViewBox = { x: 0, y: 0, w: 1200, h: H };
  const [currentViewBox, setCurrentViewBox] = useState(defaultViewBox);
  const targetViewBoxRef = useRef(defaultViewBox);
  const [cameraMode, setCameraMode] = useState<CameraPreset>('WIDE');
  const [trackedTrainId, setTrackedTrainId] = useState<string | null>(null);
  const [envTime, setEnvTime] = useState<number>(0);

  const setCameraPreset = (preset: CameraPreset, trainId?: string) => {
    setCameraMode(preset);
    if (preset === 'TRAIN') {
      setTrackedTrainId(trainId || trains[0]?.id || null);
    } else {
      setTrackedTrainId(null);
    }

    switch (preset) {
      case 'WIDE':    targetViewBoxRef.current = defaultViewBox; break;
      case 'CIVIL':   targetViewBoxRef.current = { x: 440, y: 165, w: 440, h: 220 }; break;
      case 'SIGNAL':  targetViewBoxRef.current = { x: 200, y: 105, w: 400, h: 200 }; break;
      case 'TRACTION':targetViewBoxRef.current = { x: 680, y:  55, w: 450, h: 220 }; break;
      case 'ROUTE':   targetViewBoxRef.current = { x: 300, y: 115, w: 640, h: 300 }; break;
      case 'TRAIN':   break;
    }
  };

  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [isDemoPaused, setIsDemoPaused] = useState<boolean>(false);
  const [demoStepIdx, setDemoStepIdx] = useState<number>(0);
  const [demoWorkProgress, setDemoWorkProgress] = useState<number>(0);
  const demoTimerRef = useRef<any>(null);
  const demoWorkTimerRef = useRef<any>(null);

  const currentDemoStep = DEMO_STORY_STEPS[demoStepIdx];

  const applyDemoStep = (stepIdx: number) => {
    const step = DEMO_STORY_STEPS[stepIdx];
    if (!step) return;

    setDemoStepIdx(stepIdx);
    setCameraPreset(step.cameraPreset);
    setSignals(prev => prev.map(s => (s.id === 'SIG-UP-126' ? { ...s, aspect: step.signalAspect } : s)));

    if (step.id === 6) {
      setDemoWorkProgress(0);
      if (demoWorkTimerRef.current) clearInterval(demoWorkTimerRef.current);
      let p = 0;
      demoWorkTimerRef.current = setInterval(() => {
        p += 5;
        setDemoWorkProgress(Math.min(100, p));
        if (p >= 100) clearInterval(demoWorkTimerRef.current);
      }, step.durationMs / 20);
    } else if (step.id > 6) {
      setDemoWorkProgress(100);
    } else {
      setDemoWorkProgress(0);
    }
  };

  const startDemoStory = (fromStep = 0) => {
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    if (demoWorkTimerRef.current) clearInterval(demoWorkTimerRef.current);

    setIsDemoActive(true);
    setIsDemoPaused(false);
    applyDemoStep(fromStep);

    let current = fromStep;
    const runNext = () => {
      const step = DEMO_STORY_STEPS[current];
      if (!step) return;

      demoTimerRef.current = setTimeout(() => {
        if (current < DEMO_STORY_STEPS.length - 1) {
          current += 1;
          applyDemoStep(current);
          runNext();
        } else {
          setTimeout(() => {
            setIsDemoActive(false);
            setCameraPreset('WIDE');
          }, 3000);
        }
      }, step.durationMs);
    };

    runNext();
  };

  const pauseDemoStory  = () => { setIsDemoPaused(true); if (demoTimerRef.current) clearTimeout(demoTimerRef.current); if (demoWorkTimerRef.current) clearInterval(demoWorkTimerRef.current); };
  const resumeDemoStory = () => { setIsDemoPaused(false); startDemoStory(demoStepIdx); };
  const restartDemoStory = () => startDemoStory(0);
  const exitDemoStory = () => {
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    if (demoWorkTimerRef.current) clearInterval(demoWorkTimerRef.current);
    setIsDemoActive(false); setIsDemoPaused(false); setDemoStepIdx(0); setDemoWorkProgress(0);
    setCameraPreset('WIDE'); setSignals(INITIAL_SIGNALS);
  };

  useEffect(() => {
    if (externalDemoTrigger) startDemoStory(0);
  }, [externalDemoTrigger]);

  const [signals, setSignals] = useState<SignalInfo[]>(INITIAL_SIGNALS);
  const [trainPhysics, setTrainPhysics] = useState<Record<string, LiveTrainPhysics>>({});
  const lastTimeRef = useRef<number>(performance.now());
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const initial: Record<string, LiveTrainPhysics> = {};
    trains.forEach(t => {
      initial[t.id] = {
        id: t.id, trainNumber: t.trainNumber, trainName: t.trainName,
        currentKm: t.currentKm, speedKmH: t.speedKmH, targetSpeedKmH: t.speedKmH,
        accelState: t.speedKmH > 0 ? 'CRUISING' : 'STOPPED',
        wheelAngle: 0, suspensionOffset: 0, pitchAngle: 0,
        assignedTrack: t.assignedTrack, nextSignalAspect: 'GREEN',
        nextSignalDistanceKm: 10, entity: t,
      };
    });
    setTrainPhysics(initial);
  }, [trains]);

  const handleToggleSignal = (sigId: string) => {
    setSignals(prev => prev.map(s => {
      if (s.id === sigId) {
        const nextAspect: 'GREEN' | 'YELLOW' | 'RED' =
          s.aspect === 'GREEN' ? 'YELLOW' : s.aspect === 'YELLOW' ? 'RED' : 'GREEN';
        const updated = { ...s, aspect: nextAspect };
        onSelectSignal?.(updated);
        return updated;
      }
      return s;
    }));
  };

  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);

  useEffect(() => {
    const updatePhysics = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;
      setEnvTime(time);

      setTrainPhysics(prev => {
        let changed = false;
        const next: Record<string, LiveTrainPhysics> = {};
        const trainIds = Object.keys(prev);

        trainIds.forEach(id => {
          const tp = { ...prev[id] };
          const isUp = tp.assignedTrack === 'UP';
          const isLoop = tp.assignedTrack === 'LOOP_1' || tp.assignedTrack === 'LOOP_2';
          const direction = isUp ? 1 : -1;

          // Target line speed per train priority
          let targetSpeed = tp.entity.priority === 1 ? 130 : tp.entity.priority === 2 ? 110 : isLoop ? 0 : 75;

          // 1. SIGNAL ASPECT RESPONSE
          const upcomingSignals = signals.filter(s => {
            if (s.track !== (isUp ? 'UP' : 'DN')) return false;
            return isUp ? s.km > tp.currentKm : s.km < tp.currentKm;
          }).sort((a, b) => isUp ? (a.km - b.km) : (b.km - a.km));

          const nextSig = upcomingSignals[0];
          let sigAspect: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
          let distToSignal = 999;

          if (nextSig) {
            sigAspect = nextSig.aspect;
            distToSignal = Math.abs(nextSig.km - tp.currentKm);

            if (sigAspect === 'RED') {
              const stopPoint = isUp ? nextSig.km - 0.15 : nextSig.km + 0.15;
              const distToStop = Math.abs(stopPoint - tp.currentKm);
              if (distToStop < 1.8) { targetSpeed = 0; }
              else if (distToStop < 4.0) { targetSpeed = Math.min(targetSpeed, 25); }
            } else if (sigAspect === 'YELLOW') {
              if (distToSignal < 3.0) { targetSpeed = Math.min(targetSpeed, 45); }
            }
          }

          // 2. KAVACH AUTOMATIC TRAIN PROTECTION (Anti-Collision Headway)
          trainIds.forEach(otherId => {
            if (otherId === id) return;
            const other = prev[otherId];
            if (other.assignedTrack === tp.assignedTrack) {
              const kmGap = isUp ? (other.currentKm - tp.currentKm) : (tp.currentKm - other.currentKm);
              if (kmGap > 0 && kmGap < 8.0) {
                if (kmGap < 1.4) {
                  // Safe emergency stop buffer
                  targetSpeed = 0;
                } else if (kmGap < 3.2) {
                  targetSpeed = Math.min(targetSpeed, 25);
                } else if (kmGap < 6.0) {
                  targetSpeed = Math.min(targetSpeed, 50);
                }
              }
            }
          });

          tp.nextSignalAspect = sigAspect;
          tp.nextSignalDistanceKm = distToSignal;
          tp.targetSpeedKmH = targetSpeed;

          // 3. TRACTIVE EFFORT & BRAKING ACCELERATION
          const maxAccel = tp.entity.priority === 1 ? 16 : 10;
          const maxBrake = 26;

          if (tp.speedKmH < targetSpeed) {
            tp.speedKmH = Math.min(targetSpeed, tp.speedKmH + maxAccel * dt);
            tp.accelState = 'ACCELERATING';
          } else if (tp.speedKmH > targetSpeed) {
            tp.speedKmH = Math.max(targetSpeed, tp.speedKmH - maxBrake * dt);
            tp.accelState = tp.speedKmH === 0 ? 'STOPPED' : 'BRAKING';
          } else {
            tp.accelState = tp.speedKmH === 0 ? 'STOPPED' : 'CRUISING';
          }

          // 4. INERTIAL BODY PITCH ANGLE (Rock-solid authority standard)
          tp.pitchAngle = 0;

          // 5. CORRIDOR POSITION
          if (!isLoop) {
            const dKm = (tp.speedKmH / 3600) * dt * direction;
            tp.currentKm = tp.currentKm + dKm;

            if (isUp && tp.currentKm > KM_MAX) tp.currentKm = KM_MIN;
            else if (!isUp && tp.currentKm < KM_MIN) tp.currentKm = KM_MAX;
          }

          // 6. SYNCHRONIZED WHEEL ROTATION
          const wheelCircumferenceM = 2.8;
          const wheelRotationsPerSec = (tp.speedKmH / 3.6) / wheelCircumferenceM;
          const dAngle = wheelRotationsPerSec * 360 * dt * direction;
          tp.wheelAngle = (tp.wheelAngle + dAngle) % 360;

          // 7. ZERO BOUNCING (Rock-solid level on railhead)
          tp.suspensionOffset = 0;

          if (cameraMode === 'TRAIN' && (trackedTrainId === id || (!trackedTrainId && isUp))) {
            const trainX = kmToX(tp.currentKm, W);
            targetViewBoxRef.current = {
              x: Math.max(0, Math.min(W - 420, trainX - 220)),
              y: 130, w: 420, h: 210,
            };
          }

          next[id] = tp;
          changed = true;
        });

        return changed ? next : prev;
      });

      setCurrentViewBox(prevVb => {
        const target = targetViewBoxRef.current;
        const lp = 0.055;
        return {
          x: prevVb.x + (target.x - prevVb.x) * lp,
          y: prevVb.y + (target.y - prevVb.y) * lp,
          w: prevVb.w + (target.w - prevVb.w) * lp,
          h: prevVb.h + (target.h - prevVb.h) * lp,
        };
      });

      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [signals, cameraMode, trackedTrainId]);

  const isHighlighted = (dept?: DepartmentType) => {
    if (departmentFilter === 'ALL') return true;
    return departmentFilter === dept;
  };

  const civilWorkX  = kmToX(126, W);
  const signalWorkX = kmToX(114, W);
  const tractionWorkX = kmToX(138, W);

  const bgParallaxX = -currentViewBox.x * 0.15;
  const cloudDriftX = (envTime * 0.008) % 1200;

  const isCivilDrawn   = isDemoActive && demoStepIdx >= 1 && demoStepIdx <= 6;
  const isTractionDrawn = isDemoActive && demoStepIdx === 7;
  const isSignalDrawn  = isDemoActive && demoStepIdx === 8;

  return (
    <div
      className="w-full relative overflow-hidden select-none"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '4px' }}
    >
      {/* ── TOOLBAR ── */}
      <div
        className="p-2 px-3.5 flex flex-wrap items-center justify-between gap-2"
        style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {!isDemoActive ? (
            <button
              onClick={() => startDemoStory(0)}
              style={{
                padding: '4px 11px',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                border: '1px solid #0F172A',
                borderRadius: '3px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '11.5px', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '5px',
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              <Play style={{ width: 11, height: 11, color: '#22C55E', fill: 'currentColor' }} />
              Simulate Operation
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '3px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter', sans-serif", fontSize: '10.5px', fontWeight: 600, color: '#DC2626' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#DC2626', display: 'inline-block' }} className="animate-pulse" />
                Live · Step {demoStepIdx + 1}/10
              </span>
              {isDemoPaused ? (
                <button onClick={resumeDemoStory} style={{ padding: '2px 6px', backgroundColor: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '2px', fontFamily: "'Inter', sans-serif", fontSize: '10.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Play style={{ width: 10, height: 10, fill: 'currentColor' }} /> Resume
                </button>
              ) : (
                <button onClick={pauseDemoStory} style={{ padding: '2px 6px', backgroundColor: 'transparent', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '2px', fontFamily: "'Inter', sans-serif", fontSize: '10.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Pause style={{ width: 10, height: 10 }} /> Pause
                </button>
              )}
              <button onClick={restartDemoStory} style={{ padding: '2px 6px', backgroundColor: 'transparent', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '2px', fontFamily: "'Inter', sans-serif", fontSize: '10.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                <RotateCcw style={{ width: 10, height: 10 }} /> Restart
              </button>
              <button onClick={exitDemoStory} style={{ padding: '2px 4px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X style={{ width: 12, height: 12 }} />
              </button>
            </div>
          )}

          {/* Camera Presets */}
          <div className="hidden sm:flex items-center gap-1">
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9.5px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em', marginRight: 2 }}>View</span>
            {(['WIDE', 'TRAIN', 'CIVIL', 'SIGNAL', 'TRACTION', 'ROUTE'] as CameraPreset[]).map(cam => (
              <button
                key={cam}
                onClick={() => setCameraPreset(cam)}
                style={{
                  padding: '2.5px 7px',
                  borderRadius: '3px',
                  border: '1px solid',
                  borderColor: cameraMode === cam ? '#0F172A' : '#CBD5E1',
                  backgroundColor: cameraMode === cam ? '#0F172A' : '#FFFFFF',
                  color: cameraMode === cam ? '#FFFFFF' : '#475569',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '10px', fontWeight: cameraMode === cam ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.12s ease',
                  letterSpacing: '0.02em',
                }}
              >
                {cam}
              </button>
            ))}
          </div>
        </div>

        {/* Signal & Speed Telemetry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'Inter', sans-serif", fontSize: '11.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#64748B' }}>Prot. Signal</span>
            {(() => {
              const asp = signals.find(s => s.id === 'SIG-UP-126')?.aspect || 'GREEN';
              const c = asp === 'RED' ? { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' } :
                        asp === 'YELLOW' ? { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' } :
                        { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' };
              return (
                <span style={{ padding: '1px 6px', backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: '2px', fontWeight: 600, fontSize: '10.5px' }}>
                  {asp} (S-126)
                </span>
              );
            })()}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#64748B' }}>Loco 20901</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#0F172A', fontSize: '12.5px' }}>
              {trainPhysics['TRN-20901'] ? Math.round(trainPhysics['TRN-20901'].speedKmH) : 130} km/h
            </span>
          </div>
        </div>
      </div>

      {/* ── TECHNICAL DRAFTING CANVAS (Crisp Pure White Surface) ── */}
      <div className="relative">
        <svg
          viewBox={`${currentViewBox.x} ${currentViewBox.y} ${currentViewBox.w} ${currentViewBox.h}`}
          width="100%"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          style={{ backgroundColor: '#FAFAFA' }}
        >
          <defs>
            <pattern id="pen-hatch-track" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#0F172A" strokeWidth="1.2" strokeOpacity="0.25" />
            </pattern>
            {/* Dynamic Headlight Glow Beam Gradient */}
            <linearGradient id="headlight-beam-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.75" />
              <stop offset="45%" stopColor="#FEF08A" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#FEF08A" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* ── LAYER 1: BACKGROUND (parallax) ── */}
          <g transform={`translate(${bgParallaxX}, 0)`}>
            <rect x="-300" y="0" width={W + 600} height={SKY_H} fill="#F8FAFC" />
            <g transform={`translate(${cloudDriftX - 200}, 0)`} opacity="0.4">
              <path d="M 50 28 Q 70 16 95 24 Q 120 18 140 28 Q 155 38 135 48 L 45 48 Z"  fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="0.8" />
              <path d="M 420 22 Q 445 12 470 20 Q 500 14 525 24 Q 540 36 515 44 L 410 44 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="0.8" />
              <path d="M 820 26 Q 840 14 865 22 Q 890 16 910 26 Q 925 36 905 46 L 815 46 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="0.8" />
            </g>
            <line x1="-300" y1="25" x2={W+300} y2="25" stroke="#E2E8F0" strokeWidth="0.6" strokeDasharray="6 4" />
            <line x1="-300" y1="55" x2={W+300} y2="55" stroke="#E2E8F0" strokeWidth="0.6" strokeDasharray="6 4" />
            <path
              d={`M -300 ${TERRAIN_Y} Q 180 ${TERRAIN_Y - 28} 380 ${TERRAIN_Y - 6} Q 600 ${TERRAIN_Y - 38} 820 ${TERRAIN_Y - 14} Q 1020 ${TERRAIN_Y - 32} ${W+300} ${TERRAIN_Y} L ${W+300} ${H} L -300 ${H} Z`}
              fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="0.8"
            />
            {[80, 200, 400, 620, 810, 980, 1100].map((tx, i) => (
              <g key={i} opacity="0.35">
                <rect x={tx - 4} y={TERRAIN_Y - 20} width={8} height={20} fill="#94A3B8" />
                <ellipse cx={tx} cy={TERRAIN_Y - 22} rx={14} ry={16} fill="#64748B" />
              </g>
            ))}
          </g>

          {/* ── LAYER 2: MIDGROUND — Stations, OHE, Signals ── */}
          {STATIONS.map(st => {
            const x = kmToX(st.km, W);
            return (
              <g key={st.code}>
                <rect x={x - 36} y={UP_Y - TRACK_H / 2 - 10} width={72} height={10} fill="#E2E8F0" stroke="#0F172A" strokeWidth="0.9" />
                <rect x={x - 26} y={UP_Y - TRACK_H / 2 - 42} width={52} height={12} fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.1" rx="1" />
                <line x1={x} y1={UP_Y - TRACK_H / 2 - 30} x2={x} y2={UP_Y - TRACK_H / 2 - 10} stroke="#0F172A" strokeWidth="0.9" />
                <text x={x} y={UP_Y - TRACK_H / 2 - 33} textAnchor="middle" fontSize="7.5" fontFamily="'Inter', sans-serif" fontWeight="600" fill="#0F172A">{st.name}</text>
                <text x={x} y={UP_Y - TRACK_H / 2 - 45} textAnchor="middle" fontSize="6" fontFamily="'JetBrains Mono', monospace" fill="#64748B">KM {st.km}</text>
              </g>
            );
          })}

          {/* OHE Masts & Contact Wire */}
          <g opacity={isHighlighted('OHE') ? 1 : 0.4}>
            {[60, 160, 260, 360, 460, 560, 660, 760, 860, 960, 1060, 1160].map((mx, idx) => {
              const mastTopY  = UP_Y - TRACK_H / 2 - OHE_MAST_H;
              const mastBaseY = UP_Y - TRACK_H / 2;
              const cantileverY = mastTopY + 14;
              const wireOffsetX = 22;
              return (
                <g key={`ohe-${idx}`}>
                  <line x1={mx} y1={mastTopY} x2={mx} y2={mastBaseY} stroke="#0F172A" strokeWidth="1.8" />
                  <line x1={mx} y1={cantileverY} x2={mx + wireOffsetX} y2={cantileverY + 14} stroke="#0F172A" strokeWidth="1.2" />
                  <line x1={mx} y1={cantileverY + 4} x2={mx + wireOffsetX} y2={cantileverY + 14} stroke="#64748B" strokeWidth="0.7" strokeDasharray="3 2" />
                  <circle cx={mx + wireOffsetX} cy={cantileverY + 14} r="2.8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.9" />
                </g>
              );
            })}
            <path
              d={`M 0 ${UP_Y - TRACK_H / 2 - OHE_MAST_H + 28} Q 300 ${UP_Y - TRACK_H / 2 - OHE_MAST_H + 36} 600 ${UP_Y - TRACK_H / 2 - OHE_MAST_H + 28} Q 900 ${UP_Y - TRACK_H / 2 - OHE_MAST_H + 36} ${W} ${UP_Y - TRACK_H / 2 - OHE_MAST_H + 28}`}
              fill="none" stroke="#0F172A" strokeWidth="1.1" opacity="0.9"
            />
            <line x1="0" y1={UP_Y - TRACK_H / 2 - OHE_MAST_H + 16} x2={W} y2={UP_Y - TRACK_H / 2 - OHE_MAST_H + 16}
              stroke="#64748B" strokeWidth="0.8" opacity="0.6" />
            {[60, 160, 260, 360, 460, 560, 660, 760, 860, 960, 1060, 1160].map((mx, idx) => (
              <line key={`drop-${idx}`}
                x1={mx + 22} y1={UP_Y - TRACK_H / 2 - OHE_MAST_H + 16}
                x2={mx + 22} y2={UP_Y - TRACK_H / 2 - OHE_MAST_H + 28}
                stroke="#64748B" strokeWidth="0.8" opacity="0.6"
              />
            ))}
          </g>

          {/* Signals */}
          <g opacity={isHighlighted('SNT') ? 1 : 0.4}>
            {signals.map(sig => {
              const sx = kmToX(sig.km, W);
              const mastBaseY = UP_Y - TRACK_H / 2 - 2;
              const mastTopY  = mastBaseY - 50;
              const isRed    = sig.aspect === 'RED';
              const isYellow = sig.aspect === 'YELLOW';
              const isGreen  = sig.aspect === 'GREEN';

              return (
                <g key={sig.id} onClick={() => { handleToggleSignal(sig.id); setCameraPreset('SIGNAL'); }} className="cursor-pointer">
                  <line x1={sx} y1={mastTopY + 30} x2={sx} y2={mastBaseY} stroke="#0F172A" strokeWidth="2" />
                  <rect x={sx - 6} y={mastTopY} width={12} height={30} rx="2" fill="#0F172A" stroke="#0F172A" strokeWidth="1" />
                  {[5, 14, 23].map((ly, i) => (
                    <line key={i} x1={sx - 7} y1={mastTopY + ly - 1} x2={sx + 7} y2={mastTopY + ly - 1} stroke="#0F172A" strokeWidth="1.2" />
                  ))}
                  <circle cx={sx} cy={mastTopY + 6}  r="3.5" fill={isGreen  ? '#16A34A' : '#1E293B'} />
                  {isGreen  && <circle cx={sx} cy={mastTopY + 6}  r="6.5" fill="#16A34A" fillOpacity="0.3" />}
                  <circle cx={sx} cy={mastTopY + 15} r="3.5" fill={isYellow ? '#D97706' : '#1E293B'} />
                  {isYellow && <circle cx={sx} cy={mastTopY + 15} r="6.5" fill="#D97706" fillOpacity="0.3" />}
                  <circle cx={sx} cy={mastTopY + 24} r="3.5" fill={isRed    ? '#DC2626' : '#1E293B'} />
                  {isRed    && <circle cx={sx} cy={mastTopY + 24} r="7.5" fill="#DC2626" fillOpacity="0.35" />}
                  <rect x={sx - 10} y={mastTopY + 32} width={20} height={8} fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.7" />
                  <text x={sx} y={mastTopY + 38} textAnchor="middle" fontSize="5.5" fontFamily="'JetBrains Mono', monospace" fontWeight="700" fill="#0F172A">S-{sig.km}</text>
                </g>
              );
            })}
          </g>

          {/* ── LAYER 3: TRACK FOREGROUND ── */}
          {[UP_Y, DN_Y, LOOP_Y].map((lineY, lIdx) => (
            <rect key={`ballast-${lIdx}`}
              x={0} y={lineY - TRACK_H / 2 - 4}
              width={W} height={TRACK_H + 8}
              fill="#E2E8F0" opacity="0.6"
            />
          ))}

          {/* Sleepers */}
          {[UP_Y, DN_Y, LOOP_Y].map((lineY, lIdx) => (
            <g key={`sleepers-line-${lIdx}`}>
              {Array.from({ length: 65 }, (_, i) => {
                const sx = i * 18.5 + 4;
                return (
                  <rect key={`sp-${lIdx}-${i}`}
                    x={sx} y={lineY - TRACK_H / 2 - 2}
                    width={11} height={TRACK_H + 4}
                    fill="#CBD5E1" stroke="#0F172A" strokeWidth="0.7" rx="0.5"
                  />
                );
              })}
            </g>
          ))}

          {/* Rails */}
          {[UP_Y, DN_Y, LOOP_Y].map((lineY, lIdx) => (
            <g key={`rails-line-${lIdx}`}>
              <line x1="0" y1={lineY - TRACK_H / 2 + 2} x2={W} y2={lineY - TRACK_H / 2 + 2} stroke="#0F172A" strokeWidth="2.8" />
              <line x1="0" y1={lineY + TRACK_H / 2 - 2} x2={W} y2={lineY + TRACK_H / 2 - 2} stroke="#0F172A" strokeWidth="2.8" />
            </g>
          ))}

          {/* Turnout switch crossing at Vapi yard */}
          <line
            x1={kmToX(124.5, W)}
            y1={UP_Y + TRACK_H / 2 - 2}
            x2={kmToX(126.8, W)}
            y2={DN_Y - TRACK_H / 2 + 2}
            stroke="#0F172A"
            strokeWidth="2.4"
          />

          {/* Civil Work Zone */}
          {isCivilDrawn && (
            <g transform={`translate(${civilWorkX - 55}, ${UP_Y - TRACK_H / 2 - 28})`} className="animate-fade-in">
              <rect x={0} y={10} width={110} height={42} fill="url(#pen-hatch-track)" stroke="#D97706" strokeWidth="1.8" strokeDasharray="7 3" />
              {[0, 52, 104].map((bx, i) => (
                <g key={i}>
                  <line x1={bx + 3} y1={10} x2={bx + 3} y2={52} stroke="#DC2626" strokeWidth="1.5" />
                  <line x1={bx + 3} y1={14} x2={bx + 8} y2={10} stroke="#FFFFFF" strokeWidth="1.5" />
                  <line x1={bx + 3} y1={20} x2={bx + 8} y2={16} stroke="#FFFFFF" strokeWidth="1.5" />
                  <line x1={bx + 3} y1={26} x2={bx + 8} y2={22} stroke="#FFFFFF" strokeWidth="1.5" />
                </g>
              ))}
              {demoStepIdx >= 5 && (
                <g transform="translate(40, -16)">
                  <ellipse cx={7} cy={3} rx={6} ry={3.5} fill="#D97706" stroke="#0F172A" strokeWidth="0.8" />
                  <circle cx={7} cy={7} r={4} fill="#F8FAFC" stroke="#0F172A" strokeWidth="0.8" />
                  <rect x={3} y={11} width={8} height={11} fill="#D97706" stroke="#0F172A" strokeWidth="0.9" rx="0.5" />
                  <line x1={3} y1={14} x2={11} y2={14} stroke="#0F172A" strokeWidth="0.8" />
                  <line x1={3} y1={12} x2={-2} y2={18} stroke="#0F172A" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1={11} y1={12} x2={14} y2={20} stroke="#0F172A" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1={14} y1={20} x2={14} y2={32} stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1={5} y1={22} x2={4} y2={34} stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1={9} y1={22} x2={10} y2={34} stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
                </g>
              )}
              {demoStepIdx === 6 && (
                <g>
                  <rect x={20} y={-10} width={70} height={12} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" rx="2" />
                  <text x={55} y={-1} textAnchor="middle" fontSize="6.5" fontFamily="'Inter', sans-serif" fontWeight="600" fill="#0F172A">
                    Tamping {demoWorkProgress}%
                  </text>
                </g>
              )}
            </g>
          )}

          {/* OHE Traction Work */}
          {isTractionDrawn && (
            <g transform={`translate(${tractionWorkX - 24}, ${UP_Y - TRACK_H / 2 - OHE_MAST_H - 16})`} className="animate-fade-in">
              <line x1={10} y1={22} x2={6} y2={76} stroke="#0F172A" strokeWidth="1.5" />
              <line x1={22} y1={22} x2={26} y2={76} stroke="#0F172A" strokeWidth="1.5" />
              <line x1={6} y1={44} x2={26} y2={44} stroke="#64748B" strokeWidth="0.9" strokeDasharray="3 2" />
              <circle cx={16} cy={6} r={3.5} fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.9" />
              <ellipse cx={16} cy={2} rx={5} ry={2.5} fill="#0F172A" stroke="#0F172A" strokeWidth="0.7" />
              <rect x={12} y={9} width={8} height={10} fill="#0F172A" stroke="#0F172A" strokeWidth="0.9" rx="0.5" />
              <rect x={30} y={4} width={24} height={10} fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.8" rx="2" />
              <text x={42} y={12} textAnchor="middle" fontSize="6" fontFamily="'JetBrains Mono', monospace" fontWeight="700" fill="#0F172A">25kV AC</text>
            </g>
          )}

          {/* Signal Work */}
          {isSignalDrawn && (
            <g transform={`translate(${signalWorkX + 8}, ${UP_Y - TRACK_H / 2 - 38})`} className="animate-fade-in">
              <rect x={0} y={0} width={26} height={32} fill="#FFFFFF" stroke="#16A34A" strokeWidth="1.4" rx="2" />
              {[4, 9, 14, 19, 24].map((ly, i) => (
                <line key={i} x1={3} y1={ly} x2={23} y2={ly} stroke="#E2E8F0" strokeWidth="0.7" />
              ))}
              <circle cx={20} cy={4}  r="1.8" fill="#16A34A" />
              <circle cx={20} cy={9}  r="1.8" fill="#16A34A" />
              <circle cx={20} cy={14} r="1.8" fill="#D97706" />
              <text x={13} y={38} textAnchor="middle" fontSize="5.5" fontFamily="'Inter', sans-serif" fontWeight="600" fill="#16A34A">TC CLEAR</text>
            </g>
          )}

          {/* ── REAL-TIME KINEMATIC TRAINS ── */}
          {trains.map((train, tIdx) => {
            const phys = trainPhysics[train.id];
            const currentKm = phys ? phys.currentKm : train.currentKm;
            const speed     = phys ? Math.round(phys.speedKmH) : train.speedKmH;
            const wheelAngle = phys ? phys.wheelAngle : 0;
            const suspension = phys ? phys.suspensionOffset : 0;
            const pitchAngle = phys ? phys.pitchAngle : 0;
            const accelState = phys ? phys.accelState : 'CRUISING';

            const tx    = kmToX(currentKm, W);
            const isUp  = train.assignedTrack === 'UP';
            const isLoop = train.assignedTrack === 'LOOP_1' || train.assignedTrack === 'LOOP_2';
            const lineY = isUp ? UP_Y : (isLoop ? LOOP_Y : DN_Y);
            const dir   = (isUp ? 1 : -1) as 1 | -1;
            const isSelected = selectedTrainId === train.id;
            const isSecondary = tIdx > 0 && !isSelected;

            const railTopY = lineY - TRACK_H / 2 + 2;

            return (
              <g
                key={train.id}
                onClick={() => {
                  setSelectedTrainId(isSelected ? null : train.id);
                  onSelectTrain?.(train, phys);
                  setCameraPreset('TRAIN', train.id);
                }}
                className="cursor-pointer"
              >
                <IRTrain
                  centerX={tx}
                  railY={railTopY}
                  compact={compact}
                  wheelAngle={wheelAngle}
                  suspensionOffset={suspension}
                  pitchAngle={pitchAngle}
                  accelState={accelState}
                  speed={speed}
                  isSelected={isSelected}
                  direction={dir}
                  isSecondary={isSecondary}
                  trainType={train.trainType}
                  locoNumber={train.locoNumber}
                />

                {/* Track Circuit Rail Occupancy Highlighting (Authority Interlocking Style) */}
                <line
                  x1={tx - (compact ? 60 : 100)}
                  y1={railTopY}
                  x2={tx + (compact ? 60 : 100)}
                  y2={railTopY}
                  stroke={accelState === 'BRAKING' ? '#EF4444' : accelState === 'STOPPED' ? '#F59E0B' : '#3B82F6'}
                  strokeWidth="3.2"
                  strokeOpacity="0.75"
                  strokeLinecap="round"
                />

                {/* Professional Authority SCADA Train Telemetry Badge */}
                <g transform={`translate(${tx}, ${railTopY - (compact ? 52 : 72)})`}>
                  <rect
                    x="-42" y="-10" width="84" height="20"
                    fill="#FFFFFF"
                    stroke={accelState === 'BRAKING' ? '#EF4444' : accelState === 'STOPPED' ? '#F59E0B' : '#1E40AF'}
                    strokeWidth="1.2"
                    rx="3"
                    filter="drop-shadow(0 2px 4px rgba(15,23,42,0.12))"
                  />
                  {/* Status Indicator Dot */}
                  <circle
                    cx="-34" cy="0" r="2.5"
                    fill={accelState === 'BRAKING' ? '#EF4444' : accelState === 'STOPPED' ? '#F59E0B' : '#10B981'}
                  />
                  {/* Train Identity */}
                  <text x="-28" y="-1" fontSize="6.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="700" fill="#0F172A">
                    {train.trainNumber}
                  </text>
                  <text x="-28" y="7" fontSize="4.5" fontFamily="'Inter', sans-serif" fontWeight="600" fill="#64748B">
                    {train.assignedTrack} · KM {Math.round(currentKm * 10) / 10}
                  </text>
                  {/* Speed & Kavach telemetry */}
                  <text
                    x="36" y="0"
                    textAnchor="end"
                    fontSize="7.5"
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight="800"
                    fill={accelState === 'BRAKING' ? '#DC2626' : accelState === 'STOPPED' ? '#D97706' : '#1E40AF'}
                  >
                    {speed}
                  </text>
                  <text
                    x="36" y="7"
                    textAnchor="end"
                    fontSize="4"
                    fontFamily="'Inter', sans-serif"
                    fontWeight="600"
                    fill="#64748B"
                  >
                    km/h · KAVACH
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* ── FLOATING DEMO STORY OVERLAY ── */}
        {isDemoActive && currentDemoStep && (
          <div
            className="absolute top-3 left-3 z-20 animate-fade-in"
            style={{
              maxWidth: 320,
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '4px',
              boxShadow: '0 4px 16px rgba(15,23,42,0.12)',
              padding: '10px 12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#DC2626', display: 'inline-block' }} className="animate-pulse" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#DC2626' }}>
                  Step {demoStepIdx + 1}/10
                </span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9.5px', fontWeight: 500, color: '#475569' }}>
                  {currentDemoStep.phaseName}
                </span>
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: '#0F172A', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', padding: '1px 5px', borderRadius: '2px' }}>
                {currentDemoStep.shortTitle}
              </span>
            </div>

            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 400, color: '#0F172A', lineHeight: 1.5, margin: 0 }}>
              {currentDemoStep.narrative}
            </p>

            {demoStepIdx === 6 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter', sans-serif", fontSize: '9.5px', color: '#475569', marginBottom: 3 }}>
                  <span>Tamping progress</span>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: '#0F172A' }}>{demoWorkProgress}%</span>
                </div>
                <div style={{ width: '100%', height: 3, backgroundColor: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', backgroundColor: '#0F172A', borderRadius: '2px', width: `${demoWorkProgress}%`, transition: 'width 0.1s linear' }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── THIN OPERATIONAL TIMELINE ── */}
      <div
        className="flex items-center justify-between gap-2 overflow-x-auto"
        style={{ padding: '6px 10px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}
      >
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9.5px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock style={{ width: 11, height: 11, color: '#0F172A' }} /> Timeline
        </span>

        <div className="flex items-center gap-1 overflow-x-auto">
          {DEMO_STORY_STEPS.map((step, idx) => {
            const isCurrent = isDemoActive && demoStepIdx === idx;
            const isPassed  = isDemoActive && demoStepIdx > idx;

            return (
              <button
                key={step.id}
                onClick={() => { if (!isDemoActive) setIsDemoActive(true); applyDemoStep(idx); }}
                style={{
                  padding: '2.5px 7px',
                  borderRadius: '2px',
                  border: '1px solid',
                  borderColor: isCurrent ? '#0F172A' : isPassed ? '#BBF7D0' : '#E2E8F0',
                  backgroundColor: isCurrent ? '#0F172A' : isPassed ? '#F0FDF4' : '#FFFFFF',
                  color: isCurrent ? '#FFFFFF' : isPassed ? '#16A34A' : '#475569',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '9.5px', fontWeight: isCurrent ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.12s ease',
                  flexShrink: 0,
                }}
              >
                {idx + 1}. {step.shortTitle}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
