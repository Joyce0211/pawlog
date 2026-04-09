---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 30440220093c9d1204204dbfa316f6618bddb8dd112e627c82a56ec2501ad341ba9d3c590220696ff2f7dd350c989e7e2c59bb5b99cb2570df096c189e6db188169ec812c17d
    ReservedCode2: 3045022100ce9b2ffd1a9849809f43663eb560aa5082a528b91737ef494a227888296571b102207b113d243ca74e85d9155b21860efd7077b55d52f147b100738adff276588914
---

# 🐾 PawLog 宠物健康日记

一款专为养宠人设计的宠物健康记录工具，支持本地存储和云端同步。

## ✨ 功能特点

- 📝 **健康记录**：体重、健康、刷牙、驱虫、疫苗、美容
- 💰 **支出记账**：记录养宠开支，分类统计
- 📊 **数据报告**：体重趋势图、支出分类图
- ☁️ **云端同步**：数据自动备份到云端，永不丢失
- 🎨 **个性化**：多种主题颜色、壁纸、光标可选
- 📱 **响应式**：完美支持移动端和桌面端

## 🚀 快速开始

### 方式一：直接使用（本地模式）

1. 下载或克隆项目
2. 直接在浏览器中打开 `index.html` 文件
3. 开始使用！

### 方式二：云端同步模式（推荐）

#### 第一步：创建 Supabase 数据库

1. 访问 [supabase.com](https://supabase.com)
2. 注册并登录账户
3. 创建新项目
4. 进入 **SQL Editor**
5. 复制 `docs/setup-database.sql` 文件内容
6. 粘贴到 SQL Editor 中并点击 **Run**

#### 第二步：获取 API 凭证

1. 进入项目的 **Settings** → **API**
2. 复制 **Project URL**
3. 复制 **Publishable Key**

#### 第三步：更新应用配置

在 `index.html` 文件中找到以下代码，将您的凭证替换进去：

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

#### 第四步：部署到云端

##### 部署到 Vercel（推荐）

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账户登录
3. 点击 "New Project"
4. 上传您的项目文件
5. 点击 "Deploy"
6. 等待部署完成，获得在线网址

##### 部署到 Netlify

1. 访问 [netlify.com](https://netlify.com)
2. 注册并登录
3. 点击 "Add new site"
4. 拖拽您的项目文件夹
5. 等待部署完成

## 📁 项目结构

```
pawlog/
├── index.html              # 应用主入口
├── index-original.html      # 原始版本备份
├── assets/
│   └── js/
│       ├── supabase-config.js  # Supabase 配置
│       └── storage.js          # 存储模块
├── docs/
│   ├── setup-database.sql     # 数据库设置脚本
│   └── PRD.md                 # 产品需求文档
└── README.md                  # 项目说明
```

## 🔧 技术栈

- **前端**：原生 HTML/CSS/JavaScript
- **图表**：Chart.js
- **云端数据库**：Supabase
- **存储**：localStorage + Supabase
- **部署**：Vercel / Netlify

## 📋 数据存储说明

### 本地存储（localStorage）

- 快速访问，无需网络
- 容量约 5-10MB
- 关闭浏览器后数据保留
- 清除浏览器数据会丢失

### 云端存储（Supabase）

- 永久保存，不会丢失
- 支持多设备同步
- 免费额度：1GB 存储
- 自动备份

### 数据同步逻辑

```
添加/修改数据
    ↓
保存到 localStorage（立即）
    ↓
同时同步到 Supabase（自动）
    ↓
如果离线，加入同步队列
    ↓
网络恢复后自动同步
```

## 🎨 使用指南

### 添加宠物

1. 点击首页的宠物卡片
2. 填写宠物信息
3. 点击保存

### 记录健康数据

1. 点击右下角的 **+** 按钮
2. 选择记录类型
3. 填写信息并保存

### 查看历史记录

1. 进入"日记"页面
2. 使用筛选器过滤类型
3. 点击记录可编辑

### 同步数据

1. 进入"设置"页面
2. 点击"同步到云端"
3. 等待同步完成

## ⚠️ 注意事项

1. **数据备份**：定期使用"导出数据"功能备份
2. **网络要求**：云端同步需要网络连接
3. **隐私模式**：Safari 隐私模式不支持本地存储
4. **存储空间**：localStorage 有容量限制，重要数据请导出备份

## 📞 获取帮助

如果您在使用过程中遇到问题：

1. 查看控制台错误信息
2. 检查网络连接
3. 尝试清除浏览器缓存
4. 重新导入数据备份

## 📄 许可证

MIT License

## 🙏 致谢

- [Supabase](https://supabase.com) - 开源的 Firebase 替代品
- [Chart.js](https://www.chartjs.org/) - 灵活的图表库
- [Google Fonts](https://fonts.google.com/) - Nunito 字体

---

**版本**：2.0.0
**更新日期**：2026-03-23
**开发者**：MiniMax Agent
