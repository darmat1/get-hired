# AI Agents (MCP) Page + Public Site Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public `/agents` page that explains GetHired's existing MCP integration for AI assistants (Claude, ChatGPT, etc.), surface it in nav/footer/homepage, and tighten weak marketing copy on the pricing and extension landing pages.

**Architecture:** Next.js App Router, client-rendered marketing pages (`"use client"`) with metadata supplied by a sibling `layout.tsx` (the pattern already used by `/pricing` and `/extension`). All copy lives in the flat `en/uk/ru` map in `src/lib/translations-data.ts`. No new dependencies, no new design system — reuse `src/components/ui/*` primitives and the existing Tailwind/slate idiom.

**Tech Stack:** Next.js 16 App Router, React, Tailwind v4 (`@theme` tokens in `globals.scss`), `lucide-react` icons, existing `useTranslation()` i18n hook.

---

## Repo conventions this plan follows (confirmed by reading the code)

- `Footer` is rendered **once globally** in `src/app/layout.tsx` (`RootLayout`) and self-hides on app routes via `isAppRoute(pathname)`. **Do not** render `<Footer />` inside the new page — it already appears automatically.
- `Header` is **not** global — every marketing page imports and renders it manually (see `src/app/pricing/page.tsx`, `src/app/extension/page.tsx`).
- A `"use client"` page (needed here because sections use `useTranslation()`/`useState`) cannot export `generateMetadata` itself, so metadata lives in a sibling `layout.tsx` (see `src/app/pricing/layout.tsx`). This plan follows that split for `/agents`.
- Internal links use `LocalizedLink` (`src/components/ui/localized-link.tsx`), which prefixes the current non-English locale automatically. Use it for every in-app link; use plain `<a>`/`next/link` only for external URLs.
- No component/DOM test setup exists in this repo (`vitest.config.ts` runs in `environment: "node"` and only covers `src/lib/**` and `src/app/api/**`; no `@testing-library/react`, no jsdom). Per repo convention, this plan does **not** add component tests — verification is `npm run build` + `npm run lint` + a manual browser check (see Task 14 and Task 17).
- Per the user's global instructions, browser MCP tools are not to be used without asking permission for that specific check. Manual-verification tasks in this plan therefore end with instructions **for the user** to check in their own browser, not a step where the agent opens one unprompted.

---

## Phase A — `/agents` page, nav/footer links, homepage teaser

### Task 1: Add all new translation keys

**Files:**
- Modify: `src/lib/translations-data.ts`

- [ ] **Step 1: Insert the new `agents.*`, `nav.*`, `footer.*`, and `landing.agents_teaser.*` keys**

Find this exact block (the last FAQ entry before the `template.title` section):

```ts
  "landing.seo.a4": {
    en: "Yes! You can generate cover letters instantly based on your profile and copy the text or download them directly from your dashboard.",
    uk: "Так! Ви можете миттєво генерувати листи на основі профілю і копіювати текст або завантажувати їх з дашборду.",
    ru: "Да! Вы можете мгновенно генерировать письма на основе вашего профиля и копировать текст или скачивать их прямо в дашборде.",
  },

  "template.title": {
```

Replace it with (this inserts a new block between the two, keeping `"template.title"` where it was):

