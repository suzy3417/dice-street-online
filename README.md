# 骰子街

依据附图制作的中文网页桌游。基础版支持 2–4 人同设备轮流玩；配置 Supabase 后可用房间链接在不同设备上联机。

## 运行

在本目录运行 `python -m http.server 4173`，打开 http://localhost:4173 。也可以放到任意静态网站托管服务。GitHub Pages 可直接托管本目录文件；确保发布根目录包含 `index.html`、`config.js` 和 `src/`。

## 联机设置

1. 在 Supabase 的 SQL Editor 执行 `supabase/schema.sql`。
2. 从 Project Settings → API 复制项目 URL 和 **anon / publishable key** 到 `config.js`。不要把 service role key 放进前端。
3. 推送到 GitHub 仓库的 `main` 分支，并在仓库 Settings → Pages 将 Source 设为 GitHub Actions。随附的工作流会发布网页。玩家用房间码或房间链接加入。

房间状态通过 Supabase RPC 保存，页面每 2 秒同步。房间操作限制为持有玩家本机令牌的人；这适合朋友间对局，尚未达到防作弊的竞技级服务端裁定。令牌只存在各自浏览器中；清除浏览器存储会失去该席位。
