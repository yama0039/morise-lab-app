import React, { useState } from 'react';
import { useApp, Equipment } from '../context/AppContext';
import { Search, Filter, BookOpen, Laptop, Radio, Clipboard, Calendar, CornerDownLeft, PlusCircle } from 'lucide-react';

export const EquipmentRental: React.FC = () => {
  const { equipmentList, rentEquipment, returnEquipment } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // 貸出モーダル用状態
  const [rentingItem, setRentingItem] = useState<Equipment | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // カテゴリ一覧
  const categories = ['All', '音響機器', 'PC・計算機', '書籍'];

  // フィルタリング処理
  const filteredEquipment = equipmentList.filter((eq) => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          eq.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || eq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '音響機器':
        return <Radio size={18} style={{ color: 'var(--accent-cyan)' }} />;
      case 'PC・計算機':
        return <Laptop size={18} style={{ color: 'var(--accent-blue)' }} />;
      case '書籍':
        return <BookOpen size={18} style={{ color: 'var(--accent-indigo)' }} />;
      default:
        return <Clipboard size={18} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="badge badge-success">貸出可能</span>;
      case 'rented':
        return <span className="badge badge-danger">貸出中</span>;
      case 'maintenance':
        return <span className="badge badge-warning">メンテナンス中</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const handleOpenRentModal = (item: Equipment) => {
    setRentingItem(item);
    setUserName('');
    setPurpose('');
    // デフォルトの返却予定日を1週間後に設定
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setReturnDate(nextWeek.toISOString().split('T')[0]);
    setErrorMsg('');
  };

  const handleCloseRentModal = () => {
    setRentingItem(null);
  };

  const handleRentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!userName.trim()) {
      setErrorMsg('借用者名を入力してください。');
      return;
    }
    if (!purpose.trim()) {
      setErrorMsg('利用目的を入力してください。');
      return;
    }
    if (!returnDate) {
      setErrorMsg('返却予定日を選択してください。');
      return;
    }

    if (rentingItem) {
      rentEquipment(rentingItem.id, userName.trim(), purpose.trim(), returnDate);
      handleCloseRentModal();
    }
  };

  const handleReturnItem = (id: string) => {
    if (window.confirm('この物品を返却完了にしますか？')) {
      returnEquipment(id);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">物品・機材貸出</h1>
          <p className="page-subtitle">研究室所有のマイク, ヘッドホン, PC, オシロスコープ, 書籍等の貸出を申請・管理できます。</p>
        </div>
      </div>

      {/* 検索・フィルターバー */}
      <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', padding: '1.25rem' }}>
        <div style={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '48px' }}
            placeholder="機材名や型番で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 16px', borderRadius: '20px' }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'All' ? 'すべて' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 物品グリッド */}
      <div className="equipment-grid">
        {filteredEquipment.map((item) => {
          return (
            <div key={item.id} className="glass-card equipment-card">
              <div>
                <div className="equipment-image-placeholder">
                  {getCategoryIcon(item.category)}
                  <span style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    {getStatusBadge(item.status)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {item.category}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '12px', lineHeight: '1.4', color: 'var(--text-primary)' }}>
                  {item.name}
                </h3>

                {/* 貸出中の場合の借用者情報 */}
                {item.status === 'rented' && (
                  <div style={{ padding: '12px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>借用者:</span>
                      <span style={{ fontWeight: '600', color: 'var(--accent-cyan)' }}>{item.currentUser}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>返却予定日:</span>
                      <span style={{ fontWeight: '600', color: 'var(--accent-blue)' }}>{item.returnDate}</span>
                    </div>
                    <div style={{ marginTop: '6px', color: 'var(--text-muted)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '6px' }}>
                      <strong>目的:</strong> {item.purpose}
                    </div>
                  </div>
                )}
              </div>

              {/* ボタンアクション */}
              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                {item.status === 'available' && (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', borderRadius: '10px' }}
                    onClick={() => handleOpenRentModal(item)}
                  >
                    <PlusCircle size={16} />
                    貸出申請をする
                  </button>
                )}

                {item.status === 'rented' && (
                  <button
                    className="btn btn-danger"
                    style={{ width: '100%', borderRadius: '10px' }}
                    onClick={() => handleReturnItem(item.id)}
                  >
                    <CornerDownLeft size={16} />
                    返却を完了する
                  </button>
                )}

                {item.status === 'maintenance' && (
                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', borderRadius: '10px', cursor: 'not-allowed', opacity: 0.6 }}
                    disabled
                  >
                    メンテナンス中
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 貸出申請ダイアログ (モーダル) */}
      {rentingItem && (
        <div className="modal-overlay">
          <div className="glass-card modal-card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>
              物品の貸出申請
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', fontWeight: '600', marginBottom: '1.5rem' }}>
              {rentingItem.name}
            </p>

            {errorMsg && (
              <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRentSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="rent-user">借用者名 *</label>
                <input
                  id="rent-user"
                  type="text"
                  className="form-input"
                  placeholder="例: 山田 太郎"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="rent-purpose">利用目的 *</label>
                <textarea
                  id="rent-purpose"
                  className="form-input"
                  style={{ height: '80px', resize: 'none' }}
                  placeholder="例: 会議室での予備実験、卒論執筆のためのデータ整理用として"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="rent-return-date">返却予定日:</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Calendar size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                  <input
                    id="rent-return-date"
                    type="date"
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={handleCloseRentModal}>
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  申請を確定する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
