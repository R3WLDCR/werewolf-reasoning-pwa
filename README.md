# 人狼推理ノート

iPhone SafariとPCブラウザで使える、人狼の推理補助PWAです。未ログイン時は端末内へ保存し、Supabaseを設定するとPC・iPhone間で同期できます。

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