```ts
  "landing.seo.a4": {
    en: "Yes! You can generate cover letters instantly based on your profile and copy the text or download them directly from your dashboard.",
    uk: "Так! Ви можете миттєво генерувати листи на основі профілю і копіювати текст або завантажувати їх з дашборду.",
    ru: "Да! Вы можете мгновенно генерировать письма на основе вашего профиля и копировать текст или скачивать их прямо в дашборде.",
  },

  // AGENTS PAGE
  "agents.hero.badge": {
    en: "AI Agents",
    uk: "AI-агенти",
    ru: "AI-агенты",
  },
  "agents.hero.title": {
    en: "Let your AI assistant handle your job search",
    uk: "Хай ваш AI-асистент займеться пошуком роботи",
    ru: "Пусть ваш AI-ассистент займётся поиском работы",
  },
  "agents.hero.subtitle": {
    en: "Connect Claude, ChatGPT, or any other MCP-compatible AI assistant to GetHired. It can update your profile, tailor resumes, and write cover letters — no copy-pasting between tabs.",
    uk: "Підключіть Claude, ChatGPT або будь-який інший AI-асистент із підтримкою MCP до GetHired. Він зможе оновлювати профіль, адаптувати резюме та писати супровідні листи — без копіювання між вкладками.",
    ru: "Подключите Claude, ChatGPT или любой другой AI-ассистент с поддержкой MCP к GetHired. Он сможет обновлять профиль, адаптировать резюме и писать сопроводительные письма — без копирования между вкладками.",
  },
  "agents.hero.cta": {
    en: "Get your access token",
    uk: "Отримати токен доступу",
    ru: "Получить токен доступа",
  },
  "agents.hero.cta_secondary": {
    en: "See how it works",
    uk: "Подивитись, як це працює",
    ru: "Посмотреть, как это работает",
  },

  "agents.capabilities.title": {
    en: "What your AI assistant can do",
    uk: "Що може ваш AI-асистент",
    ru: "Что может ваш AI-ассистент",
  },
  "agents.capabilities.profile.title": {
    en: "Keep your profile up to date",
    uk: "Підтримувати профіль в актуальному стані",
    ru: "Поддерживать профиль в актуальном состоянии",
  },
  "agents.capabilities.profile.desc": {
    en: "Add a new job, skill, or certificate the moment you mention it — no forms to fill in.",
    uk: "Додає нову посаду, навичку чи сертифікат одразу, як ви про це згадаєте — без заповнення форм.",
    ru: "Добавляет новую должность, навык или сертификат, как только вы о них упомянули — без заполнения форм.",
  },
  "agents.capabilities.resumes.title": {
    en: "Tailor a resume to any job post",
    uk: "Адаптувати резюме під будь-яку вакансію",
    ru: "Адаптировать резюме под любую вакансию",
  },
  "agents.capabilities.resumes.desc": {
    en: "Paste a job link into your chat and get a resume built from your real experience, matched to that role.",
    uk: "Вставте посилання на вакансію в чат — і отримайте резюме, зібране з вашого реального досвіду під цю роль.",
    ru: "Вставьте ссылку на вакансию в чат — и получите резюме, собранное из вашего реального опыта под эту роль.",
  },
  "agents.capabilities.cover_letters.title": {
    en: "Write a cover letter on the spot",
    uk: "Написати супровідний лист на місці",
    ru: "Написать сопроводительное письмо на месте",
  },
  "agents.capabilities.cover_letters.desc": {
    en: "Ask for a cover letter while you're reading the job post, and get one grounded in your actual background.",
    uk: "Попросіть супровідний лист прямо під час читання вакансії — і отримайте текст на основі вашого реального досвіду.",
    ru: "Попросите сопроводительное письмо прямо во время чтения вакансии — и получите текст на основе вашего реального опыта.",
  },
  "agents.capabilities.score.title": {
    en: "Get a second opinion on your resume",
    uk: "Отримати другу думку щодо резюме",
    ru: "Получить второе мнение о резюме",
  },
  "agents.capabilities.score.desc": {
    en: "Have your assistant score a resume against a job description and point out what's missing.",
    uk: "Попросіть асистента оцінити резюме відносно опису вакансії й підказати, чого бракує.",
    ru: "Попросите ассистента оценить резюме относительно описания вакансии и подсказать, чего не хватает.",
  },

  "agents.compatible.title": {
    en: "Works with the AI assistant you already use",
    uk: "Працює з AI-асистентом, яким ви вже користуєтесь",
    ru: "Работает с AI-ассистентом, которым вы уже пользуетесь",
  },
  "agents.compatible.subtitle": {
    en: "Claude, ChatGPT, and any other tool that speaks MCP (Model Context Protocol) can connect — no special app to install.",
    uk: "Claude, ChatGPT та будь-який інший інструмент, що підтримує MCP (Model Context Protocol), може підключитись — без встановлення окремого застосунку.",
    ru: "Claude, ChatGPT и любой другой инструмент с поддержкой MCP (Model Context Protocol) может подключиться — без установки отдельного приложения.",
  },
  "agents.compatible.other": {
    en: "+ any MCP-compatible AI assistant",
    uk: "+ будь-який AI-асистент з підтримкою MCP",
    ru: "+ любой AI-ассистент с поддержкой MCP",
  },

  "agents.how_it_works.title": {
    en: "How to connect",
    uk: "Як підключити",
    ru: "Как подключить",
  },
  "agents.how_it_works.step1_title": {
    en: "Create a token",
    uk: "Створіть токен",
    ru: "Создайте токен",
  },
  "agents.how_it_works.step1_desc": {
    en: "In Settings → AI Agents, create a token and choose what it's allowed to access.",
    uk: "У Налаштуваннях → AI-агенти створіть токен і оберіть, до чого він матиме доступ.",
    ru: "В Настройках → AI-агенты создайте токен и выберите, к чему у него будет доступ.",
  },
  "agents.how_it_works.step2_title": {
    en: "Paste one snippet",
    uk: "Вставте один фрагмент",
    ru: "Вставьте один фрагмент",
  },
  "agents.how_it_works.step2_desc": {
    en: "Copy the generated config into your AI assistant's MCP settings. That's the entire setup.",
    uk: "Скопіюйте згенерований конфіг у налаштування MCP вашого AI-асистента. Це весь процес налаштування.",
    ru: "Скопируйте сгенерированный конфиг в настройки MCP вашего AI-ассистента. Это весь процесс настройки.",
  },
  "agents.how_it_works.step3_title": {
    en: "Just ask",
    uk: "Просто попросіть",
    ru: "Просто попросите",
  },
  "agents.how_it_works.step3_desc": {
    en: "Tell your assistant what you need — tailor a resume, draft a cover letter, update your profile.",
    uk: "Скажіть асистенту, що потрібно — адаптувати резюме, написати лист, оновити профіль.",
    ru: "Скажите ассистенту, что нужно — адаптировать резюме, написать письмо, обновить профиль.",
  },

  "agents.security.title": {
    en: "You stay in control",
    uk: "Контроль завжди у вас",
    ru: "Контроль всегда у вас",
  },
  "agents.security.item1_title": {
    en: "Scoped access",
    uk: "Обмежений доступ",
    ru: "Ограниченный доступ",
  },
  "agents.security.item1_desc": {
    en: "Grant only what's needed — read-only profile, resume writing, or both.",
    uk: "Надавайте лише потрібне — читання профілю, редагування резюме або і те, і те.",
    ru: "Предоставляйте только нужное — чтение профиля, редактирование резюме или и то, и другое.",
  },
  "agents.security.item2_title": {
    en: "Nothing stored in plain text",
    uk: "Нічого не зберігається у відкритому вигляді",
    ru: "Ничего не хранится в открытом виде",
  },
  "agents.security.item2_desc": {
    en: "Your token is hashed on our side — we can't read it back, and neither can anyone else.",
    uk: "Ваш токен зберігається у вигляді хешу — ми не можемо його прочитати, як і ніхто інший.",
    ru: "Ваш токен хранится в виде хеша — мы не можем его прочитать, как и никто другой.",
  },
  "agents.security.item3_title": {
    en: "Revoke anytime",
    uk: "Відкликати будь-коли",
    ru: "Отозвать в любой момент",
  },
  "agents.security.item3_desc": {
    en: "Turn off access for any token from Settings in one click, no questions asked.",
    uk: "Вимкніть доступ для будь-якого токена в Налаштуваннях в один клік.",
    ru: "Отключите доступ для любого токена в Настройках в один клик.",
  },

  "agents.faq.q1": {
    en: "Do I need to know how to code?",
    uk: "Чи треба вміти програмувати?",
    ru: "Нужно ли уметь программировать?",
  },
  "agents.faq.a1": {
    en: "No. Creating a token is a few clicks in Settings, and connecting it is pasting one block of text into your AI tool's settings.",
    uk: "Ні. Створення токена — кілька кліків у Налаштуваннях, а підключення — вставка одного блоку тексту в налаштування вашого AI-інструменту.",
    ru: "Нет. Создание токена — несколько кликов в Настройках, а подключение — вставка одного блока текста в настройки вашего AI-инструмента.",
  },
  "agents.faq.q2": {
    en: "Which AI assistants are supported?",
    uk: "Які AI-асистенти підтримуються?",
    ru: "Какие AI-ассистенты поддерживаются?",
  },
  "agents.faq.a2": {
    en: "Claude, ChatGPT, and any other assistant or app that supports MCP (Model Context Protocol).",
    uk: "Claude, ChatGPT та будь-який інший асистент чи застосунок з підтримкою MCP (Model Context Protocol).",
    ru: "Claude, ChatGPT и любой другой ассистент или приложение с поддержкой MCP (Model Context Protocol).",
  },
  "agents.faq.q3": {
    en: "Is this safe?",
    uk: "Чи це безпечно?",
    ru: "Это безопасно?",
  },
  "agents.faq.a3": {
    en: "Yes. You choose exactly what each token can access, tokens are stored as a hash, and you can revoke any of them instantly from Settings.",
    uk: "Так. Ви обираєте, до чого саме має доступ кожен токен, токени зберігаються у вигляді хешу, і ви можете миттєво відкликати будь-який з Налаштувань.",
    ru: "Да. Вы выбираете, к чему именно имеет доступ каждый токен, токены хранятся в виде хеша, и вы можете мгновенно отозвать любой из Настроек.",
  },
  "agents.faq.q4": {
    en: "Can I revoke access later?",
    uk: "Чи можна відкликати доступ пізніше?",
    ru: "Можно ли отозвать доступ позже?",
  },
  "agents.faq.a4": {
    en: "Yes, anytime, with no downside — revoking a token doesn't affect your resumes or profile, it just cuts off that one connection.",
    uk: "Так, будь-коли і без наслідків — відкликання токена не впливає на ваші резюме чи профіль, лише вимикає це одне з'єднання.",
    ru: "Да, в любой момент и без последствий — отзыв токена не влияет на ваши резюме или профиль, а лишь отключает это одно соединение.",
  },

  "agents.cta.title": {
    en: "Ready to connect your AI assistant?",
    uk: "Готові підключити свого AI-асистента?",
    ru: "Готовы подключить своего AI-ассистента?",
  },
  "agents.cta.button": {
    en: "Get started free",
    uk: "Почати безкоштовно",
    ru: "Начать бесплатно",
  },

  "nav.pricing": { en: "Pricing", uk: "Ціни", ru: "Цены" },
  "nav.templates": { en: "Templates", uk: "Шаблони", ru: "Шаблоны" },
  "nav.agents": { en: "AI Agents", uk: "AI-агенти", ru: "AI-агенты" },

  "footer.ai_agents": { en: "AI Agents", uk: "AI-агенти", ru: "AI-агенты" },

  "landing.agents_teaser.eyebrow": { en: "New", uk: "Нове", ru: "Новое" },
  "landing.agents_teaser.title": {
    en: "Bring your own AI agent",
    uk: "Підключіть свого AI-агента",
    ru: "Подключите своего AI-агента",
  },
  "landing.agents_teaser.subtitle": {
    en: "Claude, ChatGPT, or any MCP-compatible assistant can now update your profile, tailor resumes, and write cover letters for you.",
    uk: "Claude, ChatGPT або будь-який AI-асистент з підтримкою MCP тепер можуть оновлювати ваш профіль, адаптувати резюме й писати супровідні листи.",
    ru: "Claude, ChatGPT или любой AI-ассистент с поддержкой MCP теперь может обновлять ваш профиль, адаптировать резюме и писать сопроводительные письма.",
  },
  "landing.agents_teaser.cta": {
    en: "Explore AI Agents",
    uk: "Дізнатись про AI-агентів",
    ru: "Узнать про AI-агентов",
  },

  "template.title": {
```

