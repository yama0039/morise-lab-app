import React, { useState } from 'react';
import { useApp, PurchaseRequest as RequestType, PurchaseStatus } from '../context/AppContext';
import { FileText, Send, Eye, ExternalLink } from 'lucide-react';

export const PurchaseRequest: React.FC = () => {
  const { purchaseRequests, addPurchaseRequest } = useApp();

  // フォーム状態
  const [requester, setRequester] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [genre, setGenre] = useState<string>('PC&iPad&iPhone');
  const [quantity, setQuantity] = useState<number>(1);
  const [url, setUrl] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 詳細閲覧モーダル状態
  const [viewingRequest, setViewingRequest] = useState<RequestType | null>(null);
  // 履歴表示トグル状態
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!requester.trim()) {
      setErrorMsg('提案者を入力してください。');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('品名を入力してください。');
      return;
    }
    if (quantity <= 0) {
      setErrorMsg('個数を1以上に設定してください。');
      return;
    }
    if (!url.trim()) {
      setErrorMsg('URLを入力してください。');
      return;
    }
    if (!purpose.trim()) {
      setErrorMsg('用途・目的を入力してください。');
      return;
    }

    addPurchaseRequest({
      requester: requester.trim(),
      name: name.trim(),
      genre,
      quantity,
      url: url.trim(),
      purpose: purpose.trim()
    });

    setSuccessMsg('購入申請を送信しました！');
    // フォームリセット
    setRequester('');
    setName('');
    setGenre('PC&iPad&iPhone');
    setQuantity(1);
    setUrl('');
    setPurpose('');
  };

  const getStatusBadge = (status: PurchaseStatus) => {
    switch (status) {
      case 'delivered':
        return <span className="badge badge-success">納品済み</span>;
      case 'undelivered':
        return <span className="badge badge-danger">未納品</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">購入申請</h1>
          <p className="page-subtitle">研究活動に必要な物品の購入を申請します。</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* 新規購入申請フォーム */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            <Send size={18} style={{ color: 'var(--accent-cyan)' }} />
            新規購入申請
          </h3>

          {errorMsg && (
            <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="req-requester">提案者 *</label>
              <input
                id="req-requester"
                type="text"
                className="form-input"
                placeholder="例：森勢 将雅"
                value={requester}
                onChange={(e) => setRequester(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="req-name">品名 *</label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                書籍の場合はタイトルと著者，備品の場合はメーカーと品番を入れてください．カラーを選べる物品は，カラーも入れるようにお願いします．
              </p>
              <input
                id="req-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="req-genre">ジャンル *</label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                次の中からジャンルを選択してください
              </p>
              <select
                id="req-genre"
                className="form-select"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              >
                <option value="PC&iPad&iPhone">PC, iPad, iPhone → PC&iPad&iPhone</option>
                <option value="Headphone & earphone">ヘッドフォン，イヤホン → Headphone & earphone</option>
                <option value="Audio I/O & Mic etc.">オーディオインタフェース，マイク → Audio I/O & Mic etc.</option>
                <option value="Books">本 → Books</option>
                <option value="Equipments">キーボード，マウス，端子変換機など → Equipments</option>
                <option value="Others">その他（物品管理シートに記録する必要がないもの） → Others</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="req-qty">個数 *</label>
              <input
                id="req-qty"
                type="number"
                className="form-input"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="req-url">URL *</label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                書籍はAmazonのリンクでお願いします．<br/>
                それ以外の物品は可能であれば楽天のURL，次点Amazonでお願いします．<br/>
                それらで購入できない場合は教員から連絡が来る場合があります．
              </p>
              <input
                id="req-url"
                type="url"
                className="form-input"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="req-purpose">用途・目的 *</label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                使途がわかりにくい場合教員から連絡が来る場合があります．
              </p>
              <textarea
                id="req-purpose"
                className="form-input"
                style={{ height: '80px', resize: 'none' }}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              申請を送信する
            </button>
          </form>
        </div>

        {/* 申請一覧のトグルボタン */}
        <div>
          <button 
            type="button"
            className="btn btn-secondary" 
            style={{ width: '100%', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '1.05rem', fontWeight: '600', borderRadius: '16px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
            onClick={() => setShowHistory(!showHistory)}
          >
            <FileText size={20} style={{ color: 'var(--accent-blue)' }} />
            {showHistory ? '申請履歴・ステータスを閉じる' : '申請履歴・ステータスを見る'}
          </button>
        </div>

        {/* 申請一覧（トグルで表示） */}
        {showHistory && (
        <div className="glass-card" style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: '600' }}>
              <FileText size={18} style={{ color: 'var(--accent-blue)' }} />
              申請履歴・ステータス
            </h3>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>品名</th>
                  <th>提案者</th>
                  <th>ジャンル</th>
                  <th>個数</th>
                  <th>ステータス</th>
                  <th style={{ textAlign: 'center' }}>詳細</th>
                </tr>
              </thead>
              <tbody>
                {purchaseRequests.map((req) => (
                  <tr key={req.id}>
                    <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '600' }}>
                      {req.name}
                    </td>
                    <td>{req.requester}</td>
                    <td>{req.genre}</td>
                    <td>{req.quantity}</td>
                    <td>{getStatusBadge(req.status)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => setViewingRequest(req)}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>

      {/* 詳細閲覧モーダル */}
      {viewingRequest && (
        <div className="modal-overlay">
          <div className="glass-card modal-card modal-card-lg">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  購入申請詳細
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {viewingRequest.id}</span>
              </div>
              <div>
                {getStatusBadge(viewingRequest.status)}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>物品名</span>
                <div style={{ fontSize: '1rem', fontWeight: '600', marginTop: '2px' }}>{viewingRequest.name}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>個数</span>
                  <div style={{ fontSize: '0.95rem', marginTop: '2px' }}>
                    {viewingRequest.quantity}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ジャンル</span>
                  <div style={{ fontSize: '0.95rem', marginTop: '2px' }}>
                    {viewingRequest.genre}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>申請者</span>
                  <div style={{ fontSize: '0.95rem', marginTop: '2px' }}>{viewingRequest.requester}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>申請日</span>
                  <div style={{ fontSize: '0.95rem', marginTop: '2px' }}>{viewingRequest.date}</div>
                </div>
              </div>



              {viewingRequest.url && (
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>参考リンク</span>
                  <div style={{ fontSize: '0.9rem', marginTop: '2px' }}>
                    <a 
                      href={viewingRequest.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ color: 'var(--accent-blue)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                    >
                      商品ページを開く <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>用途・目的</span>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '4px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', whiteSpace: 'pre-wrap' }}>
                  {viewingRequest.purpose}
                </div>
              </div>
            </div>



            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setViewingRequest(null)}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
