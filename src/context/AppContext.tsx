import React, { createContext, useContext, useState, useEffect } from 'react';

// === 型定義 ===

export interface Reservation {
  id: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "09:00-11:00", "11:00-13:00", "13:00-15:00", "15:00-17:00", "17:00-19:00"
  user: string;
  purpose: string;
  eventId?: string; // Googleカレンダーのイベント削除用ID
}

export type EquipmentStatus = 'available' | 'rented' | 'maintenance';

export interface Equipment {
  id: string;
  name: string;
  category: string;
  status: EquipmentStatus;
  currentUser?: string;
  rentalDate?: string;
  returnDate?: string;
  purpose?: string;
}

export type PurchaseStatus = 'delivered' | 'undelivered';

export interface PurchaseRequest {
  id: string;
  name: string;
  genre: string;
  quantity: number;
  url?: string;
  purpose: string;
  status: PurchaseStatus;
  requester: string;
  date: string; // YYYY-MM-DD
}

interface AppContextType {
  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, 'id'>) => Promise<boolean>;
  cancelReservation: (id: string) => Promise<void>;
  equipmentList: Equipment[];
  rentEquipment: (id: string, userName: string, purpose: string, returnDate: string) => void;
  returnEquipment: (id: string) => void;
  purchaseRequests: PurchaseRequest[];
  addPurchaseRequest: (request: Omit<PurchaseRequest, 'id' | 'status' | 'date'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// === 初期データ ===

const DEFAULT_EQUIPMENT: Equipment[] = [
  { id: 'eq-1', name: 'Neumann U87 Ai (高級コンデンサーマイク)', category: '音響機器', status: 'available' },
  { id: 'eq-2', name: 'Sennheiser HD600 (開放型モニターヘッドホン)', category: '音響機器', status: 'rented', currentUser: '鈴木 花子', rentalDate: '2026-05-15', returnDate: '2026-05-22', purpose: '実験用音声データのノイズチェック' },
  { id: 'eq-3', name: 'Audio-Technica ATH-M50x (密閉型ヘッドホン)', category: '音響機器', status: 'available' },
  { id: 'eq-4', name: 'NVIDIA RTX 4090 搭載 Deep Learning用ノートPC', category: 'PC・計算機', status: 'available' },
  { id: 'eq-5', name: 'MacBook Pro M3 Max 16インチ', category: 'PC・計算機', status: 'rented', currentUser: '山田 太郎', rentalDate: '2026-05-10', returnDate: '2026-05-24', purpose: '国際学会(INTERSPEECH)のデモ発表用' },
  { id: 'eq-6', name: 'RME Babyface Pro FS (オーディオインターフェイス)', category: '音響機器', status: 'available' },
  { id: 'eq-7', name: '音声信号処理（オーム社・書籍）', category: '書籍', status: 'available' }
];

const DEFAULT_RESERVATIONS: Reservation[] = [
  { id: 'res-1', date: new Date().toISOString().split('T')[0], timeSlot: '11:00 - 13:00', user: '鈴木 花子', purpose: '知覚実験（被験者3名）' },
  { id: 'res-2', date: new Date().toISOString().split('T')[0], timeSlot: '15:00 - 17:00', user: '山田 太郎', purpose: '音声分析データの収録' }
];


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // 防音室予約
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('morise_reservations');
    return saved ? JSON.parse(saved) : DEFAULT_RESERVATIONS;
  });

  // 物品貸出
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem('morise_equipment');
    return saved ? JSON.parse(saved) : DEFAULT_EQUIPMENT;
  });

  // スプレッドシート（備品管理）から最新の備品リストを初期ロードする
  useEffect(() => {
    const GET_GAS_URL = 'https://script.google.com/macros/s/AKfycbw_xUBtGkL2XBjhO41eJyoHQ8Yj2LLHfSaL6FIadwO94vQI3vn7s7NIH3KBW93yNGSvgQ/exec';
    
    fetch(GET_GAS_URL)
      .then(res => res.json())
      .then(result => {
        if (result.status === 'success' && result.data) {
          // スプレッドシートから取得した最新の備品リストで上書きする
          setEquipmentList(result.data);
          console.log('スプレッドシートから備品リストを取得しました:', result.data);
        }
      })
      .catch(err => console.error('備品リストの取得に失敗しました:', err));
  }, []);

  // 購入申請
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);

  // LocalStorageへの自動保存

  useEffect(() => {
    localStorage.setItem('morise_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('morise_equipment', JSON.stringify(equipmentList));
  }, [equipmentList]);



  // スプレッドシート（ほしいものリスト）から最新の購入申請リストを初期ロードする
  useEffect(() => {
    const PURCHASE_GAS_URL = 'https://script.google.com/macros/s/AKfycbzixz6brVP8B4SEkcljA02oBWmD2P3vqTUzBEYAv4CYwp9gLo5Dy_Sf-BujdEa43BI/exec';
    
    fetch(PURCHASE_GAS_URL)
      .then(res => res.json())
      .then(result => {
        if (result.status === 'success' && result.data) {
          setPurchaseRequests(result.data);
          console.log('スプレッドシートから購入申請リストを取得しました:', result.data);
        }
      })
      .catch(err => console.error('購入申請リストの取得に失敗しました:', err));
  }, []);

  // --- 防音室予約アクション（Googleカレンダー連携版） ---
  const addReservation = async (newRes: Omit<Reservation, 'id'>): Promise<boolean> => {
    // 重複チェック
    const isConflict = reservations.some(
      (res) => res.date === newRes.date && res.timeSlot === newRes.timeSlot
    );

    if (isConflict) {
      return false; // 重複あり
    }

    const GET_GAS_URL = 'https://script.google.com/macros/s/AKfycbw_xUBtGkL2XBjhO41eJyoHQ8Yj2LLHfSaL6FIadwO94vQI3vn7s7NIH3KBW93yNGSvgQ/exec';

    try {
      // GASへ予約リクエストを送信（Googleカレンダーへの登録を含む）
      const response = await fetch(GET_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'reserve',
          data: newRes
        })
      });

      const result = await response.json();

      if (result.status === 'success') {
        // カレンダー登録成功時、eventIdを含めてステートに保存
        const reservationWithId: Reservation = {
          ...newRes,
          id: `res-${Date.now()}`,
          eventId: result.eventId || undefined
        };
        setReservations((prev) => [...prev, reservationWithId]);
        console.log('カレンダー予約登録に成功しました:', result);
        return true;
      } else {
        console.error('GAS側の予約登録エラー:', result.message);
        // GAS側でエラーが発生してもローカルには予約を追加する（フォールバック）
        const reservationWithId: Reservation = {
          ...newRes,
          id: `res-${Date.now()}`
        };
        setReservations((prev) => [...prev, reservationWithId]);
        return true;
      }
    } catch (err) {
      console.error('予約登録通信エラー:', err);
      // 通信エラーでもローカルには予約を追加する（フォールバック）
      const reservationWithId: Reservation = {
        ...newRes,
        id: `res-${Date.now()}`
      };
      setReservations((prev) => [...prev, reservationWithId]);
      return true;
    }
  };

  const cancelReservation = async (id: string): Promise<void> => {
    const targetRes = reservations.find(res => res.id === id);

    // もしGAS/カレンダー登録されたイベントIDがあればカレンダーからも削除
    if (targetRes?.eventId) {
      const GET_GAS_URL = 'https://script.google.com/macros/s/AKfycbw_xUBtGkL2XBjhO41eJyoHQ8Yj2LLHfSaL6FIadwO94vQI3vn7s7NIH3KBW93yNGSvgQ/exec';
      try {
        await fetch(GET_GAS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'cancel_reserve',
            eventId: targetRes.eventId
          })
        });
        console.log('カレンダー予約を削除しました');
      } catch (err) {
        console.error('カレンダー予約削除通信エラー:', err);
      }
    }

    setReservations((prev) => prev.filter((res) => res.id !== id));
  };

  // --- 物品貸出アクション ---
  const rentEquipment = (id: string, userName: string, purpose: string, returnDate: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // 対象の機材情報を取得して名前を特定
    const targetEq = equipmentList.find(eq => eq.id === id);
    const eqName = targetEq ? targetEq.name : '';

    setEquipmentList((prev) =>
      prev.map((eq) => {
        if (eq.id === id) {
          return {
            ...eq,
            status: 'rented',
            currentUser: userName,
            rentalDate: todayStr,
            returnDate,
            purpose
          };
        }
        return eq;
      })
    );

    // スプレッドシート（GAS）へ貸出情報を送信
    const GET_GAS_URL = 'https://script.google.com/macros/s/AKfycbw_xUBtGkL2XBjhO41eJyoHQ8Yj2LLHfSaL6FIadwO94vQI3vn7s7NIH3KBW93yNGSvgQ/exec';
    
    fetch(GET_GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'rent',
        id: id,
        name: eqName, // 機材名またはタイトルを追加
        data: {
          currentUser: userName,
          rentalDate: todayStr,
          returnDate: returnDate,
          purpose: purpose,
          location: '研究室' // デフォルト保管場所
        }
      })
    })
    .then(res => res.json())
    .then(result => console.log('貸出のスプレッドシート記録成功:', result))
    .catch(err => console.error('貸出のスプレッドシート記録エラー:', err));
  };

  const returnEquipment = (id: string) => {
    // 対象の機材情報を取得して名前を特定
    const targetEq = equipmentList.find(eq => eq.id === id);
    const eqName = targetEq ? targetEq.name : '';

    setEquipmentList((prev) =>
      prev.map((eq) => {
        if (eq.id === id) {
          return {
            ...eq,
            status: 'available',
            currentUser: undefined,
            rentalDate: undefined,
            returnDate: undefined,
            purpose: undefined
          };
        }
        return eq;
      })
    );

    // スプレッドシート（GAS）へ返却情報を送信
    const GET_GAS_URL = 'https://script.google.com/macros/s/AKfycbw_xUBtGkL2XBjhO41eJyoHQ8Yj2LLHfSaL6FIadwO94vQI3vn7s7NIH3KBW93yNGSvgQ/exec';
    
    fetch(GET_GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'return',
        id: id,
        name: eqName // 機材名またはタイトルを追加
      })
    })
    .then(res => res.json())
    .then(result => console.log('返却のスプレッドシート記録成功:', result))
    .catch(err => console.error('返却のスプレッドシート記録エラー:', err));
  };

  // --- 購入申請アクション ---
  const addPurchaseRequest = (request: Omit<PurchaseRequest, 'id' | 'status' | 'date'>) => {
    const newReq: PurchaseRequest = {
      ...request,
      id: `pr-${Date.now()}`,
      status: 'undelivered',
      date: new Date().toISOString().split('T')[0]
    };
    setPurchaseRequests((prev) => [newReq, ...prev]);

    // Google Apps Script (スプレッドシート) へデータを送信
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbzixz6brVP8B4SEkcljA02oBWmD2P3vqTUzBEYAv4CYwp9gLo5Dy_Sf-BujdEa43BI/exec';
    
    // CORSプリフライトエラーを回避するため、Content-Typeをtext/plainに設定して送信
    fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        type: 'purchaseRequest',
        data: newReq
      })
    })
    .then(response => response.json())
    .then(result => console.log('スプレッドシートへの記録成功:', result))
    .catch(err => console.error('スプレッドシートへの記録エラー:', err));
  };

  return (
    <AppContext.Provider
      value={{
        reservations,
        addReservation,
        cancelReservation,
        equipmentList,
        rentEquipment,
        returnEquipment,
        purchaseRequests,
        addPurchaseRequest
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
