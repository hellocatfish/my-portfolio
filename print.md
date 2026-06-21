# 角色简历 PDF 打印指南

## 打印入口

先启动本地开发服务：

```bash
npm run dev
```

然后在浏览器打开：

```text
http://127.0.0.1:5173/resumes/print
```

这个页面会把全部 266 个角色简历渲染成一页一页的 A4 预览。

## 选择主题

`/resumes/print` 页面右上角有深色 / 浅色主题切换按钮。

打印前先切到想要的主题，再打开浏览器打印。这个按钮只用于预览切换，打印时不会进入 PDF。

## 导出 PDF

在 `/resumes/print` 页面中：

1. 右键页面，选择 `Print`。
2. 目标打印机选择 `Save as PDF` 或 `Microsoft Print to PDF`。
3. 纸张选择 `A4`。
4. 方向选择 `Portrait`。
5. 建议开启 `Background graphics`，否则深色 / 浅色背景和卡片底色可能丢失。
6. 确认预览页数不是 `1 page` 后保存。

## 常见问题

如果打印预览只显示 `total: 1 page`，通常是浏览器没有重新加载最新样式。先刷新 `/resumes/print`，再重新打开打印。

如果 PDF 背景变白或颜色丢失，检查打印设置里的 `Background graphics` 是否开启。

如果图片还没加载完，等待页面滚动预览稳定后再打印。
