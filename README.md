# 日報管理システム

中小企業向けの標準的な日報管理ツールです。

## 機能

- 日報の作成・編集・削除
- 日付、社員ID、部署での検索・フィルター
- CSVエクスポート機能
- レスポンシブデザイン

## セットアップ

1. 依存関係のインストール
```bash
npm install
```

2. サーバー起動
```bash
npm start
```

3. ブラウザで以下にアクセス
```
http://localhost:3000
```

## 開発環境での起動

```bash
npm run dev
```

## 技術構成

- **バックエンド**: Express.js + SQLite
- **フロントエンド**: HTML/CSS/JavaScript
- **データベース**: SQLite（自動作成）

## ディレクトリ構造

```
nippo-management/
├── src/
│   ├── server.js          # メインサーバーファイル
│   ├── database.js        # データベース設定とスキーマ
│   └── routes/
│       └── reports.js     # 日報関連のAPIルート
├── public/
│   ├── index.html         # メインHTMLファイル
│   ├── css/
│   │   └── style.css      # スタイルシート
│   └── js/
│       └── app.js         # フロントエンドJavaScript
├── database/              # SQLiteデータベースファイル保存先
├── package.json
└── README.md
```

## API エンドポイント

### 日報関連
- `GET /api/reports` - 日報一覧取得（フィルター対応）
- `GET /api/reports/:id` - 特定の日報取得
- `POST /api/reports` - 新規日報作成
- `PUT /api/reports/:id` - 日報更新
- `DELETE /api/reports/:id` - 日報削除
- `GET /api/reports/export/csv` - CSV形式でエクスポート

### フィルターパラメータ
- `start_date` - 開始日（YYYY-MM-DD形式）
- `end_date` - 終了日（YYYY-MM-DD形式）
- `employee_id` - 社員ID
- `department` - 部署名

## 使用方法

1. **日報作成**: 「新規作成」ボタンをクリックしてフォームに入力
2. **日報編集**: 一覧から「編集」ボタンをクリック
3. **日報削除**: 一覧から「削除」ボタンをクリック
4. **検索・フィルター**: 画面上部のフィルター項目を設定して「検索」ボタンをクリック
5. **CSVエクスポート**: 「CSVエクスポート」ボタンをクリック

## 注意事項

- 氏名、社員ID、部署、日付、業務内容は必須項目です
- データベースファイルは `database/nippo.db` に自動作成されます
- CSVエクスポートは日本語ヘッダー付きで出力されます