- [ ] **Step 2: Confirm the file still parses**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep translations-data || echo "no errors in translations-data.ts"`
Expected: `no errors in translations-data.ts`

- [ ] **Step 3: Commit**

```bash
git add src/lib/translations-data.ts
git commit -m "feat: add translation keys for the AI agents page and nav/footer/teaser links"
```

---

### Task 2: `agents-hero.tsx`

**Files:**
- Create: `src/components/agents/agents-hero.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useTranslation } from "@/lib/translations";
import { LocalizedLink } from "@/components/ui/localized-link";
import { ArrowRight } from "lucide-react";

export function AgentsHero() {
  const { t } = useTranslation();

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-slate-400/10 dark:bg-slate-500/10 rounded-[100%] blur-[120px] -z-10" />

      <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 text-sm font-semibold mb-8 shadow-sm">
        {t("agents.hero.badge")}
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-8">
        {t("agents.hero.title")}
      </h1>

      <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
        {t("agents.hero.subtitle")}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <LocalizedLink
          href="/auth/signin"
          className="w-full sm:w-auto px-10 py-4 text-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          {t("agents.hero.cta")} <ArrowRight className="w-5 h-5" />
        </LocalizedLink>
        <a
          href="#how-it-works"
          className="w-full sm:w-auto px-10 py-4 text-lg bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-white font-bold rounded-full border border-slate-200 dark:border-white/10 transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
        >
          {t("agents.hero.cta_secondary")}
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/agents/agents-hero.tsx
git commit -m "feat: add AgentsHero section"
```

---

### Task 3: `agents-capabilities.tsx`

**Files:**
- Create: `src/components/agents/agents-capabilities.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useTranslation } from "@/lib/translations";
import { Card, CardContent } from "@/components/ui/card";
import { UserCog, FileText, Mail, Sparkles } from "lucide-react";

