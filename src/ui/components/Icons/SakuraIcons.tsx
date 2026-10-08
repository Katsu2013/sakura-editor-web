import React from 'react';

export interface IconProps {
  size?: number;
  className?: string;
}

// 16x16 クラシック Win32 サクラエディタ スタイルアイコン集 (高品質ピクセルアート SVG)

// --- ファイル関連 ---

// 新規作成 (白紙に折り目 + 黄色いキラキラ)
export const NewIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <path d="M3 1h6l4 4v10H3V1z" fill="#ffffff" stroke="#333333" strokeWidth="1" />
    <polygon points="9,1 9,5 13,5" fill="#d1d5db" stroke="#333333" strokeWidth="0.8" />
    <polygon points="3,0 4,2 6,3 4,4 3,6 2,4 0,3 2,2" fill="#facc15" stroke="#eab308" strokeWidth="0.5" />
    <line x1="5" y1="7" x2="11" y2="7" stroke="#94a3b8" strokeWidth="1" />
    <line x1="5" y1="9" x2="11" y2="9" stroke="#94a3b8" strokeWidth="1" />
    <line x1="5" y1="11" x2="9" y2="11" stroke="#94a3b8" strokeWidth="1" />
  </svg>
);

// 新規ウインドウを開く
export const NewWinIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="2" width="12" height="11" fill="#f8fafc" stroke="#2563eb" strokeWidth="1" />
    <rect x="2" y="2" width="12" height="3" fill="#2563eb" />
    <rect x="11" y="3" width="2" height="1" fill="#ffffff" />
    <path d="M5 8h6v4H5z" fill="#ffffff" stroke="#64748b" strokeWidth="0.8" />
  </svg>
);

// 開く (黄色いフォルダ + 書類)
export const OpenIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <path d="M2 3h4l2 2h6v2H2V3z" fill="#d97706" stroke="#92400e" strokeWidth="0.8" />
    <rect x="4" y="4" width="7" height="5" fill="#ffffff" stroke="#64748b" strokeWidth="0.5" />
    <path d="M1 13l2.5-6h11.5l-2.5 6H1z" fill="#f59e0b" stroke="#b45309" strokeWidth="0.8" />
  </svg>
);

// 上書き保存 (フロッピーディスク)
export const SaveIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="2" width="12" height="12" rx="1" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
    <rect x="4" y="2" width="8" height="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.5" />
    <rect x="5" y="3" width="2" height="2" fill="#2563eb" />
    <rect x="4" y="8" width="8" height="5" fill="#dbeafe" stroke="#93c5fd" strokeWidth="0.5" />
    <line x1="6" y1="10" x2="10" y2="10" stroke="#3b82f6" strokeWidth="1" />
  </svg>
);

// 名前を付けて保存
export const SaveAsIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1" y="2" width="11" height="11" rx="1" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
    <rect x="3" y="2" width="7" height="4" fill="#ffffff" />
    <polygon points="12,9 16,13 14,13 14,16 10,16 10,13 12,13" fill="#f43f5e" stroke="#be123c" strokeWidth="0.5" />
  </svg>
);

// すべて上書き保存
export const SaveAllIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="4" y="1" width="10" height="10" rx="1" fill="#60a5fa" stroke="#2563eb" strokeWidth="0.8" />
    <rect x="1" y="4" width="10" height="10" rx="1" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.8" />
    <rect x="3" y="4" width="6" height="3" fill="#ffffff" />
    <polygon points="12,10 16,13 14,13 14,16 10,16 10,13 12,13" fill="#22c55e" stroke="#15803d" strokeWidth="0.5" />
  </svg>
);

// 閉じる (書類 + 赤いバツ)
export const CloseIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <path d="M2 2h7l3 3v8H2V2z" fill="#ffffff" stroke="#64748b" strokeWidth="0.8" />
    <line x1="8" y1="8" x2="14" y2="14" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
    <line x1="14" y1="8" x2="8" y2="14" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 印刷
export const PrintIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="4" y="1" width="8" height="4" fill="#ffffff" stroke="#64748b" strokeWidth="0.8" />
    <rect x="2" y="5" width="12" height="6" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
    <circle cx="12" cy="7" r="0.7" fill="#10b981" />
    <rect x="4" y="9" width="8" height="6" fill="#ffffff" stroke="#64748b" strokeWidth="0.8" />
    <line x1="6" y1="11" x2="10" y2="11" stroke="#94a3b8" strokeWidth="0.8" />
    <line x1="6" y1="13" x2="10" y2="13" stroke="#94a3b8" strokeWidth="0.8" />
  </svg>
);

// 印刷プレビュー
export const PrintPrevIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="1" width="8" height="11" fill="#ffffff" stroke="#64748b" strokeWidth="0.8" />
    <ellipse cx="10" cy="10" rx="3.5" ry="3.5" fill="#bae6fd" stroke="#0284c7" strokeWidth="1" />
    <line x1="12.5" y1="12.5" x2="15.5" y2="15.5" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// プロパティ
export const PropertyIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="1" width="10" height="12" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />
    <line x1="4" y1="4" x2="10" y2="4" stroke="#3b82f6" strokeWidth="1" />
    <line x1="4" y1="7" x2="10" y2="7" stroke="#3b82f6" strokeWidth="1" />
    <line x1="4" y1="10" x2="8" y2="10" stroke="#3b82f6" strokeWidth="1" />
    <circle cx="11.5" cy="11.5" r="3" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
    <text x="10.5" y="13.5" fontSize="5" fontWeight="bold" fill="#000">i</text>
  </svg>
);

