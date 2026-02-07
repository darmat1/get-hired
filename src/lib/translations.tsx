"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Language = "en" | "uk" | "ru";

export interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

export const translations: Translations = {
  "nav.logo": { en: "GetHired", uk: "GetHired", ru: "GetHired" },
  "nav.dashboard": { en: "My Resumes", uk: "Мої резюме", ru: "Мои резюме" },
  "nav.ai_settings": {
    en: "AI Settings",
    uk: "Налаштування AI",
    ru: "AI настройки",
  },
  "common.auth_required": {
    en: "Authorization required",
    uk: "Потрібна авторизація",
    ru: "Требуется авторизация",
  },
  "profile.error.upload_pdf": {
    en: "Please upload a PDF file",
    uk: "Будь ласка, завантажте PDF-файл",
    ru: "Пожалуйста, загрузите PDF-файл",
  },
  "nav.create_resume": {
    en: "Create Resume",
    uk: "Створити резюме",
    ru: "Создать резюме",
  },
  "nav.sign_in": { en: "Sign In", uk: "Увійти", ru: "Войти" },
  "nav.sign_out": { en: "Sign out", uk: "Вийти", ru: "Выйти" },
  "nav.my_resumes": { en: "My Resumes", uk: "Мої резюме", ru: "Мои резюме" },
  "nav.my_experience": {
    en: "My Experience",
    uk: "Мій досвід",
    ru: "Мой опыт",
  },
  "nav.home": { en: "Home", uk: "Додому", ru: "Главная" },
  "profile.unified_desc": {
    en: "Your unified experience profile for creating perfect resumes",
    uk: "Ваш єдиний профіль досвіду для створення ідеальних резюме",
    ru: "Ваш единый профиль опыта для создания идеальных резюме",
  },
  "profile.suggest_btn": {
    en: "Suggest Resumes",
    uk: "Запропонувати резюме",
    ru: "Предложить резюме",
  },
  "profile.import_data": {
    en: "Import Data",
    uk: "Імпорт даних",
    ru: "Импорт данных",
  },
  "profile.upload_pdf_desc": {
    en: "Click to upload your resume in PDF",
    uk: "Натисніть для завантаження резюме в PDF",
    ru: "Нажмите для загрузки резюме в PDF",
  },
  "profile.paste_text_placeholder": {
    en: "Paste your profile or resume text here...",
    uk: "Вставте текст вашого профілю або резюме тут...",
    ru: "Вставьте текст вашего профиля или резюме здесь...",
  },
  "profile.ai_parse_btn": {
    en: "Recognize via AI",
    uk: "Розпізнати через ШІ",
    ru: "Распознать через ИИ",
  },
  "profile.loading_profile": {
    en: "Loading profile...",
    uk: "Завантаження профілю...",
    ru: "Загрузка профиля...",
  },
  "profile.load_error": {
    en: "Failed to load profile data. Please try again later.",
    uk: "Не вдалося завантажити дані профілю. Будь ласка, спробуйте пізніше.",
    ru: "Не удалось загрузить данные профиля. Пожалуйста, попробуйте позже.",
  },
  "profile.tab_personal": {
    en: "Personal Info",
    uk: "Особисті дані",
    ru: "Личные данные",
  },
  "profile.tab_experience": {
    en: "Experience",
    uk: "Досвід роботи",
    ru: "Опыт работы",
  },
  "profile.tab_education": {
    en: "Education",
    uk: "Освіта",
    ru: "Образование",
  },
  "profile.tab_skills": { en: "Skills", uk: "Навички", ru: "Навыки" },
  "profile.save_success": {
    en: "Profile saved successfully!",
    uk: "Профіль успішно збережено!",
    ru: "Профиль успешно сохранен!",
  },
  "profile.save_error": {
    en: "Error saving profile",
    uk: "Помилка при збереженні профілю",
    ru: "Ошибка при сохранении профиля",
  },
  "profile.import_success": {
    en: "Profile successfully updated!",
    uk: "Профіль успішно оновлено!",
    ru: "Профиль успешно обновлен!",
  },
  "profile.import_error": {
    en: "Import error",
    uk: "Помилка імпорту",
    ru: "Ошибка импорта",
  },
  "profile.pdf_processing": {
    en: "Processing PDF...",
    uk: "Обробка PDF...",
    ru: "Обработка PDF...",
  },
  "profile.pdf_success": {
    en: "Text extracted successfully!",
    uk: "Текст успішно вилучено!",
    ru: "Текст извлечен успешно!",
  },
  "profile.resume_suggestions_title": {
    en: "AI Resume Suggestions",
    uk: "AI Пропозиції для резюме",
    ru: "ИИ Предложения для резюме",
  },
  "profile.resume_exists": {
    en: "Resume Created",
    uk: "Резюме створено",
    ru: "Резюме создано",
  },
  "profile.loading_suggestions": {
    en: "Analyzing your experience...",
    uk: "Аналізуємо ваш досвід...",
    ru: "Анализируем ваш опыт...",
  },
  "profile.suggest_limit_title": {
    en: "Resume limit reached",
    uk: "Ліміт резюме досягнуто",
    ru: "Лимит резюме достигнут",
  },
  "profile.suggest_limit_desc": {
    en: "You can save up to 4 resumes. Delete unnecessary ones to create a new one.",
    uk: "Ви можете зберегти не більше 4 резюме. Видаліть непотрібні, щоб створити нове.",
    ru: "Вы можете сохранить не более 4 резюме. Удалите ненужные, чтобы создать новое.",
  },
  "profile.no_suggestions": {
    en: "Failed to generate suggestions. Try updating your profile.",
    uk: "Не вдалося згенерувати варіанти. Спробуйте оновити профіль.",
    ru: "Не удалось сгенерировать варианты. Попробуйте обновить профиль.",
  },
  "profile.create_resume_btn": {
    en: "Create Resume",
    uk: "Створити резюме",
    ru: "Создать резюме",
  },
  "profile.social_connections": {
    en: "Social Connections",
    uk: "Соціальні мережі",
    ru: "Социальные сети",
  },
  "profile.linkedin_connected": {
    en: "Connected",
    uk: "Підключено",
    ru: "Подключено",
  },
  "profile.linkedin_not_connected": {
    en: "Not connected",
    uk: "Не підключено",
    ru: "Не подключено",
  },
  "profile.unlink_linkedin": {
    en: "Unlink",
    uk: "Відключити",
    ru: "Отключить",
  },
  "profile.link_linkedin": {
    en: "Link LinkedIn",
    uk: "Підключити LinkedIn",
    ru: "Подключить LinkedIn",
  },
  "profile.current_name": {
    en: "Current Name",
    uk: "Поточне ім'я",
    ru: "Текущее имя",
  },
  "profile.change_name": {
    en: "Change Name",
    uk: "Змінити ім'я",
    ru: "Изменить имя",
  },
  "profile.new_name": {
    en: "New Name",
    uk: "Нове ім'я",
    ru: "Новое имя",
  },
  "profile.update_name": {
    en: "Update Name",
    uk: "Оновити ім'я",
    ru: "Обновить имя",
  },
  "profile.change_password": {
    en: "Change Password",
    uk: "Змінити пароль",
    ru: "Изменить пароль",
  },
  "profile.current_password": {
    en: "Current Password",
    uk: "Поточний пароль",
    ru: "Текущий пароль",
  },
  "profile.new_password": {
    en: "New Password",
    uk: "Новий пароль",
    ru: "Новый пароль",
  },
  "profile.confirm_password": {
    en: "Confirm Password",
    uk: "Підтвердіть пароль",
    ru: "Подтвердите пароль",
  },
  "profile.update_password": {
    en: "Update Password",
    uk: "Оновити пароль",
    ru: "Обновить пароль",
  },
  "profile.error.enter_name": {
    en: "Please enter a name",
    uk: "Будь ласка, введіть ім'я",
    ru: "Пожалуйста, введите имя",
  },
  "profile.success.name_updated": {
    en: "Name updated successfully",
    uk: "Ім'я успішно оновлено",
    ru: "Имя успешно обновлено",
  },
  "profile.success.password_changed": {
    en: "Password changed successfully",
    uk: "Пароль успішно змінено",
    ru: "Пароль успешно изменен",
  },
  "profile.error.fill_fields": {
    en: "Please fill in all fields",
    uk: "Будь ласка, заповніть всі поля",
    ru: "Пожалуйста, заполните все поля",
  },
  "profile.error.passwords_mismatch": {
    en: "Passwords do not match",
    uk: "Паролі не співпадають",
    ru: "Пароли не совпадают",
  },
  "profile.error.password_too_short": {
    en: "Password must be at least 8 characters long",
    uk: "Пароль має бути не менше 8 символів",
    ru: "Пароль должен быть не менее 8 символов",
  },
  "profile.error.password_change_failed": {
    en: "Failed to change password",
    uk: "Не вдалося змінити пароль",
    ru: "Ошибка при изменении пароля",
  },

  "home.title": {
    en: "Create a Professional Resume",
    uk: "Створіть професійне резюме",
    ru: "Создайте профессиональное резюме",
  },
  "home.subtitle": {
    en: "Import data from LinkedIn, use AI recommendations and choose from multiple PDF templates",
    uk: "Імпортуйте дані з LinkedIn, використовуйте AI-рекомендації та оберіть з численних PDF-шаблонів",
    ru: "Импортируйте данные из LinkedIn, используйте AI-рекомендации и выберите из множества шаблонов PDF",
  },
  "home.create_resume_btn": {
    en: "Create Resume",
    uk: "Створити резюме",
    ru: "Создать резюме",
  },
  "home.sign_in": { en: "Sign in", uk: "Увійти", ru: "Войти" },
  "home.feature.linkedin.title": {
    en: "LinkedIn Integration",
    uk: "Інтеграція з LinkedIn",
    ru: "Интеграция с LinkedIn",
  },
  "home.feature.linkedin.desc": {
    en: "Import your profile, work experience, education and skills with one click from LinkedIn",
    uk: "Імпортуйте ваш профіль, досвід роботи, освіту та навички одним кліком з LinkedIn",
    ru: "Импортируйте ваш профиль, опыт работы, образование и навыки одним кликом из LinkedIn",
  },
  "home.feature.ai.title": {
    en: "AI Recommendations",
    uk: "AI-рекомендації",
    ru: "AI-рекомендации",
  },
  "home.feature.ai.desc": {
    en: "Get personalized resume improvement suggestions from artificial intelligence",
    uk: "Отримайте персоналізовані поради щодо вдосконалення резюме від штучного інтелекту",
    ru: "Получите персональные рекомендации по улучшению резюме от искусственного интеллекта",
  },
  "home.feature.templates.title": {
    en: "Professional Templates",
    uk: "Професійні шаблони",
    ru: "Профессиональные шаблоны",
  },
  "home.feature.templates.desc": {
    en: "Choose from modern, professional, creative and minimalist templates and save as PDF",
    uk: "Оберіть з сучасних, професійних, креативних та мінімалістичних шаблонів і збережіть у PDF",
    ru: "Выберите из современных, профессиональных, креативных и минималистичных шаблонов и сохраните в PDF",
  },

  "form.personal_info": {
    en: "Personal Information",
    uk: "Особиста інформація",
    ru: "Личная информация",
  },
  "form.first_name": { en: "First Name", uk: "Ім'я", ru: "Имя" },
  "form.last_name": { en: "Last Name", uk: "Прізвище", ru: "Фамилия" },
  "form.email": { en: "Email", uk: "Email", ru: "Email" },
  "form.phone": { en: "Phone", uk: "Телефон", ru: "Телефон" },
  "form.location": {
    en: "Location",
    uk: "Місцезнаходження",
    ru: "Местоположение",
  },
  "form.website": { en: "Website", uk: "Веб-сайт", ru: "Веб-сайт" },
  "form.summary": { en: "Summary", uk: "Про себе", ru: "О себе" },
  "form.work_experience": {
    en: "Work Experience",
    uk: "Досвід роботи",
    ru: "Опыт работы",
  },
  "form.education": { en: "Education", uk: "Освіта", ru: "Образование" },
  "form.skills": { en: "Skills", uk: "Навички", ru: "Навыки" },
  "form.add": { en: "Add", uk: "Додати", ru: "Добавить" },
  "form.next": { en: "Next", uk: "Далі", ru: "Далее" },
  "form.back": { en: "Back", uk: "Назад", ru: "Назад" },
  "form.delete": { en: "Delete", uk: "Видалити", ru: "Удалить" },
  "form.save": { en: "Save", uk: "Зберегти", ru: "Сохранить" },
  "form.download_pdf": {
    en: "Download PDF",
    uk: "Завантажити PDF",
    ru: "Скачать PDF",
  },
  "form.import_linkedin": {
    en: "Import from LinkedIn",
    uk: "Імпорт з LinkedIn",
    ru: "Импорт из LinkedIn",
  },
  "form.loading": {
    en: "Loading...",
    uk: "Завантаження...",
    ru: "Загрузка...",
  },

  "placeholder.first_name": { en: "John", uk: "Іван", ru: "Иван" },
  "placeholder.last_name": { en: "Doe", uk: "Петренко", ru: "Иванов" },
  "placeholder.email": {
    en: "john@example.com",
    uk: "ivan@example.com",
    ru: "ivan@example.com",
  },
  "placeholder.phone": {
    en: "+1 (555) 123-4567",
    uk: "+1 (555) 123-4567",
    ru: "+1 (555) 123-4567",
  },
  "placeholder.location": {
    en: "New York, NY",
    uk: "New York, NY",
    ru: "New York, NY",
  },
  "placeholder.website": {
    en: "https://example.com",
    uk: "https://example.com",
    ru: "https://example.com",
  },
  "placeholder.summary": {
    en: "Describe your professional experience and goals...",
    uk: "Опишіть ваш професійний досвід та цілі...",
    ru: "Опишите ваш профессиональный опыт и цели...",
  },

  "dashboard.title": { en: "My Resumes", uk: "Мої резюме", ru: "Мои резюме" },
  "dashboard.subtitle": {
    en: "Manage your resumes and create new ones",
    uk: "Керуйте своїми резюме та створюйте нові",
    ru: "Управляйте вашими резюме и создавайте новые",
  },
  "dashboard.no_resumes": {
    en: "You don't have any resumes yet",
    uk: "У вас ще немає резюме",
    ru: "У вас пока нет резюме",
  },
  "dashboard.no_resumes_desc": {
    en: "Create your first resume to get started",
    uk: "Створіть своє перше резюме, щоб почати",
    ru: "Создайте первое резюме, чтобы начать",
  },
  "dashboard.loading": {
    en: "Loading...",
    uk: "Завантаження...",
    ru: "Загрузка...",
  },
  "dashboard.edit": { en: "Edit", uk: "Редагувати", ru: "Редактировать" },
  "dashboard.template": { en: "Template", uk: "Шаблон", ru: "Шаблон" },
  "dashboard.created": { en: "Created", uk: "Створено", ru: "Создано" },
  "dashboard.updated": { en: "Updated", uk: "Оновлено", ru: "Обновлено" },
  "dashboard.delete_confirm": {
    en: "Are you sure you want to delete this resume?",
    uk: "Ви впевнені, що хочете видалити це резюме?",
    ru: "Вы уверены, что хотите удалить это резюме?",
  },
  "dashboard.delete_modal_title": {
    en: "Delete Resume",
    uk: "Видалити резюме",
    ru: "Удалить резюме",
  },
  "dashboard.delete_confirm_title": {
    en: "Are you sure?",
    uk: "Ви впевнені?",
    ru: "Вы уверены?",
  },
  "dashboard.delete_confirm_desc": {
    en: "This action cannot be undone. This will permanently delete your resume.",
    uk: "Цю дію неможливо скасувати. Це назавжди видалить ваше резюме.",
    ru: "Это действие нельзя отменить. Это навсегда удалит ваше резюме.",
  },
  "common.cancel": { en: "Cancel", uk: "Скасувати", ru: "Отмена" },
  "common.delete": { en: "Delete", uk: "Видалити", ru: "Удалить" },
  "common.save": { en: "Save", uk: "Зберегти", ru: "Сохранить" },

  "ai.title": {
    en: "AI Resume Analysis",
    uk: "AI Аналіз резюме",
    ru: "AI Анализ резюме",
  },
  "ai.description": {
    en: "Use artificial intelligence to improve your resume",
    uk: "Використовуйте штучний інтелект для покращення вашого резюме",
    ru: "Используйте искусственный интеллект для улучшения вашего резюме",
  },
  "ai.analyzing": {
    en: "Analyzing resume...",
    uk: "Аналіз резюме...",
    ru: "Анализ резюме...",
  },
  "ai.score": {
    en: "Resume score:",
    uk: "Оцінка резюме:",
    ru: "Оценка резюме:",
  },
  "ai.excellent": { en: "Excellent!", uk: "Чудово!", ru: "Отлично!" },
  "ai.good": { en: "Good", uk: "Добре", ru: "Хорошо" },
  "ai.fair": { en: "Fair", uk: "Задовільно", ru: "Нормально" },
  "ai.needs_work": {
    en: "Needs improvement",
    uk: "Потребує покращення",
    ru: "Требует улучшения",
  },
  "ai.strengths": {
    en: "Strengths",
    uk: "Сильні сторони",
    ru: "Сильные стороны",
  },
  "ai.weaknesses": {
    en: "Areas to improve",
    uk: "Що можна покращити",
    ru: "Что можно улучшить",
  },
  "ai.recommendations": {
    en: "Improvement recommendations",
    uk: "Рекомендації щодо покращення",
    ru: "Рекомендации по улучшению",
  },
  "ai.detailed_recommendations": {
    en: "Detailed recommendations",
    uk: "Детальні рекомендації",
    ru: "Детальные рекомендации",
  },
  "ai.regenerate_suggestions": {
    en: "Regenerate Suggestions",
    uk: "Згенерувати нові варіанти",
    ru: "Сгенерировать новые варианты",
  },

  // New AI page translations
  "ai.active": { en: "AI Active", uk: "AI Активне", ru: "AI Активно" },
  "ai.not_configured": {
    en: "AI not configured",
    uk: "AI не налаштовано",
    ru: "AI не настроен",
  },
  "ai.analysis_with": {
    en: "Resume analysis is performed using {service}",
    uk: "Аналіз резюме виконується за допомогою {service}",
    ru: "Анализ резюме выполняется с помощью {service}",
  },
  "ai.setup_required": {
    en: "Configure AI service to get personalized recommendations",
    uk: "Налаштуйте AI сервіс для отримання персоналізованих рекомендацій",
    ru: "Настройте AI сервис для получения персонализированных рекомендаций",
  },
  "ai.free": { en: "Free", uk: "Безкоштовний", ru: "Бесплатный" },
  "ai.paid": { en: "Paid", uk: "Платний", ru: "Платный" },
  "ai.connected": { en: "Connected", uk: "Підключено", ru: "Подключено" },
  "ai.how_it_works": {
    en: "How does AI analysis work?",
    uk: "Як працює AI аналіз?",
    ru: "Как работает AI анализ?",
  },
  "ai.step1_title": {
    en: "Structure Analysis",
    uk: "Аналіз структури",
    ru: "Анализ структуры",
  },
  "ai.step1_desc": {
    en: "AI checks for all necessary resume sections",
    uk: "AI перевіряє наявність усіх необхідних розділів резюме",
    ru: "AI проверяет наличие всех необходимых разделов резюме",
  },
  "ai.step2_title": {
    en: "Quality Assessment",
    uk: "Оцінка якості",
    ru: "Оценка качества",
  },
  "ai.step2_desc": {
    en: "Analyzes completeness of experience and skills description",
    uk: "Аналізує повноту опису досвіду та навичок",
    ru: "Анализирует полноту описания опыта и навыков",
  },
  "ai.step3_title": {
    en: "Personalized Recommendations",
    uk: "Персоналізовані рекомендації",
    ru: "Персональные рекомендации",
  },
  "ai.step3_desc": {
    en: "Provides specific tips for improving each section",
    uk: "Надає конкретні поради щодо покращення кожного розділу",
    ru: "Дает конкретные советы по улучшению каждого раздела",
  },
  "ai.available_services": {
    en: "Available AI Services",
    uk: "Доступні AI сервіси",
    ru: "Доступные AI сервисы",
  },
  "ai.choose_service": {
    en: "Choose the option that suits you",
    uk: "Оберіть підходящий вам варіант",
    ru: "Выберите подходящий вам вариант",
  },
  "ai.ready_to_improve": {
    en: "Ready to improve your resume with AI?",
    uk: "Готові покращити ваше резюме з AI?",
    ru: "Готовы улучшить ваше резюме с AI?",
  },
  "ai.setup_recommendation": {
    en: "Configure AI service and get personalized recommendations today",
    uk: "Налаштуйте AI сервіс і отримайте персоналізовані рекомендації вже сьогодні",
    ru: "Настройте AI сервис и получите персонализированные рекомендации уже сегодня",
  },
  "ai.setup": { en: "Setup AI", uk: "Налаштувати AI", ru: "Настроить AI" },
  "ai.test_analysis": {
    en: "Test AI Analysis",
    uk: "Протестувати AI аналіз",
    ru: "Протестировать AI анализ",
  },

  "ai_settings.title": {
    en: "AI Settings",
    uk: "Налаштування AI",
    ru: "AI настройки",
  },
  "ai_settings.subtitle": {
    en: "Manage AI services for resume analysis",
    uk: "Керуйте AI-сервісами для аналізу резюме",
    ru: "Управляйте AI сервисами для анализа резюме",
  },
  "ai_settings.active_service": {
    en: "Active AI service:",
    uk: "Активний AI сервіс:",
    ru: "Активный AI сервис:",
  },
  "ai_settings.analysis_using": {
    en: "Resume analysis is performed using",
    uk: "Аналіз резюме виконується за допомогою",
    ru: "Анализ резюме выполняется с помощью",
  },
  "ai_settings.available_services": {
    en: "Available AI Services",
    uk: "Доступні AI сервіси",
    ru: "Доступные AI сервисы",
  },
  "ai_settings.free": { en: "Free", uk: "Безкоштовно", ru: "Бесплатный" },
  "ai_settings.paid": { en: "Paid", uk: "Платний", ru: "Платный" },
  "ai_settings.connected": {
    en: "Connected",
    uk: "Підключено",
    ru: "Подключено",
  },
  "ai_settings.setup": { en: "Setup", uk: "Налаштувати", ru: "Настроить" },
  "ai_settings.test": { en: "Test", uk: "Перевірити", ru: "Проверить" },
  "ai_settings.testing": {
    en: "Testing...",
    uk: "Перевірка...",
    ru: "Проверка...",
  },
  "ai_settings.not_configured": {
    en: "AI analysis not configured",
    uk: "AI аналіз не налаштовано",
    ru: "AI анализ не настроен",
  },
  "ai_settings.not_configured_desc": {
    en: "Configure at least one AI service to get personalized resume improvement recommendations.",
    uk: "Налаштуйте хоча б один AI-сервіс для отримання персоналізованих рекомендацій щодо покращення резюме.",
    ru: "Настройте хотя бы один AI сервис для получения персонализированных рекомендаций по улучшению резюме.",
  },
  "ai_settings.reload": {
    en: "Reload application after setup",
    uk: "Перезавантажити застосунок після налаштування",
    ru: "Перезагрузить приложение после настройки",
  },
  "ai_settings.how_it_works": {
    en: "How does AI analysis work?",
    uk: "Як працює AI аналіз?",
    ru: "Как работает AI анализ?",
  },
  "ai_settings.how_it_works_items": {
    en: "• AI analyzes the structure and content of your resume\n• Identifies strengths and areas for improvement\n• Provides personalized recommendations for each section\n• Helps make your resume more attractive to recruiters",
    uk: "• AI аналізує структуру та зміст вашого резюме\n• Виявляє сильні сторони та області для покращення\n• Надає персоналізовані рекомендації для кожного розділу\n• Допомагає зробити ваше резюме привабливішим для рекрутерів",
    ru: "• AI анализирует структуру и содержание вашего резюме\n• Выявляет сильные стороны и области для улучшения\n• Дает персонализированные рекомендации по каждому разделу\n• Помогает сделать резюме более привлекательным для рекрутеров",
  },

  "template.title": {
    en: "Choose template",
    uk: "Оберіть шаблон",
    ru: "Выберите шаблон",
  },
  "template.modern": { en: "Modern", uk: "Сучасний", ru: "Современный" },
  "template.modern_desc": {
    en: "Clean and minimalist design",
    uk: "Чистий та мінімалістичний дизайн",
    ru: "Чистый и минималистичный дизайн",
  },
  "template.professional": {
    en: "Professional",
    uk: "Професійний",
    ru: "Профессиональный",
  },
  "template.professional_desc": {
    en: "Classic business style",
    uk: "Класичний діловий стиль",
    ru: "Классический деловой стиль",
  },
  "template.creative": { en: "Creative", uk: "Креативний", ru: "Креативный" },
  "template.creative_desc": {
    en: "Bright and eye-catching design",
    uk: "Яскравий та помітний дизайн",
    ru: "Яркий и заметный дизайн",
  },
  "template.minimal": {
    en: "Minimalist",
    uk: "Мінімалістичний",
    ru: "Минималистичный",
  },
  "template.minimal_desc": {
    en: "Simple and elegant",
    uk: "Простий та елегантний",
    ru: "Простой и элегантный",
  },
  "template.selected": { en: "Selected", uk: "Обрано", ru: "Выбрано" },
  "template.preview": { en: "Preview", uk: "Перегляд", ru: "Предпросмотр" },

  "theme.toggle": {
    en: "Toggle theme",
    uk: "Перемкнути тему",
    ru: "Переключить тему",
  },
  "theme.light": { en: "Light", uk: "Світла", ru: "Светлая" },
  "theme.dark": { en: "Dark", uk: "Темна", ru: "Темная" },
  "theme.system": { en: "System", uk: "Система", ru: "Система" },

  "language.title": { en: "Language", uk: "Мова", ru: "Язык" },
  "language.english": { en: "English", uk: "English", ru: "English" },
  "language.ukrainian": { en: "Ukrainian", uk: "Українська", ru: "Украинский" },
  "language.russian": { en: "Russian", uk: "Російська", ru: "Русский" },

  "work.position": { en: "Position", uk: "Посада", ru: "Должность" },
  "work.company": { en: "Company", uk: "Компанія", ru: "Компания" },
  "work.location": { en: "Location", uk: "Локація", ru: "Локация" },
  "work.period": { en: "Period", uk: "Період", ru: "Период" },
  "work.description": {
    en: "Description of responsibilities",
    uk: "Опис обов'язків",
    ru: "Описание обязанностей",
  },
  "work.current_position": {
    en: "Current position",
    uk: "Поточна посада",
    ru: "Текущая должность",
  },
  "work.start_date": {
    en: "Start date",
    uk: "Дата початку",
    ru: "Дата начала",
  },
  "work.end_date": {
    en: "End date",
    uk: "Дата закінчення",
    ru: "Дата окончания",
  },
  "work.placeholder.position": {
    en: "Frontend Developer",
    uk: "Frontend Developer",
    ru: "Frontend Developer",
  },
  "work.placeholder.company": {
    en: "Tech Company",
    uk: "Tech Company",
    ru: "Tech Company",
  },
  "work.placeholder.location": {
    en: "San Francisco, CA",
    uk: "San Francisco, CA",
    ru: "San Francisco, CA",
  },
  "work.placeholder.description": {
    en: "Describe your responsibilities and achievements...",
    uk: "Опишіть ваші обов'язки та досягнення...",
    ru: "Опишите ваши обязанности и достижения...",
  },
  "work.new_position": {
    en: "New position",
    uk: "Нова посада",
    ru: "Новая должность",
  },
  "work.company_placeholder": {
    en: "Company",
    uk: "Компанія",
    ru: "Компания",
  },

  "skills.technical": {
    en: "Technical skills",
    uk: "Технічні навички",
    ru: "Технические навыки",
  },
  "skills.soft": { en: "Soft skills", uk: "Soft skills", ru: "Soft skills" },
  "skills.languages": { en: "Languages", uk: "Мови", ru: "Языки" },
  "skills.none": {
    en: "No skills in this category",
    uk: "Немає навичок у цій категорії",
    ru: "Нет навыков в этой категории",
  },
  "skill.level.beginner": {
    en: "Beginner",
    uk: "Початківець",
    ru: "Начинающий",
  },
  "skill.level.intermediate": {
    en: "Intermediate",
    uk: "Середній",
    ru: "Средний",
  },
  "skill.level.advanced": {
    en: "Advanced",
    uk: "Просунутий",
    ru: "Продвинутый",
  },
  "skill.level.expert": { en: "Expert", uk: "Експерт", ru: "Эксперт" },
  "skills.placeholder.skill": {
    en: "JavaScript",
    uk: "JavaScript",
    ru: "JavaScript",
  },

  "education.institution": {
    en: "Institution",
    uk: "Навчальний заклад",
    ru: "Учебное заведение",
  },
  "education.degree": { en: "Degree", uk: "Ступінь", ru: "Степень" },
  "education.field": {
    en: "Field of study",
    uk: "Спеціальність",
    ru: "Специальность",
  },
  "education.gpa": {
    en: "GPA",
    uk: "Середній бал (GPA)",
    ru: "Средний балл (GPA)",
  },
  "education.period": {
    en: "Period of study",
    uk: "Період навчання",
    ru: "Период обучения",
  },
  "education.placeholder.institution": {
    en: "Stanford University",
    uk: "Stanford University",
    ru: "Stanford University",
  },
  "education.placeholder.degree": {
    en: "Bachelor of Science",
    uk: "Bachelor of Science",
    ru: "Bachelor of Science",
  },
  "education.placeholder.field": {
    en: "Computer Science",
    uk: "Computer Science",
    ru: "Computer Science",
  },
  "education.placeholder.gpa": { en: "3.8", uk: "3.8", ru: "3.8" },
  "education.currently_studying": {
    en: "Currently studying",
    uk: "Навчаюсь зараз",
    ru: "Учусь сейчас",
  },

  "preview.title": {
    en: "Resume preview",
    uk: "Перегляд резюме",
    ru: "Предпросмотр резюме",
  },
  "preview.work_experience": {
    en: "Work Experience",
    uk: "Досвід роботи",
    ru: "Опыт работы",
  },
  "preview.education": { en: "Education", uk: "Освіта", ru: "Образование" },
  "preview.skills": { en: "Skills", uk: "Навички", ru: "Навыки" },

  "page.home.title": {
    en: "GetHired - Create Professional Resumes",
    uk: "GetHired - Створення професійних резюме",
    ru: "GetHired - Создание профессиональных резюме",
  },
  "page.home.description": {
    en: "Create professional resumes with LinkedIn data integration and AI recommendations",
    uk: "Створюйте професійні резюме з даними з LinkedIn та AI-рекомендаціями",
    ru: "Создавайте профессиональные резюме с данными из LinkedIn и AI-рекомендациями",
  },

  "resume_builder.title": {
    en: "Create Resume",
    uk: "Створити резюме",
    ru: "Создать резюме",
  },
  "resume_builder.subtitle": {
    en: "Fill in your information to create a professional resume",
    uk: "Заповніть свою інформацію для створення професійного резюме",
    ru: "Заполните свою информацию для создания профессионального резюме",
  },
  "resume_builder.success": {
    en: "Resume created successfully!",
    uk: "Резюме створено успішно!",
    ru: "Резюме создано успешно!",
  },

  "message.resume_saved": {
    en: "Resume saved successfully",
    uk: "Резюме збережено успішно",
    ru: "Резюме сохранено успешно",
  },
  "message.resume_deleted": {
    en: "Resume deleted successfully",
    uk: "Резюме видалено успішно",
    ru: "Резюме удалено успешно",
  },
  "message.resume_created": {
    en: "Resume created successfully",
    uk: "Резюме створено успішно",
    ru: "Резюме создано успешно",
  },
  "message.loading": {
    en: "Loading...",
    uk: "Завантаження...",
    ru: "Загрузка...",
  },
  "message.error": {
    en: "Error occurred",
    uk: "Виникла помилка",
    ru: "Произошла ошибка",
  },
  "message.no_data": {
    en: "No data available",
    uk: "Даних немає",
    ru: "Данных нет",
  },

  "validation.required": {
    en: "This field is required",
    uk: "Це поле є обов'язковим",
    ru: "Это поле обязательно",
  },
  "validation.email": {
    en: "Please enter a valid email address",
    uk: "Будь ласка, введіть дійсну email адресу",
    ru: "Пожалуйста, введите действительный email",
  },
  "validation.phone": {
    en: "Please enter a valid phone number",
    uk: "Будь ласка, введіть дійсний номер телефону",
    ru: "Пожалуйста, введите действительный номер телефона",
  },

  // AI Services
  "ai_service.groq.description": {
    en: "Llama 3.1 - free and very fast",
    uk: "Llama 3.1 - безкоштовний і дуже швидкий",
    ru: "Llama 3.1 - бесплатный и очень быстрый",
  },
  "ai_service.openai.description": {
    en: "GPT-3.5 Turbo - paid but very high quality",
    uk: "GPT-3.5 Turbo - платний, але дуже якісний",
    ru: "GPT-3.5 Turbo - платный, но очень качественный",
  },
  "ai_service.groq.limits": {
    en: "30 requests per minute for free",
    uk: "30 запитів на хвилину безкоштовно",
    ru: "30 запросов в минуту бесплатно",
  },
  "ai_service.openai.limits": {
    en: "Paid usage, but very high quality analysis",
    uk: "Платне використання, але дуже якісний аналіз",
    ru: "Платное использование, но очень качественный анализ",
  },

  // AI Setup Instructions
  "ai_setup.groq.step1": {
    en: "1. Go to https://console.groq.com/",
    uk: "1. Перейдіть на https://console.groq.com/",
    ru: "1. Перейдите на https://console.groq.com/",
  },
  "ai_setup.groq.step2": {
    en: "2. Register (free)",
    uk: "2. Зареєструйтесь (безкоштовно)",
    ru: "2. Зарегистрируйтесь (бесплатно)",
  },
  "ai_setup.groq.step3": {
    en: '3. Create new API key in "API Keys" section',
    uk: '3. Створіть новий API ключ у розділі "API Keys"',
    ru: '3. Создайте новый API ключ в разделе "API Keys"',
  },
  "ai_setup.groq.step4": {
    en: "4. Add key to .env.local as GROQ_API_KEY=your-key-here",
    uk: "4. Додайте ключ до .env.local як GROQ_API_KEY=your-key-here",
    ru: "4. Добавьте ключ в .env.local как GROQ_API_KEY=your-key-here",
  },
  "ai_setup.groq.step5": {
    en: "5. Get 14 days of free usage",
    uk: "5. Отримайте 14 днів безкоштовного використання",
    ru: "5. Получите 14 дней бесплатного использования",
  },
  "ai_setup.openai.step1": {
    en: "1. Go to https://platform.openai.com/",
    uk: "1. Перейдіть на https://platform.openai.com/",
    ru: "1. Перейдите на https://platform.openai.com/",
  },
  "ai_setup.openai.step2": {
    en: "2. Register and add payment method",
    uk: "2. Зареєструйтесь і додайте спосіб оплати",
    ru: "2. Зарегистрируйтесь и добавьте способ оплаты",
  },
  "ai_setup.openai.step3": {
    en: '3. Create new API key in "API Keys" section',
    uk: '3. Створіть новий API ключ у розділі "API Keys"',
    ru: '3. Создайте новый API ключ в разделе "API Keys"',
  },
  "ai_setup.openai.step4": {
    en: "4. Add key to .env.local as OPENAI_API_KEY=your-key-here",
    uk: "4. Додайте ключ до .env.local як OPENAI_API_KEY=your-key-here",
    ru: "4. Добавьте ключ в .env.local как OPENAI_API_KEY=your-key-here",
  },
  "ai_setup.openai.step5": {
    en: "5. Cost per resume analysis: ~$0.001",
    uk: "5. Вартість аналізу одного резюме: ~$0.001",
    ru: "5. Стоимость анализа одного резюме: ~$0.001",
  },

  // AI Analysis Messages
  "ai_analysis.summary_good": {
    en: 'Professional experience is well described in "About" section',
    uk: 'Професійний досвід добре описаний у розділі "Про себе"',
    ru: 'Хорошо описан профессиональный опыт в разделе "О себе"',
  },
  "ai_analysis.summary_missing": {
    en: '"About" section is too short or missing',
    uk: 'Розділ "Про себе" занадто короткий або відсутній',
    ru: 'Раздел "О себе" слишком короткий или отсутствует',
  },
  "ai_analysis.summary_recommendation": {
    en: "Add more detailed description of your experience and goals (2-3 sentences)",
    uk: "Додайте більш детальний опис вашого досвіду та цілей (2-3 речення)",
    ru: "Добавьте более подробное описание вашего опыта и целей (2-3 предложения)",
  },
  "ai_analysis.work_missing": {
    en: "No work experience listed",
    uk: "Не вказано досвід роботи",
    ru: "Отсутствует опыт работы",
  },
  "ai_analysis.work_add": {
    en: "Add information about previous positions",
    uk: "Додайте інформацію про попередні місця роботи",
    ru: "Добавьте информацию о предыдущих местах работы",
  },
  "ai_analysis.work_detailed": {
    en: "Detailed description of responsibilities in work experience",
    uk: "Детальний опис обов'язків у досвіді роботи",
    ru: "Подробное описание обязанностей в опыте работы",
  },
  "ai_analysis.work_add_details": {
    en: "Add more details to responsibility descriptions",
    uk: "Додайте більше деталей до опису обов'язків",
    ru: "Добавьте больше деталей в описание обязанностей",
  },
  "ai_analysis.work_recommendation": {
    en: "For each position, add 3-5 key responsibilities using active verbs",
    uk: "Для кожної посади додайте 3-5 ключових обов'язків з використанням активних дієслів",
    ru: "Для каждой должности добавьте 3-5 ключевых обязанностей с использованием активных глаголов",
  },
  "ai_analysis.education_listed": {
    en: "Education is listed",
    uk: "Освіта вказана",
    ru: "Указано образование",
  },
  "ai_analysis.education_consider": {
    en: "Consider adding education information",
    uk: "Розгляньте додавання інформації про освіту",
    ru: "Рассмотрите добавление информации об образовании",
  },
  "ai_analysis.education_recommendation": {
    en: "Add information about your education even if it's courses or certificates",
    uk: "Додайте інформацію про вашу освіту навіть якщо це курси або сертифікати",
    ru: "Добавьте информацию о вашем образовании даже если это курсы или сертификаты",
  },
  "ai_analysis.technical_good": {
    en: "Technical skills are well represented",
    uk: "Технічні навички добре представлені",
    ru: "Хорошо представлены технические навыки",
  },
  "ai_analysis.technical_add_more": {
    en: "Add more technical skills",
    uk: "Додайте більше технічних навичок",
    ru: "Добавьте больше технических навыков",
  },
  "ai_analysis.softskills_listed": {
    en: "Soft skills are listed",
    uk: "Soft skills вказані",
    ru: "Указаны soft skills",
  },
  "ai_analysis.softskills_add": {
    en: "Add soft skills: communication, teamwork, problem solving",
    uk: "Додайте soft skills: комунікація, робота в команді, вирішення проблем",
    ru: "Добавьте soft skills: коммуникация, работа в команде, решение проблем",
  },
  "ai_analysis.general_certificates": {
    en: "Consider adding certificates and professional development courses",
    uk: "Розгляньте додавання сертифікатів та курсів підвищення кваліфікації",
    ru: "Рассмотрите добавление сертификатов и курсов повышения квалификации",
  },

  // AI Improvement Tips
  "ai_tip.poor_score": {
    en: "Your resume needs significant improvements to attract recruiters",
    uk: "Ваше резюме потребує значних покращень для приваблення рекрутерів",
    ru: "Ваше резюме требует значительных улучшений для привлечения внимания рекрутеров",
  },
  "ai_tip.good_score": {
    en: "Good resume, but there are opportunities for improvement",
    uk: "Добре резюме, але є можливості для покращення",
    ru: "Хорошее резюме, но есть возможности для улучшения",
  },
  "ai_tip.excellent_score": {
    en: "Excellent resume! Consider fine-tuning for each specific position",
    uk: "Чудове резюме! Розгляньте тонке налаштування для кожної конкретної позиції",
    ru: "Отличное резюме! Рассмотрите тонкую настройку для каждой конкретной позиции",
  },

  // Profile Page
  "nav.profile": { en: "Profile", uk: "Профіль", ru: "Профиль" },
  "nav.cover_letter": {
    en: "Cover Letter",
    uk: "Супровідний лист",
    ru: "Сопроводительное письмо",
  },

  // Cover Letter Page
  "cover_letter.title": {
    en: "Cover Letter Generator",
    uk: "Генератор супровідних листів",
    ru: "Генератор сопроводительных писем",
  },
  "cover_letter.subtitle": {
    en: "Generate personalized cover letters based on job descriptions",
    uk: "Генеруйте персоналізовані супровідні листи на основі описів вакансій",
    ru: "Генерируйте персонализированные сопроводительные письма на основе описания вакансий",
  },
  "cover_letter.job_description": {
    en: "Job Description",
    uk: "Опис вакансії",
    ru: "Описание вакансии",
  },
  "cover_letter.paste_job_description": {
    en: "Paste job description",
    uk: "Вставте опис вакансії",
    ru: "Вставьте описание вакансии",
  },
  "cover_letter.job_description_placeholder": {
    en: "Paste the full job description here...",
    uk: "Вставте повний опис вакансії тут...",
    ru: "Вставьте полное описание вакансии здесь...",
  },
  "cover_letter.generate": {
    en: "Generate Cover Letter",
    uk: "Згенерувати супровідний лист",
    ru: "Сгенерировать сопроводительное письмо",
  },
  "cover_letter.generated": {
    en: "Generated Cover Letter",
    uk: "Згенерований супровідний лист",
    ru: "Сгенерированное сопроводительное письмо",
  },
  "cover_letter.copy": { en: "Copy", uk: "Копіювати", ru: "Копировать" },
  "cover_letter.copied": {
    en: "Copied!",
    uk: "Скопійовано!",
    ru: "Скопировано!",
  },
  "cover_letter.error.enter_job_description": {
    en: "Please paste job description",
    uk: "Будь ласка, вставте опис вакансії",
    ru: "Пожалуйста, вставьте описание вакансии",
  },
  "cover_letter.error.generation_failed": {
    en: "Error generating cover letter",
    uk: "Помилка при генеруванні супровідного листа",
    ru: "Ошибка при генерировании сопроводительного письма",
  },
  "cover_letter.success.generated": {
    en: "Cover letter generated successfully",
    uk: "Супровідний лист успішно згенерований",
    ru: "Сопроводительное письмо успешно сгенерировано",
  },

  // LinkedIn Import
  "resume.import_from_linkedin": {
    en: "Import from LinkedIn",
    uk: "Імпортувати з LinkedIn",
    ru: "Импортировать из LinkedIn",
  },
  "resume.importing": {
    en: "Importing...",
    uk: "Імпортування...",
    ru: "Импортирование...",
  },
  "resume.error.no_linkedin_connected": {
    en: "LinkedIn not connected. Please sign in with LinkedIn first.",
    uk: "LinkedIn не підключений. Будь ласка, спочатку увійдіть за допомогою LinkedIn.",
    ru: "LinkedIn не подключен. Пожалуйста, сначала войдите через LinkedIn.",
  },
  "resume.error.linkedin_import_failed": {
    en: "Failed to import profile from LinkedIn",
    uk: "Не вдалося імпортувати профіль з LinkedIn",
    ru: "Не удалось импортировать профиль из LinkedIn",
  },
  "resume.success.linkedin_imported": {
    en: "Profile imported successfully from LinkedIn",
    uk: "Профіль успішно імпортовано з LinkedIn",
    ru: "Профиль успешно импортирован из LinkedIn",
  },
  "resume.linkedin_url": {
    en: "LinkedIn Profile URL",
    uk: "URL профілю LinkedIn",
    ru: "URL профиля LinkedIn",
  },
  "resume.paste_profile_title": {
    en: "Import by pasting profile text",
    uk: "Імпорт шляхом вставки тексту профілю",
    ru: "Импорт путем вставки текста профиля",
  },
  "resume.paste_placeholder": {
    en: "Paste your LinkedIn profile text here (Experience, Education, etc.)...",
    uk: "Вставте текст вашого профілю LinkedIn тут (Досвід, Освіта тощо)...",
    ru: "Вставьте текст вашего профиля LinkedIn здесь (Опыт, Образование и т. д.)...",
  },
  "resume.ai_parse": {
    en: "AI Parse & Import",
    uk: "AI Парсинг та Імпорт",
    ru: "AI Парсинг и Импорт",
  },
  "resume.connect_linkedin": {
    en: "Connect LinkedIn",
    uk: "Підключити LinkedIn",
    ru: "Подключить LinkedIn",
  },
  "resume.upload_pdf": {
    en: "Upload PDF",
    uk: "Завантажити PDF",
    ru: "Загрузить PDF",
  },
  "resume.pdf_file": {
    en: "PDF File (LinkedIn Export or Resume)",
    uk: "PDF-файл (Експорт з LinkedIn або резюме)",
    ru: "PDF-файл (Экспорт из LinkedIn или резюме)",
  },
  "resume.drag_drop_pdf": {
    en: "Drag & drop your PDF here, or click to select",
    uk: "Перетягніть свій PDF сюди або натисніть, щоб вибрати",
    ru: "Перетащите свой PDF сюда или нажмите, чтобы выбрать",
  },
  "resume.message.processing_pdf": {
    en: "Extracting text from PDF...",
    uk: "Вилучення тексту з PDF...",
    ru: "Извлечение текста из PDF...",
  },
  "resume.message.pdf_extracted": {
    en: "Text extracted successfully! Sending to AI...",
    uk: "Текст успішно вилучено! Надсилання до AI...",
    ru: "Текст успешно извлечен! Отправка в AI...",
  },
  "resume.error.pdf_read_failed": {
    en: "Failed to read PDF. Please try a different file or use 'AI Paste'.",
    uk: "Не вдалося прочитати PDF. Спробуйте інший файл або використайте 'AI Paste'.",
    ru: "Не удалось прочитать PDF. Попробуйте другой файл или используйте 'AI Paste'.",
  },
  "resume.message.api_limited": {
    en: "Limited data imported",
    uk: "Імпортовано обмежені дані",
    ru: "Импортированы ограниченные данные",
  },
  "resume.message.api_limited_desc": {
    en: "LinkedIn's API sometimes restricts access to work history. If data is missing, try using 'AI Paste' for a better result.",
    uk: "API LinkedIn іноді обмежує доступ до історії роботи. Якщо дані відсутні, спробуйте 'AI Paste' для кращого результату.",
    ru: "API LinkedIn иногда ограничивает доступ к истории работы. Если данные отсутствуют, попробуйте 'AI Paste' для лучшего результата.",
  },

  // Footer
  "footer.about": { en: "About Us", uk: "Про нас", ru: "О нас" },
  "footer.about_text": {
    en: "GetHired helps you create professional resumes with AI-powered recommendations and LinkedIn integration.",
    uk: "GetHired допомагає вам створювати професійні резюме за допомогою рекомендацій AI та інтеграції з LinkedIn.",
    ru: "GetHired помогает вам создавать профессиональные резюме с помощью рекомендаций AI и интеграции с LinkedIn.",
  },
  "footer.legal": { en: "Legal", uk: "Юридичне", ru: "Юридическое" },
  "footer.privacy_policy": {
    en: "Privacy Policy",
    uk: "Політика приватності",
    ru: "Политика конфиденциальности",
  },
  "footer.terms_of_service": {
    en: "Terms of Service",
    uk: "Умови користування",
    ru: "Условия использования",
  },
  "footer.cookie_policy": {
    en: "Cookie Policy",
    uk: "Політика щодо печива",
    ru: "Политика в отношении печенья",
  },
  "footer.contact": { en: "Contact", uk: "Контакти", ru: "Контакты" },
  "footer.contact_email": {
    en: "support@gethired.work",
    uk: "support@gethired.work",
    ru: "support@gethired.work",
  },
  "footer.copyright": {
    en: "GetHired. All rights reserved.",
    uk: "GetHired. Усі права захищені.",
    ru: "GetHired. Все права защищены.",
  },

  // Privacy Policy
  "privacy.section1_title": { en: "Introduction", uk: "Вступ", ru: "Введение" },
  "privacy.section1_text": {
    en: "We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.",
    uk: "Ми прихильні до захисту вашої приватності. Ця Політика приватності пояснює, як ми збираємо, використовуємо, розкриваємо та захищаємо вашу інформацію при використанні нашого веб-сайту та послуг.",
    ru: "Мы привержены защите вашей конфиденциальности. Данная Политика конфиденциальности объясняет, как мы собираем, используем, раскрываем и защищаем вашу информацию при использовании нашего веб-сайта и услуг.",
  },
  "privacy.section2_title": {
    en: "Information We Collect",
    uk: "Інформація, яку ми збираємо",
    ru: "Информация, которую мы собираем",
  },
  "privacy.section2_text": {
    en: "We collect information you provide directly (such as email, resume data, and profile information) and information collected automatically (such as log data and cookies). We may also collect information from LinkedIn when you connect your account.",
    uk: "Ми збираємо інформацію, яку ви надаєте безпосередньо (наприклад, електронну пошту, дані резюме та інформацію профілю) та інформацію, зібрану автоматично (наприклад, дані журналу та файли cookie). Ми також можемо збирати інформацію з LinkedIn при підключенні вашого облікового запису.",
    ru: "Мы собираем информацию, которую вы предоставляете напрямую (такую как электронная почта, данные резюме и информацию профиля) и информацию, собранную автоматически (такую как данные журнала и файлы cookie). Мы также можем собирать информацию из LinkedIn при подключении вашего аккаунта.",
  },
  "privacy.section3_title": {
    en: "How We Use Your Information",
    uk: "Як ми використовуємо вашу інформацію",
    ru: "Как мы используем вашу информацию",
  },
  "privacy.section3_text": {
    en: "We use your information to provide, maintain, and improve our services, to process transactions, to send you service updates, and to comply with legal obligations.",
    uk: "Ми використовуємо вашу інформацію для надання, обслуговування та вдосконалення наших послуг, обробки операцій, надсилання вам оновлень послуг та відповідності юридичним зобов'язанням.",
    ru: "Мы используем вашу информацию для предоставления, поддержки и улучшения наших услуг, обработки транзакций, отправки вам обновлений услуг и соблюдения юридических обязательств.",
  },
  "privacy.section4_title": {
    en: "Data Security",
    uk: "Безпека даних",
    ru: "Безопасность данных",
  },
  "privacy.section4_text": {
    en: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.",
    uk: "Ми впроваджуємо відповідні технічні та організаційні заходи для захисту вашої особистої інформації від несанкціонованого доступу, зміни, розкриття або знищення. Однак жоден спосіб передачі через Інтернет не є 100% безпечним.",
    ru: "Мы принимаем надлежащие технические и организационные меры для защиты вашей личной информации от несанкционированного доступа, изменения, раскрытия или уничтожения. Однако никакой способ передачи через Интернет не является 100% безопасным.",
  },
  "privacy.section5_title": {
    en: "Your Rights",
    uk: "Ваші права",
    ru: "Ваши права",
  },
  "privacy.section5_text": {
    en: "You have the right to access, correct, or delete your personal information. You can manage your preferences in your account settings or contact us for assistance.",
    uk: "У вас є право на доступ, виправлення або видалення вашої особистої інформації. Ви можете керувати своїми параметрами в налаштуваннях облікового запису або звернутися до нас за допомогою.",
    ru: "Вы имеете право на доступ, исправление или удаление вашей личной информации. Вы можете управлять своими предпочтениями в настройках учетной записи или связаться с нами для получения помощи.",
  },
  "privacy.section6_title": {
    en: "Contact Us",
    uk: "Зв'яжіться з нами",
    ru: "Свяжитесь с нами",
  },
  "privacy.section6_text": {
    en: "If you have questions about this Privacy Policy or our privacy practices, please contact us at support@gethired.work.",
    uk: "Якщо у вас є запитання щодо цієї Політики приватності або наших методів захисту приватності, будь ласка, зв'яжіться з нами за адресою support@gethired.work.",
    ru: "Если у вас есть вопросы о данной Политике конфиденциальности или наших методах защиты конфиденциальности, пожалуйста, свяжитесь с нами по адресу support@gethired.work.",
  },

  // Terms of Service
  "terms.section1_title": {
    en: "Agreement to Terms",
    uk: "Погодження з Умовами",
    ru: "Согласие с условиями",
  },
  "terms.section1_text": {
    en: "By accessing and using GetHired, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
    uk: "Отримавши доступ та використовуючи GetHired, ви приймаєте та погоджуєтесь бути пов'язані умовами та положеннями цієї угоди. Якщо ви не згодні дотримуватися вищевказаного, будь ласка, не користуйтеся цією послугою.",
    ru: "Получая доступ и используя GetHired, вы принимаете и соглашаетесь соблюдать условия и положения данного соглашения. Если вы не согласны соблюдать вышеизложенное, пожалуйста, не используйте эту услугу.",
  },
  "terms.section2_title": {
    en: "Use License",
    uk: "Ліцензія на використання",
    ru: "Лицензия на использование",
  },
  "terms.section2_text": {
    en: "Permission is granted to temporarily download one copy of the materials (information or software) on GetHired for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify the materials, copy the materials, use the materials for any commercial purpose or for any public display, attempt to decompile or reverse engineer any software contained on the service, transfer the materials to another person, or replicate the materials on any other server.",
    uk: "Надається дозвіл на тимчасове завантаження однієї копії матеріалів (інформації або програмного забезпечення) на GetHired виключно для особистого, некомерційного тимчасового перегляду. Це надання ліцензії, а не передача прав власності, і при цій ліцензії ви не можете: змінювати матеріали, копіювати матеріали, використовувати матеріали в будь-яких комерційних цілях або для публічного показу, намагатися декомпілювати або зворотньо розробляти будь-яке програмне забезпечення, розміщене на послузі, передавати матеріали іншій особі або повторювати матеріали на будь-якому іншому сервері.",
    ru: "Дается разрешение на временное загрузку одной копии материалов (информации или программного обеспечения) на GetHired исключительно для личного, некоммерческого временного просмотра. Это предоставление лицензии, а не передача прав собственности, и в соответствии с этой лицензией вы не можете: изменять материалы, копировать материалы, использовать материалы в любых коммерческих целях или для публичного отображения, пытаться декомпилировать или обратно разрабатывать любое программное обеспечение, содержащееся на сервисе, передавать материалы другому лицу или тиражировать материалы на любом другом сервере.",
  },
  "terms.section3_title": {
    en: "Disclaimer",
    uk: "Відмова від відповідальності",
    ru: "Отказ от ответственности",
  },
  "terms.section3_text": {
    en: "The materials on GetHired are provided on an 'as is' basis. GetHired makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.",
    uk: 'Матеріали на GetHired надаються на основі "як є". GetHired не дає жодних гарантій, виражених або передбачених, і цим відмовляється від усіх інших гарантій, включаючи, без обмеження, передбачені гарантії або умови товарозвичайності, придатності для конкретної мети або неанаповідальності за порушення прав інтелектуальної власності або інші порушення прав.',
    ru: 'Материалы на GetHired предоставляются "как есть". GetHired не дает никаких гарантий, ни явных, ни подразумеваемых, и настоящим отказывается от всех других гарантий, включая, без ограничения, подразумеваемые гарантии или условия товарной пригодности, пригодности для конкретной цели или неправомерности нарушения прав интеллектуальной собственности или других нарушений прав.',
  },
  "terms.section4_title": {
    en: "Limitations of Liability",
    uk: "Обмеження відповідальності",
    ru: "Ограничение ответственности",
  },
  "terms.section4_text": {
    en: "In no event shall CV Maker or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on CV Maker.",
    uk: "CV Maker та його постачальники ні за яких обставин не несуть відповідальності за будь-які збитки (включаючи, без обмеження, збитки за втрату даних або прибутку, або через перебої в роботі) що виникають з використання або неможливості використання матеріалів на CV Maker.",
    ru: "CV Maker и его поставщики при всех обстоятельствах не несут ответственности за любые убытки (включая, без ограничения, убытки от потери данных или прибыли либо из-за перебоев в работе), возникающие в результате использования или невозможности использования материалов на CV Maker.",
  },
  "terms.section5_title": {
    en: "Accuracy of Materials",
    uk: "Точність матеріалів",
    ru: "Точность материалов",
  },
  "terms.section5_text": {
    en: "The materials appearing on CV Maker could include technical, typographical, or photographic errors. CV Maker does not warrant that any of the materials on its website are accurate, complete, or current. CV Maker may make changes to the materials contained on its website at any time without notice.",
    uk: "Матеріали, що з'являються на CV Maker, можуть включати технічні, типографічні або фотографічні помилки. CV Maker не гарантує, що будь-які матеріали на його веб-сайті є точними, повними або поточними. CV Maker може змінювати матеріали на своєму веб-сайті в будь-який час без повідомлення.",
    ru: "Материалы, отображаемые на CV Maker, могут содержать технические, типографические или фотографические ошибки. CV Maker не гарантирует, что какие-либо материалы на его веб-сайте являются точными, полными или актуальными. CV Maker может вносить изменения в материалы на своем веб-сайте в любое время без уведомления.",
  },
  "terms.section6_title": { en: "Links", uk: "Посилання", ru: "Ссылки" },
  "terms.section6_text": {
    en: "CV Maker has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by CV Maker of the site. Use of any such linked website is at the user's own risk.",
    uk: "CV Maker не переглядав всі сайти, пов'язані з його веб-сайтом, і не несе відповідальності за зміст жодного такого пов'язаного сайту. Включення будь-якого посилання не означає схвалення CV Maker сайту. Використання будь-якого такого пов'язаного веб-сайту здійснюється на ризик користувача.",
    ru: "CV Maker не просмотрел все сайты, связанные с его веб-сайтом, и не несет ответственности за содержание какого-либо такого связанного сайта. Включение любой ссылки не подразумевает одобрение CV Maker сайта. Использование любого такого связанного веб-сайта происходит на риск пользователя.",
  },

  // Cookie Policy
  "cookies.section1_title": {
    en: "What Are Cookies",
    uk: "Що таке печива",
    ru: "Что такое печенье",
  },
  "cookies.section1_text": {
    en: "Cookies are small pieces of data stored on your device when you visit our website. They help us remember your preferences, maintain your session, and analyze how you use our service. Some cookies are essential for the site to function, while others help us improve your experience.",
    uk: "Печива - це невеликі фрагменти даних, збережені на вашому пристрої при відвідуванні нашого веб-сайту. Вони допомагають нам запам'ятовувати ваші переваги, підтримувати вашу сесію та аналізувати, як ви користуєтеся нашою послугою. Деякі печива є важливими для функціонування сайту, тоді як інші допомагають нам вдосконалити вашу роботу.",
    ru: "Печенье - это небольшие фрагменты данных, хранящиеся на вашем устройстве при посещении нашего веб-сайта. Они помогают нам запомнить ваши предпочтения, поддерживать ваш сеанс и анализировать, как вы используете нашу услугу. Некоторое печенье необходимо для работы сайта, тогда как другое помогает нам улучшить ваш опыт.",
  },
  "cookies.section2_title": {
    en: "Types of Cookies We Use",
    uk: "Типи печива, які ми використовуємо",
    ru: "Типы печенья, которые мы используем",
  },
  "cookies.section2_text": {
    en: "Essential Cookies: Required for the site to function properly (authentication, security). Analytics Cookies: Help us understand how users interact with our site. Preference Cookies: Remember your language and theme settings. Marketing Cookies: Used to track your activity and show relevant content.",
    uk: "Необхідні печива: Необхідні для належного функціонування сайту (автентифікація, безпека). Аналітичні печива: Допомагають нам зрозуміти, як користувачі взаємодіють з нашим сайтом. Печива для переваг: Запам'ятовують ваші мовні та теми налаштування. Маркетингові печива: Використовуються для відстеження вашої діяльності та відображення відповідного змісту.",
    ru: "Важное печенье: Требуется для правильной работы сайта (аутентификация, безопасность). Аналитическое печенье: Помогает нам понять, как пользователи взаимодействуют с нашим сайтом. Печенье для предпочтений: Запомните ваши языковые и темные настройки. Маркетинговое печенье: Используется для отслеживания вашей активности и показа соответствующего контента.",
  },
  "cookies.section3_title": {
    en: "How to Control Cookies",
    uk: "Як контролювати печива",
    ru: "Как контролировать печенье",
  },
  "cookies.section3_text": {
    en: "Most web browsers allow you to control cookies through their settings. You can choose to accept all cookies, refuse all cookies, or be notified when a cookie is sent. Note that disabling essential cookies may affect the functionality of our website.",
    uk: "Більшість веб-браузерів дозволяють вам керувати печивом через його параметри. Ви можете вибрати прийняття всіх печива, відмову від усіх печива або отримання повідомлення при відправленні печива. Зверніть увагу, що вимкнення необхідних печива може вплинути на функціональність нашого веб-сайту.",
    ru: "Большинство веб-браузеров позволяют вам контролировать печенье через его настройки. Вы можете выбрать принять все печенье, отказать во всех печеньях или получить уведомление при отправке печенья. Обратите внимание, что отключение важного печенья может повлиять на функциональность нашего веб-сайта.",
  },
  "cookies.section4_title": {
    en: "Third-Party Cookies",
    uk: "Печива третіх сторін",
    ru: "Печенье третьих сторон",
  },
  "cookies.section4_text": {
    en: "We may use third-party services that set cookies on your device, such as analytics providers and authentication services (LinkedIn, Google). These services have their own privacy policies and cookie practices.",
    uk: "Ми можемо використовувати сторонні послуги, які встановлюють печива на вашому пристрої, такі як постачальники аналітики та послуги автентифікації (LinkedIn, Google). Ці послуги мають свої власні політики приватності та практики щодо печива.",
    ru: "Мы можем использовать сторонние сервисы, которые устанавливают печенье на вашем устройстве, такие как поставщики аналитики и услуги аутентификации (LinkedIn, Google). Эти сервисы имеют свои собственные политики конфиденциальности и практики использования печенья.",
  },
  "cookies.section5_title": {
    en: "Changes to This Policy",
    uk: "Зміни до цієї політики",
    ru: "Изменения в этой политике",
  },
  "cookies.section5_text": {
    en: "We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by updating the date of this policy.",
    uk: "Ми можемо оновлювати цю Політику щодо печива час від часу, щоб відобразити зміни в наших практиках або з інших операційних, юридичних чи нормативних причин. Ми повідомимо вас про будь-які матеріальні зміни, оновивши дату цієї політики.",
    ru: "Мы можем обновлять данную Политику в отношении печенья время от времени, чтобы отразить изменения в нашей практике или по другим операционным, юридическим или нормативным причинам. Мы уведомим вас о любых существенных изменениях, обновив дату этой политики.",
  },
  "work.add_description_point": {
    en: "Add description point",
    uk: "Додати пункт опису",
    ru: "Добавить пункт описания",
  },
  "skill.level.elementary": {
    en: "Elementary",
    uk: "Елементарний",
    ru: "Элементарный",
  },
  "form.experience": {
    en: "Experience",
    uk: "Досвід",
    ru: "Опыт",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    const effectiveLanguage = language;
    const translation = translations[key];

    if (translation) {
      return translation[effectiveLanguage] || translation["en"] || key;
    }
    return key;
  };

  useEffect(() => {
    const saved = localStorage.getItem("cv-maker-language") as Language;
    if (saved && ["en", "uk", "ru"].includes(saved) && saved !== "en") {
      // eslint-disable-next-line
      setLanguage(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cv-maker-language", language);
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