export function AgentsCapabilities() {
  const { t } = useTranslation();

  const items = [
    {
      icon: UserCog,
      title: t("agents.capabilities.profile.title"),
      desc: t("agents.capabilities.profile.desc"),
    },
    {
      icon: FileText,
      title: t("agents.capabilities.resumes.title"),
      desc: t("agents.capabilities.resumes.desc"),
    },
    {
      icon: Mail,
      title: t("agents.capabilities.cover_letters.title"),
      desc: t("agents.capabilities.cover_letters.desc"),
    },
    {
      icon: Sparkles,
      title: t("agents.capabilities.score.title"),
      desc: t("agents.capabilities.score.desc"),
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl text-center mb-16">
          {t("agents.capabilities.title")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map((item) => (
            <Card
              key={item.title}
              className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/agents/agents-capabilities.tsx
git commit -m "feat: add AgentsCapabilities section"
```

---

### Task 4: `agents-compatible-with.tsx`

**Files:**
- Create: `src/components/agents/agents-compatible-with.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useTranslation } from "@/lib/translations";
import { Badge } from "@/components/ui/badge";

export function AgentsCompatibleWith() {
  const { t } = useTranslation();

  return (
    <section className="py-24 sm:py-32 bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl mb-6">
          {t("agents.compatible.title")}
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
          {t("agents.compatible.subtitle")}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Badge className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 px-4 py-2 text-sm">
            Claude
          </Badge>
          <Badge className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 px-4 py-2 text-sm">
            ChatGPT
          </Badge>
          <Badge className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 px-4 py-2 text-sm">
            {t("agents.compatible.other")}
          </Badge>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/agents/agents-compatible-with.tsx
git commit -m "feat: add AgentsCompatibleWith section"
```

---

### Task 5: `agents-how-it-works.tsx`

**Files:**
- Create: `src/components/agents/agents-how-it-works.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useTranslation } from "@/lib/translations";
import { Card, CardContent } from "@/components/ui/card";
import { KeyRound, ClipboardPaste, MessageSquare } from "lucide-react";

export function AgentsHowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: KeyRound,
      title: t("agents.how_it_works.step1_title"),
      desc: t("agents.how_it_works.step1_desc"),
    },
    {
      icon: ClipboardPaste,
      title: t("agents.how_it_works.step2_title"),
      desc: t("agents.how_it_works.step2_desc"),
    },
    {
      icon: MessageSquare,
      title: t("agents.how_it_works.step3_title"),
      desc: t("agents.how_it_works.step3_desc"),
    },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl text-center mb-16">
          {t("agents.how_it_works.title")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <Card
              key={step.title}
              className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 text-sm">
                    {index + 1}
                  </div>
                  <step.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/agents/agents-how-it-works.tsx
git commit -m "feat: add AgentsHowItWorks section"
```

---

### Task 6: `agents-security.tsx`

**Files:**
- Create: `src/components/agents/agents-security.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useTranslation } from "@/lib/translations";
import { ShieldCheck, Lock, Ban } from "lucide-react";

export function AgentsSecurity() {
  const { t } = useTranslation();

  const items = [
    {
      icon: ShieldCheck,
      title: t("agents.security.item1_title"),
      desc: t("agents.security.item1_desc"),
    },
    {
      icon: Lock,
      title: t("agents.security.item2_title"),
      desc: t("agents.security.item2_desc"),
    },
    {
      icon: Ban,
      title: t("agents.security.item3_title"),
      desc: t("agents.security.item3_desc"),
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl text-center mb-16">
          {t("agents.security.title")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.title} className="text-center">
              <div className="mx-auto flex-shrink-0 w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4">
                <item.icon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/agents/agents-security.tsx
git commit -m "feat: add AgentsSecurity section"
```

---

### Task 7: `agents-faq.tsx`

**Files:**
- Create: `src/components/agents/agents-faq.tsx`

- [ ] **Step 1: Write the component** (same accordion pattern as `src/components/landing/faq-seo.tsx`, new `agents.faq.*` keys)

```tsx
"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/translations";
import { ChevronDown } from "lucide-react";

export function AgentsFAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { question: t("agents.faq.q1"), answer: t("agents.faq.a1") },
    { question: t("agents.faq.q2"), answer: t("agents.faq.a2") },
    { question: t("agents.faq.q3"), answer: t("agents.faq.a3") },
    { question: t("agents.faq.q4"), answer: t("agents.faq.a4") },
  ];

  return (
    <section className="py-24 sm:py-32 bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`bg-white dark:bg-slate-800 rounded-2xl border ${
                  isOpen
                    ? "border-slate-500 shadow-md"
                    : "border-slate-200 dark:border-slate-700 shadow-sm"
                } transition-all duration-300 overflow-hidden`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <h3
                    className={`text-lg font-bold pr-8 ${isOpen ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}
                  >
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-6 h-6 flex-shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? "transform rotate-180" : ""}`}
                  />
                </button>

                <div
                  className={`px-6 overflow-hidden transition-all duration-500 ease-in-out ${
                    isOpen ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/agents/agents-faq.tsx
git commit -m "feat: add AgentsFAQ section"
```

---

### Task 8: `/agents` metadata + page

**Files:**
- Create: `src/app/agents/layout.tsx`
- Create: `src/app/agents/page.tsx`

- [ ] **Step 1: Write the metadata layout** (mirrors `src/app/pricing/layout.tsx`)

```tsx
import type { Metadata } from "next";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const locale = headerList.get("x-locale") || "en";
  const path = "/agents";
  const canonical = locale === "en" ? path : `/${locale}${path}`;

  return {
    title: "AI Agents | GetHired - Connect Claude, ChatGPT & MCP Assistants",
    description:
      "Connect Claude, ChatGPT, or any MCP-compatible AI assistant to GetHired. Update your profile, tailor resumes, and write cover letters right from your AI tool.",
    keywords:
      "mcp, model context protocol, ai agent, claude, chatgpt, resume ai integration",
    alternates: {
      canonical,
      languages: {
        "en-US": "/agents",
        "uk-UA": "/uk/agents",
        "ru-RU": "/ru/agents",
        "x-default": "/agents",
      },
    },
    openGraph: {
      url: canonical,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
```

- [ ] **Step 2: Write the page**

```tsx
"use client";

import { Header } from "@/components/layout/header";
import { useTranslation } from "@/lib/translations";
import { LocalizedLink } from "@/components/ui/localized-link";
import { AgentsHero } from "@/components/agents/agents-hero";
import { AgentsCapabilities } from "@/components/agents/agents-capabilities";
import { AgentsCompatibleWith } from "@/components/agents/agents-compatible-with";
import { AgentsHowItWorks } from "@/components/agents/agents-how-it-works";
import { AgentsSecurity } from "@/components/agents/agents-security";
import { AgentsFAQ } from "@/components/agents/agents-faq";

export default function AgentsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Header />
      <main>
        <AgentsHero />
        <AgentsCapabilities />
        <AgentsCompatibleWith />
        <AgentsHowItWorks />
        <AgentsSecurity />
        <AgentsFAQ />

        <section className="py-20 text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-8">
            {t("agents.cta.title")}
          </h2>
          <LocalizedLink
            href="/auth/signin"
            className="inline-flex px-10 py-4 text-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            {t("agents.cta.button")}
          </LocalizedLink>
        </section>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Run the dev server and check for build errors**

Run: `npm run build 2>&1 | tail -50`
Expected: build completes, `/agents` listed among the routes, no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/agents/layout.tsx src/app/agents/page.tsx
git commit -m "feat: add /agents page composing all AI agents sections"
```

---

### Task 9: Add marketing nav to the header

**Files:**
- Modify: `src/components/layout/header.tsx:22-42` (unmounted skeleton) and `:66-85` (mounted header)

- [ ] **Step 1: Add a `MarketingNav` inline block used in both branches**

Replace the unmounted skeleton's inner content:

```tsx
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {!isApplicationPage && (
              <LocalizedLink
                href="/"
                className="text-xl font-bold text-slate-900 dark:text-white"
              >
                <Logo />
              </LocalizedLink>
            )}
          </div>
          <nav className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <LanguageSelector />
            </div>
          </nav>
        </div>
```

with:

```tsx
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            {!isApplicationPage && (
              <LocalizedLink
                href="/"
                className="text-xl font-bold text-slate-900 dark:text-white"
              >
                <Logo />
              </LocalizedLink>
            )}
          </div>
          <nav className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <LanguageSelector />
            </div>
          </nav>
        </div>
```

(This branch renders before `mounted` is true and is session-independent already, so it does not need the marketing links — they'd cause a visible flash before hydration since the skeleton is intentionally minimal. Leave it as just the `gap-8` change for consistency; the real nav goes in the mounted branch below.)

- [ ] **Step 2: Add the marketing nav to the mounted header**

Replace:

```tsx
      <div
        className={
          isApplicationPage
            ? "mx-auto px-8"
            : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        }
      >
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            {!isApplicationPage && (
              <LocalizedLink
                href="/"
                className="text-xl font-bold text-slate-900 dark:text-white"
                aria-label="GetHired Home"
              >
                <Logo />
              </LocalizedLink>
            )}
          </div>

          <nav className="flex items-center space-x-2">
```

with:

```tsx
      <div
        className={
          isApplicationPage
            ? "mx-auto px-8"
            : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        }
      >
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            {!isApplicationPage && (
              <LocalizedLink
                href="/"
                className="text-xl font-bold text-slate-900 dark:text-white"
                aria-label="GetHired Home"
              >
                <Logo />
              </LocalizedLink>
            )}
            {!isApplicationPage && (
              <nav className="hidden md:flex items-center gap-6">
                <LocalizedLink
                  href="/pricing"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                >
                  {t("nav.pricing")}
                </LocalizedLink>
                <LocalizedLink
                  href="/templates"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                >
                  {t("nav.templates")}
                </LocalizedLink>
                <LocalizedLink
                  href="/blog"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                >
                  {t("nav.blog")}
                </LocalizedLink>
                <LocalizedLink
                  href="/agents"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                >
                  {t("nav.agents")}
                </LocalizedLink>
              </nav>
            )}
          </div>

          <nav className="flex items-center space-x-2">
```

This deliberately skips a mobile hamburger menu for these four links — `md:` hides them below the `md` breakpoint, and mobile visitors can still reach `/agents` via the footer or the homepage teaser. Add a mobile drawer only if this turns out to matter in practice.

- [ ] **Step 3: Verify the header renders**

Run: `npm run build 2>&1 | tail -30`
Expected: no errors referencing `header.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/header.tsx
git commit -m "feat: add marketing nav (Pricing, Templates, Blog, AI Agents) to header"
```

---

### Task 10: Add "AI Agents" to the footer

**Files:**
- Modify: `src/components/layout/footer.tsx:35-45` (the "Product" column)

- [ ] **Step 1: Add the new link**

Find:

```tsx
              <li>
                <LocalizedLink
                  href="/blog"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.blog")}
                </LocalizedLink>
              </li>
            </ul>
          </div>

          {/* Column 3: Solutions */}
```

Replace with:

```tsx
              <li>
                <LocalizedLink
                  href="/blog"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.blog")}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  href="/agents"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.ai_agents")}
                </LocalizedLink>
              </li>
            </ul>
          </div>

          {/* Column 3: Solutions */}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/footer.tsx
git commit -m "feat: add AI Agents link to footer Product column"
```

---

### Task 11: Homepage teaser section

**Files:**
- Create: `src/components/landing/agents-teaser.tsx`
- Modify: `src/components/landing/landing-page.tsx`

- [ ] **Step 1: Write the teaser**

```tsx
"use client";

import { useTranslation } from "@/lib/translations";
import { LocalizedLink } from "@/components/ui/localized-link";
import { ArrowRight } from "lucide-react";

export function AgentsTeaser() {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-8 py-10 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 text-xs font-bold uppercase tracking-wider mb-3">
              {t("landing.agents_teaser.eyebrow")}
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              {t("landing.agents_teaser.title")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl">
              {t("landing.agents_teaser.subtitle")}
            </p>
          </div>
          <LocalizedLink
            href="/agents"
            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 font-bold rounded-full transition-colors whitespace-nowrap"
          >
            {t("landing.agents_teaser.cta")} <ArrowRight className="w-4 h-4" />
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Insert it into the homepage**

In `src/components/landing/landing-page.tsx`, add the import:

```tsx
import { FAQSEO } from "@/components/landing/faq-seo";
```
→
```tsx
import { FAQSEO } from "@/components/landing/faq-seo";
import { AgentsTeaser } from "@/components/landing/agents-teaser";
```

And change:

```tsx
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <HowItWorks />
        <FAQSEO />
```

to:

```tsx
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <AgentsTeaser />
        <HowItWorks />
        <FAQSEO />
```

- [ ] **Step 3: Verify**

Run: `npm run build 2>&1 | tail -30`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/agents-teaser.tsx src/components/landing/landing-page.tsx
git commit -m "feat: add AI agents teaser section to homepage"
```

---

### Task 12: Add `/agents` to the sitemap

**Files:**
- Modify: `src/app/sitemap.ts:11-20`

- [ ] **Step 1: Add the route**

Find:

```ts
  const staticRoutes = [
    "",
    "/ai",
    "/pricing",
    "/linkedin-import",
    "/cover-letter",
    "/resume-builder",
    "/blog",
    "/privacy-policy",
    "/terms-of-service",
  ];
```

Replace with:

```ts
  const staticRoutes = [
    "",
    "/ai",
    "/agents",
    "/pricing",
    "/linkedin-import",
    "/cover-letter",
    "/resume-builder",
    "/blog",
    "/privacy-policy",
    "/terms-of-service",
  ];
```

- [ ] **Step 2: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat: add /agents to sitemap"
```

---

### Task 13: Lint, full build, and manual check (Phase A)

**Files:** none (verification only)

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: no errors in any file touched by Tasks 1–12.

- [ ] **Step 2: Full build**

Run: `npm run build 2>&1 | tail -60`
Expected: build succeeds; route list includes `/agents`.

- [ ] **Step 3: Ask the user to manually verify in their own browser** (per the global instruction: don't open a browser for this without being asked to)

Tell the user to run `npm run dev` and check:
- `http://localhost:3000/agents` — hero, capabilities, compatible-with, how-it-works, security, FAQ accordion (click a question), final CTA. Check both light and dark mode (toggle in header).
- `http://localhost:3000/` — the new "Bring your own AI agent" banner appears between Features and How It Works, links to `/agents`.
- Header on a narrow window (< 768px): the four new nav links should disappear (by design, Task 9); on a wide window they should appear between the logo and the theme/language controls.
- Footer: "AI Agents" appears in the Product column and links to `/agents`.

---

## Phase B — copywriting pass

### Task 14: Rewrite the pricing hero copy

**Files:**
- Modify: `src/lib/translations-data.ts:2659-2666`

**Why:** "Simple, Value-Driven Pricing" is generic SaaS boilerplate with no concrete claim. The real story is more compelling and specific: the Pro tier is literally tagged `"Coming Soon"` (`pricing_landing.pro_tag`), so today everything useful is free — that's a stronger, more honest hook than "value-driven."

- [ ] **Step 1: Replace the hero copy**

Find:

```ts
  "pricing_landing.hero_title": {
    en: "Simple, Value-Driven Pricing",
    uk: "Проста та вигідна ціна",
    ru: "Простая и выгодная цена",
  },
  "pricing_landing.hero_subtitle": {
    en: "Choose the plan that's right for your career growth. Start for free and upgrade as you grow.",
    uk: "Оберіть план, який підходить для вашого кар'єрного зростання. Почніть безкоштовно та переходьте на вищий рівень у міру зростання.",
    ru: "Выберите план, который подходит для вашего карьерного роста. Начните бесплатно и переходите на новый уровень по мере роста.",
  },
```

Replace with:

```ts
  "pricing_landing.hero_title": {
    en: "Everything you need to apply, free to start",
    uk: "Усе потрібне для пошуку роботи — безкоштовно на старті",
    ru: "Всё нужное для поиска работы — бесплатно на старте",
  },
  "pricing_landing.hero_subtitle": {
    en: "Build your profile, tailor resumes, and write cover letters at no cost. Pro adds unlimited resumes and premium templates when you're ready for them.",
    uk: "Створюйте профіль, адаптуйте резюме та пишіть супровідні листи безкоштовно. Pro додає безліміт резюме та преміум-шаблони, коли вони вам знадобляться.",
    ru: "Создавайте профиль, адаптируйте резюме и пишите сопроводительные письма бесплатно. Pro добавляет безлимит резюме и премиум-шаблоны, когда они вам понадобятся.",
  },
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/translations-data.ts
git commit -m "copy: rewrite generic pricing hero into a concrete, honest pitch"
```

---

### Task 15: Fix the extension hero title/subtitle mismatch

**Files:**
- Modify: `src/lib/translations-data.ts:3219-3223`

**Why:** The hero title only promises cover letters ("Generate Cover Letters in Seconds"), but the very next line (the subtitle) promises "tailored cover letters and resumes" — the title undersells what's actually on offer, right above the sentence that contradicts it.

- [ ] **Step 1: Broaden the title to match the subtitle's scope**

Find:

```ts
  "extension_landing.hero_title": {
    en: "Generate Cover Letters in Seconds",
    uk: "Генеруйте супровідні листи за секунди",
    ru: "Генерируйте сопроводительные письма за секунды",
  },
```

Replace with:

```ts
  "extension_landing.hero_title": {
    en: "Tailor Resumes & Cover Letters in Seconds",
    uk: "Адаптуйте резюме та супровідні листи за секунди",
    ru: "Адаптируйте резюме и сопроводительные письма за секунды",
  },
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/translations-data.ts
git commit -m "copy: fix extension hero title to match its own subtitle's scope"
```

---

### Task 16: Lint, build, and manual check (Phase B)

**Files:** none (verification only)

- [ ] **Step 1: Lint + build**

Run: `npm run lint && npm run build 2>&1 | tail -60`
Expected: no errors.

- [ ] **Step 2: Ask the user to manually verify**

Tell the user to check, with `npm run dev` running:
- `http://localhost:3000/pricing` — new hero headline/subtitle read correctly, no layout break.
- `http://localhost:3000/extension` — new hero title fits the existing layout (it's one word longer, check it doesn't wrap awkwardly on mobile widths).
- Switch language to Ukrainian and Russian (language selector in header) on both pages and confirm the new copy displays instead of falling back to English — this is also a good moment for the user (or a native speaker) to sanity-check the uk/ru phrasing, since it was translated without native review.

---

## Self-review notes

- **Spec coverage:** every section of the design doc has a task — new page + sections (Tasks 2–8), discoverability (Tasks 9–12), Phase A verification (Task 13), copy audit (Tasks 14–15), Phase B verification (Task 16). Translation keys (Task 1) cover every string referenced by every new component.
- **No placeholders:** all copy is final text in all three locales; all code blocks are complete, no `TODO`/`...`/"add logic here".
- **Type/name consistency:** component export names (`AgentsHero`, `AgentsCapabilities`, `AgentsCompatibleWith`, `AgentsHowItWorks`, `AgentsSecurity`, `AgentsFAQ`, `AgentsTeaser`) match exactly between their creation task and their import in Task 8/Task 11. Translation keys referenced in components (`agents.hero.*`, `agents.capabilities.*`, `agents.compatible.*`, `agents.how_it_works.*`, `agents.security.*`, `agents.faq.*`, `agents.cta.*`, `nav.pricing`/`nav.templates`/`nav.agents`, `footer.ai_agents`, `landing.agents_teaser.*`) match exactly what Task 1 adds.
- **No test framework mismatch:** deliberately no new Vitest/RTL tests added — the repo's existing suite only covers `src/lib/**`/`src/app/api/**`, and there's no DOM test environment configured. Verification is build + lint + manual browser check (Tasks 13, 16), consistent with how the rest of the marketing surface is verified.