// ブラウズ
export const BrowseIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <circle cx="8" cy="8" r="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
    <ellipse cx="8" cy="8" rx="2.5" ry="6" fill="none" stroke="#ffffff" strokeWidth="0.8" />
    <line x1="2" y1="8" x2="14" y2="8" stroke="#ffffff" strokeWidth="0.8" />
  </svg>
);

// 全終了 (桜の花びら + 赤いX)
export const ExitAppIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <circle cx="6" cy="6" r="4.5" fill="#fbcfe8" stroke="#f43f5e" strokeWidth="0.8" />
    <polygon points="6,2 7,5 10,6 7,7 6,10 5,7 2,6 5,5" fill="#fda4af" />
    <line x1="8" y1="8" x2="15" y2="15" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
    <line x1="15" y1="8" x2="8" y2="15" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// --- 編集関連 ---

// 元に戻す (Undo: 左曲がり青矢印)
export const UndoIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <path d="M6 3L1.5 7.5l4.5 4.5V9c4 0 7 1 8.5 5-0.5-5.5-3.5-8-8.5-8V3z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.5" />
  </svg>
);

// やり直し (Redo: 右曲がり青矢印)
export const RedoIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <path d="M10 3l4.5 4.5L10 12V9c-4 0-7 1-8.5 5 0.5-5.5 3.5-8 8.5-8V3z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.5" />
  </svg>
);

// 切り取り (赤/シルバーハサミ)
export const CutIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <circle cx="5" cy="12" r="2.2" fill="none" stroke="#ef4444" strokeWidth="1.5" />
    <circle cx="11" cy="12" r="2.2" fill="none" stroke="#ef4444" strokeWidth="1.5" />
    <line x1="6.5" y1="10.5" x2="12" y2="3" stroke="#475569" strokeWidth="1.6" />
    <line x1="9.5" y1="10.5" x2="4" y2="3" stroke="#475569" strokeWidth="1.6" />
    <circle cx="8" cy="7.5" r="1" fill="#f8fafc" stroke="#334155" strokeWidth="0.5" />
  </svg>
);

// コピー (2枚の書類)
export const CopyIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="5" y="2" width="9" height="10" rx="1" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" />
    <rect x="2" y="5" width="9" height="10" rx="1" fill="#ffffff" stroke="#2563eb" strokeWidth="1" />
    <line x1="4" y1="8" x2="9" y2="8" stroke="#94a3b8" strokeWidth="1" />
    <line x1="4" y1="10" x2="9" y2="10" stroke="#94a3b8" strokeWidth="1" />
    <line x1="4" y1="12" x2="7" y2="12" stroke="#94a3b8" strokeWidth="1" />
  </svg>
);

// 貼り付け (クリップボード + 用紙)
export const PasteIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="3" y="3" width="10" height="11" rx="1" fill="#d97706" stroke="#92400e" strokeWidth="0.8" />
    <rect x="6" y="1" width="4" height="3" rx="0.5" fill="#fcd34d" stroke="#b45309" strokeWidth="0.5" />
    <rect x="5" y="5" width="8" height="9" fill="#ffffff" stroke="#64748b" strokeWidth="0.8" />
    <line x1="7" y1="8" x2="11" y2="8" stroke="#cbd5e1" strokeWidth="1" />
    <line x1="7" y1="10" x2="11" y2="10" stroke="#cbd5e1" strokeWidth="1" />
  </svg>
);

// 削除 (赤いバツ)
export const DeleteIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <line x1="3.5" y1="3.5" x2="12.5" y2="12.5" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="12.5" y1="3.5" x2="3.5" y2="12.5" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// すべて選択 (全選択グリーン用紙)
export const SelectAllIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="2" width="12" height="12" fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />
    <line x1="4" y1="5" x2="12" y2="5" stroke="#15803d" strokeWidth="1.2" />
    <line x1="4" y1="8" x2="12" y2="8" stroke="#15803d" strokeWidth="1.2" />
    <line x1="4" y1="11" x2="9" y2="11" stroke="#15803d" strokeWidth="1.2" />
  </svg>
);

// 再変換
export const ReconvertIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1" y="2" width="14" height="12" rx="1" fill="#f8fafc" stroke="#475569" strokeWidth="0.8" />
    <text x="3" y="11" fontSize="9" fontWeight="bold" fill="#2563eb">再</text>
  </svg>
);

// --- 検索関連 (双眼鏡シリーズ) ---

// 検索 (双眼鏡: 真正サクラエディタ仕様)
export const FindIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    {/* 左筒 */}
    <rect x="2" y="5" width="4.5" height="7" rx="1.5" fill="#475569" stroke="#1e293b" strokeWidth="0.8" />
    {/* 右筒 */}
    <rect x="9.5" y="5" width="4.5" height="7" rx="1.5" fill="#475569" stroke="#1e293b" strokeWidth="0.8" />
    {/* 接眼レンズ */}
    <rect x="3" y="3" width="2.5" height="2" rx="0.5" fill="#1e293b" />
    <rect x="10.5" y="3" width="2.5" height="2" rx="0.5" fill="#1e293b" />
    {/* 中央ブリッジ */}
    <rect x="6.5" y="7" width="3" height="2" fill="#64748b" />
    <circle cx="8" cy="8" r="1.2" fill="#cbd5e1" stroke="#334155" strokeWidth="0.5" />
    {/* 対物レンズの反射 (水色) */}
    <ellipse cx="4.25" cy="11" rx="1.5" ry="0.8" fill="#38bdf8" />
    <ellipse cx="11.75" cy="11" rx="1.5" ry="0.8" fill="#38bdf8" />
  </svg>
);

