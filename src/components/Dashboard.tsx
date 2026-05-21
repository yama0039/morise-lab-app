import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Package, 
  FileText, 
  Bell, 
  CheckCircle, 
  Clock 
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    reservations, 
    equipmentList, 
    purchaseRequests 
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // 今日の防音室予約数
  const todayReservations = reservations.filter((res) => res.date === todayStr);

  // 貸出中の機材
  const rentedEquipment = equipmentList.filter((eq) => eq.status === 'rented');

  // 未納品の購入リクエスト
  const undeliveredRequests = purchaseRequests.filter((req) => req.status === 'undelivered');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={16} color="var(--success)" />;
      case 'undelivered':
        return <Clock size={16} color="var(--danger)" />;
      default:
        return <Package size={16} color="var(--text-muted)" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return '納品済み';
      case 'undelivered': return '未納品';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'delivered': return 'badge-success';
      case 'undelivered': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">森勢研究室ポータル</h1>
          <p className="page-subtitle">Sound & Audio Processing Laboratory Portal</p>
        </div>
      </div>

      {/* ウェルカムカード */}
      <div className="glass-card welcome-gradient-card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
          ようこそ、森勢研究室ポータルへ
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
          本ポータルでは、森勢研究室の防音室予約、機材・物品の貸出、書籍や機材の購入申請を一括で管理できます。
        </p>
      </div>

      {/* クイックステータスグリッド */}
      <div className="grid-cols-3">
        {/* 今日の防音室予約数 */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="dashboard-stat-icon-cyan">
            <Calendar size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>今日の防音室予約</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', marginTop: '2px' }}>
              {todayReservations.length} 件
            </div>
          </div>
        </div>

        {/* 自分の貸出中機材数 */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="dashboard-stat-icon-blue">
            <Package size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>貸出中の物品</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', marginTop: '2px' }}>
              {rentedEquipment.length} 件
            </div>
          </div>
        </div>

        {/* 購入申請ステータス */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="dashboard-stat-icon-indigo">
            <FileText size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              未納品の購入申請
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '800', marginTop: '2px' }}>
              {undeliveredRequests.length} 件
            </div>
          </div>
        </div>
      </div>

      {/* 今日のアクティビティ & 簡易お知らせ */}
      <div className="grid-cols-2">
        {/* 今日の防音室タイムテーブル */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 className="section-title">
              <Calendar size={18} style={{ color: 'var(--accent-cyan)' }} />
              本日の防音室利用状況
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{todayStr}</span>
          </div>

          {todayReservations.length === 0 ? (
            <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              本日の予約はありません。空き室です。
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {todayReservations.map((res) => (
                <div key={res.id} className="activity-item">
                  <div>
                    <span className="activity-item-time">
                      {res.timeSlot}
                    </span>
                    <span className="activity-item-purpose">
                      - {res.purpose}
                    </span>
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                    {res.user}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* お知らせ & 最近の申請 */}
        <div className="glass-card">
          <h3 className="section-title">
            <Bell size={18} style={{ color: 'var(--accent-indigo)' }} />
            最近の購入申請
          </h3>

          {purchaseRequests.length === 0 ? (
            <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              最近の購入申請はありません。
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {purchaseRequests
                .slice(0, 3)
                .map((req) => (
                  <div key={req.id} className="activity-item">
                    <div className="activity-item-details">
                      <div className="activity-item-title">{req.name}</div>
                      <div className="activity-item-meta">
                        {req.date} ・ {req.requester} ・ {req.quantity}個
                      </div>
                    </div>
                    <span className={`badge ${getStatusClass(req.status)}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {getStatusIcon(req.status)}
                      {getStatusText(req.status)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
