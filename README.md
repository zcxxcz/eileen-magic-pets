# Eileen 的魔法宠物屋 · 家庭云存档版

学习发生在学习机 Pad 上；游戏负责家长确认后的奖励和养宠。Vite 静态页面部署到 GitHub Pages，Supabase Auth + PostgreSQL 保存家庭进度。

## 日常使用

1. 打开游戏，进入 **家长设置**，用后台创建的邮箱和账号密码登录。
2. 首次云端没有存档时，选择 **迁移原本机记录** 或 **新建存档**。本地旧存档不会删除。
3. 孵化宠物后，点击“请家长确认一课”设置 4–6 位数字密码。这与登录密码是两套凭据。
4. 在另一台设备上使用同一账号登录即可恢复进度。未登录、断网或服务连接失败时不能修改。
5. 家长设置中可导出 JSON、导入备份或恢复最近 20 个历史版本。覆盖和恢复需确认，并在已设置数字密码时验证密码。

迁移必须在**原浏览器、原本地地址（包括端口）**打开新版本。若直接打开 GitHub Pages，页面无法读取本地地址的旧记录：请先在原地址导出，再去 Pages 导入；或者在原地址登录并迁移到云端后，再打开 Pages。

## 本地启动

```sh
npm ci
cp .env.example .env.local
# 填写 Supabase 项目 URL 和 Publishable Key
npm run dev -- --port 5173
```

打开 http://127.0.0.1:5173 。`.env.local` 已被 Git 忽略，管理密钥和数据库密码不得放进任何 `VITE_` 变量。未配置云服务时只展示旧记录和导出入口，不会假装同步成功。

## 初始化 Supabase（新项目只执行一次）

1. 创建免费项目，在 SQL Editor 依次运行 `supabase/migrations/001_validation.sql` 和 `002_cloud.sql`。前者安装 pg_jsonschema 并定义校验，后者创建表、权限和保存 RPC。
2. 在 Authentication → Sign In / Providers 关闭 **Allow new users to sign up**；保持邮箱登录开启、匿名登录关闭。
3. 在 Authentication → Users → Add user → Create new user 创建家长账号，勾选 **Auto confirm user**。本版没有公开注册，不依赖邮件服务。
4. 项目 URL 和 Publishable Key 填入环境配置。所有浏览器只使用公开密钥；数据表按 `auth.uid()` 限定访问，写入只经事务 RPC。
5. 可在 SQL Editor 执行 `supabase/tests/cloud.sql` 验证真实数据库权限、版本冲突、重复提交和历史保留。脚本创建两个无密码测试身份，并在事务结尾回滚全部测试数据，不改家庭存档。

账号密码遗忘时由项目所有者通过 Supabase 后台管理用户，不在游戏中提供邮件找回。数字密码保留原有 PBKDF2 哈希与错误锁定机制，是家庭操作保护，不是防作弊机制。

## GitHub Pages 发布

仓库： https://github.com/zcxxcz/eileen-magic-pets

1. 仓库 Settings → Secrets and variables → Actions → Variables 设置 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_PUBLISHABLE_KEY`。
2. Settings → Pages 的 Source 选择 **GitHub Actions**。
3. 推送到 `main`，或运行 **Publish Pages** 工作流。工作流安装依赖、跑单元测试、构建和发布 `dist`。
4. Vite 使用相对资源路径，支持 `https://用户名.github.io/仓库名/` 子目录，无需单独的服务器路由。
5. 发布后在手机与电脑各登录一次。首次迁移、跨设备刷新和实际操作都成功后，才算真实双设备联调完成。

## 存档行为与接口

- `game_saves`：每个账号一条当前存档，包含 `state`、`revision`、`updated_at`。
- `game_save_history`：最近 20 个成功保存的快照，包括当前版本；恢复生成新版本，保留恢复前进度。
- `game_save_operations`：独立的轻量操作回执，不随快照清理；保证旧请求重试不会重复执行。
- `commit_game_save(p_state, p_expected_revision, p_operation_id)`：依据当前登录身份写入，账号级事务锁 + 版本检查；冲突返回 `PT409`，格式错误返回 `PT400`。不会接受客户端指定的目标账号。
- 本地仅缓存服务器确认过的快照，键为 `eileen-cloud-v1:<账号ID>`。原 `eileen-magic-pets-v1` 保留作迁移来源。退出后隐藏账号缓存；另一账号不会看到它。
- 同一设备同时仅提交一次操作；冲突后读取最新进度，请重新操作。无法确认的请求用原操作编号重试，核对完成前禁止新修改。不做离线修改队列。
- 页面加载、获得焦点、联网及前台每 15 秒拉取云端。正在提交时不并发刷新。已打开页面断网可查看缓存；不保证断网后首次加载页面。
- 备份格式为 `magic-pets-backup-v1`，也兼容原始 v1 状态 JSON；最大 2 MB。校验字段、数值、装扮、宠物及课程引用关系。拒绝无效文件，不清空现有记录。
- JSON Schema 源码位于 `src/save-schema.js`，修改后运行 `npm run schema:generate` 更新数据库校验脚本，再对既有项目应用更新函数（不要重跑建表脚本）。