// 次を検索 (双眼鏡 + 右/下緑矢印)
export const FindNextIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1.5" y="4" width="3.5" height="6" rx="1" fill="#475569" stroke="#1e293b" strokeWidth="0.5" />
    <rect x="7" y="4" width="3.5" height="6" rx="1" fill="#475569" stroke="#1e293b" strokeWidth="0.5" />
    <rect x="5" y="6" width="2" height="1.5" fill="#64748b" />
    {/* 次へ緑矢印 */}
    <polygon points="12,7 16,10 12,13 12,11 9,11 9,9 12,9" fill="#16a34a" stroke="#14532d" strokeWidth="0.5" />
  </svg>
);

// 前を検索 (双眼鏡 + 左/上緑矢印)
export const FindPrevIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="5.5" y="4" width="3.5" height="6" rx="1" fill="#475569" stroke="#1e293b" strokeWidth="0.5" />
    <rect x="11" y="4" width="3.5" height="6" rx="1" fill="#475569" stroke="#1e293b" strokeWidth="0.5" />
    <rect x="9" y="6" width="2" height="1.5" fill="#64748b" />
    {/* 前へ緑矢印 */}
    <polygon points="4,7 0,10 4,13 4,11 7,11 7,9 4,9" fill="#16a34a" stroke="#14532d" strokeWidth="0.5" />
  </svg>
);

// 置換 (双眼鏡 + 赤いR->P文字)
export const ReplaceIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1" y="5" width="4" height="6" rx="1" fill="#64748b" stroke="#334155" strokeWidth="0.5" />
    <rect x="7" y="5" width="4" height="6" rx="1" fill="#64748b" stroke="#334155" strokeWidth="0.5" />
    <rect x="5" y="7" width="2" height="1.5" fill="#94a3b8" />
    {/* R→P バッジ */}
    <rect x="7" y="1" width="9" height="6" rx="1" fill="#fee2e2" stroke="#ef4444" strokeWidth="0.6" />
    <text x="8" y="6" fontSize="5" fontWeight="bold" fill="#b91c1c">R-P</text>
  </svg>
);

// 検索マークの切替え (双眼鏡 + 赤いX)
export const SearchMarkIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1.5" y="5" width="4" height="6" rx="1" fill="#64748b" stroke="#334155" strokeWidth="0.5" />
    <rect x="7.5" y="5" width="4" height="6" rx="1" fill="#64748b" stroke="#334155" strokeWidth="0.5" />
    <rect x="5.5" y="7" width="2" height="1.5" fill="#94a3b8" />
    {/* 赤いバツ印 */}
    <line x1="10" y1="2" x2="15" y2="7" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
    <line x1="15" y1="2" x2="10" y2="7" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Grep (黄色いフォルダ + 双眼鏡)
export const GrepIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    {/* フォルダ */}
    <path d="M1 3h4l2 2h7v3H1V3z" fill="#f59e0b" stroke="#b45309" strokeWidth="0.5" />
    <rect x="1" y="6" width="11" height="8" rx="1" fill="#fde047" stroke="#b45309" strokeWidth="0.5" />
    {/* 双眼鏡 */}
    <rect x="6" y="8" width="3.5" height="5.5" rx="1" fill="#334155" stroke="#0f172a" strokeWidth="0.5" />
    <rect x="11" y="8" width="3.5" height="5.5" rx="1" fill="#334155" stroke="#0f172a" strokeWidth="0.5" />
    <rect x="9.5" y="10" width="1.5" height="1.5" fill="#64748b" />
    <ellipse cx="7.75" cy="12.5" rx="1" ry="0.6" fill="#38bdf8" />
    <ellipse cx="12.75" cy="12.5" rx="1" ry="0.6" fill="#38bdf8" />
  </svg>
);

// Grep置換 (フォルダ + 双眼鏡 + 鉛筆/矢印)
export const GrepReplaceIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <path d="M1 3h4l2 2h7v3H1V3z" fill="#f59e0b" stroke="#b45309" strokeWidth="0.5" />
    <rect x="1" y="6" width="10" height="8" rx="1" fill="#fde047" stroke="#b45309" strokeWidth="0.5" />
    <rect x="6" y="8" width="3" height="5" rx="0.8" fill="#334155" />
    <rect x="10.5" y="8" width="3" height="5" rx="0.8" fill="#334155" />
    <line x1="8" y1="3" x2="15" y2="10" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// ブックマーク (青丸)
export const BookmarkIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <circle cx="8" cy="8" r="5" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
  </svg>
);

// 次のブックマーク
export const BmNextIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <circle cx="5" cy="8" r="3.5" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.5" />
    <polygon points="11,5 15,9 11,13 11,10 9,10 9,8 11,8" fill="#16a34a" stroke="#14532d" strokeWidth="0.5" />
  </svg>
);

// 前のブックマーク
export const BmPrevIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <circle cx="11" cy="8" r="3.5" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.5" />
    <polygon points="5,5 1,9 5,13 5,10 7,10 7,8 5,8" fill="#16a34a" stroke="#14532d" strokeWidth="0.5" />
  </svg>
);

