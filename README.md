# AirTouch 品牌官网 V14

## 本次更新

- 修正手机端强制不换行导致的标题、正文和数据溢出。
- 标题在桌面端保持语义完整，在窄屏上根据可用宽度自然换行。
- 重构优势卡片、物料 Tab、场景方案、客户案例、交付流程和联系表单的手机布局。
- 为 760px、480px 和 360px 三档屏幕宽度分别设置稳定的响应式规则。
- 图片、表单控件、联系方式、案例指标和弹窗均限制在手机可视区域内。
- 保留 V13 已经打通的飞书多维表格写入和群机器人通知逻辑。
- 所有网页图片已嵌入 `index.html`，无需单独上传图片目录。

## EdgeOne 部署

仓库根目录请至少保留：

```text
index.html
edge-functions/
  api/
    lead.js
```

`index.html` 为单文件前端，大小约 11 MB，低于 GitHub 网页上传 25 MB 的单文件限制。`lead.js` 负责把表单线索写入飞书多维表格并发送群通知，请继续保留现有 EdgeOne 环境变量。

## 表单错误诊断

最新版 `lead.js` 会在失败响应中附带不含密钥的诊断字段：

- `MISSING_ENVIRONMENT`：生产环境缺少必要变量。
- `FEISHU_AUTH_FAILED`：App ID 或 App Secret 无效。
- `FEISHU_BITABLE_WRITE_FAILED`：多维表格权限、App Token、Table ID、字段名称或字段类型不匹配。
- `LEAD_SUBMISSION_FAILED`：其他运行时或网络异常。

同时会返回 `providerCode` 和 `requestId`，便于进一步定位；不会返回 App Secret 或访问凭证。
