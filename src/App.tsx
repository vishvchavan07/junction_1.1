import React, { useState } from 'react';
import { UserRole, FixedAsset, MaintenanceBlock, TrainEntity } from './types';
import { 
  INITIAL_ASSETS, 
  INITIAL_BLOCKS, 
  INITIAL_TRAINS, 
  INITIAL_CONFLICTS, 
  INITIAL_USER_PROFILES 
} from './data/mockData';
import { Header } from './components/common/Header';
import { RailNav } from './components/common/RailNav';
import { NavTab } from './components/common/Sidebar';
import { LoginModal } from './components/auth/LoginModal';
import { OperationsDashboard } from './components/dashboard/OperationsDashboard';
import { LiveNetworkMap } from './components/map/LiveNetworkMap';
import { AssetIntelligence } from './components/assets/AssetIntelligence';
import { AiBlockPlanner } from './components/planner/AiBlockPlanner';
import { TrainOperations } from './components/trains/TrainOperations';
import { ConflictCenter } from './components/conflicts/ConflictCenter';
import { WhatIfSandbox } from './components/simulation/WhatIfSandbox';
import { AiInsights } from './components/insights/AiInsights';
import { TrackDepartment } from './components/department/TrackDepartment';
import { OheDepartment } from './components/department/OheDepartment';
import { SntDepartment } from './components/department/SntDepartment';
import { AdminPortal } from './components/admin/AdminPortal';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('controller');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [activeEmergency, setActiveEmergency] = useState<boolean>(false);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

  // Application Data States
  const [assets, setAssets] = useState<FixedAsset[]>(INITIAL_ASSETS);
  const [blocks, setBlocks] = useState<MaintenanceBlock[]>(INITIAL_BLOCKS);
  const [trains, setTrains] = useState<TrainEntity[]>(INITIAL_TRAINS);
  const [conflicts, setConflicts] = useState(INITIAL_CONFLICTS);
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(INITIAL_ASSETS[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Role Change Handler with contextual navigation
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    showToast(`Switched Role: ${INITIAL_USER_PROFILES[role]?.roleTitle || role}`);
    
    // Automatically navigate to role's primary workspace
    if (role === 'engineering') setActiveTab('dept-track');
    else if (role === 'ohe') setActiveTab('dept-ohe');
    else if (role === 'signalling') setActiveTab('dept-snt');
    else if (role === 'maintenance_planner') setActiveTab('planner');
    else if (role === 'admin') setActiveTab('admin');
    else setActiveTab('dashboard');
  };

  // Toggle Emergency Incident Sandbox
  const handleToggleEmergency = () => {
    const nextState = !activeEmergency;
    setActiveEmergency(nextState);
    if (nextState) {
      showToast('EMERGENCY SIMULATION TRIGGERED: Rail Fracture at KM 127/4');
      setActiveTab('simulation');
    } else {
      showToast('Emergency state cleared. Baseline traffic restored.');
    }
  };

  // Block Update Handler
  const handleUpdateBlock = (updatedBlock: MaintenanceBlock) => {
    setBlocks(prev => prev.map(b => b.id === updatedBlock.id ? updatedBlock : b));
    showToast(`Block ${updatedBlock.blockCode} status updated to ${updatedBlock.status}`);
  };

  // Request New Block for an Asset
  const handleRequestBlockForAsset = (asset: FixedAsset) => {
    setSelectedAsset(asset);
    setActiveTab('planner');
    showToast(`Block proposal queued for ${asset.code} (${asset.section})`);
  };

  // Handle Simulation Results
  const handleApplySimulationResult = (impactedTrains: TrainEntity[], emergencyBlocks: MaintenanceBlock[]) => {
    setTrains(impactedTrains);
    setBlocks(prev => [...emergencyBlocks, ...prev]);
    showToast('Applied emergency mitigation and diversion plan to live corridor.');
  };

  const [demoTriggerTimestamp, setDemoTriggerTimestamp] = useState<number>(0);

  const handleTriggerDemo = () => {
    setDemoTriggerTimestamp(Date.now());
    setActiveTab('dashboard');
    showToast('Starting 30-Second Hackathon Live Demonstration...');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col antialiased selection:bg-[#E2E8F0] selection:text-[#0F172A]">
      {/* Top Minimal Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        onOpenLogin={() => setIsLoginOpen(true)}
        activeEmergency={activeEmergency}
        onToggleEmergency={handleToggleEmergency}
        isPresentationMode={isPresentationMode}
        onTogglePresentationMode={() => setIsPresentationMode(!isPresentationMode)}
        onTriggerDemo={handleTriggerDemo}
      />

      {/* Main Spatial Operations Viewport */}
      <main className={`flex-1 ${isPresentationMode ? 'mt-13 mb-14 px-3 sm:px-5' : 'mt-13 mb-14 px-3 sm:px-5 py-2'} max-w-7xl w-full mx-auto transition-all duration-200`}>
        {/* Emergency Alert Header (if triggered) */}
        {activeEmergency && (
          <div className="mb-2.5 p-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded-[4px] text-[#0F172A] flex items-center justify-between shadow-panel">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <div>
                <span className="font-mono font-bold text-xs text-[#DC2626]">EMERGENCY INCIDENT ACTIVE: </span>
                <span className="font-sans text-xs text-[#475569]">Rail Fracture on UP Line KM 127/4. Single Line Working (SLW) engaged on Down Line.</span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('simulation')}
              className="btn-pen-danger text-[10px] font-mono font-semibold uppercase px-2 py-1"
            >
              VIEW MITIGATION
            </button>
          </div>
        )}

        {/* Tab Router */}
        {activeTab === 'dashboard' && (
          <OperationsDashboard
            assets={assets}
            blocks={blocks}
            trains={trains}
            conflicts={conflicts}
            onNavigate={setActiveTab}
            onSelectAsset={(a) => {
              setSelectedAsset(a);
              setActiveTab('assets');
            }}
            onRunOptimization={() => setActiveTab('planner')}
            externalDemoTrigger={demoTriggerTimestamp}
          />
        )}

        {activeTab === 'map' && (
          <LiveNetworkMap
            assets={assets}
            trains={trains}
            blocks={blocks}
            onSelectAsset={(a) => {
              setSelectedAsset(a);
              setActiveTab('assets');
            }}
            onSelectBlock={(b) => {
              setActiveTab('planner');
            }}
          />
        )}

        {activeTab === 'assets' && (
          <AssetIntelligence
            assets={assets}
            selectedAsset={selectedAsset}
            onSelectAsset={setSelectedAsset}
            onRequestBlock={handleRequestBlockForAsset}
            onNavigateToOverview={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'planner' && (
          <AiBlockPlanner
            blocks={blocks}
            assets={assets}
            trains={trains}
            onUpdateBlock={handleUpdateBlock}
            onNavigateToOverview={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'trains' && (
          <TrainOperations
            trains={trains}
            onRerouteTrain={(id) => showToast(`Rerouted train ${id} via alternative loop`)}
            onNavigateToOverview={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'conflicts' && (
          <ConflictCenter
            conflicts={conflicts}
            onResolveConflict={(id) => showToast(`Conflict ${id} resolved by AI Shadow Block Clubbing`)}
            onNavigateToOverview={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'simulation' && (
          <WhatIfSandbox
            blocks={blocks}
            trains={trains}
            onApplySimulationResult={handleApplySimulationResult}
            onNavigateToOverview={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'insights' && <AiInsights />}

        {activeTab === 'dept-track' && (
          <TrackDepartment
            assets={assets}
            onRequestBlock={handleRequestBlockForAsset}
            onNavigateToOverview={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'dept-ohe' && (
          <OheDepartment
            assets={assets}
            onRequestBlock={handleRequestBlockForAsset}
            onNavigateToOverview={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'dept-snt' && (
          <SntDepartment
            assets={assets}
            onRequestBlock={handleRequestBlockForAsset}
            onNavigateToOverview={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'admin' && <AdminPortal />}
      </main>

      {/* Sleek Bottom Railway Navigation Dock */}
      <RailNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isPresentationMode={isPresentationMode}
        onTogglePresentationMode={() => setIsPresentationMode(!isPresentationMode)}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-14 right-6 z-50 bg-[#0F172A] border border-[#0F172A] text-[#FFFFFF] px-3.5 py-2 text-[11px] font-mono font-medium rounded-[4px] shadow-panel-lift flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-3.5 h-3.5 text-[#22C55E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Login / Switch Profile Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSelectRole={handleRoleChange}
        currentRole={currentRole}
      />
    </div>
  );
};