// 全ブックマーク解除
export const BmClearIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <circle cx="8" cy="8" r="5" fill="#94a3b8" stroke="#475569" strokeWidth="0.8" />
    <line x1="5" y1="5" x2="11" y2="11" stroke="#dc2626" strokeWidth="1.8" />
    <line x1="11" y1="5" x2="5" y2="11" stroke="#dc2626" strokeWidth="1.8" />
  </svg>
);

// 指定行へジャンプ (書類 + ターゲット矢印)
export const JumpIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="2" width="9" height="12" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />
    <line x1="4" y1="5" x2="9" y2="5" stroke="#94a3b8" strokeWidth="1" />
    <line x1="4" y1="8" x2="9" y2="8" stroke="#94a3b8" strokeWidth="1" />
    <polygon points="12,10 16,13 14,13 14,16 10,16 10,13 12,13" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.5" transform="rotate(-45 13 13)" />
  </svg>
);

// アウトライン解析 (青ルート、緑・橙分岐のツリー構造)
export const OutlineIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="2" width="4" height="3" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="0.5" />
    <line x1="4" y1="5" x2="4" y2="13" stroke="#64748b" strokeWidth="1.2" />
    <line x1="4" y1="8" x2="8" y2="8" stroke="#64748b" strokeWidth="1.2" />
    <rect x="8" y="6.5" width="5" height="3" fill="#10b981" stroke="#047857" strokeWidth="0.5" />
    <line x1="4" y1="12" x2="8" y2="12" stroke="#64748b" strokeWidth="1.2" />
    <rect x="8" y="10.5" width="5" height="3" fill="#f59e0b" stroke="#b45309" strokeWidth="0.5" />
  </svg>
);

// ファイルツリー
export const FileTreeIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <path d="M1 2h4l1.5 1.5H10v3H1V2z" fill="#f59e0b" stroke="#b45309" strokeWidth="0.5" />
    <line x1="3" y1="6" x2="3" y2="14" stroke="#64748b" strokeWidth="1" />
    <line x1="3" y1="10" x2="6" y2="10" stroke="#64748b" strokeWidth="1" />
    <rect x="6" y="9" width="7" height="3" fill="#ffffff" stroke="#475569" strokeWidth="0.5" />
    <line x1="3" y1="13" x2="6" y2="13" stroke="#64748b" strokeWidth="1" />
    <rect x="6" y="12" width="7" height="3" fill="#ffffff" stroke="#475569" strokeWidth="0.5" />
  </svg>
);

// ファイル内容比較 (Diff)
export const DiffIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1" y="2" width="6" height="12" fill="#dbeafe" stroke="#3b82f6" strokeWidth="0.8" />
    <rect x="9" y="2" width="6" height="12" fill="#fee2e2" stroke="#ef4444" strokeWidth="0.8" />
    <line x1="2.5" y1="5" x2="5.5" y2="5" stroke="#2563eb" strokeWidth="1" />
    <line x1="10.5" y1="7" x2="13.5" y2="7" stroke="#dc2626" strokeWidth="1" />
  </svg>
);

// 対括弧の強調 & 検索 ([{}])
export const BracketMatchIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <text x="1" y="13" fontFamily="Consolas, monospace" fontSize="13" fontWeight="bold" fill="#0284c7">&#123;&#125;</text>
  </svg>
);

// --- 設定関連 ---

// タイプ別設定一覧 (書類スタック)
export const TypeListIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="4" y="1" width="9" height="10" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.8" />
    <rect x="2" y="3" width="9" height="10" fill="#ffffff" stroke="#334155" strokeWidth="0.8" />
    <line x1="4" y1="6" x2="9" y2="6" stroke="#0284c7" strokeWidth="1" />
    <line x1="4" y1="8" x2="9" y2="8" stroke="#0284c7" strokeWidth="1" />
  </svg>
);

// タイプ別設定 (書類 + ギア / ペン)
export const TypeSettingsIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <path d="M2 1h7l4 4v10H2V1z" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />
    <circle cx="10" cy="10" r="3.5" fill="#6366f1" stroke="#3730a3" strokeWidth="0.5" />
    <path d="M10 8v4M8 10h4" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// 共通設定 (交差したスパナとドライバー / 工具箱)
export const CommonSettingsIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    {/* ドライバー */}
    <line x1="3" y1="13" x2="11" y2="5" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    <line x1="11" y1="5" x2="14" y2="2" stroke="#64748b" strokeWidth="1.5" />
    {/* スパナ */}
    <line x1="13" y1="13" x2="5" y2="5" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="4" cy="4" r="2" fill="none" stroke="#475569" strokeWidth="1.2" />
  </svg>
);

// フォント (A a)
export const FontIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <text x="1" y="13" fontFamily="Segoe UI, sans-serif" fontSize="13" fontWeight="bold" fill="#2563eb">A</text>
    <text x="9" y="14" fontFamily="Segoe UI, sans-serif" fontSize="10" fontWeight="bold" fill="#dc2626">a</text>
  </svg>
);

// 設定エクスポート / インポート
export const ExportIniIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="2" width="12" height="12" rx="1" fill="#f8fafc" stroke="#475569" strokeWidth="0.8" />
    <polygon points="8,4 12,8 9,8 9,12 7,12 7,8 4,8" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.5" />
  </svg>
);

export const ImportIniIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="2" width="12" height="12" rx="1" fill="#f8fafc" stroke="#475569" strokeWidth="0.8" />
    <polygon points="8,12 12,8 9,8 9,4 7,4 7,8 4,8" fill="#16a34a" stroke="#15803d" strokeWidth="0.5" />
  </svg>
);