## 服务暂停和恢复

Supabase 免费项目可能因一周内活动不足暂停。进入项目后台按提示恢复，等项目健康后在游戏“家长设置”点击刷新。期间只能查看已缓存记录，可导出备份；缓存不能替代独立备份。参考 [Supabase 暂停规则](https://supabase.com/docs/guides/platform/free-project-pausing)。

## 已实现的规则

- 每次家长确认一个新课次：当前选中宠物 +1 成长分、账户 +1 兑换星星、+1 抽奖次数。
- 相同课名不能重复领奖。不同课次、复习课次请注明具体名称和日期。系统不自动验证 Pad，由家长负责实际检查。
- 家长密码使用带随机盐的 PBKDF2 哈希保存在本机，不保存明文；每次奖励都要求重新输入。连续 5 次错误后暂停尝试 1 分钟。
- 成长分不因消费减少。0–1 分 Lv.1，2–4 分 Lv.2，5 分起 Lv.3 成年。体型、项链、皇冠随成长变化。
- 普通上衣、裤子、手镯、发卡、手持物、化妆每件 1 星星；初始魔法棒免费。已兑换物品可重复使用、供不同宠物穿戴。裙子替代上衣和裤子。
- 抽奖每次扣除 1 次机会，奖品为两条裙子及四种摆件，优先获得尚未拥有的奖品；全部收集后可抽到重复奖品，没有额外奖励。
- 第一只固定为小猫。可选择小狗、兔子、小熊、小仓鼠、小狐狸、小鸡、豚鼠、小鸟、小乌龟。所有宠物由蛋孵化。
- 当前宝宝成年后才能孵化下一只，已养成的宠物一直保留。
- 成年时准备第一颗蛋；收蛋后，该成年宠物再获得 3 课成长奖励可产下一颗蛋。未收的蛋不继续叠加。
- 去程和回程分别点击地图设计；沿用户路线移动，6 秒到达。到动物园后可以持续喂食、住下或接回家。喂食没有学习奖励。
- 修改操作须联网，由服务器确认后生效；旅行到达也同步保存。断网只能查看已打开页面中的本机缓存。

## 验证

```sh
npm test
npm run build
# 另一个终端保持本地开发服务器运行，然后：
npm run test:ui
```

浏览器测试拦截 Auth 和数据库网络请求，使用独立浏览器环境与模拟服务，不读写家长真实存档。需 Playwright Chromium；若无可用浏览器，运行 `npx playwright install chromium`。截图写入被 Git 忽略的 `artifacts/`。

- 规则测试覆盖成长、奖励、抽奖、换装、孵化、路线、旅行及数字密码。
- 存档层测试覆盖迁移、断网、暂停、账号隔离、响应丢失、并发冲突、历史及严格导入校验。
- 浏览器测试覆盖原有完整玩法，以及迁移、断网禁用、冲突、导入导出、PIN 确认恢复、换页面和退出登录，检查 1440 / 1024 / 390 像素布局。
- `supabase/tests/cloud.sql` 用于真实 PostgreSQL 验证，前端模拟测试不替代这一步。真实邮箱登录和跨设备验收需使用已创建的家庭账号。

## 当前边界

没有连接学习机 Pad、读取课程或按学习时间发奖，仍由家长确认学习完成。一个账号一份家庭存档，无公开注册、支付和社交功能。登录身份控制云端访问；本版本不提供对家庭成员的强防作弊保护。

## 统一发布与内容索引

总入口：https://zcxxcz.github.io/ 。本项目通过公开 `catalog.json` 接入全文搜索。`publish.json` 显式列出公开内容，不包含账号数据。

Windows/macOS 均安装 Node.js 24、Git 与 GitHub CLI，先 `gh auth login`。使用独立任务分支，提交本任务文件后运行 `npm run publish`：创建 PR → 等待 Publish Pages 检查 → 自动合并 → GitHub Actions 构建发布 → 自动刷新总索引。工作区必须干净；main 更新时先合并最新 main 并解决冲突。不需要本地运行 gh-pages。

Pages Source 使用 GitHub Actions，正式产物只由云端构建。直接推送 main 后，总索引由每日补漏任务更新；需要立即更新则运行 `node scripts/publish.mjs --refresh-only`。不自动执行数据库迁移。新增或修改公开内容时同步 publish.json 的元信息和 textPaths；不得将私人文件加入索引。
