# CLAUDE.md

## Карта проекта

**Что это.** Сайт Ирины Ермаковой для её своего дела Ermakova Business Events: деловые мероприятия и бизнес-образование в Минске. Ирина уходит из найма, и сайт должен ответить заказчику не только на вопрос «кто она», но и на вопрос «как с ней начать». Первые заказчики — компании из личных контактов, ссылку Ирина присылает сама. Успех — человек долистал страницу и написал «Давайте обсудим наше событие». Первый шаг для заказчика — бесплатная встреча на 30–40 минут, после которой Ирина присылает идею и формат мероприятия. Подробно: [docs/superpowers/specs/2026-10-20-own-business-page-design.md](docs/superpowers/specs/2026-10-20-own-business-page-design.md).

Сайт — это лендинг идеи. Следующий шаг — MVP: маленький рабочий инструмент прямо на сайте (выбран «конструктор программы дня»). Его дизайн ещё обсуждается; когда будет готов, документ появится в `docs/superpowers/specs/`.

**Что где лежит.**

- `index.html` — сама страница: тексты, стили и скрипты в одном файле.
- `images/` — фотографии для страницы.
- `profile.md`, `про-меня.md`, `проекты.md`, `факты.md` — исходные тексты о Ирине, из которых написана страница. Цифры и факты сверяем с ними.
- `linkedin/` — тексты и баннер для профиля в LinkedIn, на сайт не попадают.
- `docs/superpowers/specs/` — документы дизайна: что и зачем решили сделать.
- `docs/agents/` — настройки для скиллов Claude: где задачи, какие метки.

**Как сайт публикуется.** Через GitHub Pages: после `git push` в ветку `main` сайт сам обновляется через минуту-две по адресу https://irinaermakova99-hue.github.io/persona/. Сборки нет. Репозиторий публичный, поэтому материалы клиентов и работодателя (программы, бюджеты, имена) в него не кладём.

**Как мы работаем.** Каждая задача — отдельный issue в GitHub Issues этого репозитория. Одна задача = одна новая сессия Claude: открываем сессию, берём issue, делаем, коммитим, пушим, закрываем issue. Следующую задачу начинаем в новой сессии.

---

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A site for Irina Ermakova's own business "Ermakova Business Events" (business events / business education, Minsk), plus the Russian-language source texts it is written from. There is no build system, package manager, tests, or linter: the site is plain static HTML published via GitHub Pages from `main`. To preview, open `index.html` in a browser (or `python3 -m http.server` in this directory).

## Structure

- `index.html` — the whole site: a self-contained single page (inline `<style>` and `<script>`, no external deps).
- `images/` — all photos, referenced by relative path (`images/*.jpg`) from the HTML. Alt text is in Russian.
- `profile.md`, `про-меня.md`, `проекты.md`, `факты.md` — first-person source copy (bio, projects/assets, verified facts). `profile.md` is the most recently updated and most complete. The page text is derived from these; they are not rendered by anything.
- `docs/superpowers/specs/` — design docs; read the relevant one before changing the page.

Page sections in order (anchor ids): hero → `#approach` → `#formats` → `#experience` → `#work` → `#facts` → `#personal` → `#contact`. Theming is via CSS variables in `:root` (`--accent`, `--accent-2`, etc.).

## Conventions

- All user-facing copy is in Russian. Headings and intro texts use «мы» («Какие мероприятия мы создаём?»); stage descriptions and contacts are in the first person. See the design doc.
- Facts (years, audience sizes, revenue, speaker names, employers) must stay consistent across the markdown sources and the HTML. `факты.md` states it contains only verifiable claims — don't add or inflate numbers; check them against `profile.md` before changing.
- Contact details (email, Telegram, phone) appear in the `#contact` section and footer of the HTML; update every occurrence if they change.

## Agent skills

### Issue tracker

Задачи живут в GitHub Issues репозитория `irinaermakova99-hue/persona`, работаем через `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

Стандартные пять меток: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: один `GLOSSARY.md` и `docs/adr/` в корне (создаются по мере надобности). See `docs/agents/domain.md`.