// ウィンドウ分割 (4分割ウィンドウ)
export const WindowSplitIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="2" width="12" height="12" rx="1" fill="#ffffff" stroke="#334155" strokeWidth="1" />
    <line x1="8" y1="2" x2="8" y2="14" stroke="#2563eb" strokeWidth="1.5" />
    <line x1="2" y1="8" x2="14" y2="8" stroke="#2563eb" strokeWidth="1.5" />
  </svg>
);

// --- マクロ関連 ---

export const MacroRecIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <circle cx="8" cy="8" r="5" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
  </svg>
);

export const MacroPlayIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <polygon points="5,3 13,8 5,13" fill="#16a34a" stroke="#15803d" strokeWidth="1" />
  </svg>
);

// ヘルプ / About
export const AboutIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>🌸</span>
);

// --- ツールバー・メニュー用追加アイコン (真正サクラエディタ仕様) ---

// 行インデント (右インデント: 水平線 + 右向き緑矢印)
export const IndentRightIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <line x1="2" y1="3" x2="9" y2="3" stroke="#64748b" strokeWidth="1.2" />
    <line x1="2" y1="6" x2="7" y2="6" stroke="#64748b" strokeWidth="1.2" />
    <line x1="2" y1="9" x2="9" y2="9" stroke="#64748b" strokeWidth="1.2" />
    <line x1="2" y1="12" x2="7" y2="12" stroke="#64748b" strokeWidth="1.2" />
    <polygon points="10,4 15,8 10,12 10,10 7,10 7,6 10,6" fill="#16a34a" stroke="#15803d" strokeWidth="0.5" />
  </svg>
);

// 行逆インデント (左インデント: 水平線 + 左向き緑矢印)
export const IndentLeftIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <line x1="7" y1="3" x2="14" y2="3" stroke="#64748b" strokeWidth="1.2" />
    <line x1="9" y1="6" x2="14" y2="6" stroke="#64748b" strokeWidth="1.2" />
    <line x1="7" y1="9" x2="14" y2="9" stroke="#64748b" strokeWidth="1.2" />
    <line x1="9" y1="12" x2="14" y2="12" stroke="#64748b" strokeWidth="1.2" />
    <polygon points="6,4 1,8 6,12 6,10 9,10 9,6 6,6" fill="#16a34a" stroke="#15803d" strokeWidth="0.5" />
  </svg>
);

// 保存して閉じる (フロッピー + 終了矢印)
export const SaveCloseIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1" y="2" width="10" height="10" rx="1" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.8" />
    <rect x="3" y="2" width="6" height="3" fill="#ffffff" />
    <polygon points="11,8 15,11 11,14 11,12 8,12 8,10 11,10" fill="#dc2626" stroke="#b91c1c" strokeWidth="0.5" />
  </svg>
);

// 閉じて(無題)
export const CloseUntitledIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <path d="M2 1h6l3 3v10H2V1z" fill="#ffffff" stroke="#64748b" strokeWidth="0.8" />
    <line x1="8" y1="8" x2="14" y2="14" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
    <line x1="14" y1="8" x2="8" y2="14" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 閉じて開く
export const CloseOpenIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <path d="M1 3h4l2 2h7v3H1V3z" fill="#d97706" stroke="#92400e" strokeWidth="0.8" />
    <polygon points="10,8 15,11 10,14 10,12 7,12 7,10 10,10" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.5" />
  </svg>
);

// 印刷ページ設定
export const PrintSetupIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="3" width="12" height="10" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />
    <rect x="4" y="1" width="8" height="4" fill="#cbd5e1" stroke="#475569" strokeWidth="0.5" />
    <line x1="4" y1="6" x2="12" y2="6" stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="1,1" />
    <line x1="4" y1="10" x2="12" y2="10" stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="1,1" />
  </svg>
);

// グループを閉じる
export const GroupCloseIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1" y="4" width="9" height="9" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" />
    <rect x="4" y="1" width="9" height="9" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" />
    <line x1="8" y1="8" x2="15" y2="15" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
    <line x1="15" y1="8" x2="8" y2="15" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 編集の全終了
export const ExitAllEditIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1" y="2" width="7" height="10" fill="#ffffff" stroke="#64748b" strokeWidth="0.6" />
    <rect x="5" y="4" width="7" height="10" fill="#ffffff" stroke="#64748b" strokeWidth="0.6" />
    <line x1="8" y1="8" x2="15" y2="15" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
    <line x1="15" y1="8" x2="8" y2="15" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// サクラエディタの全終了 (桜の花びら + X)
export const SakuraExitIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <circle cx="6" cy="6" r="5" fill="#fce7f3" stroke="#f43f5e" strokeWidth="0.8" />
    <polygon points="6,2 7,5 10,6 7,7 6,10 5,7 2,6 5,5" fill="#fb7185" />
    <line x1="8" y1="8" x2="15" y2="15" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="15" y1="8" x2="8" y2="15" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// サクラエディタ アプリケーションアイコン (タイトルバー / タスクバー用)
export const SakuraAppIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <path d="M2 1h7l4 4v10H2V1z" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />
    <polygon points="9,1 9,5 13,5" fill="#cbd5e1" stroke="#475569" strokeWidth="0.6" />
    <circle cx="7.5" cy="8.5" r="4" fill="#fdf2f8" stroke="#f472b6" strokeWidth="0.5" />
    <polygon points="7.5,5 8.5,7.5 11,8.5 8.5,9.5 7.5,12 6.5,9.5 4,8.5 6.5,7.5" fill="#ec4899" />
    <circle cx="7.5" cy="8.5" r="1.2" fill="#fde047" />
  </svg>
);

