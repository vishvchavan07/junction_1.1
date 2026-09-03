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

const TRACK_SECTIONS: TrackSectionInfo[] = [
  { sectionId: 'SEC-100-115', kmStart: 100, kmEnd: 115, track: 'UP', railType: '60kg 90UTS Continuous Welded', tgiScore: 84.5, omsPeakG: 0.12, speedLimitKmph: 130, activeWork: false },
  { sectionId: 'SEC-115-130', kmStart: 115, kmEnd: 130, track: 'UP', railType: '60kg 90UTS Continuous Welded', tgiScore: 68.2, omsPeakG: 0.28, speedLimitKmph: 75,  activeWork: true },
  { sectionId: 'SEC-130-145', kmStart: 130, kmEnd: 145, track: 'UP', railType: '60kg Head Hardened (HH)',      tgiScore: 91.0, omsPeakG: 0.09, speedLimitKmph: 130, activeWork: false },
  { sectionId: 'SEC-145-160', kmStart: 145, kmEnd: 160, track: 'UP', railType: '60kg 90UTS Continuous Welded', tgiScore: 88.4, omsPeakG: 0.11, speedLimitKmph: 130, activeWork: false },
];

// ─────────────────────────────────────────────────────────
// INDIAN RAILWAYS LOCOMOTIVE SVG — Technical Illustration
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
      {/* Tyre / rim */}
      <circle cx={cx} cy={cy} r={r} fill="#1E2328" stroke="#0B141D" strokeWidth="1.4" />
      {/* Wheel face */}
      <circle cx={cx} cy={cy} r={r * 0.72} fill="#2D3742" stroke="#0B141D" strokeWidth="0.8" />
      {/* Spokes */}
      {spokeAngles.map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const x2 = cx + Math.cos(rad) * r * 0.68;
        const y2 = cy + Math.sin(rad) * r * 0.68;
        return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="#0B141D" strokeWidth={variant === 'driving' ? '0.9' : '0.7'} strokeOpacity="0.85" />;
      })}
      {/* Counter weight disc */}
      {variant === 'driving' && (
        <ellipse cx={cx + r * 0.35} cy={cy} rx={r * 0.28} ry={r * 0.18} fill="#0B141D" opacity="0.7" />
      )}
      {/* Hub */}
      <circle cx={cx} cy={cy} r={r * 0.18} fill="#79B8E6" stroke="#0B141D" strokeWidth="0.9" />
      <circle cx={cx} cy={cy} r={r * 0.07} fill="#0B141D" />
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
      {/* Bogie side frames */}
      <rect
        x={x - frameW / 2} y={bogieBaseY - frameH}
        width={frameW} height={frameH}
        fill="#2A3744" stroke="#0B141D" strokeWidth="0.9" rx="1"
      />
      {/* Bolster */}
      <rect
        x={x - 4} y={bogieBaseY - frameH - 4}
        width={8} height={5}
        fill="#1E2833" stroke="#0B141D" strokeWidth="0.8" rx="0.5"
      />
      {/* Axle boxes */}
      {wheelXs.map((wx, i) => (
        <g key={i}>
          <rect x={wx - 4} y={bogieBaseY - frameH - 2} width={8} height={3}
            fill="#79B8E6" stroke="#0B141D" strokeWidth="0.6" rx="0.5" />
        </g>
      ))}
      {/* Coil spring indicators */}
      {wheelXs.map((wx, i) => (
        <g key={`spring-${i}`}>
          <line x1={wx - 1.5} y1={bogieBaseY - 1} x2={wx - 1.5} y2={bogieBaseY + 4}
            stroke="#71879A" strokeWidth="0.8" strokeDasharray="1.5 1" />
          <line x1={wx + 1.5} y1={bogieBaseY - 1} x2={wx + 1.5} y2={bogieBaseY + 4}
            stroke="#71879A" strokeWidth="0.8" strokeDasharray="1.5 1" />
        </g>
      ))}
      {/* Wheels */}
      {wheelXs.map((wx, i) => (
        <LocoWheel
          key={i}
          cx={wx} cy={y - wheelR}
          r={wheelR}
          angle={wheelAngle}
          variant={wheelCount === 4 ? 'driving' : 'bogie'}
        />
      ))}
      {/* Brake rigging */}
      {wheelXs.length > 1 && wheelXs.slice(0, -1).map((wx, i) => (
        <line key={`rig-${i}`}
          x1={wx + wheelR * 0.6} y1={y - wheelR * 0.5}
          x2={wheelXs[i + 1] - wheelR * 0.6} y2={y - wheelR * 0.5}
          stroke="#2A3744" strokeWidth="0.8" strokeOpacity="0.7"
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
      {/* Base shoe on roof */}
      <rect x={x - baseWidth / 2} y={baseY - 3} width={baseWidth} height={4}
        fill="#1E2833" stroke="#0B141D" strokeWidth="0.8" />
      {/* Lower diamond arms */}
      <line x1={x - armSpread / 2} y1={baseY - 3}   x2={x} y2={midY}
        stroke="#0B141D" strokeWidth="1.6" strokeLinecap="round" />
      <line x1={x + armSpread / 2} y1={baseY - 3}   x2={x} y2={midY}
        stroke="#0B141D" strokeWidth="1.6" strokeLinecap="round" />
      {/* Upper arms */}
      <line x1={x - armSpread * 0.6} y1={midY} x2={x - 4} y2={topY}
        stroke="#0B141D" strokeWidth="1.3" strokeLinecap="round" />
      <line x1={x + armSpread * 0.6} y1={midY} x2={x + 4} y2={topY}
        stroke="#0B141D" strokeWidth="1.3" strokeLinecap="round" />
      {/* Contact strip */}
      <line x1={x - 8} y1={topY} x2={x + 8} y2={topY}
        stroke="#C96A45" strokeWidth="2.4" strokeLinecap="round" />
      {/* Knuckle joints */}
      <circle cx={x - armSpread / 2} cy={baseY - 3} r="1.8" fill="#79B8E6" stroke="#0B141D" strokeWidth="0.7" />
      <circle cx={x + armSpread / 2} cy={baseY - 3} r="1.8" fill="#79B8E6" stroke="#0B141D" strokeWidth="0.7" />
      <circle cx={x} cy={midY}                      r="2.2" fill="#79B8E6" stroke="#0B141D" strokeWidth="0.7" />
    </g>
  );
};

// ─────────────────────────────────────────────────────────
// MAIN LOCOMOTIVE RENDERER
// Indian Railways WAP-7 inspired electric locomotive
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
  isSelected?: boolean;
}

