import React, { useState, useEffect, useRef } from 'react';
import { TrainEntity, MaintenanceBlock, FixedAsset, DepartmentType } from '../../types';
import {
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
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

const parseKmMarker = (marker: string): number => {
  const m = marker.replace('KM ', '').match(/(\d+)(?:\/(\d+))?/);
  if (!m) return 125;
  return parseFloat(m[1]) + (m[2] ? parseFloat(m[2]) / 10 : 0);
};

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
    id: 0,
    phaseName: 'NORMAL OPERATION',
    shortTitle: 'Normal Line Speed',
    narrative: 'Corridor operating under full line speed (130 km/h). Signals GREEN, automatic headway clearance normal.',
    cameraPreset: 'WIDE',
    signalAspect: 'GREEN',
    activeDept: null,
    durationMs: 3500,
  },
  {
    id: 1,
    phaseName: 'TASK DETECTED',
    shortTitle: 'Flaw Detected (KM 126)',
    narrative: 'TMS ultrasonic sensor detects lateral wear and TGI degradation on Turnout PT-227 at KM 126.',
    cameraPreset: 'CIVIL',
    signalAspect: 'GREEN',
    activeDept: 'CIVIL',
    durationMs: 3000,
  },
  {
    id: 2,
    phaseName: 'TRACK RESTRICTED',
    shortTitle: 'Section Restricted',
    narrative: 'AI Block Planner establishes a possession zone. Up line track possession locked.',
    cameraPreset: 'ROUTE',
    signalAspect: 'YELLOW',
    activeDept: 'CIVIL',
    durationMs: 2500,
  },
  {
    id: 3,
    phaseName: 'SIGNAL RED',
    shortTitle: 'Protection Signal Red',
    narrative: 'Protection Signal S-126 flips to RED aspect to safeguard maintenance crews.',
    cameraPreset: 'SIGNAL',
    signalAspect: 'RED',
    activeDept: 'CIVIL',
    durationMs: 2500,
  },
  {
    id: 4,
    phaseName: 'TRAIN BRAKING',
    shortTitle: 'Kavach Braking Applied',
    narrative: 'Approaching Vande Bharat 20901 detects downstream red aspect. Automatic service air brakes engage.',
    cameraPreset: 'TRAIN',
    signalAspect: 'RED',
    activeDept: 'CIVIL',
    durationMs: 3500,
  },
  {
    id: 5,
    phaseName: 'TRAIN STOPPED',
    shortTitle: 'Train Halted',
    narrative: 'Train comes to a complete halt 150m ahead of Signal S-126. Wheels stop rotating (0 RPM).',
    cameraPreset: 'TRAIN',
    signalAspect: 'RED',
    activeDept: 'CIVIL',
    durationMs: 2500,
  },
  {
    id: 6,
    phaseName: 'CIVIL WORK IN PROGRESS',
    shortTitle: 'Civil Track Tamping (0-100%)',
    narrative: 'Civil maintenance lines drawn. Safety barricades, track crew, and hydraulic tamping tools active.',
    cameraPreset: 'CIVIL',
    signalAspect: 'RED',
    activeDept: 'CIVIL',
    durationMs: 5000,
  },
  {
    id: 7,
    phaseName: 'TRACTION CLEARANCE',
    shortTitle: 'OHE Catenary Verified',
    narrative: 'TRD electrical linesman inspects 25kV catenary droppers and cantilever. Power re-energized.',
    cameraPreset: 'TRACTION',
    signalAspect: 'RED',
    activeDept: 'TRACTION',
    durationMs: 3500,
  },
  {
    id: 8,
    phaseName: 'SIGNAL VERIFICATION',
    shortTitle: 'Route Interlocked',
    narrative: 'S&T electronic interlocking verifies track circuit TC-126A and point machine lock. Signal clears to GREEN.',
    cameraPreset: 'SIGNAL',
    signalAspect: 'GREEN',
    activeDept: 'SIGNAL',
    durationMs: 3000,
  },
  {
    id: 9,
    phaseName: 'TRAIN ACCELERATES',
    shortTitle: 'Operations Resumed',
    narrative: 'Brakes release. Vande Bharat 20901 accelerates smoothly back to 130 km/h. Normal headway restored.',
    cameraPreset: 'WIDE',
    signalAspect: 'GREEN',
    activeDept: null,
    durationMs: 4000,
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
  const H = compact ? 260 : 440;

  const SKY_H       = compact ? 70  : 110;
  const TERRAIN_Y   = SKY_H;
  const UP_Y        = compact ? 150 : 250;
  const DN_Y        = compact ? 195 : 330;
  const LOOP_Y      = compact ? 230 : 395;
  const TRACK_H     = compact ? 10  : 14;
  const OHE_MAST_H  = compact ? 42  : 62;

  // ─────────────────────────────────────────────────────────
  // 2.5D Cinematic Camera Engine
  // ─────────────────────────────────────────────────────────
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
      case 'WIDE':
        targetViewBoxRef.current = defaultViewBox;
        break;
      case 'CIVIL':
        targetViewBoxRef.current = { x: 440, y: 155, w: 440, h: 220 };
        break;
      case 'SIGNAL':
        targetViewBoxRef.current = { x: 200, y: 95, w: 400, h: 200 };
        break;
      case 'TRACTION':
        targetViewBoxRef.current = { x: 680, y: 48, w: 450, h: 220 };
        break;
      case 'ROUTE':
        targetViewBoxRef.current = { x: 300, y: 105, w: 640, h: 300 };
        break;
      case 'TRAIN':
        break;
    }
  };

  // ─────────────────────────────────────────────────────────
  // HACKATHON DEMO NARRATIVE STORY ENGINE (30s Story)
  // ─────────────────────────────────────────────────────────
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

    // Handle Civil Work Sub-Progress (Step 6)
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
          // Completed full narrative
          setTimeout(() => {
            setIsDemoActive(false);
            setCameraPreset('WIDE');
          }, 3000);
        }
      }, step.durationMs);
    };

    runNext();
  };

  const pauseDemoStory = () => {
    setIsDemoPaused(true);
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    if (demoWorkTimerRef.current) clearInterval(demoWorkTimerRef.current);
  };

  const resumeDemoStory = () => {
    setIsDemoPaused(false);
    startDemoStory(demoStepIdx);
  };

  const restartDemoStory = () => {
    startDemoStory(0);
  };

  const exitDemoStory = () => {
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    if (demoWorkTimerRef.current) clearInterval(demoWorkTimerRef.current);
    setIsDemoActive(false);
    setIsDemoPaused(false);
    setDemoStepIdx(0);
    setDemoWorkProgress(0);
    setCameraPreset('WIDE');
    setSignals(INITIAL_SIGNALS);
  };

  useEffect(() => {
    if (externalDemoTrigger) {
      startDemoStory(0);
    }
  }, [externalDemoTrigger]);

  // ─────────────────────────────────────────────────────────
  // Dynamic Signal & Physics Simulation State
  // ─────────────────────────────────────────────────────────
  const [signals, setSignals] = useState<SignalInfo[]>(INITIAL_SIGNALS);
  const [trainPhysics, setTrainPhysics] = useState<Record<string, LiveTrainPhysics>>({});
  const lastTimeRef = useRef<number>(performance.now());
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const initial: Record<string, LiveTrainPhysics> = {};
    trains.forEach(t => {
      initial[t.id] = {
        id: t.id,
        trainNumber: t.trainNumber,
        trainName: t.trainName,
        currentKm: t.currentKm,
        speedKmH: t.speedKmH,
        targetSpeedKmH: t.speedKmH,
        accelState: t.speedKmH > 0 ? 'CRUISING' : 'STOPPED',
        wheelAngle: 0,
        suspensionOffset: 0,
        assignedTrack: t.assignedTrack,
        nextSignalAspect: 'GREEN',
        nextSignalDistanceKm: 10,
        entity: t,
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

  // ─────────────────────────────────────────────────────────
  // Kinematic & Cinematic Camera Loop
  // ─────────────────────────────────────────────────────────
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
              if (distToStop < 1.8) {
                targetSpeed = 0;
              }
            } else if (sigAspect === 'YELLOW') {
              if (distToSignal < 2.5) {
                targetSpeed = 45;
              }
            }
          }

          tp.nextSignalAspect = sigAspect;
          tp.nextSignalDistanceKm = distToSignal;
          tp.targetSpeedKmH = targetSpeed;

          const maxAccel = 18;
          const maxBrake = 32;

          if (tp.speedKmH < targetSpeed) {
            tp.speedKmH = Math.min(targetSpeed, tp.speedKmH + maxAccel * dt);
            tp.accelState = 'ACCELERATING';
          } else if (tp.speedKmH > targetSpeed) {
            tp.speedKmH = Math.max(targetSpeed, tp.speedKmH - maxBrake * dt);
            tp.accelState = 'BRAKING';
          } else {
            tp.accelState = tp.speedKmH === 0 ? 'STOPPED' : 'CRUISING';
          }

          const dKm = (tp.speedKmH / 3600) * dt * direction;
          tp.currentKm = tp.currentKm + dKm;

          if (isUp && tp.currentKm > KM_MAX) {
            tp.currentKm = KM_MIN;
          } else if (!isUp && tp.currentKm < KM_MIN) {
            tp.currentKm = KM_MAX;
          }

          const wheelRotationsPerSec = (tp.speedKmH / 3.6) / 3.43;
          const dAngle = wheelRotationsPerSec * 360 * dt * direction;
          tp.wheelAngle = (tp.wheelAngle + dAngle) % 360;

          if (tp.speedKmH > 0) {
            tp.suspensionOffset = Math.sin(time * 0.015) * 0.75 * (tp.speedKmH / 130);
          } else {
            tp.suspensionOffset = 0;
          }

          if (cameraMode === 'TRAIN' && (trackedTrainId === id || (!trackedTrainId && isUp))) {
            const trainX = kmToX(tp.currentKm, W);
            targetViewBoxRef.current = {
              x: Math.max(0, Math.min(W - 360, trainX - 180)),
              y: 135,
              w: 360,
              h: 190,
            };
          }

          next[id] = tp;
          changed = true;
        });

        return changed ? next : prev;
      });

      setCurrentViewBox(prevVb => {
        const target = targetViewBoxRef.current;
        const lerpFactor = 0.055;
        return {
          x: prevVb.x + (target.x - prevVb.x) * lerpFactor,
          y: prevVb.y + (target.y - prevVb.y) * lerpFactor,
          w: prevVb.w + (target.w - prevVb.w) * lerpFactor,
          h: prevVb.h + (target.h - prevVb.h) * lerpFactor,
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

  const civilWorkX = kmToX(126, W);
  const signalWorkX = kmToX(114, W);
  const tractionWorkX = kmToX(138, W);

  const bgParallaxX = -currentViewBox.x * 0.15;
  const cloudDriftX = (envTime * 0.008) % 1200;

  const isCivilDrawn = isDemoActive && demoStepIdx >= 1 && demoStepIdx <= 6;
  const isTractionDrawn = isDemoActive && demoStepIdx === 7;
  const isSignalDrawn = isDemoActive && demoStepIdx === 8;

  return (
    <div className="w-full relative overflow-hidden select-none bg-[#F7F4EE] border border-[#1A1815] rounded-[2px]">

      {/* ── TOP PRIMARY DEMO & CAMERA TOOLBAR ── */}
      <div className="p-2.5 px-3.5 border-b border-[#D8D1C5] bg-[#FFFFFF] flex flex-wrap items-center justify-between gap-2.5">

        {/* Primary Hackathon Demo Action */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isDemoActive ? (
            <button
              onClick={() => startDemoStory(0)}
              className="px-3.5 py-1.5 bg-[#8B1A1A] hover:bg-[#7F1D1D] text-[#FFFFFF] text-[11px] font-mono font-bold uppercase tracking-wider rounded-[2px] shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>SIMULATE OPERATION (30s Story)</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-[#F7F4EE] border border-[#D8D1C5] p-0.5 rounded-[2px]">
              <span className="text-[10px] font-mono font-bold text-[#8B1A1A] px-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8B1A1A] animate-ping" />
                LIVE DEMO (STEP {demoStepIdx + 1}/10)
              </span>

              {isDemoPaused ? (
                <button
                  onClick={resumeDemoStory}
                  className="p-1 px-2 text-[10px] font-mono bg-[#1A1815] text-[#FFFFFF] rounded-[1px] flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" /> Resume
                </button>
              ) : (
                <button
                  onClick={pauseDemoStory}
                  className="p-1 px-2 text-[10px] font-mono bg-[#FFFFFF] hover:bg-[#EDE7DC] text-[#1A1815] border border-[#D8D1C5] rounded-[1px] flex items-center gap-1 cursor-pointer"
                >
                  <Pause className="w-3 h-3" /> Pause
                </button>
              )}

              <button
                onClick={restartDemoStory}
                className="p-1 px-2 text-[10px] font-mono bg-[#FFFFFF] hover:bg-[#EDE7DC] text-[#1A1815] border border-[#D8D1C5] rounded-[1px] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Restart
              </button>

              <button
                onClick={exitDemoStory}
                className="p-1 px-1.5 text-[10px] font-mono text-[#615A4F] hover:text-[#B91C1C] rounded-[1px] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Camera Presets */}
          <div className="hidden sm:flex items-center gap-1 ml-2">
            <span className="text-[9.5px] font-mono font-bold text-[#615A4F] uppercase mr-0.5">CAMERA:</span>
            {(['WIDE', 'TRAIN', 'CIVIL', 'SIGNAL', 'TRACTION', 'ROUTE'] as CameraPreset[]).map(cam => (
              <button
                key={cam}
                onClick={() => setCameraPreset(cam)}
                className={`px-2 py-0.5 text-[9.5px] font-mono font-bold rounded-[1px] border transition-all cursor-pointer ${
                  cameraMode === cam
                    ? 'bg-[#1A1815] text-[#FFFFFF] border-[#1A1815]'
                    : 'bg-[#F7F4EE] text-[#615A4F] hover:bg-[#EDE7DC] border-[#D8D1C5]'
                }`}
              >
                {cam}
              </button>
            ))}
          </div>
        </div>

        {/* Speed & Signal Aspect Telemetry */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#615A4F]">PROT. SIGNAL:</span>
            <span className={`px-1.5 py-0.2 text-[9.5px] font-bold rounded-[1px] border ${
              signals.find(s => s.id === 'SIG-UP-126')?.aspect === 'RED' ? 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
              : signals.find(s => s.id === 'SIG-UP-126')?.aspect === 'YELLOW' ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
              : 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
            }`}>
              {signals.find(s => s.id === 'SIG-UP-126')?.aspect || 'GREEN'} (S-126)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#615A4F]">LOCO 20901:</span>
            <span className="font-bold text-[#1A1815]">
              {trainPhysics['TRN-20901'] ? Math.round(trainPhysics['TRN-20901'].speedKmH) : 130} km/h
            </span>
          </div>
        </div>
      </div>

      {/* ── THE LIVING CANVAS SVG WITH 2.5D CAMERA ── */}
      <div className="relative">
        <svg
          viewBox={`${currentViewBox.x} ${currentViewBox.y} ${currentViewBox.w} ${currentViewBox.h}`}
          width="100%"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
        >
          <defs>
            <pattern id="pen-hatch-track" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#1A1815" strokeWidth="1.2" strokeOpacity="0.4" />
            </pattern>
          </defs>

          {/* LAYER 1: BACKGROUND (0.15x Parallax + Ambient Cloud Drift) */}
          <g transform={`translate(${bgParallaxX}, 0)`}>
            <rect x="-300" y="0" width={W + 600} height={SKY_H} fill="#FAF7F2" />
            <g transform={`translate(${cloudDriftX - 200}, 0)`} opacity="0.65">
              <path d="M 50 28 Q 70 16 95 24 Q 120 18 140 28 Q 155 38 135 48 L 45 48 Z" fill="#F2ECE1" stroke="#D8D1C5" strokeWidth="0.8" />
              <path d="M 420 22 Q 445 12 470 20 Q 500 14 525 24 Q 540 36 515 44 L 410 44 Z" fill="#F2ECE1" stroke="#D8D1C5" strokeWidth="0.8" />
              <path d="M 820 26 Q 840 14 865 22 Q 890 16 910 26 Q 925 36 905 46 L 815 46 Z" fill="#F2ECE1" stroke="#D8D1C5" strokeWidth="0.8" />
            </g>
            <line x1="-300" y1="25" x2={W + 300} y2="25" stroke="#EAE4D9" strokeWidth="0.75" strokeDasharray="6 4" />
            <line x1="-300" y1="55" x2={W + 300} y2="55" stroke="#EAE4D9" strokeWidth="0.75" strokeDasharray="6 4" />
            <path
              d={`M -300 ${TERRAIN_Y} Q 180 ${TERRAIN_Y - 28} 380 ${TERRAIN_Y - 6} Q 600 ${TERRAIN_Y - 38} 820 ${TERRAIN_Y - 14} Q 1020 ${TERRAIN_Y - 32} ${W + 300} ${TERRAIN_Y} L ${W + 300} ${H} L -300 ${H} Z`}
              fill="#F2ECE1"
              stroke="#D8D1C5"
              strokeWidth="1"
            />
          </g>

          {/* LAYER 2: MIDGROUND (Stations, OHE Masts, 3-Light Signals) */}
          {STATIONS.map(st => {
            const x = kmToX(st.km, W);
            return (
              <g key={st.code}>
                <rect x={x - 32} y={UP_Y - TRACK_H / 2 - 8} width="64" height="8" fill="#EDE7DC" stroke="#1A1815" strokeWidth="1" />
                <rect x={x - 24} y={UP_Y - TRACK_H / 2 - 38} width="48" height="11" fill="#FFFFFF" stroke="#1A1815" strokeWidth="1.2" rx="1" />
                <line x1={x} y1={UP_Y - TRACK_H / 2 - 27} x2={x} y2={UP_Y - TRACK_H / 2 - 8} stroke="#1A1815" strokeWidth="1" />
                <text x={x} y={UP_Y - TRACK_H / 2 - 30} textAnchor="middle" fontSize="7.5" fontFamily="'Inter', sans-serif" fontWeight="700" fill="#1A1815">
                  {st.name}
                </text>
                <text x={x} y={UP_Y - TRACK_H / 2 - 42} textAnchor="middle" fontSize="6.5" fontFamily="'JetBrains Mono', monospace" fill="#615A4F">
                  KM {st.km}
                </text>
              </g>
            );
          })}

          {/* OHE Traction Network */}
          <g opacity={isHighlighted('OHE') ? 1 : 0.4}>
            {[60, 160, 260, 360, 460, 560, 660, 760, 860, 960, 1060, 1160].map((mx, idx) => {
              const mastTopY = UP_Y - TRACK_H / 2 - OHE_MAST_H;
              const mastBaseY = UP_Y - TRACK_H / 2;
              return (
                <g key={`ohe-mast-${idx}`}>
                  <line x1={mx} y1={mastTopY} x2={mx} y2={mastBaseY} stroke="#1A1815" strokeWidth="1.8" />
                  <line x1={mx} y1={mastTopY + 14} x2={mx + 22} y2={mastTopY + 28} stroke="#1A1815" strokeWidth="1.2" />
                  <line x1={mx + 22} y1={mastTopY + 28} x2={mx + 22} y2={mastTopY + 28} stroke="#1A1815" strokeWidth="1.2" />
                  <circle cx={mx + 22} cy={mastTopY + 28} r="2.5" fill="#FFFFFF" stroke="#1A1815" strokeWidth="1" />
                </g>
              );
            })}
            <path
              d={`M 0 ${UP_Y - TRACK_H / 2 - OHE_MAST_H + 18} Q 300 ${UP_Y - TRACK_H / 2 - OHE_MAST_H + 28} 600 ${UP_Y - TRACK_H / 2 - OHE_MAST_H + 18} Q 900 ${UP_Y - TRACK_H / 2 - OHE_MAST_H + 28} ${W} ${UP_Y - TRACK_H / 2 - OHE_MAST_H + 18}`}
              fill="none"
              stroke="#1A1815"
              strokeWidth="1.2"
            />
            <line x1="0" y1={UP_Y - TRACK_H / 2 - 30} x2={W} y2={UP_Y - TRACK_H / 2 - 30} stroke="#1A1815" strokeWidth="1.4" />
          </g>

          {/* 3-Light Color Aspect Signals */}
          <g opacity={isHighlighted('SNT') ? 1 : 0.4}>
            {signals.map(sig => {
              const sx = kmToX(sig.km, W);
              const mastBaseY = UP_Y - TRACK_H / 2 - 2;
              const mastTopY = mastBaseY - 44;

              const isRed = sig.aspect === 'RED';
              const isYellow = sig.aspect === 'YELLOW';
              const isGreen = sig.aspect === 'GREEN';

              return (
                <g
                  key={sig.id}
                  onClick={() => {
                    handleToggleSignal(sig.id);
                    setCameraPreset('SIGNAL');
                  }}
                  className="cursor-pointer"
                >
                  <line x1={sx} y1={mastTopY + 28} x2={sx} y2={mastBaseY} stroke="#1A1815" strokeWidth="2" />
                  <rect x={sx - 5} y={mastTopY} width="10" height="28" rx="2" fill="#1A1815" stroke="#1A1815" strokeWidth="1.2" />

                  <circle cx={sx} cy={mastTopY + 5} r="3" fill={isGreen ? '#15803D' : '#2D2A26'} />
                  {isGreen && <circle cx={sx} cy={mastTopY + 5} r="5" fill="#15803D" fillOpacity="0.3" />}

                  <circle cx={sx} cy={mastTopY + 14} r="3" fill={isYellow ? '#B45309' : '#2D2A26'} />
                  {isYellow && <circle cx={sx} cy={mastTopY + 14} r="5" fill="#B45309" fillOpacity="0.3" />}

                  <circle cx={sx} cy={mastTopY + 23} r="3" fill={isRed ? '#B91C1C' : '#2D2A26'} />
                  {isRed && <circle cx={sx} cy={mastTopY + 23} r="6" fill="#B91C1C" fillOpacity="0.35" />}

                  <rect x={sx - 10} y={mastTopY + 30} width="20" height="7" fill="#FFFFFF" stroke="#1A1815" strokeWidth="0.8" />
                  <text x={sx} y={mastTopY + 35.5} textAnchor="middle" fontSize="5.5" fontFamily="'JetBrains Mono', monospace" fontWeight="700" fill="#1A1815">
                    S-{sig.km}
                  </text>
                </g>
              );
            })}
          </g>

          {/* LAYER 3: FOREGROUND (Rails, Sleepers, Maintenance Drawings) */}
          {[UP_Y, DN_Y].map((lineY, lIdx) => (
            <g key={`sleepers-line-${lIdx}`}>
              {Array.from({ length: 65 }, (_, i) => {
                const sx = i * 18.5 + 4;
                return (
                  <rect
                    key={`sp-${lIdx}-${i}`}
                    x={sx}
                    y={lineY - TRACK_H / 2 - 2}
                    width="11"
                    height={TRACK_H + 4}
                    fill="#D8D1C5"
                    stroke="#1A1815"
                    strokeWidth="0.8"
                    rx="0.5"
                  />
                );
              })}
            </g>
          ))}

          <line x1="0" y1={UP_Y - TRACK_H / 2 + 2} x2={W} y2={UP_Y - TRACK_H / 2 + 2} stroke="#1A1815" strokeWidth="2.4" />
          <line x1="0" y1={UP_Y + TRACK_H / 2 - 2} x2={W} y2={UP_Y + TRACK_H / 2 - 2} stroke="#1A1815" strokeWidth="2.4" />
          <line x1="0" y1={DN_Y - TRACK_H / 2 + 2} x2={W} y2={DN_Y - TRACK_H / 2 + 2} stroke="#1A1815" strokeWidth="2.4" />
          <line x1="0" y1={DN_Y + TRACK_H / 2 - 2} x2={W} y2={DN_Y + TRACK_H / 2 - 2} stroke="#1A1815" strokeWidth="2.4" />

          {/* DYNAMIC SCENARIO ELEMENT: CIVIL WORK DRAWINGS */}
          {isCivilDrawn && (
            <g transform={`translate(${civilWorkX - 45}, ${UP_Y - TRACK_H / 2 - 20})`} className="animate-fade-in">
              <rect x="0" y="10" width="90" height="36" fill="url(#pen-hatch-track)" stroke="#B45309" strokeWidth="1.8" strokeDasharray="6 3" />
              {demoStepIdx >= 5 && (
                <g transform="translate(36, -8)">
                  <circle cx="6" cy="4" r="3" fill="#B45309" stroke="#1A1815" strokeWidth="0.8" />
                  <rect x="3" y="7" width="6" height="10" fill="#FFFFFF" stroke="#1A1815" strokeWidth="1" />
                  <line x1="3" y1="11" x2="9" y2="11" stroke="#B45309" strokeWidth="1.2" />
                  <line x1="4" y1="17" x2="3" y2="24" stroke="#1A1815" strokeWidth="1.2" />
                  <line x1="8" y1="17" x2="9" y2="24" stroke="#1A1815" strokeWidth="1.2" />
                  <line x1="-3" y1="16" x2="-3" y2="28" stroke="#1A1815" strokeWidth="1.6" />
                </g>
              )}
            </g>
          )}

          {/* DYNAMIC SCENARIO ELEMENT: OHE TRACTION DRAWINGS */}
          {isTractionDrawn && (
            <g transform={`translate(${tractionWorkX - 20}, ${UP_Y - TRACK_H / 2 - OHE_MAST_H - 10})`} className="animate-fade-in">
              <line x1="8" y1="18" x2="4" y2="70" stroke="#1E3A5F" strokeWidth="1.5" />
              <line x1="18" y1="18" x2="22" y2="70" stroke="#1E3A5F" strokeWidth="1.5" />
              <g transform="translate(6, 4)">
                <circle cx="6" cy="4" r="3" fill="#FFFFFF" stroke="#1A1815" strokeWidth="1" />
                <rect x="3" y="7" width="6" height="10" fill="#1E3A5F" stroke="#1A1815" strokeWidth="1" />
                <line x1="3" y1="11" x2="9" y2="11" stroke="#B45309" strokeWidth="1.2" />
              </g>
            </g>
          )}

          {/* DYNAMIC SCENARIO ELEMENT: SIGNAL DRAWINGS */}
          {isSignalDrawn && (
            <g transform={`translate(${signalWorkX + 6}, ${UP_Y - TRACK_H / 2 - 34})`} className="animate-fade-in">
              <rect x="0" y="8" width="18" height="24" fill="#FFFFFF" stroke="#15803D" strokeWidth="1.4" />
              <line x1="3" y1="13" x2="15" y2="13" stroke="#1A1815" strokeWidth="0.8" />
              <line x1="3" y1="17" x2="15" y2="17" stroke="#1A1815" strokeWidth="0.8" />
            </g>
          )}

          {/* REAL-TIME KINEMATIC VECTOR TRAINS */}
          {trains.map(train => {
            const phys = trainPhysics[train.id];
            const currentKm = phys ? phys.currentKm : train.currentKm;
            const speed = phys ? Math.round(phys.speedKmH) : train.speedKmH;
            const wheelAngle = phys ? phys.wheelAngle : 0;
            const suspension = phys ? phys.suspensionOffset : 0;
            const accelState = phys ? phys.accelState : 'CRUISING';

            const tx = kmToX(currentKm, W);
            const isUp = train.assignedTrack === 'UP';
            const isLoop = train.assignedTrack === 'LOOP_1' || train.assignedTrack === 'LOOP_2';
            const lineY = isUp ? UP_Y : (isLoop ? LOOP_Y : DN_Y);
            const isPassenger = train.priority <= 2;
            const trainLength = compact ? 64 : 88;
            const trainHeight = compact ? 16 : 22;

            const frontWheel1 = trainLength * 0.74;
            const frontWheel2 = trainLength * 0.86;
            const rearWheel1  = trainLength * 0.16;
            const rearWheel2  = trainLength * 0.28;
            const wheelCenterY = trainHeight + 4;
            const wheelRadius = 3.8;

            return (
              <g
                key={train.id}
                onClick={() => {
                  onSelectTrain?.(train, phys);
                  setCameraPreset('TRAIN', train.id);
                }}
                className="cursor-pointer group"
              >
                <g transform={`translate(${tx - trainLength / 2}, ${lineY - TRACK_H / 2 - trainHeight - 2 + suspension})`}>
                  <g>
                    <line x1={trainLength * 0.25} y1="0" x2={trainLength * 0.35} y2="-10" stroke="#1A1815" strokeWidth="1.4" />
                    <line x1={trainLength * 0.35} y1="-10" x2={trainLength * 0.28} y2="-18" stroke="#1A1815" strokeWidth="1.4" />
                    <line x1={trainLength * 0.22} y1="-18" x2={trainLength * 0.38} y2="-18" stroke="#1A1815" strokeWidth="2" />
                  </g>

                  <rect x="0" y="0" width={trainLength} height={trainHeight} fill="#FFFFFF" stroke="#1A1815" strokeWidth="1.8" rx="2" />
                  {isPassenger ? (
                    <path d={`M ${trainLength - 16} 0 L ${trainLength} 4 L ${trainLength} ${trainHeight - 4} L ${trainLength - 16} ${trainHeight} Z`} fill="#1A1815" />
                  ) : (
                    <rect x={trainLength - 12} y="0" width="12" height={trainHeight} fill="#785D3F" stroke="#1A1815" strokeWidth="1" />
                  )}
                  <line x1="2" y1={trainHeight * 0.55} x2={trainLength - 16} y2={trainHeight * 0.55} stroke="#1A1815" strokeWidth="1.2" />

                  <polygon points={`${trainLength - 14},3 ${trainLength - 3},6 ${trainLength - 3},${trainHeight * 0.45} ${trainLength - 14},${trainHeight * 0.45}`} fill="#EDE7DC" stroke="#1A1815" strokeWidth="1" />

                  {[0.12, 0.26, 0.40, 0.54, 0.68].map((wRatio, wIdx) => (
                    <rect key={`win-${wIdx}`} x={trainLength * wRatio} y="3.5" width="7" height={trainHeight * 0.35} fill="#EDE7DC" stroke="#1A1815" strokeWidth="0.8" rx="1" />
                  ))}

                  <rect x={trainLength * 0.7} y={trainHeight} width="18" height="4" fill="#615A4F" stroke="#1A1815" strokeWidth="0.8" />
                  <rect x={trainLength * 0.12} y={trainHeight} width="18" height="4" fill="#615A4F" stroke="#1A1815" strokeWidth="0.8" />

                  {[frontWheel1, frontWheel2, rearWheel1, rearWheel2].map((wx, wIdx) => (
                    <g key={`wheel-${wIdx}`} transform={`rotate(${wheelAngle}, ${wx}, ${wheelCenterY})`}>
                      <circle cx={wx} cy={wheelCenterY} r={wheelRadius} fill="#FFFFFF" stroke="#1A1815" strokeWidth="1.3" />
                      <line x1={wx - wheelRadius + 0.5} y1={wheelCenterY} x2={wx + wheelRadius - 0.5} y2={wheelCenterY} stroke="#1A1815" strokeWidth="0.8" />
                      <line x1={wx} y1={wheelCenterY - wheelRadius + 0.5} x2={wx} y2={wheelCenterY + wheelRadius - 0.5} stroke="#1A1815" strokeWidth="0.8" />
                      <circle cx={wx} cy={wheelCenterY} r="1.2" fill="#1A1815" />
                    </g>
                  ))}
                </g>

                <g transform={`translate(${tx}, ${lineY - TRACK_H / 2 - trainHeight - 24})`}>
                  <rect
                    x="-36"
                    y="-8"
                    width="72"
                    height="13"
                    fill="#FFFFFF"
                    stroke={accelState === 'BRAKING' ? '#B91C1C' : accelState === 'STOPPED' ? '#B45309' : '#1A1815'}
                    strokeWidth="1.2"
                    rx="1"
                  />
                  <text x="-32" y="1" fontSize="6.5" fontFamily="'JetBrains Mono', monospace" fontWeight="700" fill="#1A1815">
                    {train.trainNumber}
                  </text>
                  <text
                    x="30"
                    y="1"
                    textAnchor="end"
                    fontSize="6.5"
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight="700"
                    fill={accelState === 'BRAKING' ? '#B91C1C' : accelState === 'STOPPED' ? '#B45309' : '#15803D'}
                  >
                    {speed}kph
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* ── CONTEXTUAL FLOATING STORY OVERLAY (When Demo Active) ── */}
        {isDemoActive && currentDemoStep && (
          <div className="absolute top-3 left-3 max-w-sm sm:max-w-md bg-[#FFFFFF] border border-[#1A1815] p-3.5 rounded-[2px] shadow-xl z-20 animate-fade-in font-sans">
            <div className="flex items-center justify-between border-b border-[#D8D1C5] pb-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8B1A1A] animate-pulse" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B1A1A]">
                  STEP {demoStepIdx + 1}/10: {currentDemoStep.phaseName}
                </span>
              </div>
              <span className="text-[9.5px] font-mono text-[#615A4F] bg-[#F7F4EE] border border-[#D8D1C5] px-1.5 py-0.2 rounded-[1px]">
                {currentDemoStep.shortTitle}
              </span>
            </div>

            <p className="text-[12px] text-[#1A1815] font-medium leading-snug">
              {currentDemoStep.narrative}
            </p>

            {/* Sub-Progress for Civil Work */}
            {demoStepIdx === 6 && (
              <div className="mt-2.5 space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-[#615A4F]">Tamping & Flaw Weld Progress:</span>
                  <span className="font-bold text-[#1A1815]">{demoWorkProgress}%</span>
                </div>
                <div className="w-full bg-[#EDE7DC] h-1.5 rounded-[1px] overflow-hidden">
                  <div className="h-full bg-[#1A1815] transition-all duration-100" style={{ width: `${demoWorkProgress}%` }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── INTERACTIVE REPLAY TIMELINE (10 Clickable Milestone Nodes) ── */}
      <div className="p-2 px-3 border-t border-[#D8D1C5] bg-[#FAF7F2] flex items-center justify-between gap-2 overflow-x-auto text-[10px] font-mono">
        <span className="text-[#615A4F] font-bold shrink-0 uppercase flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[#1A1815]" /> REPLAY TIMELINE:
        </span>

        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto">
          {DEMO_STORY_STEPS.map((step, idx) => {
            const isCurrent = isDemoActive && demoStepIdx === idx;
            const isPassed = isDemoActive && demoStepIdx > idx;

            return (
              <button
                key={step.id}
                onClick={() => {
                  if (!isDemoActive) setIsDemoActive(true);
                  applyDemoStep(idx);
                }}
                className={`px-2 py-1 rounded-[2px] border transition-all cursor-pointer shrink-0 ${
                  isCurrent
                    ? 'bg-[#1A1815] text-[#FFFFFF] border-[#1A1815] font-bold shadow-xs'
                    : isPassed
                    ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                    : 'bg-[#FFFFFF] text-[#615A4F] hover:bg-[#F7F4EE] border-[#D8D1C5]'
                }`}
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