// CRLF改行でコピー
export const CopyCrlfIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="2" width="8" height="10" fill="#ffffff" stroke="#2563eb" strokeWidth="0.8" />
    <path d="M14 6v5H8m2-2l-2 2 2 2" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 折り返し位置に改行をつけてコピー
export const CopyWrapIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="2" width="8" height="10" fill="#ffffff" stroke="#2563eb" strokeWidth="0.8" />
    <path d="M8 8h5a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H9m2-2l-2 2 2 2" fill="none" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 矩形貼り付け
export const BoxPasteIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="2" width="12" height="12" fill="none" stroke="#3b82f6" strokeWidth="1.2" strokeDasharray="2,2" />
    <rect x="5" y="4" width="7" height="8" fill="#fde047" stroke="#b45309" strokeWidth="0.6" />
  </svg>
);

// カーソル前を削除 (BkSp)
export const BkSpDeleteIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <path d="M6 3L1 8l5 5h9V3H6z" fill="#fee2e2" stroke="#dc2626" strokeWidth="0.8" />
    <line x1="7" y1="6" x2="12" y2="10" stroke="#dc2626" strokeWidth="1.5" />
    <line x1="12" y1="6" x2="7" y2="10" stroke="#dc2626" strokeWidth="1.5" />
  </svg>
);

// --- 変換メニュー用アイコン ---

export const ToLowerIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <text x="2" y="12" fontFamily="Segoe UI, sans-serif" fontSize="12" fontWeight="bold" fill="#2563eb">a</text>
    <polygon points="11,6 14,9 8,9" fill="#16a34a" transform="rotate(180 11 8)" />
  </svg>
);

export const ToUpperIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <text x="1" y="13" fontFamily="Segoe UI, sans-serif" fontSize="13" fontWeight="bold" fill="#2563eb">A</text>
    <polygon points="12,4 15,7 9,7" fill="#16a34a" />
  </svg>
);

export const ZenToHanIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1" y="2" width="6" height="12" fill="#dbeafe" stroke="#2563eb" strokeWidth="0.8" />
    <line x1="8" y1="8" x2="11" y2="8" stroke="#16a34a" strokeWidth="1.5" />
    <polygon points="12,8 10,6 10,10" fill="#16a34a" />
    <rect x="13" y="2" width="2" height="12" fill="#2563eb" />
  </svg>
);

export const ToZenKanaIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <text x="2" y="12" fontFamily="MS UI Gothic, sans-serif" fontSize="12" fontWeight="bold" fill="#2563eb">カ</text>
  </svg>
);

export const ToZenHiraIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <text x="2" y="12" fontFamily="MS UI Gothic, sans-serif" fontSize="12" fontWeight="bold" fill="#16a34a">ひ</text>
  </svg>
);

export const ZenAlnumToHanIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <text x="1" y="12" fontFamily="Segoe UI, sans-serif" fontSize="10" fontWeight="bold" fill="#475569">全A</text>
  </svg>
);

export const HanAlnumToZenIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <text x="1" y="12" fontFamily="Segoe UI, sans-serif" fontSize="10" fontWeight="bold" fill="#2563eb">半A</text>
  </svg>
);

export const ZenKataToHanIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <text x="1" y="11" fontFamily="MS UI Gothic, sans-serif" fontSize="9" fontWeight="bold" fill="#d97706">カｶ</text>
  </svg>
);

export const HanKataToZenIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <text x="1" y="11" fontFamily="MS UI Gothic, sans-serif" fontSize="9" fontWeight="bold" fill="#2563eb">ｶカ</text>
  </svg>
);

export const HanKataToZenHiraIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <text x="1" y="11" fontFamily="MS UI Gothic, sans-serif" fontSize="9" fontWeight="bold" fill="#16a34a">ｶひ</text>
  </svg>
);

export const TabToSpaceIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <line x1="1" y1="8" x2="6" y2="8" stroke="#3b82f6" strokeWidth="1.2" />
    <polyline points="4,6 6,8 4,10" fill="none" stroke="#3b82f6" strokeWidth="1.2" />
    <circle cx="9" cy="8" r="1" fill="#16a34a" />
    <circle cx="12" cy="8" r="1" fill="#16a34a" />
    <circle cx="15" cy="8" r="1" fill="#16a34a" />
  </svg>
);

export const SpaceToTabIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <circle cx="2" cy="8" r="1" fill="#16a34a" />
    <circle cx="5" cy="8" r="1" fill="#16a34a" />
    <line x1="8" y1="8" x2="14" y2="8" stroke="#3b82f6" strokeWidth="1.2" />
    <polyline points="12,6 14,8 12,10" fill="none" stroke="#3b82f6" strokeWidth="1.2" />
  </svg>
);

// --- 検索メニュー用アイコン ---

export const ReturnSearchOriginIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="5" width="4" height="6" rx="1" fill="#64748b" stroke="#334155" strokeWidth="0.5" />
    <rect x="8" y="5" width="4" height="6" rx="1" fill="#64748b" stroke="#334155" strokeWidth="0.5" />
    <path d="M14 4A5 5 0 0 0 6 7l-2-1v5h5l-2-2a3 3 0 0 1 5-2z" fill="#2563eb" />
  </svg>
);

