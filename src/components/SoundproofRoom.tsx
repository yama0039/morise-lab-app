import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar as CalendarIcon, Clock, User, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const TIME_SLOTS = [
  '09:00 - 11:00',
  '11:00 - 13:00',
  '13:00 - 15:00',
  '15:00 - 17:00',
  '17:00 - 19:00',
  '19:00 - 21:00'
];

export const SoundproofRoom: React.FC = () => {
  const { reservations, addReservation, cancelReservation } = useApp();
  const [userName, setUserName] = useState<string>('');

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // 選択された日の既存の予約
  const dayReservations = reservations.filter((res) => res.date === selectedDate);

  // 全体の予約一覧（日付順にソート）
  const allReservations = [...reservations].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.timeSlot.localeCompare(b.timeSlot);
  });

  // カレンダー生成用（簡易的な月間カレンダー）
  const [currentYearMonth, setCurrentYearMonth] = useState<{ year: number; month: number }>(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  const handlePrevMonth = () => {
    setCurrentYearMonth((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentYearMonth((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  // 月の日数を取得
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // 月の初日の曜日を取得 (0: 日曜日, 6: 土曜日)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const days = getDaysInMonth(currentYearMonth.year, currentYearMonth.month);
  const firstDay = getFirstDayOfMonth(currentYearMonth.year, currentYearMonth.month);

  const calendarDays = [];
  // 空白埋め（先月分）
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  // 今月の日付
  for (let i = 1; i <= days; i++) {
    calendarDays.push(i);
  }

  const handleDaySelect = (day: number) => {
    const formattedMonth = String(currentYearMonth.month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    setSelectedDate(`${currentYearMonth.year}-${formattedMonth}-${formattedDay}`);
    setSelectedSlot('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedSlot) {
      setErrorMessage('予約する時間スロットを選択してください。');
      return;
    }
    if (!userName.trim()) {
      setErrorMessage('予約者名を入力してください。');
      return;
    }
    if (!purpose.trim()) {
      setErrorMessage('利用目的を入力してください。');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await addReservation({
        date: selectedDate,
        timeSlot: selectedSlot,
        user: userName.trim(),
        purpose: purpose.trim()
      });

      if (success) {
        setSuccessMessage('防音室の予約が完了しました！（Googleカレンダーにも登録済み）');
        setPurpose('');
        setSelectedSlot('');
      } else {
        setErrorMessage('その時間はすでに他のユーザーに予約されています。');
      }
    } catch {
      setErrorMessage('予約処理中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (window.confirm('この予約をキャンセルしてもよろしいですか？（Googleカレンダーからも削除されます）')) {
      setIsSubmitting(true);
      try {
        await cancelReservation(id);
        setSuccessMessage('予約をキャンセルしました。（Googleカレンダーからも削除済み）');
      } catch {
        setErrorMessage('キャンセル処理中にエラーが発生しました。');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isSlotReserved = (slot: string) => {
    return dayReservations.find((res) => res.timeSlot === slot);
  };

  const getSlotReserver = (slot: string) => {
    const res = dayReservations.find((res) => res.timeSlot === slot);
    return res ? res.user : '';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">防音室予約</h1>
          <p className="page-subtitle">学術実験や高音質な音声収録用の防音室を予約できます。</p>
        </div>
      </div>

      {/* メインレイアウト */}
      <div className="grid-cols-3" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }}>
        {/* 左カラム：カレンダー選択 */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: '600' }}>
              <CalendarIcon size={18} style={{ color: 'var(--accent-cyan)' }} />
              日付を選択
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={handlePrevMonth}>&lt;</button>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', alignSelf: 'center' }}>
                {currentYearMonth.year}年 {currentYearMonth.month + 1}月
              </span>
              <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} onClick={handleNextMonth}>&gt;</button>
            </div>
          </div>

          <div className="calendar-container">
            {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
              <div key={d} className="calendar-day-header">{d}</div>
            ))}
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} />;
              }

              const formattedMonth = String(currentYearMonth.month + 1).padStart(2, '0');
              const formattedDay = String(day).padStart(2, '0');
              const dateStr = `${currentYearMonth.year}-${formattedMonth}-${formattedDay}`;
              const isSelected = selectedDate === dateStr;
              
              const today = new Date();
              const isToday = 
                today.getFullYear() === currentYearMonth.year && 
                today.getMonth() === currentYearMonth.month && 
                today.getDate() === day;

              return (
                <div
                  key={day}
                  className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => handleDaySelect(day)}
                >
                  {day}
                </div>
              );
            })}
          </div>

          <div className="selected-date-container">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>選択中の日付:</span>
            <div className="selected-date-display">
              {selectedDate}
            </div>
          </div>
        </div>

        {/* 右カラム：タイムスロット選択 ＆ 予約フォーム */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.25rem' }}>
              <Clock size={18} style={{ color: 'var(--accent-blue)' }} />
              {selectedDate} の空き状況と予約申請
            </h3>

            {/* アラートメッセージ */}
            {errorMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                <AlertCircle size={16} />
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                <CheckCircle2 size={16} />
                {successMessage}
              </div>
            )}

            <form onSubmit={handleReserve}>
              <div className="form-group">
                <label className="form-label">利用する時間を選択:</label>
                <div className="time-grid">
                  {TIME_SLOTS.map((slot) => {
                    const reserved = isSlotReserved(slot);
                    const isSelected = selectedSlot === slot;
                    const reserver = getSlotReserver(slot);

                    return (
                      <div
                        key={slot}
                        className={`time-slot ${reserved ? 'reserved' : ''} ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          if (!reserved) {
                            setSelectedSlot(slot);
                            setErrorMessage('');
                          }
                        }}
                      >
                        <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{slot}</div>
                        <div style={{ fontSize: '0.7rem', marginTop: '4px', opacity: 0.8 }}>
                          {reserved ? `予約済 (${reserver})` : '空室'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label" htmlFor="userName">予約者名 *</label>
                <input
                  id="userName"
                  type="text"
                  className="form-input"
                  placeholder="例: 森勢 将雅"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="purpose">利用目的・使用予定の機材等 *</label>
                <input
                  id="purpose"
                  type="text"
                  className="form-input"
                  placeholder="例: 音声合成の学習用データ収録、被験者知覚実験 など"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> 予約を登録中...
                  </>
                ) : (
                  'この条件で予約する（カレンダー自動登録）'
                )}
              </button>
            </form>
          </div>

          {/* すべての予約履歴 */}
          <div className="glass-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.25rem' }}>
              <User size={18} style={{ color: 'var(--accent-indigo)' }} />
              すべての防音室予約一覧
            </h3>

            {allReservations.length === 0 ? (
              <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                予約されている防音室はありません。
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {allReservations.map((res) => (
                  <div key={res.id} className="activity-item">
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {res.date} ({res.timeSlot}) - <span style={{ color: 'var(--accent-cyan)' }}>{res.user}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        目的: {res.purpose}
                      </div>
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => handleCancel(res.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
