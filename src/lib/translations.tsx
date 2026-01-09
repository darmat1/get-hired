'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'en' | 'uk' | 'ru'

export interface Translations {
  [key: string]: {
    [key in Language]: string
  }
}

export const translations: Translations = {
  'nav.logo': { en: 'CV Maker', uk: 'CV Maker', ru: 'CV Maker' },
  'nav.dashboard': { en: 'My Resumes', uk: 'Мої резюме', ru: 'Мои резюме' },
  'nav.ai_settings': { en: 'AI Settings', uk: 'Налаштування AI', ru: 'AI настройки' },
  'nav.create_resume': { en: 'Create Resume', uk: 'Створити резюме', ru: 'Создать резюме' },
  'nav.sign_in': { en: 'Sign in with LinkedIn', uk: 'Увійти через LinkedIn', ru: 'Войти через LinkedIn' },
  'nav.sign_out': { en: 'Sign out', uk: 'Вийти', ru: 'Выйти' },

  'home.title': { en: 'Create a Professional Resume', uk: 'Створіть професійне резюме', ru: 'Создайте профессиональное резюме' },
  'home.subtitle': { en: 'Import data from LinkedIn, use AI recommendations and choose from multiple PDF templates', uk: 'Імпортуйте дані з LinkedIn, використовуйте AI-рекомендації та оберіть з численних PDF-шаблонів', ru: 'Импортируйте данные из LinkedIn, используйте AI-рекомендации и выберите из множества шаблонов PDF' },
  'home.create_resume_btn': { en: 'Create Resume', uk: 'Створити резюме', ru: 'Создать резюме' },
  'home.sign_in': { en: 'Sign in', uk: 'Увійти', ru: 'Войти' },
  'home.feature.linkedin.title': { en: 'LinkedIn Integration', uk: 'Інтеграція з LinkedIn', ru: 'Интеграция с LinkedIn' },
  'home.feature.linkedin.desc': { en: 'Import your profile, work experience, education and skills with one click from LinkedIn', uk: 'Імпортуйте ваш профіль, досвід роботи, освіту та навички одним кліком з LinkedIn', ru: 'Импортируйте ваш профиль, опыт работы, образование и навыки одним кликом из LinkedIn' },
  'home.feature.ai.title': { en: 'AI Recommendations', uk: 'AI-рекомендації', ru: 'AI-рекомендации' },
  'home.feature.ai.desc': { en: 'Get personalized resume improvement suggestions from artificial intelligence', uk: 'Отримайте персоналізовані поради щодо вдосконалення резюме від штучного інтелекту', ru: 'Получите персональные рекомендации по улучшению резюме от искусственного интеллекта' },
  'home.feature.templates.title': { en: 'Professional Templates', uk: 'Професійні шаблони', ru: 'Профессиональные шаблоны' },
  'home.feature.templates.desc': { en: 'Choose from modern, professional, creative and minimalist templates and save as PDF', uk: 'Оберіть з сучасних, професійних, креативних та мінімалістичних шаблонів і збережіть у PDF', ru: 'Выберите из современных, профессиональных, креативных и минималистичных шаблонов и сохраните в PDF' },

  'form.personal_info': { en: 'Personal Information', uk: 'Особиста інформація', ru: 'Личная информация' },
  'form.first_name': { en: 'First Name', uk: 'Ім\'я', ru: 'Имя' },
  'form.last_name': { en: 'Last Name', uk: 'Прізвище', ru: 'Фамилия' },
  'form.email': { en: 'Email', uk: 'Email', ru: 'Email' },
  'form.phone': { en: 'Phone', uk: 'Телефон', ru: 'Телефон' },
  'form.location': { en: 'Location', uk: 'Місцезнаходження', ru: 'Местоположение' },
  'form.website': { en: 'Website', uk: 'Веб-сайт', ru: 'Веб-сайт' },
  'form.summary': { en: 'Summary', uk: 'Про себе', ru: 'О себе' },
  'form.work_experience': { en: 'Work Experience', uk: 'Досвід роботи', ru: 'Опыт работы' },
  'form.education': { en: 'Education', uk: 'Освіта', ru: 'Образование' },
  'form.skills': { en: 'Skills', uk: 'Навички', ru: 'Навыки' },
  'form.add': { en: 'Add', uk: 'Додати', ru: 'Добавить' },
  'form.next': { en: 'Next', uk: 'Далі', ru: 'Далее' },
  'form.back': { en: 'Back', uk: 'Назад', ru: 'Назад' },
  'form.delete': { en: 'Delete', uk: 'Видалити', ru: 'Удалить' },
  'form.save': { en: 'Save', uk: 'Зберегти', ru: 'Сохранить' },
  'form.download_pdf': { en: 'Download PDF', uk: 'Завантажити PDF', ru: 'Скачать PDF' },
  'form.import_linkedin': { en: 'Import from LinkedIn', uk: 'Імпорт з LinkedIn', ru: 'Импорт из LinkedIn' },
  'form.loading': { en: 'Loading...', uk: 'Завантаження...', ru: 'Загрузка...' },

  'placeholder.first_name': { en: 'John', uk: 'Іван', ru: 'Иван' },
  'placeholder.last_name': { en: 'Doe', uk: 'Петренко', ru: 'Иванов' },
  'placeholder.email': { en: 'john@example.com', uk: 'ivan@example.com', ru: 'ivan@example.com' },
  'placeholder.phone': { en: '+1 (555) 123-4567', uk: '+1 (555) 123-4567', ru: '+1 (555) 123-4567' },
  'placeholder.location': { en: 'New York, NY', uk: 'New York, NY', ru: 'New York, NY' },
  'placeholder.website': { en: 'https://example.com', uk: 'https://example.com', ru: 'https://example.com' },
  'placeholder.summary': { en: 'Describe your professional experience and goals...', uk: 'Опишіть ваш професійний досвід та цілі...', ru: 'Опишите ваш профессиональный опыт и цели...' },

  'dashboard.title': { en: 'My Resumes', uk: 'Мої резюме', ru: 'Мои резюме' },
  'dashboard.subtitle': { en: 'Manage your resumes and create new ones', uk: 'Керуйте своїми резюме та створюйте нові', ru: 'Управляйте вашими резюме и создавайте новые' },
  'dashboard.no_resumes': { en: 'You don\'t have any resumes yet', uk: 'У вас ще немає резюме', ru: 'У вас пока нет резюме' },
  'dashboard.no_resumes_desc': { en: 'Create your first resume to get started', uk: 'Створіть своє перше резюме, щоб почати', ru: 'Создайте первое резюме, чтобы начать' },
  'dashboard.loading': { en: 'Loading...', uk: 'Завантаження...', ru: 'Загрузка...' },
  'dashboard.edit': { en: 'Edit', uk: 'Редагувати', ru: 'Редактировать' },
  'dashboard.template': { en: 'Template', uk: 'Шаблон', ru: 'Шаблон' },
  'dashboard.created': { en: 'Created', uk: 'Створено', ru: 'Создано' },
  'dashboard.updated': { en: 'Updated', uk: 'Оновлено', ru: 'Обновлено' },
  'dashboard.delete_confirm': { en: 'Are you sure you want to delete this resume?', uk: 'Ви впевнені, що хочете видалити це резюме?', ru: 'Вы уверены, что хотите удалить это резюме?' },

  'ai.title': { en: 'AI Resume Analysis', uk: 'AI Аналіз резюме', ru: 'AI Анализ резюме' },
  'ai.analyzing': { en: 'Analyzing resume...', uk: 'Аналіз резюме...', ru: 'Анализ резюме...' },
  'ai.score': { en: 'Resume score:', uk: 'Оцінка резюме:', ru: 'Оценка резюме:' },
  'ai.excellent': { en: 'Excellent!', uk: 'Чудово!', ru: 'Отлично!' },
  'ai.good': { en: 'Good', uk: 'Добре', ru: 'Хорошо' },
  'ai.fair': { en: 'Fair', uk: 'Задовільно', ru: 'Нормально' },
  'ai.needs_work': { en: 'Needs improvement', uk: 'Потребує покращення', ru: 'Требует улучшения' },
  'ai.strengths': { en: 'Strengths', uk: 'Сильні сторони', ru: 'Сильные стороны' },
  'ai.weaknesses': { en: 'Areas to improve', uk: 'Що можна покращити', ru: 'Что можно улучшить' },
  'ai.recommendations': { en: 'Improvement recommendations', uk: 'Рекомендації щодо покращення', ru: 'Рекомендации по улучшению' },
  'ai.detailed_recommendations': { en: 'Detailed recommendations', uk: 'Детальні рекомендації', ru: 'Детальные рекомендации' },

  'ai_settings.title': { en: 'AI Settings', uk: 'Налаштування AI', ru: 'AI настройки' },
  'ai_settings.subtitle': { en: 'Manage AI services for resume analysis', uk: 'Керуйте AI-сервісами для аналізу резюме', ru: 'Управляйте AI сервисами для анализа резюме' },
  'ai_settings.active_service': { en: 'Active AI service:', uk: 'Активний AI сервіс:', ru: 'Активный AI сервис:' },
  'ai_settings.analysis_using': { en: 'Resume analysis is performed using', uk: 'Аналіз резюме виконується за допомогою', ru: 'Анализ резюме выполняется с помощью' },
  'ai_settings.available_services': { en: 'Available AI Services', uk: 'Доступні AI сервіси', ru: 'Доступные AI сервисы' },
  'ai_settings.free': { en: 'Free', uk: 'Безкоштовно', ru: 'Бесплатный' },
  'ai_settings.paid': { en: 'Paid', uk: 'Платний', ru: 'Платный' },
  'ai_settings.connected': { en: 'Connected', uk: 'Підключено', ru: 'Подключено' },
  'ai_settings.setup': { en: 'Setup', uk: 'Налаштувати', ru: 'Настроить' },
  'ai_settings.test': { en: 'Test', uk: 'Перевірити', ru: 'Проверить' },
  'ai_settings.testing': { en: 'Testing...', uk: 'Перевірка...', ru: 'Проверка...' },
  'ai_settings.not_configured': { en: 'AI analysis not configured', uk: 'AI аналіз не налаштовано', ru: 'AI анализ не настроен' },
  'ai_settings.not_configured_desc': { en: 'Configure at least one AI service to get personalized resume improvement recommendations.', uk: 'Налаштуйте хоча б один AI-сервіс для отримання персоналізованих рекомендацій щодо покращення резюме.', ru: 'Настройте хотя бы один AI сервис для получения персонализированных рекомендаций по улучшению резюме.' },
  'ai_settings.reload': { en: 'Reload application after setup', uk: 'Перезавантажити застосунок після налаштування', ru: 'Перезагрузить приложение после настройки' },
  'ai_settings.how_it_works': { en: 'How does AI analysis work?', uk: 'Як працює AI аналіз?', ru: 'Как работает AI анализ?' },
  'ai_settings.how_it_works_items': {
    en: '• AI analyzes the structure and content of your resume\n• Identifies strengths and areas for improvement\n• Provides personalized recommendations for each section\n• Helps make your resume more attractive to recruiters',
    uk: '• AI аналізує структуру та зміст вашого резюме\n• Виявляє сильні сторони та області для покращення\n• Надає персоналізовані рекомендації для кожного розділу\n• Допомагає зробити ваше резюме привабливішим для рекрутерів',
    ru: '• AI анализирует структуру и содержание вашего резюме\n• Выявляет сильные стороны и области для улучшения\n• Дает персонализированные рекомендации по каждому разделу\n• Помогает сделать резюме более привлекательным для рекрутеров'
  },

  'template.title': { en: 'Choose template', uk: 'Оберіть шаблон', ru: 'Выберите шаблон' },
  'template.modern': { en: 'Modern', uk: 'Сучасний', ru: 'Современный' },
  'template.modern_desc': { en: 'Clean and minimalist design', uk: 'Чистий та мінімалістичний дизайн', ru: 'Чистый и минималистичный дизайн' },
  'template.professional': { en: 'Professional', uk: 'Професійний', ru: 'Профессиональный' },
  'template.professional_desc': { en: 'Classic business style', uk: 'Класичний діловий стиль', ru: 'Классический деловой стиль' },
  'template.creative': { en: 'Creative', uk: 'Креативний', ru: 'Креативный' },
  'template.creative_desc': { en: 'Bright and eye-catching design', uk: 'Яскравий та помітний дизайн', ru: 'Яркий и заметный дизайн' },
  'template.minimal': { en: 'Minimalist', uk: 'Мінімалістичний', ru: 'Минималистичный' },
  'template.minimal_desc': { en: 'Simple and elegant', uk: 'Простий та елегантний', ru: 'Простой и элегантный' },
  'template.selected': { en: 'Selected', uk: 'Обрано', ru: 'Выбрано' },
  'template.preview': { en: 'Preview', uk: 'Перегляд', ru: 'Предпросмотр' },

  'theme.toggle': { en: 'Toggle theme', uk: 'Перемкнути тему', ru: 'Переключить тему' },
  'theme.light': { en: 'Light', uk: 'Світла', ru: 'Светлая' },
  'theme.dark': { en: 'Dark', uk: 'Темна', ru: 'Темная' },
  'theme.system': { en: 'System', uk: 'Система', ru: 'Система' },

  'language.title': { en: 'Language', uk: 'Мова', ru: 'Язык' },
  'language.english': { en: 'English', uk: 'English', ru: 'English' },
  'language.ukrainian': { en: 'Ukrainian', uk: 'Українська', ru: 'Украинский' },
  'language.russian': { en: 'Russian', uk: 'Російська', ru: 'Русский' },

  'work.position': { en: 'Position', uk: 'Посада', ru: 'Должность' },
  'work.company': { en: 'Company', uk: 'Компанія', ru: 'Компания' },
  'work.location': { en: 'Location', uk: 'Локація', ru: 'Локация' },
  'work.period': { en: 'Period', uk: 'Період', ru: 'Период' },
  'work.description': { en: 'Description of responsibilities', uk: 'Опис обов\'язків', ru: 'Описание обязанностей' },
  'work.current_position': { en: 'Current position', uk: 'Поточна посада', ru: 'Текущая должность' },
  'work.start_date': { en: 'Start date', uk: 'Дата початку', ru: 'Дата начала' },
  'work.end_date': { en: 'End date', uk: 'Дата закінчення', ru: 'Дата окончания' },
  'work.placeholder.position': { en: 'Frontend Developer', uk: 'Frontend Developer', ru: 'Frontend Developer' },
  'work.placeholder.company': { en: 'Tech Company', uk: 'Tech Company', ru: 'Tech Company' },
  'work.placeholder.location': { en: 'San Francisco, CA', uk: 'San Francisco, CA', ru: 'San Francisco, CA' },
  'work.placeholder.description': { en: 'Describe your responsibilities and achievements...', uk: 'Опишіть ваші обов\'язки та досягнення...', ru: 'Опишите ваши обязанности и достижения...' },

  'skills.technical': { en: 'Technical skills', uk: 'Технічні навички', ru: 'Технические навыки' },
  'skills.soft': { en: 'Soft skills', uk: 'Soft skills', ru: 'Soft skills' },
  'skills.languages': { en: 'Languages', uk: 'Мови', ru: 'Языки' },
  'skills.none': { en: 'No skills in this category', uk: 'Немає навичок у цій категорії', ru: 'Нет навыков в этой категории' },
  'skill.level.beginner': { en: 'Beginner', uk: 'Початківець', ru: 'Начинающий' },
  'skill.level.intermediate': { en: 'Intermediate', uk: 'Середній', ru: 'Средний' },
  'skill.level.advanced': { en: 'Advanced', uk: 'Просунутий', ru: 'Продвинутый' },
  'skill.level.expert': { en: 'Expert', uk: 'Експерт', ru: 'Эксперт' },
  'skills.placeholder.skill': { en: 'JavaScript', uk: 'JavaScript', ru: 'JavaScript' },

  'education.institution': { en: 'Institution', uk: 'Навчальний заклад', ru: 'Учебное заведение' },
  'education.degree': { en: 'Degree', uk: 'Ступінь', ru: 'Степень' },
  'education.field': { en: 'Field of study', uk: 'Спеціальність', ru: 'Специальность' },
  'education.gpa': { en: 'GPA', uk: 'Середній бал (GPA)', ru: 'Средний балл (GPA)' },
  'education.period': { en: 'Period of study', uk: 'Період навчання', ru: 'Период обучения' },
  'education.placeholder.institution': { en: 'Stanford University', uk: 'Stanford University', ru: 'Stanford University' },
  'education.placeholder.degree': { en: 'Bachelor of Science', uk: 'Bachelor of Science', ru: 'Bachelor of Science' },
  'education.placeholder.field': { en: 'Computer Science', uk: 'Computer Science', ru: 'Computer Science' },
  'education.placeholder.gpa': { en: '3.8', uk: '3.8', ru: '3.8' },

  'preview.title': { en: 'Resume preview', uk: 'Перегляд резюме', ru: 'Предпросмотр резюме' },
  'preview.work_experience': { en: 'Work Experience', uk: 'Досвід роботи', ru: 'Опыт работы' },
  'preview.education': { en: 'Education', uk: 'Освіта', ru: 'Образование' },
  'preview.skills': { en: 'Skills', uk: 'Навички', ru: 'Навыки' },

  'page.home.title': { en: 'CV Maker - Create Professional Resumes', uk: 'CV Maker - Створення професійних резюме', ru: 'CV Maker - Создание профессиональных резюме' },
  'page.home.description': { en: 'Create professional resumes with LinkedIn data integration and AI recommendations', uk: 'Створюйте професійні резюме з даними з LinkedIn та AI-рекомендаціями', ru: 'Создавайте профессиональные резюме с данными из LinkedIn и AI-рекомендациями' },

  'resume_builder.title': { en: 'Create Resume', uk: 'Створити резюме', ru: 'Создать резюме' },
  'resume_builder.subtitle': { en: 'Fill in your information to create a professional resume', uk: 'Заповніть свою інформацію для створення професійного резюме', ru: 'Заполните свою информацию для создания профессионального резюме' },
  'resume_builder.success': { en: 'Resume created successfully!', uk: 'Резюме створено успішно!', ru: 'Резюме создано успешно!' },

  'message.resume_saved': { en: 'Resume saved successfully', uk: 'Резюме збережено успішно', ru: 'Резюме сохранено успешно' },
  'message.resume_deleted': { en: 'Resume deleted successfully', uk: 'Резюме видалено успішно', ru: 'Резюме удалено успешно' },
  'message.resume_created': { en: 'Resume created successfully', uk: 'Резюме створено успішно', ru: 'Резюме создано успешно' },
  'message.loading': { en: 'Loading...', uk: 'Завантаження...', ru: 'Загрузка...' },
  'message.error': { en: 'Error occurred', uk: 'Виникла помилка', ru: 'Произошла ошибка' },
  'message.no_data': { en: 'No data available', uk: 'Даних немає', ru: 'Данных нет' },

  'validation.required': { en: 'This field is required', uk: 'Це поле є обов\'язковим', ru: 'Это поле обязательно' },
  'validation.email': { en: 'Please enter a valid email address', uk: 'Будь ласка, введіть дійсну email адресу', ru: 'Пожалуйста, введите действительный email' },
  'validation.phone': { en: 'Please enter a valid phone number', uk: 'Будь ласка, введіть дійсний номер телефону', ru: 'Пожалуйста, введите действительный номер телефона' },
  
  // AI Services
  'ai_service.groq.description': { en: 'Llama 3.1 - free and very fast', uk: 'Llama 3.1 - безкоштовний і дуже швидкий', ru: 'Llama 3.1 - бесплатный и очень быстрый' },
  'ai_service.openai.description': { en: 'GPT-3.5 Turbo - paid but very high quality', uk: 'GPT-3.5 Turbo - платний, але дуже якісний', ru: 'GPT-3.5 Turbo - платный, но очень качественный' },
  'ai_service.groq.limits': { en: '30 requests per minute for free', uk: '30 запитів на хвилину безкоштовно', ru: '30 запросов в минуту бесплатно' },
  'ai_service.openai.limits': { en: 'Paid usage, but very high quality analysis', uk: 'Платне використання, але дуже якісний аналіз', ru: 'Платное использование, но очень качественный анализ' },
  
  // AI Setup Instructions
  'ai_setup.groq.step1': { en: '1. Go to https://console.groq.com/', uk: '1. Перейдіть на https://console.groq.com/', ru: '1. Перейдите на https://console.groq.com/' },
  'ai_setup.groq.step2': { en: '2. Register (free)', uk: '2. Зареєструйтесь (безкоштовно)', ru: '2. Зарегистрируйтесь (бесплатно)' },
  'ai_setup.groq.step3': { en: '3. Create new API key in "API Keys" section', uk: '3. Створіть новий API ключ у розділі "API Keys"', ru: '3. Создайте новый API ключ в разделе "API Keys"' },
  'ai_setup.groq.step4': { en: '4. Add key to .env.local as GROQ_API_KEY=your-key-here', uk: '4. Додайте ключ до .env.local як GROQ_API_KEY=your-key-here', ru: '4. Добавьте ключ в .env.local как GROQ_API_KEY=your-key-here' },
  'ai_setup.groq.step5': { en: '5. Get 14 days of free usage', uk: '5. Отримайте 14 днів безкоштовного використання', ru: '5. Получите 14 дней бесплатного использования' },
  'ai_setup.openai.step1': { en: '1. Go to https://platform.openai.com/', uk: '1. Перейдіть на https://platform.openai.com/', ru: '1. Перейдите на https://platform.openai.com/' },
  'ai_setup.openai.step2': { en: '2. Register and add payment method', uk: '2. Зареєструйтесь і додайте спосіб оплати', ru: '2. Зарегистрируйтесь и добавьте способ оплаты' },
  'ai_setup.openai.step3': { en: '3. Create new API key in "API Keys" section', uk: '3. Створіть новий API ключ у розділі "API Keys"', ru: '3. Создайте новый API ключ в разделе "API Keys"' },
  'ai_setup.openai.step4': { en: '4. Add key to .env.local as OPENAI_API_KEY=your-key-here', uk: '4. Додайте ключ до .env.local як OPENAI_API_KEY=your-key-here', ru: '4. Добавьте ключ в .env.local как OPENAI_API_KEY=your-key-here' },
  'ai_setup.openai.step5': { en: '5. Cost per resume analysis: ~$0.001', uk: '5. Вартість аналізу одного резюме: ~$0.001', ru: '5. Стоимость анализа одного резюме: ~$0.001' },
  
  // AI Analysis Messages
  'ai_analysis.summary_good': { en: 'Professional experience is well described in "About" section', uk: 'Професійний досвід добре описаний у розділі "Про себе"', ru: 'Хорошо описан профессиональный опыт в разделе "О себе"' },
  'ai_analysis.summary_missing': { en: '"About" section is too short or missing', uk: 'Розділ "Про себе" занадто короткий або відсутній', ru: 'Раздел "О себе" слишком короткий или отсутствует' },
  'ai_analysis.summary_recommendation': { en: 'Add more detailed description of your experience and goals (2-3 sentences)', uk: 'Додайте більш детальний опис вашого досвіду та цілей (2-3 речення)', ru: 'Добавьте более подробное описание вашего опыта и целей (2-3 предложения)' },
  'ai_analysis.work_missing': { en: 'No work experience listed', uk: 'Не вказано досвід роботи', ru: 'Отсутствует опыт работы' },
  'ai_analysis.work_add': { en: 'Add information about previous positions', uk: 'Додайте інформацію про попередні місця роботи', ru: 'Добавьте информацию о предыдущих местах работы' },
  'ai_analysis.work_detailed': { en: 'Detailed description of responsibilities in work experience', uk: 'Детальний опис обов\'язків у досвіді роботи', ru: 'Подробное описание обязанностей в опыте работы' },
  'ai_analysis.work_add_details': { en: 'Add more details to responsibility descriptions', uk: 'Додайте більше деталей до опису обов\'язків', ru: 'Добавьте больше деталей в описание обязанностей' },
  'ai_analysis.work_recommendation': { en: 'For each position, add 3-5 key responsibilities using active verbs', uk: 'Для кожної посади додайте 3-5 ключових обов\'язків з використанням активних дієслів', ru: 'Для каждой должности добавьте 3-5 ключевых обязанностей с использованием активных глаголов' },
  'ai_analysis.education_listed': { en: 'Education is listed', uk: 'Освіта вказана', ru: 'Указано образование' },
  'ai_analysis.education_consider': { en: 'Consider adding education information', uk: 'Розгляньте додавання інформації про освіту', ru: 'Рассмотрите добавление информации об образовании' },
  'ai_analysis.education_recommendation': { en: 'Add information about your education even if it\'s courses or certificates', uk: 'Додайте інформацію про вашу освіту навіть якщо це курси або сертифікати', ru: 'Добавьте информацию о вашем образовании даже если это курсы или сертификаты' },
  'ai_analysis.technical_good': { en: 'Technical skills are well represented', uk: 'Технічні навички добре представлені', ru: 'Хорошо представлены технические навыки' },
  'ai_analysis.technical_add_more': { en: 'Add more technical skills', uk: 'Додайте більше технічних навичок', ru: 'Добавьте больше технических навыков' },
  'ai_analysis.softskills_listed': { en: 'Soft skills are listed', uk: 'Soft skills вказані', ru: 'Указаны soft skills' },
  'ai_analysis.softskills_add': { en: 'Add soft skills: communication, teamwork, problem solving', uk: 'Додайте soft skills: комунікація, робота в команді, вирішення проблем', ru: 'Добавьте soft skills: коммуникация, работа в команде, решение проблем' },
  'ai_analysis.general_certificates': { en: 'Consider adding certificates and professional development courses', uk: 'Розгляньте додавання сертифікатів та курсів підвищення кваліфікації', ru: 'Рассмотрите добавление сертификатов и курсов повышения квалификации' },
  
  // AI Improvement Tips
  'ai_tip.poor_score': { en: 'Your resume needs significant improvements to attract recruiters', uk: 'Ваше резюме потребує значних покращень для приваблення рекрутерів', ru: 'Ваше резюме требует значительных улучшений для привлечения внимания рекрутеров' },
  'ai_tip.good_score': { en: 'Good resume, but there are opportunities for improvement', uk: 'Добре резюме, але є можливості для покращення', ru: 'Хорошее резюме, но есть возможности для улучшения' },
  'ai_tip.excellent_score': { en: 'Excellent resume! Consider fine-tuning for each specific position', uk: 'Чудове резюме! Розгляньте тонке налаштування для кожної конкретної позиції', ru: 'Отличное резюме! Рассмотрите тонкую настройку для каждой конкретной позиции' },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cv-maker-language') as Language
      if (saved && ['en', 'uk', 'ru'].includes(saved)) {
        return saved
      }
      return 'en'
    }
    return 'en'
  })

  const t = (key: string): string => {
    const translation = translations[key]
    if (translation && translation[language]) {
      return translation[language]
    }
    return key
  }

  useEffect(() => {
    localStorage.setItem('cv-maker-language', language)
    document.documentElement.lang = language
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}