import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Dashboard } from './components/Dashboard';
import { SoundproofRoom } from './components/SoundproofRoom';
import { EquipmentRental } from './components/EquipmentRental';
import { PurchaseRequest } from './components/PurchaseRequest';
import { 
  LayoutDashboard, 
  Mic, 
  Package, 
  FileText, 
  Music
} from 'lucide-react';
import './App.css'; // デフォルトのApp.cssが空または最小限であることを想定

type Tab = 'dashboard' | 'soundproof' | 'equipment' | 'purchase';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'soundproof':
        return <SoundproofRoom />;
      case 'equipment':
        return <EquipmentRental />;
      case 'purchase':
        return <PurchaseRequest />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* プレミアム・サイドバー */}
      <aside className="sidebar">
        <div>
          <div className="brand">
            <div className="brand-logo">
              <Music size={22} />
            </div>
            <div>
              <div className="brand-name">森勢研究室</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>LAP Portal</div>
            </div>
          </div>

          <nav className="nav-menu">
            <div 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={20} />
              <span>ダッシュボード</span>
            </div>
            
            <div 
              className={`nav-item ${activeTab === 'soundproof' ? 'active' : ''}`}
              onClick={() => setActiveTab('soundproof')}
            >
              <Mic size={20} />
              <span>防音室予約</span>
            </div>
            
            <div 
              className={`nav-item ${activeTab === 'equipment' ? 'active' : ''}`}
              onClick={() => setActiveTab('equipment')}
            >
              <Package size={20} />
              <span>物品・機材貸出</span>
            </div>
            
            <div 
              className={`nav-item ${activeTab === 'purchase' ? 'active' : ''}`}
              onClick={() => setActiveTab('purchase')}
            >
              <FileText size={20} />
              <span>購入申請</span>
            </div>
          </nav>
        </div>

      </aside>

      {/* メインコンテンツ */}
      <main className="main-content">
        <div className="main-container">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
