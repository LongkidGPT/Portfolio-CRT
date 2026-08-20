# DJI Marketing：母版同步说明

## 目的

将已验证的案例信息架构、首屏层级和首页预览交互同步至母版；保持默认首页为个人简介，不将 DJI Marketing 的岗位文案误写入母版默认状态。

## 同步范围

### 1. 首页项目卡与预览状态

默认状态与项目卡悬停状态需要明确分离：

| 状态 | 首页预览内容 |
| --- | --- |
| 未悬停项目卡 | 个人简介：我是 KID（龙昊翔） |
| 悬停 `00 OVERVIEW` | 项目总览 |
| 悬停 `01–04` | 对应案例预览 |

这一行为由 `components/portfolio/PortfolioHome.tsx` 控制。同步时保留母版自身的个人简介与项目总览文案，只同步状态判断：只有悬停 `00 OVERVIEW` 时才传入项目总览预览文案。

### 2. 项目总览与四个案例的叙事映射

母版如使用同一组 Anker IFA 案例，可同步以下命名，使首页卡片、详情页路径和案例内容形成一组可读的项目拆分：

| 编号 | 模块名称 | 路径标识 |
| --- | --- | --- |
| Overview | IFA 2025 全球新品传播与商业化系统 | `PROJECT OVERVIEW` |
| 00 | 业务洞察与设计目标 | `PROJECT OVERVIEW / 00 DESIGN LOGIC` |
| 01 | 品牌系统与触点应用 | `PROJECT OVERVIEW / 01 BRAND SYSTEM` |
| 02 | 新品传播与 DTC 转化 | `PROJECT OVERVIEW / 02 PRODUCT LAUNCH` |
| 03 | 发布会传播与内容系统 | `PROJECT OVERVIEW / 03 LAUNCH EVENT` |

对应的 `00 OVERVIEW` 文案：

- 标识：`PROJECT OVERVIEW`
- 标题：`IFA 2025 全球新品` / `传播与商业化系统`
- 副标题：`品牌语言 · 新品发布 · DTC · 线上线下传播`
- 正文：`围绕 IFA 2025，将品牌语言、产品价值、DTC 页面与发布会内容，组织为同一套全球新品传播与商业化系统。`

这些内容位于 `lib/portfolio/projects.ts`。若母版服务的不是这组 IFA 案例，只同步命名结构和字段关系，保留母版对应的项目文案。

### 3. 01–04 详情页首屏结构

仅对 01–04 案例详情页应用以下规则；`00 OVERVIEW` 不应用。

1. 移除首屏大标题，避免与下面的案例模块标题重复。
2. 在信息区顶部显示路径标识，例如 `PROJECT OVERVIEW / 00 DESIGN LOGIC`。
3. 直接展示「业务目标 / 负责范围」。
4. 后续展示「核心设计贡献」。
5. `00 OVERVIEW` 与首页默认状态仍可保留各自的个人简介或项目总览标题结构。

组件实现：

- `components/portfolio/CaseTemplate.tsx`：为 01–04 生成编号与模块名组成的 `contextLabel`。
- `components/portfolio/RecruiterProjectSummary.tsx`：支持 `hideTitle` 与 `contextLabel`；标题隐藏时使用非标题的无障碍区域标签。

### 4. 字体与间距规则

详情页信息区采用三层层级，不再使用 14px / 13px / 12px 的连续跳级：

| 内容 | 设定 |
| --- | --- |
| 路径标识 | 14px、500 字重、深色、0.04em 字距 |
| 区块标签（业务目标、负责范围、核心设计贡献） | 11px、常规字重、灰色、0.06em 字距 |
| 正文与贡献项 | 13px；贡献项标题为 500 字重深色，说明为常规字重灰色 |

间距必须成对一致：

| 区块间距 | 桌面端 | 手机端 |
| --- | ---: | ---: |
| 路径标识 → 业务目标 / 负责范围 | 52px（响应式范围为 36–56px） | 50px |
| 业务目标 / 负责范围 → 核心设计贡献 | 52px（响应式范围为 36–56px） | 50px |

样式位于 `components/portfolio/portfolio.module.css`。

## 不同步的内容

1. `public/kv/cases/` 内的蓝色案例长图未修改；图中既有标题仍是 PNG 内容。若母版要与本次命名完全一致，需要另行重制相应图像资产。
2. 不把 DJI Marketing 的个人简介、岗位定位或职位投递信息覆盖到母版。
3. 不改变首页未悬停时显示个人简介的规则。

## 涉及文件

- `components/portfolio/PortfolioHome.tsx`
- `components/portfolio/CaseTemplate.tsx`
- `components/portfolio/RecruiterProjectSummary.tsx`
- `components/portfolio/portfolio.module.css`
- `lib/portfolio/projects.ts`（仅在母版承载同一 IFA 案例与文案时）

## 验收清单

- [ ] 首页未悬停任何项目卡时，显示个人简介。
- [ ] 悬停 `00 OVERVIEW` 时，显示项目总览而非个人简介。
- [ ] 悬停 01–04 时，显示对应案例预览。
- [ ] 01–04 详情页均无首屏 `h1` 大标题。
- [ ] 01–04 均有正确的 `PROJECT OVERVIEW / 0X …` 路径标识。
- [ ] 四页桌面端两段关键间距一致；手机端两段均为 50px。
- [ ] 路径、区块标签、正文与贡献项符合三层文字层级。
- [ ] `00 OVERVIEW` 不被误改为默认个人简介，也不在未悬停状态取代个人简介。