const LocoBody: React.FC<LocoBodyProps> = ({
  x, railY, compact, wheelAngle, suspensionOffset, pitchAngle, accelState, speed, isSelected = false,
}) => {
  const locoW  = compact ? 110 : 160;
  const locoH  = compact ? 26  : 38;
  const roofSH = compact ? 5   : 7;
  const skirtH = compact ? 6   : 9;
  const wheelR = compact ? 6   : 9;
  const bogieH = wheelR * 2 + 12;

  const bogieBaseY = railY;
  const skirtBaseY = bogieBaseY - bogieH;
  const bodyBaseY  = skirtBaseY - skirtH;
  const roofBaseY  = bodyBaseY - locoH;
  const roofTopY   = roofBaseY - roofSH;
  const leftX      = x - locoW / 2;

  const pitch = Math.max(-1.5, Math.min(1.5, pitchAngle));

  // ── Indian Railways Livery Colors ──
  const maroonDark    = '#6B1A1A';
  const maroonMain    = '#8B2020';
  const maroonLight   = '#A02828';
  const creamBand     = '#E8D4A0';
  const creamDark     = '#C8B870';
  const charcoalRoof  = '#1E2833';
  const charcoalSkirt = '#141D26';
  const charcoalMid   = '#2A3744';
  const windowGlass   = '#0B141D';
  const windowFrame   = '#4A3A3A';
  const metalDark     = '#141D26';
  const metalMid      = '#71879A';
  const stroke        = '#0B141D';

  const zA_h = locoH * 0.28;
  const zB_h = locoH * 0.44;
  const zC_h = locoH * 0.28;
  const zA_y = bodyBaseY;
  const zB_y = bodyBaseY + zA_h;
  const zC_y = bodyBaseY + zA_h + zB_h;

  const cabW   = compact ? 32  : 46;
  const bodyW  = locoW - cabW;

  const bogie1X = leftX + locoW * 0.2;
  const bogie2X = leftX + locoW * 0.8;

  const pantoX    = leftX + cabW + bodyW * 0.45;
  const pantoBaseY = roofTopY;
  const oheWireY  = roofTopY - (compact ? 26 : 42);

  const isMoving = accelState !== 'STOPPED';

  return (
    <g transform={`rotate(${pitch}, ${x}, ${bogieBaseY - bogieH / 2})`}>

      {/* ── BOGIES ── */}
      <BogieFrame x={bogie1X} y={bogieBaseY} wheelR={wheelR} wheelAngle={wheelAngle} wheelCount={4} compact={compact} />
      <BogieFrame x={bogie2X} y={bogieBaseY} wheelR={wheelR} wheelAngle={wheelAngle} wheelCount={4} compact={compact} />

      {/* ── UNDERFRAME ── */}
      <rect x={leftX} y={skirtBaseY} width={locoW} height={skirtH} fill={charcoalSkirt} stroke={stroke} strokeWidth="0.9" />
      <rect x={bogie1X - 6} y={skirtBaseY - 3} width={12} height={4} fill={charcoalMid} stroke={stroke} strokeWidth="0.7" />
      <rect x={bogie2X - 6} y={skirtBaseY - 3} width={12} height={4} fill={charcoalMid} stroke={stroke} strokeWidth="0.7" />
      <rect x={leftX + locoW * 0.35} y={skirtBaseY + 2} width={locoW * 0.3} height={skirtH - 3} fill={charcoalMid} stroke={stroke} strokeWidth="0.5" rx="0.5" />
      <rect x={leftX - (compact ? 7 : 10)} y={skirtBaseY + 2} width={compact ? 8 : 11} height={compact ? 4 : 5} fill={metalDark} stroke={stroke} strokeWidth="0.9" />
      <rect x={leftX - (compact ? 5 : 7)} y={skirtBaseY} width={compact ? 5 : 6} height={compact ? 2 : 3} fill={metalMid} stroke={stroke} strokeWidth="0.6" />

      {/* ── MAIN BODY (rear 70%) ── */}
      <rect x={leftX + cabW} y={zC_y} width={bodyW} height={zC_h} fill={maroonDark} stroke={stroke} strokeWidth="0.8" />
      <rect x={leftX + cabW} y={zB_y} width={bodyW} height={zB_h} fill={maroonMain} stroke={stroke} strokeWidth="0.8" />
      <rect x={leftX + cabW} y={zA_y} width={bodyW} height={zA_h} fill={maroonLight} stroke={stroke} strokeWidth="0.8" />

      {/* Livery Bands */}
      <rect x={leftX + cabW} y={zB_y - (compact ? 2.5 : 3.5)} width={bodyW} height={compact ? 2.5 : 3.5} fill={creamBand} stroke="none" />
      <rect x={leftX + cabW} y={zC_y - (compact ? 1.5 : 2)} width={bodyW} height={compact ? 1.5 : 2} fill={creamDark} stroke="none" />
      <rect x={leftX + cabW} y={zA_y} width={bodyW} height={locoH} fill="none" stroke={stroke} strokeWidth="1.2" />

      {/* Ventilation Grille */}
      {!compact && (
        <>
          <rect x={leftX + cabW + bodyW * 0.15} y={zB_y + 2} width={bodyW * 0.35} height={zB_h - 4}
            fill={charcoalMid} stroke={stroke} strokeWidth="0.8" rx="1" />
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i}
              x1={leftX + cabW + bodyW * 0.15 + 3 + i * (bodyW * 0.35 - 6) / 8}
              y1={zB_y + 4}
              x2={leftX + cabW + bodyW * 0.15 + 3 + i * (bodyW * 0.35 - 6) / 8}
              y2={zB_y + zB_h - 3}
              stroke="#71879A" strokeWidth="0.7" opacity="0.6"
            />
          ))}
          <rect x={leftX + cabW + bodyW * 0.55} y={zB_y + 3} width={bodyW * 0.18} height={zB_h - 5}
            fill={maroonMain} stroke={metalMid} strokeWidth="0.7" rx="0.5" />
          <circle cx={leftX + cabW + bodyW * 0.64} cy={zB_y + zB_h / 2} r="1.5" fill={metalMid} />
          <rect x={leftX + cabW + bodyW * 0.76} y={zA_y + 2} width={bodyW * 0.2} height={locoH - 4}
            fill={maroonDark} stroke={stroke} strokeWidth="0.7" rx="0.5" />
        </>
      )}
      {compact && (
        <>
          <rect x={leftX + cabW + 4} y={zB_y + 2} width={bodyW * 0.4} height={zB_h - 4}
            fill={charcoalMid} stroke={stroke} strokeWidth="0.7" rx="0.5" />
          {Array.from({ length: 4 }, (_, i) => (
            <line key={i}
              x1={leftX + cabW + 7 + i * (bodyW * 0.4 - 6) / 4}
              y1={zB_y + 4}
              x2={leftX + cabW + 7 + i * (bodyW * 0.4 - 6) / 4}
              y2={zB_y + zB_h - 3}
              stroke="#71879A" strokeWidth="0.8"
            />
          ))}
        </>
      )}

      {/* ── CAB SECTION (front 30%) ── */}
      <rect x={leftX} y={zC_y} width={cabW} height={zC_h} fill={maroonDark} stroke={stroke} strokeWidth="1.2" />
      <rect x={leftX} y={zB_y} width={cabW} height={zB_h} fill={maroonMain} stroke={stroke} strokeWidth="1.2" />
      <rect x={leftX} y={zA_y} width={cabW} height={zA_h} fill={maroonLight} stroke={stroke} strokeWidth="1.2" />
      <rect x={leftX} y={zB_y - (compact ? 2.5 : 3.5)} width={cabW} height={compact ? 2.5 : 3.5} fill={creamBand} />
      <rect x={leftX} y={zC_y - (compact ? 1.5 : 2)}   width={cabW} height={compact ? 1.5 : 2} fill={creamDark} />

      {/* Cab front angled face */}
      <polygon
        points={`
          ${leftX},${bodyBaseY + 3}
          ${leftX - (compact ? 3 : 5)},${bodyBaseY + locoH * 0.35}
          ${leftX - (compact ? 3 : 5)},${bodyBaseY + locoH - 2}
          ${leftX},${bodyBaseY + locoH}
        `}
        fill={maroonDark} stroke={stroke} strokeWidth="1.3"
      />
      <rect x={leftX} y={bodyBaseY} width={compact ? 3 : 4} height={locoH} fill={maroonDark} stroke={stroke} strokeWidth="0.8" />

      {/* Top Visor */}
      <polygon
        points={`
          ${leftX + (compact ? 3 : 5)},${zA_y}
          ${leftX - (compact ? 3 : 4)},${zA_y + (compact ? 5 : 7)}
          ${leftX - (compact ? 3 : 4)},${zA_y + (compact ? 3 : 4)}
          ${leftX + (compact ? 3 : 5)},${zA_y - (compact ? 1 : 2)}
        `}
        fill={charcoalRoof} stroke={stroke} strokeWidth="0.8"
      />

      {/* Dual Windshields */}
      <rect
        x={leftX + (compact ? 4 : 5)} y={bodyBaseY + (compact ? 2 : 3)}
        width={compact ? 12 : 18} height={compact ? locoH * 0.45 : locoH * 0.5}
        fill={windowGlass} stroke={windowFrame} strokeWidth="1.2" rx="0.5"
      />
      <line
        x1={leftX + (compact ? 5 : 6)} y1={bodyBaseY + (compact ? 3 : 4)}
        x2={leftX + (compact ? 14 : 21)} y2={bodyBaseY + (compact ? locoH * 0.38 : locoH * 0.45)}
        stroke={metalMid} strokeWidth="0.7" opacity="0.5"
      />

      {/* Headlamp Cluster */}
      <rect
        x={leftX + (compact ? 2 : 3)} y={bodyBaseY + locoH * 0.58}
        width={compact ? 16 : 22} height={compact ? locoH * 0.32 : locoH * 0.3}
        fill={charcoalMid} stroke={stroke} strokeWidth="0.8" rx="0.5"
      />
      <circle
        cx={leftX + (compact ? 10 : 14)} cy={bodyBaseY + locoH * 0.73}
        r={compact ? 5 : 7}
        fill="#E8D870" stroke={stroke} strokeWidth="0.9"
        opacity={isMoving ? 0.9 : 0.6}
      />
      <circle
        cx={leftX + (compact ? 10 : 14)} cy={bodyBaseY + locoH * 0.73}
        r={compact ? 3 : 4.5}
        fill="#F5EFA0"
        opacity={isMoving ? 0.95 : 0.5}
      />
      <circle cx={leftX + (compact ? 4 : 5)} cy={bodyBaseY + locoH * 0.63} r={compact ? 1.8 : 2.5} fill="#E8D870" stroke={stroke} strokeWidth="0.6" opacity="0.85" />
      <circle cx={leftX + (compact ? 4 : 5)} cy={bodyBaseY + locoH * 0.85} r={compact ? 1.8 : 2.5} fill="#D45555" stroke={stroke} strokeWidth="0.6" opacity="0.8" />

      {/* Number Board */}
      <rect
        x={leftX + (compact ? 16 : 22)} y={bodyBaseY + locoH * 0.6}
        width={compact ? 14 : 20} height={compact ? 8 : 11}
        fill="#E8D4A0" stroke={maroonDark} strokeWidth="0.9" rx="0.5"
      />

      {/* Roof Sill */}
      <rect
        x={leftX} y={roofBaseY}
        width={locoW} height={roofSH}
        fill={charcoalRoof} stroke={stroke} strokeWidth="1.1"
      />
      <line x1={leftX + cabW + 4} y1={roofBaseY + 2} x2={leftX + locoW - 4} y2={roofBaseY + 2}
        stroke={metalMid} strokeWidth="0.8" opacity="0.7" />

      {/* Roof ABCB & Insulators */}
      <rect
        x={leftX + cabW + (compact ? 4 : 8)} y={roofTopY - (compact ? 4 : 6)}
        width={compact ? 10 : 14} height={compact ? 5 : 7}
        fill={charcoalMid} stroke={stroke} strokeWidth="0.7" rx="0.5"
      />
      {[0.25, 0.45, 0.65, 0.82].map((rx, i) => (
        <g key={i}>
          <rect
            x={leftX + cabW + bodyW * rx - 2} y={roofTopY - (compact ? 6 : 8)}
            width={4} height={compact ? 6 : 8}
            fill="#79B8E6" stroke={stroke} strokeWidth="0.6" rx="0.5"
          />
        </g>
      ))}

      {/* Pantograph */}
      <Pantograph
        x={pantoX}
        baseY={roofTopY}
        height={compact ? 24 : 40}
        wireY={oheWireY}
        extended={true}
      />

      {/* Selection Highlight */}
      {isSelected && (
        <rect
          x={leftX - 3} y={roofTopY - 4}
          width={locoW + 6} height={bogieBaseY - roofTopY + bogieH + 8}
          fill="none"
          stroke="#3B82C4"
          strokeWidth="1.5"
          strokeDasharray="6 3"
          rx="2"
        />
      )}
    </g>
  );
};