export const TagJumpIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <path d="M2 1h6l4 4v9H2V1z" fill="#ffffff" stroke="#64748b" strokeWidth="0.8" />
    <polygon points="8,7 13,10 8,13 8,11 5,11 5,9 8,9" fill="#16a34a" stroke="#15803d" strokeWidth="0.5" />
  </svg>
);

export const TagJumpBackIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <path d="M2 1h6l4 4v9H2V1z" fill="#ffffff" stroke="#64748b" strokeWidth="0.8" />
    <polygon points="7,7 2,10 7,13 7,11 10,11 10,9 7,9" fill="#2563eb" stroke="#1d4ed8" strokeWidth="0.5" />
  </svg>
);

export const TagCreateIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1" y="3" width="9" height="11" fill="#ffffff" stroke="#64748b" strokeWidth="0.8" />
    <polygon points="12,1 15,4 9,10 6,10 6,7" fill="#f59e0b" stroke="#b45309" strokeWidth="0.6" />
  </svg>
);

export const HeaderSourceIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1" y="2" width="6" height="8" fill="#dbeafe" stroke="#2563eb" strokeWidth="0.6" />
    <text x="2" y="8" fontSize="6" fontWeight="bold" fill="#1e40af">.h</text>
    <rect x="9" y="6" width="6" height="8" fill="#dcfce7" stroke="#16a34a" strokeWidth="0.6" />
    <text x="9.5" y="12" fontSize="5" fontWeight="bold" fill="#166534">.c</text>
  </svg>
);

export const DiffNextIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="2" width="12" height="12" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.8" />
    <polygon points="8,13 4,8 7,8 7,4 9,4 9,8 12,8" fill="#2563eb" />
  </svg>
);

export const DiffPrevIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="2" width="12" height="12" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.8" />
    <polygon points="8,3 4,8 7,8 7,12 9,12 9,8 12,8" fill="#2563eb" />
  </svg>
);

export const DiffClearIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="2" width="12" height="12" fill="#f1f5f9" stroke="#64748b" strokeWidth="0.8" />
    <line x1="4" y1="4" x2="12" y2="12" stroke="#dc2626" strokeWidth="2" />
    <line x1="12" y1="4" x2="4" y2="12" stroke="#dc2626" strokeWidth="2" />
  </svg>
);

export const WordCompleteIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="2" width="12" height="12" rx="1" fill="#f8fafc" stroke="#2563eb" strokeWidth="0.8" />
    <text x="3" y="11" fontSize="9" fontWeight="bold" fill="#1e3a8a" fontFamily="monospace">Ab</text>
    <polygon points="11,9 14,9 12.5,12" fill="#2563eb" />
  </svg>
);

export const CommandListIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="1" width="12" height="14" rx="1" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />
    <line x1="4" y1="4" x2="12" y2="4" stroke="#2563eb" strokeWidth="1.2" />
    <line x1="4" y1="7" x2="12" y2="7" stroke="#64748b" strokeWidth="1" />
    <line x1="4" y1="10" x2="12" y2="10" stroke="#64748b" strokeWidth="1" />
    <line x1="4" y1="13" x2="9" y2="13" stroke="#64748b" strokeWidth="1" />
  </svg>
);

export const IncSearchIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <circle cx="6" cy="6" r="4.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
    <line x1="9.5" y1="9.5" x2="14" y2="14" stroke="#713f12" strokeWidth="1.8" strokeLinecap="round" />
    <polyline points="4,6 6,4 8,6" fill="none" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SplitQuadIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1" y="1" width="14" height="14" fill="#f8fafc" stroke="#475569" strokeWidth="1" />
    <line x1="8" y1="1" x2="8" y2="15" stroke="#2563eb" strokeWidth="1.5" />
    <line x1="1" y1="8" x2="15" y2="8" stroke="#2563eb" strokeWidth="1.5" />
  </svg>
);

// --- 設定(O) メニュー専用アイコン群 (サクラエディタ 2.4.3 準拠) ---

// ファンクションキー (F1 / F12 キートップ)
export const FnKeyIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1" y="1" width="14" height="6" rx="1" fill="#f1f5f9" stroke="#334155" strokeWidth="0.8" />
    <text x="2" y="5.8" fontSize="4.2" fontWeight="bold" fill="#0f172a" fontFamily="sans-serif">F1</text>
    <line x1="8" y1="2" x2="8" y2="6" stroke="#94a3b8" strokeWidth="0.6" />
    <text x="9.2" y="5.8" fontSize="4" fontWeight="bold" fill="#475569" fontFamily="sans-serif">F6</text>
    <rect x="1" y="8" width="14" height="6" rx="1" fill="#f1f5f9" stroke="#334155" strokeWidth="0.8" />
    <text x="1.5" y="12.8" fontSize="4.2" fontWeight="bold" fill="#0f172a" fontFamily="sans-serif">F7</text>
    <line x1="7.8" y1="9" x2="7.8" y2="13" stroke="#94a3b8" strokeWidth="0.6" />
    <text x="8.5" y="12.8" fontSize="3.8" fontWeight="bold" fill="#2563eb" fontFamily="sans-serif">F12</text>
  </svg>
);

// ミニマップ (ウィンドウ右側の概要マップバー)
export const MiniMapIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1" y="2" width="14" height="12" fill="#ffffff" stroke="#334155" strokeWidth="0.8" />
    <rect x="1" y="2" width="14" height="2.5" fill="#2563eb" />
    <line x1="3" y1="6.5" x2="8.5" y2="6.5" stroke="#94a3b8" strokeWidth="0.8" />
    <line x1="3" y1="8.5" x2="7.5" y2="8.5" stroke="#94a3b8" strokeWidth="0.8" />
    <line x1="3" y1="10.5" x2="8.5" y2="10.5" stroke="#94a3b8" strokeWidth="0.8" />
    <rect x="10" y="4.5" width="5" height="9.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.5" />
    <rect x="10.5" y="7" width="4" height="3" fill="#93c5fd" stroke="#2563eb" strokeWidth="0.6" />
  </svg>
);

