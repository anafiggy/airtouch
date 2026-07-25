# AirTouch V12 · EdgeOne 部署包

本目录可直接作为 EdgeOne Pages 项目的仓库根目录。

## 必需的环境变量

- `FEISHU_APP_ID`
- `FEISHU_APP_SECRET`
- `FEISHU_BITABLE_APP_TOKEN`
- `FEISHU_TABLE_ID`
- `FEISHU_WEBHOOK_URL`
- `FEISHU_WEBHOOK_SECRET`（仅在群机器人开启签名校验时需要）

不要把这些值写入代码或提交到 GitHub。

## 多维表格字段

目标数据表需要包含以下字段，名称必须完全一致：

- 公司名称：文本
- 姓名：文本
- 联系电话：文本
- 场景类型：单选，包含企业会展、餐饮零售、文旅空间、大健康、其他场景
- 需求说明：多行文本

## 部署

1. 将本目录中的全部文件放在 GitHub 仓库根目录。
2. 确认 EdgeOne 项目的生产环境变量已经配置。
3. 在 EdgeOne 重新部署最新提交。
4. 部署成功后访问 `/api/lead`，应返回 `405 Method Not Allowed` 的 JSON，而不是 404。
5. 在官网提交一条测试线索，确认多维表格出现记录，并收到群通知。

`edge-functions/api/lead.js` 会自动生成 `/api/lead` 接口。