// ─────────────────────────────────────────────────────────
// COACH RENDERER
// ─────────────────────────────────────────────────────────
interface CoachProps {
  x: number;
  railY: number;
  compact: boolean;
  wheelAngle: number;
  suspensionOffset: number;
  index: number;
}

const Coach: React.FC<CoachProps> = ({ x, railY, compact, wheelAngle, suspensionOffset, index }) => {
  const coachW  = compact ? 82  : 118;
  const coachH  = compact ? 20  : 29;
  const roofH   = compact ? 3   : 5;
  const skirtH  = compact ? 5   : 7;
  const wheelR  = compact ? 5   : 7.5;
  const bogieH  = wheelR * 2 + 10;

  const bogieBaseY = railY;
  const skirtBaseY = bogieBaseY - bogieH;
  const bodyBaseY  = skirtBaseY - skirtH;
  const roofY      = bodyBaseY - coachH - roofH;
  const leftX      = x - coachW / 2;

  const sus = suspensionOffset * (index % 2 === 0 ? 0.8 : -0.5);

  const stroke      = '#0B141D';
  const creamUpper  = '#E8D9A8';
  const maroonLower = '#7A1F1F';
  const maroonMid   = '#8B2020';
  const windowGlass = '#0B141D';
  const roofColor   = '#1E2833';
  const skirtColor  = '#141D26';
  const metalMid    = '#71879A';

  const upperH = coachH * 0.42;
  const lowerH = coachH - upperH;
  const upperY = bodyBaseY;
  const lowerY = bodyBaseY + upperH;

  const bogie1X = leftX + coachW * 0.19;
  const bogie2X = leftX + coachW * 0.81;

  return (
    <g transform={`translate(0, ${sus})`}>
      <BogieFrame x={bogie1X} y={bogieBaseY} wheelR={wheelR} wheelAngle={wheelAngle} wheelCount={4} compact={compact} />
      <BogieFrame x={bogie2X} y={bogieBaseY} wheelR={wheelR} wheelAngle={wheelAngle} wheelCount={4} compact={compact} />

      <rect x={leftX} y={skirtBaseY} width={coachW} height={skirtH} fill={skirtColor} stroke={stroke} strokeWidth="0.8" />
      <rect x={leftX - (compact ? 4 : 6)} y={skirtBaseY + 2} width={compact ? 5 : 7} height={compact ? 3 : 5} fill={metalMid} stroke={stroke} strokeWidth="0.8" />
      <rect x={leftX + coachW} y={skirtBaseY + 2} width={compact ? 4 : 6} height={compact ? 3 : 5} fill={metalMid} stroke={stroke} strokeWidth="0.8" />

      {/* 2-Zone Coach Livery */}
      <rect x={leftX} y={lowerY} width={coachW} height={lowerH} fill={maroonLower} stroke={stroke} strokeWidth="1.1" />
      <rect x={leftX} y={upperY} width={coachW} height={upperH} fill={creamUpper} stroke={stroke} strokeWidth="1.1" />
      <rect x={leftX} y={bodyBaseY} width={coachW} height={coachH} fill="none" stroke={stroke} strokeWidth="1.1" />
      <rect x={leftX} y={lowerY - (compact ? 1 : 1.5)} width={coachW} height={compact ? 1 : 1.5} fill="#C8A840" />

      {/* Windows */}
      {Array.from({ length: compact ? 5 : 8 }, (_, i) => {
        const wCount = compact ? 5 : 8;
        const wSpacing = (coachW - 8) / wCount;
        const wx = leftX + 4 + i * wSpacing + wSpacing * 0.08;
        const ww = wSpacing * 0.72;
        const wh = compact ? upperH * 0.62 : upperH * 0.65;
        const wy = upperY + upperH * 0.2;
        return (
          <rect key={i}
            x={wx} y={wy} width={ww} height={wh}
            fill={windowGlass} stroke={stroke} strokeWidth="0.7" rx="0.5"
          />
        );
      })}

      {/* Doors */}
      <rect x={leftX + (compact ? 5 : 8)} y={lowerY + (compact ? 2 : 3)}
        width={compact ? 7 : 10} height={lowerH - (compact ? 3 : 5)}
        fill={maroonMid} stroke={stroke} strokeWidth="0.8" rx="0.5" />
      <rect x={leftX + coachW - (compact ? 12 : 18)} y={lowerY + (compact ? 2 : 3)}
        width={compact ? 7 : 10} height={lowerH - (compact ? 3 : 5)}
        fill={maroonMid} stroke={stroke} strokeWidth="0.8" rx="0.5" />

      <rect x={leftX} y={roofY} width={coachW} height={roofH} fill={roofColor} stroke={stroke} strokeWidth="0.9" />
    </g>
  );
};