// 履歴の管理 (書類 + 赤いチェックマーク)
export const HistoryIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <path d="M2 1h7l4 4v10H2V1z" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />
    <polygon points="9,1 9,5 13,5" fill="#d1d5db" stroke="#475569" strokeWidth="0.6" />
    <line x1="4" y1="6" x2="8" y2="6" stroke="#94a3b8" strokeWidth="0.8" />
    <line x1="4" y1="8" x2="11" y2="8" stroke="#94a3b8" strokeWidth="0.8" />
    <polyline points="4,10 7,13 14,5" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 指定桁で折り返す (指定桁ガイド線 + 折り返し矢印)
export const WrapColIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1" y="2" width="14" height="12" rx="1" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />
    <line x1="9" y1="2" x2="9" y2="14" stroke="#dc2626" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
    <path d="M3 5h5a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4" fill="none" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="5.5,7.5 3.5,9 5.5,10.5" fill="none" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 右端で折り返す (右端ガイド線 + 折り返し矢印)
export const WrapRightIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1" y="2" width="14" height="12" rx="1" fill="#ffffff" stroke="#475569" strokeWidth="0.8" />
    <line x1="13.5" y1="2" x2="13.5" y2="14" stroke="#2563eb" strokeWidth="1.5" />
    <path d="M3 5h9a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4" fill="none" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="5.5,7.5 3.5,9 5.5,10.5" fill="none" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 折り返し桁数 (桁幅アイコン)
export const WrapLengthIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1" y="2" width="14" height="12" rx="1" fill="#f8fafc" stroke="#475569" strokeWidth="0.8" />
    <line x1="2" y1="4" x2="2" y2="12" stroke="#2563eb" strokeWidth="1" />
    <line x1="14" y1="4" x2="14" y2="12" stroke="#2563eb" strokeWidth="1" />
    <line x1="3" y1="8" x2="13" y2="8" stroke="#2563eb" strokeWidth="1.2" />
    <polygon points="3,8 5.5,6 5.5,10" fill="#2563eb" />
    <polygon points="13,8 10.5,6 10.5,10" fill="#2563eb" />
  </svg>
);

// 文字カウント方法 (BYTE バッジ)
export const CharCountIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1" y="3" width="14" height="10" rx="1.5" fill="#f8fafc" stroke="#334155" strokeWidth="0.8" />
    <text x="1.6" y="10.2" fontSize="5.2" fontWeight="900" fill="#0f172a" fontFamily="sans-serif" letterSpacing="-0.3px">BYTE</text>
  </svg>
);

// ビューモード (書類 + 赤メガネ)
export const ViewModeIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="2" y="1" width="12" height="14" rx="1" fill="#ffffff" stroke="#64748b" strokeWidth="0.8" />
    <line x1="4" y1="4" x2="12" y2="4" stroke="#cbd5e1" strokeWidth="0.8" />
    {/* 赤いメガネ */}
    <circle cx="5.5" cy="9.5" r="2.4" fill="#eff6ff" stroke="#dc2626" strokeWidth="1.1" />
    <circle cx="10.5" cy="9.5" r="2.4" fill="#eff6ff" stroke="#dc2626" strokeWidth="1.1" />
    <line x1="7.9" y1="9.5" x2="8.1" y2="9.5" stroke="#dc2626" strokeWidth="1.2" />
    <path d="M3.2 8.5L2 7.5M12.8 8.5L14 7.5" stroke="#dc2626" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

// キーワードヘルプ自動表示 (黄色吹き出し + ヘルプ)
export const KeyHelpIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <path d="M2 2h12v9H6l-3 3v-3H2V2z" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
    <text x="5.5" y="9.5" fontSize="7.5" fontWeight="bold" fill="#2563eb" fontFamily="sans-serif">?</text>
    <polygon points="12,11 15,14 13.5,14.5 12,13" fill="#2563eb" />
  </svg>
);

// 文字コードセット指定 (赤S + 青U)
export const CharCodeSetIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <rect x="1" y="2" width="14" height="12" rx="1" fill="#f8fafc" stroke="#475569" strokeWidth="0.8" />
    <text x="2" y="11" fontSize="9.5" fontWeight="bold" fill="#dc2626" fontFamily="sans-serif">S</text>
    <text x="7.8" y="11" fontSize="9.5" fontWeight="bold" fill="#2563eb" fontFamily="sans-serif">U</text>
  </svg>
);

// 入力改行コード LF (青い下矢印 + LF)
export const LfIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <path d="M4 2v10m-2.5-3L4 12l2.5-3" fill="none" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <text x="7.2" y="10.5" fontSize="5.2" fontWeight="bold" fill="#7c3aed" fontFamily="sans-serif">LF</text>
  </svg>
);

// 入力改行コード CR (青い左折矢印 + CR)
export const CrIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: 'block' }}>
    <path d="M12 4v5H4m2.5-2.5L4 9l2.5 2.5" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <text x="5.5" y="14.5" fontSize="4.8" fontWeight="bold" fill="#7c3aed" fontFamily="sans-serif">CR</text>
  </svg>
);



