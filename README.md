# 人狼推理ノート

iPhone SafariとPCブラウザで使える、人狼の推理補助PWAです。未ログイン時は端末内へ保存し、Supabaseを設定するとPC・iPhone間で同期できます。

推理ロジックの基準と変更時の確認範囲は[`GAME_RULES.md`](GAME_RULES.md)にまとめています。

## 亡国の標準配役

参加者タブで大会を`亡国の人狼会`に切り替えると、レギュレーションブック
ver.20260926の6人〜18人向け全92パターンを配役選択欄から選べます。
配役を選ぶと今回の盤面へ適用されます。初期カードの構成を登録しており、
開始前の変身や特殊能力は自動処理しません。人数不一致の原文には注記を表示します。

`配役を編集`で調整し、`新規セット保存`を押すと自作セットとして保存できます。
同じ大会・同じレギュ名では自作セットが標準配役より優先されます。
大会は参加者タブの「名称変更」「削除」、標準・自作レギュは配役編集画面の
「名前を保存」「セットを削除」で管理できます。名前だけの変更には人数一致は不要です。
削除後も名簿・保存済み盤面・終了履歴は残り、再起動や同期で削除対象が復活しません。
標準データは`bou-koku-regulations.js`で管理します。

配役データの検証:

```powershell
node tools/check-bou-koku-regulations.cjs
```

PlaywrightとChromeを利用できるWindows環境では、以下で保存・再読み込み・
PC/iPhone幅・オフライン利用を一時データで検証できます。

```powershell
node tools/verify-bou-koku-ui.cjs
```

## GitHub Pages

公開URL:

`https://r3wldcr.github.io/werewolf-reasoning-pwa/`

GitHub Pagesでは `main` ブランチの `/ (root)` を公開元に指定します。

## Supabase同期の設定

### 1. Supabaseプロジェクトを作成

1. [Supabase](https://supabase.com/)でプロジェクトを作成します。
2. `SQL Editor`を開き、`supabase-setup.sql`の内容を実行します。
3. `Authentication` → `Providers` → `Email`でメール確認を有効にします。
4. `Authentication` → `URL Configuration`で以下を設定します。
   - Site URL: `https://r3wldcr.github.io/werewolf-reasoning-pwa/`
   - Redirect URLs: `https://r3wldcr.github.io/werewolf-reasoning-pwa/`

`permission denied for table user_states`と表示された場合は、SQL Editorで以下を実行してください。

```sql
revoke all on table public.user_states from anon;
grant select, insert, update on table public.user_states to authenticated;
```

### 2. 公開用接続情報を設定

Supabaseの`Project Settings` → `API`で、Project URLと公開用anon keyを確認します。

`sync-config.js`へ設定します。

```js
window.SYNC_CONFIG = {
  supabaseUrl: "https://PROJECT_ID.supabase.co",
  supabaseAnonKey: "公開用anon key",
};
```

`service_role`キーは絶対に設定しないでください。anon keyはブラウザで使用する公開用キーで、データへのアクセスはRow Level Securityでログイン本人だけに制限されます。

設定後、GitHubへ反映します。

```powershell
git add .
git commit -m "Add cloud sync"
git push
```

### 3. PCとiPhoneで同期

1. アプリの`同期`タブから新規登録します。
2. 届いた確認メールのリンクを開きます。
3. PCとiPhoneで同じメールアドレス・パスワードを使ってログインします。
4. 初回同期で、端末内データまたはクラウドデータのどちらを残すか選びます。

## 保存動作

- 操作内容は最初に各端末の`localStorage`へ保存されます。
- ログイン中かつオンラインなら、変更後にSupabaseへ自動同期します。
- オフライン中も利用でき、通信復帰後に同期します。
- 別端末の更新は自動上書きせず、同期画面で取得または上書きを選択します。
- ログアウトすると、その端末内の名簿・盤面・履歴は削除されます。クラウドデータは残ります。