// ─────────────────────────────────────────────────────────
// COMPLETE TRAIN ASSEMBLY
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
}

const IRTrain: React.FC<IRTrainProps> = ({
  centerX, railY, compact, wheelAngle, suspensionOffset, pitchAngle,
  accelState, speed, isSelected = false, direction = 1, isSecondary = false,
}) => {
  const locoW   = compact ? 110 : 160;
  const coachW  = compact ? 82  : 118;
  const coupling = compact ? 4  : 6;

  const locoX   = centerX - (compact ? 45 : 75);
  const coach1X  = locoX + locoW / 2 + coupling + coachW / 2;
  const coach2X  = coach1X + coachW + coupling;
  const coach3X  = coach2X + coachW + coupling;

  const sus = suspensionOffset;

  return (
    <g
      transform={direction === -1 ? `scale(-1,1) translate(${-(centerX * 2)}, 0)` : ''}
      opacity={isSecondary ? 0.75 : 1.0}
    >
      <g transform={`translate(0, ${sus})`}>
        {!compact && (
          <>
            <Coach x={coach3X} railY={railY} compact={compact} wheelAngle={wheelAngle} suspensionOffset={suspensionOffset} index={3} />
            <Coach x={coach2X} railY={railY} compact={compact} wheelAngle={wheelAngle} suspensionOffset={suspensionOffset} index={2} />
          </>
        )}
        <Coach x={coach1X} railY={railY} compact={compact} wheelAngle={wheelAngle} suspensionOffset={suspensionOffset} index={1} />
      </g>
      <LocoBody
        x={locoX} railY={railY} compact={compact}
        wheelAngle={wheelAngle} suspensionOffset={sus}
        pitchAngle={pitchAngle} accelState={accelState} speed={speed}
        isSelected={isSelected}
      />
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

  // Demo Narrative Engine
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

        Object.keys(prev).forEach(id => {
          const tp = { ...prev[id] };
          const isUp = tp.assignedTrack === 'UP';
          const direction = isUp ? 1 : -1;

          const upcomingSignals = signals.filter(s => {
            if (s.track !== (isUp ? 'UP' : 'DN')) return false;
            return isUp ? s.km > tp.currentKm : s.km < tp.currentKm;
          }).sort((a, b) => isUp ? (a.km - b.km) : (b.km - a.km));

          const nextSig = upcomingSignals[0];
          let targetSpeed = tp.entity.priority <= 2 ? 130 : 90;
          let sigAspect: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
          let distToSignal = 999;

          if (nextSig) {
            sigAspect = nextSig.aspect;
            distToSignal = Math.abs(nextSig.km - tp.currentKm);

            if (sigAspect === 'RED') {
              const stopPoint = isUp ? nextSig.km - 0.15 : nextSig.km + 0.15;
              const distToStop = Math.abs(stopPoint - tp.currentKm);
              if (distToStop < 2.0) { targetSpeed = 0; }
              else if (distToStop < 4.0) { targetSpeed = Math.min(targetSpeed, 25); }
            } else if (sigAspect === 'YELLOW') {
              if (distToSignal < 2.5) { targetSpeed = 45; }
            }
          }

          tp.nextSignalAspect = sigAspect;
          tp.nextSignalDistanceKm = distToSignal;
          tp.targetSpeedKmH = targetSpeed;

          const prevSpeed = tp.speedKmH;
          const maxAccel = 14;
          const maxBrake = 28;

          if (tp.speedKmH < targetSpeed) {
            tp.speedKmH = Math.min(targetSpeed, tp.speedKmH + maxAccel * dt);
            tp.accelState = 'ACCELERATING';
          } else if (tp.speedKmH > targetSpeed) {
            tp.speedKmH = Math.max(targetSpeed, tp.speedKmH - maxBrake * dt);
            tp.accelState = tp.speedKmH === 0 ? 'STOPPED' : 'BRAKING';
          } else {
            tp.accelState = tp.speedKmH === 0 ? 'STOPPED' : 'CRUISING';
          }

          const accelG = (tp.speedKmH - prevSpeed) / dt / 30;
          const targetPitch = Math.max(-1.5, Math.min(1.5, -accelG * 0.8));
          tp.pitchAngle = tp.pitchAngle + (targetPitch - tp.pitchAngle) * Math.min(1, dt * 2.5);

          const dKm = (tp.speedKmH / 3600) * dt * direction;
          tp.currentKm = tp.currentKm + dKm;

          if (isUp && tp.currentKm > KM_MAX) tp.currentKm = KM_MIN;
          else if (!isUp && tp.currentKm < KM_MIN) tp.currentKm = KM_MAX;

          const wheelCircumferenceM = 3.43;
          const wheelRotationsPerSec = (tp.speedKmH / 3.6) / wheelCircumferenceM;
          const dAngle = wheelRotationsPerSec * 360 * dt * direction;
          tp.wheelAngle = (tp.wheelAngle + dAngle) % 360;

          if (tp.speedKmH > 0) {
            const sway = Math.sin(time * 0.012 + (isUp ? 0 : Math.PI)) * 0.6 * (tp.speedKmH / 130);
            tp.suspensionOffset = sway;
          } else {
            tp.suspensionOffset = tp.suspensionOffset * 0.93;
          }

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
      style={{ backgroundColor: '#071A2B', border: '1px solid #29455D', borderRadius: '4px' }}
    >
      {/* ── TOOLBAR ── */}
      <div
        className="p-2 px-3 flex flex-wrap items-center justify-between gap-2"
        style={{ borderBottom: '1px solid #1E384F', backgroundColor: '#0D263D' }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {!isDemoActive ? (
            <button
              onClick={() => startDemoStory(0)}
              style={{
                padding: '4px 10px',
                backgroundColor: '#123551',
                color: '#F7FAFC',
                border: '1px solid #3B82C4',
                borderRadius: '3px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '11.5px', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '5px',
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              <Play style={{ width: 11, height: 11, color: '#79B8E6', fill: 'currentColor' }} />
              Simulate Operation
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', backgroundColor: '#071A2B', border: '1px solid #29455D', borderRadius: '3px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Inter', sans-serif", fontSize: '10.5px', fontWeight: 600, color: '#D45555' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#D45555', display: 'inline-block' }} className="animate-pulse" />
                Live · Step {demoStepIdx + 1}/10
              </span>
              {isDemoPaused ? (
                <button onClick={resumeDemoStory} style={{ padding: '2px 6px', backgroundColor: '#123551', color: '#F7FAFC', border: 'none', borderRadius: '2px', fontFamily: "'Inter', sans-serif", fontSize: '10.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Play style={{ width: 10, height: 10, fill: 'currentColor' }} /> Resume
                </button>
              ) : (
                <button onClick={pauseDemoStory} style={{ padding: '2px 6px', backgroundColor: 'transparent', color: '#A9BBCB', border: '1px solid #29455D', borderRadius: '2px', fontFamily: "'Inter', sans-serif", fontSize: '10.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Pause style={{ width: 10, height: 10 }} /> Pause
                </button>
              )}
              <button onClick={restartDemoStory} style={{ padding: '2px 6px', backgroundColor: 'transparent', color: '#A9BBCB', border: '1px solid #29455D', borderRadius: '2px', fontFamily: "'Inter', sans-serif", fontSize: '10.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                <RotateCcw style={{ width: 10, height: 10 }} /> Restart
              </button>
              <button onClick={exitDemoStory} style={{ padding: '2px 4px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#71879A' }}>
                <X style={{ width: 12, height: 12 }} />
              </button>
            </div>
          )}

          {/* Camera Presets */}
          <div className="hidden sm:flex items-center gap-1">
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9.5px', fontWeight: 600, color: '#71879A', textTransform: 'uppercase', letterSpacing: '0.07em', marginRight: 2 }}>View</span>
            {(['WIDE', 'TRAIN', 'CIVIL', 'SIGNAL', 'TRACTION', 'ROUTE'] as CameraPreset[]).map(cam => (
              <button
                key={cam}
                onClick={() => setCameraPreset(cam)}
                style={{
                  padding: '2.5px 7px',
                  borderRadius: '3px',
                  border: '1px solid',
                  borderColor: cameraMode === cam ? '#3B82C4' : '#29455D',
                  backgroundColor: cameraMode === cam ? '#123551' : 'transparent',
                  color: cameraMode === cam ? '#79B8E6' : '#A9BBCB',
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
            <span style={{ color: '#71879A' }}>Prot. Signal</span>
            {(() => {
              const asp = signals.find(s => s.id === 'SIG-UP-126')?.aspect || 'GREEN';
              const c = asp === 'RED' ? { bg: 'rgba(212,85,85,0.15)', text: '#D45555', border: 'rgba(212,85,85,0.4)' } :
                        asp === 'YELLOW' ? { bg: 'rgba(215,166,58,0.15)', text: '#D7A63A', border: 'rgba(215,166,58,0.4)' } :
                        { bg: 'rgba(70,160,106,0.15)', text: '#46A06A', border: 'rgba(70,160,106,0.4)' };
              return (
                <span style={{ padding: '1px 6px', backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: '2px', fontWeight: 600, fontSize: '10.5px' }}>
                  {asp} (S-126)
                </span>
              );
            })()}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#71879A' }}>Loco 20901</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#F7FAFC', fontSize: '12.5px' }}>
              {trainPhysics['TRN-20901'] ? Math.round(trainPhysics['TRN-20901'].speedKmH) : 130} km/h
            </span>
          </div>
        </div>
      </div>

      {/* ── TECHNICAL DRAFTING CANVAS (Clean Off-White Surface with High Contrast) ── */}
      <div className="relative">
        <svg
          viewBox={`${currentViewBox.x} ${currentViewBox.y} ${currentViewBox.w} ${currentViewBox.h}`}
          width="100%"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          style={{ backgroundColor: '#EBF1F6' }}
        >
          <defs>
            <pattern id="pen-hatch-track" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#1B3246" strokeWidth="1.2" strokeOpacity="0.3" />
            </pattern>
          </defs>

          {/* ── LAYER 1: BACKGROUND (parallax) ── */}
          <g transform={`translate(${bgParallaxX}, 0)`}>
            <rect x="-300" y="0" width={W + 600} height={SKY_H} fill="#F0F5FA" />
            {/* Clouds */}
            <g transform={`translate(${cloudDriftX - 200}, 0)`} opacity="0.45">
              <path d="M 50 28 Q 70 16 95 24 Q 120 18 140 28 Q 155 38 135 48 L 45 48 Z"  fill="#E0EAF2" stroke="#CAD8E6" strokeWidth="0.8" />
              <path d="M 420 22 Q 445 12 470 20 Q 500 14 525 24 Q 540 36 515 44 L 410 44 Z" fill="#E0EAF2" stroke="#CAD8E6" strokeWidth="0.8" />
              <path d="M 820 26 Q 840 14 865 22 Q 890 16 910 26 Q 925 36 905 46 L 815 46 Z" fill="#E0EAF2" stroke="#CAD8E6" strokeWidth="0.8" />
            </g>
            {/* Horizon lines */}
            <line x1="-300" y1="25" x2={W+300} y2="25" stroke="#DCE6F0" strokeWidth="0.6" strokeDasharray="6 4" />
            <line x1="-300" y1="55" x2={W+300} y2="55" stroke="#DCE6F0" strokeWidth="0.6" strokeDasharray="6 4" />
            {/* Terrain silhouette */}
            <path
              d={`M -300 ${TERRAIN_Y} Q 180 ${TERRAIN_Y - 28} 380 ${TERRAIN_Y - 6} Q 600 ${TERRAIN_Y - 38} 820 ${TERRAIN_Y - 14} Q 1020 ${TERRAIN_Y - 32} ${W+300} ${TERRAIN_Y} L ${W+300} ${H} L -300 ${H} Z`}
              fill="#E2ECF5" stroke="#C8D8E6" strokeWidth="0.8"
            />
            {/* Treeline */}
            {[80, 200, 400, 620, 810, 980, 1100].map((tx, i) => (
              <g key={i} opacity="0.4">
                <rect x={tx - 4} y={TERRAIN_Y - 20} width={8} height={20} fill="#8A9CAE" />
                <ellipse cx={tx} cy={TERRAIN_Y - 22} rx={14} ry={16} fill="#5C7286" />
              </g>
            ))}
          </g>

          {/* ── LAYER 2: MIDGROUND — Stations, OHE, Signals ── */}
          {STATIONS.map(st => {
            const x = kmToX(st.km, W);
            return (
              <g key={st.code}>
                <rect x={x - 36} y={UP_Y - TRACK_H / 2 - 10} width={72} height={10} fill="#DCE6F0" stroke="#1B3246" strokeWidth="0.9" />
                <rect x={x - 26} y={UP_Y - TRACK_H / 2 - 42} width={52} height={12} fill="#F7FAFC" stroke="#1B3246" strokeWidth="1.1" rx="1" />
                <line x1={x} y1={UP_Y - TRACK_H / 2 - 30} x2={x} y2={UP_Y - TRACK_H / 2 - 10} stroke="#1B3246" strokeWidth="0.9" />
                <text x={x} y={UP_Y - TRACK_H / 2 - 33} textAnchor="middle" fontSize="7.5" fontFamily="'Inter', sans-serif" fontWeight="600" fill="#1B3246">{st.name}</text>
                <text x={x} y={UP_Y - TRACK_H / 2 - 45} textAnchor="middle" fontSize="6" fontFamily="'JetBrains Mono', monospace" fill="#5C7286">KM {st.km}</text>
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
                  {/* Mast */}
                  <line x1={mx} y1={mastTopY} x2={mx} y2={mastBaseY} stroke="#1B3246" strokeWidth="1.8" />
                  {/* Cantilever arm */}
                  <line x1={mx} y1={cantileverY} x2={mx + wireOffsetX} y2={cantileverY + 14} stroke="#1B3246" strokeWidth="1.2" />
                  {/* Registration arm */}
                  <line x1={mx} y1={cantileverY + 4} x2={mx + wireOffsetX} y2={cantileverY + 14} stroke="#5C7286" strokeWidth="0.7" strokeDasharray="3 2" />
                  {/* Insulator */}
                  <circle cx={mx + wireOffsetX} cy={cantileverY + 14} r="2.8" fill="#F7FAFC" stroke="#1B3246" strokeWidth="0.9" />
                </g>
              );
            })}
            {/* Contact wire */}
            <path
              d={`M 0 ${UP_Y - TRACK_H / 2 - OHE_MAST_H + 28} Q 300 ${UP_Y - TRACK_H / 2 - OHE_MAST_H + 36} 600 ${UP_Y - TRACK_H / 2 - OHE_MAST_H + 28} Q 900 ${UP_Y - TRACK_H / 2 - OHE_MAST_H + 36} ${W} ${UP_Y - TRACK_H / 2 - OHE_MAST_H + 28}`}
              fill="none" stroke="#1B3246" strokeWidth="1.1" opacity="0.9"
            />
            {/* Messenger wire */}
            <line x1="0" y1={UP_Y - TRACK_H / 2 - OHE_MAST_H + 16} x2={W} y2={UP_Y - TRACK_H / 2 - OHE_MAST_H + 16}
              stroke="#5C7286" strokeWidth="0.8" opacity="0.6" />
            {/* Droppers */}
            {[60, 160, 260, 360, 460, 560, 660, 760, 860, 960, 1060, 1160].map((mx, idx) => (
              <line key={`drop-${idx}`}
                x1={mx + 22} y1={UP_Y - TRACK_H / 2 - OHE_MAST_H + 16}
                x2={mx + 22} y2={UP_Y - TRACK_H / 2 - OHE_MAST_H + 28}
                stroke="#5C7286" strokeWidth="0.8" opacity="0.6"
              />
            ))}
          </g>

          {/* 3-Light Color Aspect Signals */}
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
                  <line x1={sx} y1={mastTopY + 30} x2={sx} y2={mastBaseY} stroke="#1B3246" strokeWidth="2" />
                  <rect x={sx - 6} y={mastTopY} width={12} height={30} rx="2" fill="#0D263D" stroke="#071A2B" strokeWidth="1" />
                  {[5, 14, 23].map((ly, i) => (
                    <line key={i} x1={sx - 7} y1={mastTopY + ly - 1} x2={sx + 7} y2={mastTopY + ly - 1} stroke="#1B3246" strokeWidth="1.2" />
                  ))}
                  {/* Green lamp */}
                  <circle cx={sx} cy={mastTopY + 6}  r="3.5" fill={isGreen  ? '#46A06A' : '#14222E'} />
                  {isGreen  && <circle cx={sx} cy={mastTopY + 6}  r="6.5" fill="#46A06A" fillOpacity="0.35" />}
                  {/* Yellow lamp */}
                  <circle cx={sx} cy={mastTopY + 15} r="3.5" fill={isYellow ? '#D7A63A' : '#14222E'} />
                  {isYellow && <circle cx={sx} cy={mastTopY + 15} r="6.5" fill="#D7A63A" fillOpacity="0.35" />}
                  {/* Red lamp */}
                  <circle cx={sx} cy={mastTopY + 24} r="3.5" fill={isRed    ? '#D45555' : '#14222E'} />
                  {isRed    && <circle cx={sx} cy={mastTopY + 24} r="7.5" fill="#D45555" fillOpacity="0.38" />}
                  {/* ID plate */}
                  <rect x={sx - 10} y={mastTopY + 32} width={20} height={8} fill="#F7FAFC" stroke="#1B3246" strokeWidth="0.7" />
                  <text x={sx} y={mastTopY + 38} textAnchor="middle" fontSize="5.5" fontFamily="'JetBrains Mono', monospace" fontWeight="700" fill="#1B3246">S-{sig.km}</text>
                </g>
              );
            })}
          </g>

          {/* ── LAYER 3: TRACK FOREGROUND ── */}
          {[UP_Y, DN_Y].map((lineY, lIdx) => (
            <rect key={`ballast-${lIdx}`}
              x={0} y={lineY - TRACK_H / 2 - 4}
              width={W} height={TRACK_H + 8}
              fill="#D4E0EB" opacity="0.6"
            />
          ))}

          {/* Sleepers */}
          {[UP_Y, DN_Y].map((lineY, lIdx) => (
            <g key={`sleepers-line-${lIdx}`}>
              {Array.from({ length: 65 }, (_, i) => {
                const sx = i * 18.5 + 4;
                return (
                  <rect key={`sp-${lIdx}-${i}`}
                    x={sx} y={lineY - TRACK_H / 2 - 2}
                    width={11} height={TRACK_H + 4}
                    fill="#B8C8D8" stroke="#1B3246" strokeWidth="0.7" rx="0.5"
                  />
                );
              })}
            </g>
          ))}

          {/* Rails */}
          <line x1="0" y1={UP_Y - TRACK_H / 2 + 2} x2={W} y2={UP_Y - TRACK_H / 2 + 2} stroke="#1B3246" strokeWidth="2.8" />
          <line x1="0" y1={UP_Y + TRACK_H / 2 - 2} x2={W} y2={UP_Y + TRACK_H / 2 - 2} stroke="#1B3246" strokeWidth="2.8" />
          <line x1="0" y1={DN_Y - TRACK_H / 2 + 2} x2={W} y2={DN_Y - TRACK_H / 2 + 2} stroke="#1B3246" strokeWidth="2.8" />
          <line x1="0" y1={DN_Y + TRACK_H / 2 - 2} x2={W} y2={DN_Y + TRACK_H / 2 - 2} stroke="#1B3246" strokeWidth="2.8" />

          {/* Civil Work Zone */}
          {isCivilDrawn && (
            <g transform={`translate(${civilWorkX - 55}, ${UP_Y - TRACK_H / 2 - 28})`} className="animate-fade-in">
              <rect x={0} y={10} width={110} height={42} fill="url(#pen-hatch-track)" stroke="#D7A63A" strokeWidth="1.8" strokeDasharray="7 3" />
              {[0, 52, 104].map((bx, i) => (
                <g key={i}>
                  <line x1={bx + 3} y1={10} x2={bx + 3} y2={52} stroke="#D45555" strokeWidth="1.5" />
                  <line x1={bx + 3} y1={14} x2={bx + 8} y2={10} stroke="#F7FAFC" strokeWidth="1.5" />
                  <line x1={bx + 3} y1={20} x2={bx + 8} y2={16} stroke="#F7FAFC" strokeWidth="1.5" />
                  <line x1={bx + 3} y1={26} x2={bx + 8} y2={22} stroke="#F7FAFC" strokeWidth="1.5" />
                </g>
              ))}
              {demoStepIdx >= 5 && (
                <g transform="translate(40, -16)">
                  <ellipse cx={7} cy={3} rx={6} ry={3.5} fill="#D7A63A" stroke="#1B3246" strokeWidth="0.8" />
                  <circle cx={7} cy={7} r={4} fill="#F4F7FA" stroke="#1B3246" strokeWidth="0.8" />
                  <rect x={3} y={11} width={8} height={11} fill="#D7A63A" stroke="#1B3246" strokeWidth="0.9" rx="0.5" />
                  <line x1={3} y1={14} x2={11} y2={14} stroke="#1B3246" strokeWidth="0.8" />
                  <line x1={3} y1={12} x2={-2} y2={18} stroke="#1B3246" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1={11} y1={12} x2={14} y2={20} stroke="#1B3246" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1={14} y1={20} x2={14} y2={32} stroke="#2A3744" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1={5} y1={22} x2={4} y2={34} stroke="#1B3246" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1={9} y1={22} x2={10} y2={34} stroke="#1B3246" strokeWidth="1.5" strokeLinecap="round" />
                </g>
              )}
              {demoStepIdx === 6 && (
                <g>
                  <rect x={20} y={-10} width={70} height={12} fill="#0D263D" stroke="#29455D" strokeWidth="0.8" rx="2" />
                  <text x={55} y={-1} textAnchor="middle" fontSize="6.5" fontFamily="'Inter', sans-serif" fontWeight="600" fill="#79B8E6">
                    Tamping {demoWorkProgress}%
                  </text>
                </g>
              )}
            </g>
          )}

          {/* OHE Traction Work */}
          {isTractionDrawn && (
            <g transform={`translate(${tractionWorkX - 24}, ${UP_Y - TRACK_H / 2 - OHE_MAST_H - 16})`} className="animate-fade-in">
              <line x1={10} y1={22} x2={6} y2={76} stroke="#1B3246" strokeWidth="1.5" />
              <line x1={22} y1={22} x2={26} y2={76} stroke="#1B3246" strokeWidth="1.5" />
              <line x1={6} y1={44} x2={26} y2={44} stroke="#5C7286" strokeWidth="0.9" strokeDasharray="3 2" />
              <circle cx={16} cy={6} r={3.5} fill="#F7FAFC" stroke="#1B3246" strokeWidth="0.9" />
              <ellipse cx={16} cy={2} rx={5} ry={2.5} fill="#123551" stroke="#1B3246" strokeWidth="0.7" />
              <rect x={12} y={9} width={8} height={10} fill="#123551" stroke="#1B3246" strokeWidth="0.9" rx="0.5" />
              <rect x={30} y={4} width={24} height={10} fill="#0D263D" stroke="#3B82C4" strokeWidth="0.8" rx="2" />
              <text x={42} y={12} textAnchor="middle" fontSize="6" fontFamily="'JetBrains Mono', monospace" fontWeight="700" fill="#79B8E6">25kV AC</text>
            </g>
          )}

          {/* Signal Work */}
          {isSignalDrawn && (
            <g transform={`translate(${signalWorkX + 8}, ${UP_Y - TRACK_H / 2 - 38})`} className="animate-fade-in">
              <rect x={0} y={0} width={26} height={32} fill="#0D263D" stroke="#46A06A" strokeWidth="1.4" rx="2" />
              {[4, 9, 14, 19, 24].map((ly, i) => (
                <line key={i} x1={3} y1={ly} x2={23} y2={ly} stroke="#29455D" strokeWidth="0.7" />
              ))}
              <circle cx={20} cy={4}  r="1.8" fill="#46A06A" />
              <circle cx={20} cy={9}  r="1.8" fill="#46A06A" />
              <circle cx={20} cy={14} r="1.8" fill="#D7A63A" />
              <text x={13} y={38} textAnchor="middle" fontSize="5.5" fontFamily="'Inter', sans-serif" fontWeight="600" fill="#46A06A">TC CLEAR</text>
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
                {/* Indian Railways Train Model */}
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
                />

                {/* Train Label */}
                <g transform={`translate(${tx}, ${railTopY - (compact ? 68 : 108)})`}>
                  <rect
                    x="-32" y="-8" width="64" height="14"
                    fill="#0D263D"
                    stroke={accelState === 'BRAKING' ? '#D45555' : accelState === 'STOPPED' ? '#D7A63A' : '#29455D'}
                    strokeWidth="1"
                    rx="2"
                    opacity="0.95"
                  />
                  <text x="-28" y="2" fontSize="6" fontFamily="'Inter', sans-serif" fontWeight="600" fill="#F7FAFC">
                    {train.trainNumber}
                  </text>
                  <text
                    x="28" y="2"
                    textAnchor="end"
                    fontSize="6.5"
                    fontFamily="'Space Grotesk', sans-serif"
                    fontWeight="700"
                    fill={accelState === 'BRAKING' ? '#D45555' : accelState === 'STOPPED' ? '#D7A63A' : '#46A06A'}
                  >
                    {speed}
                  </text>
                  <text
                    x="28" y="2"
                    textAnchor="end"
                    fontSize="4.5"
                    fontFamily="'Inter', sans-serif"
                    dy="5"
                    fill="#71879A"
                  >
                    km/h
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
              backgroundColor: '#071A2B',
              border: '1px solid #29455D',
              borderRadius: '4px',
              boxShadow: '0 4px 16px rgba(4,13,22,0.6)',
              padding: '10px 12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1E384F', paddingBottom: '6px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#D45555', display: 'inline-block' }} className="animate-pulse" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#D45555' }}>
                  Step {demoStepIdx + 1}/10
                </span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9.5px', fontWeight: 500, color: '#A9BBCB' }}>
                  {currentDemoStep.phaseName}
                </span>
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: '#79B8E6', backgroundColor: '#123551', border: '1px solid #3B82C4', padding: '1px 5px', borderRadius: '2px' }}>
                {currentDemoStep.shortTitle}
              </span>
            </div>

            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 400, color: '#F7FAFC', lineHeight: 1.5, margin: 0 }}>
              {currentDemoStep.narrative}
            </p>

            {demoStepIdx === 6 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter', sans-serif", fontSize: '9.5px', color: '#A9BBCB', marginBottom: 3 }}>
                  <span>Tamping progress</span>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: '#79B8E6' }}>{demoWorkProgress}%</span>
                </div>
                <div style={{ width: '100%', height: 3, backgroundColor: '#0D263D', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', backgroundColor: '#3B82C4', borderRadius: '2px', width: `${demoWorkProgress}%`, transition: 'width 0.1s linear' }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── THIN OPERATIONAL TIMELINE ── */}
      <div
        className="flex items-center justify-between gap-2 overflow-x-auto"
        style={{ padding: '6px 10px', borderTop: '1px solid #1E384F', backgroundColor: '#0D263D' }}
      >
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9.5px', fontWeight: 600, color: '#71879A', textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock style={{ width: 11, height: 11, color: '#79B8E6' }} /> Timeline
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
                  borderColor: isCurrent ? '#3B82C4' : isPassed ? 'rgba(70,160,106,0.4)' : '#29455D',
                  backgroundColor: isCurrent ? '#123551' : isPassed ? 'rgba(70,160,106,0.12)' : 'transparent',
                  color: isCurrent ? '#79B8E6' : isPassed ? '#46A06A' : '#71879A',
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
