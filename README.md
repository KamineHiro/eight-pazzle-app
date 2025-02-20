# 8パズル & 15パズル

シンプルで楽しい8パズルと15パズルのゲームアプリケーションです。

![8パズルのスクリーンショット](/public/screenshots/app1.png)

## 特徴

- クリア可能な問題のみを生成
- 手数のカウント機能
- ベスト記録の保存機能
- レスポンシブデザイン
- 8パズルと15パズルの切り替え機能

## 開発環境のセットアップ

このプロジェクトは [Next.js](https://nextjs.org) で作成されています。

開発サーバーを起動するには：

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
# または
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと、アプリケーションが表示されます。

## 技術スタック

- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [TypeScript](https://www.typescriptlang.org/) - 型安全な開発
- [Tailwind CSS](https://tailwindcss.com/) - スタイリング
- LocalStorage - ベスト記録の保存

## 開発者向け情報

- `app/page.tsx` - 8パズルのメインコンポーネント
- `app/fifteen/page.tsx` - 15パズルのメインコンポーネント
- `app/page.module.css` - スタイリング
- `app/layout.tsx` - 共通レイアウト

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
