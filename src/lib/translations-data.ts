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
  "auth.forgot_password": {
    en: "Forgot password?",
    uk: "Забули пароль?",
    ru: "Забыли пароль?",
  },
  "auth.reset_password": {
    en: "Reset Password",
    uk: "Скинути пароль",
    ru: "Сбросить пароль",
  },
  "auth.verify_email": {
    en: "Verify Email",
    uk: "Підтвердити Email",
    ru: "Подтвердить Email",
  },
  "auth.confirmation_code": {
    en: "Confirmation Code",
    uk: "Код підтвердження",
    ru: "Код подтверждения",
  },
  "auth.send_code": {
    en: "Send Code",
    uk: "Надіслати код",
    ru: "Отправить код",
  },
  "auth.resend_code": {
    en: "Resend Code",
    uk: "Надіслати код повторно",
    ru: "Отправить код повторно",
  },
  "auth.code_sent": {
    en: "We've sent a code to your email",
    uk: "Ми надіслали код на ваш email",
    ru: "Мы отправили код на ваш email",
  },
  "auth.verification_success": {
    en: "Email verified successfully!",
    uk: "Email успішно підтверджено!",
    ru: "Email успешно подтвержден!",
  },
  "auth.reset_success": {
    en: "Password reset successfully!",
    uk: "Пароль успішно скинуто!",
    ru: "Пароль успешно сброшен!",
  },
  "auth.check_email": {
    en: "Please check your inbox",
    uk: "Будь ласка, перевірте поштову скриньку",
    ru: "Пожалуйста, проверьте почтовый ящик",
  },
  "common.auth_required": {
    en: "Authorization required",
    uk: "Потрібна авторизація",
    ru: "Требуется авторизация",
  },
  "auth.sign_in_required": {
    en: "Please sign in to create a resume",
    uk: "Будь ласка, увійдіть, щоб створити резюме",
    ru: "Пожалуйста, войдите, чтобы создать резюме",
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
  "resume_builder.new_subtitle": {
    en: "Give your resume a name to get started.",
    uk: "Дайте назву вашому резюме, щоб почати.",
    ru: "Дайте название вашему резюме, чтобы начать.",
  },
  "resume_builder.resume_title": {
    en: "Resume Title",
    uk: "Назва резюме",
    ru: "Название резюме",
  },
  "resume_builder.title_placeholder": {
    en: "e.g. Software Engineer 2024",
    uk: "напр., Software Engineer 2024",
    ru: "напр., Software Engineer 2024",
  },
  "resume_builder.quick_start_title": {
    en: "Quick Start",
    uk: "Швидкий старт",
    ru: "Быстрый старт",
  },
  "resume_builder.quick_start_desc": {
    en: "After creating your resume, you can import data from your profile or fill in the details manually in our powerful editor.",
    uk: "Після створення резюме ви зможете імпортувати дані з профілю або заповнити деталі вручну в нашому редакторі.",
    ru: "После создания резюме вы сможете импортировать данные из профиля или заполнить детали вручную в нашем редакторе.",
  },
  "resume.new.title": {
    en: "Create New Resume",
    uk: "Сворити нове резюме",
    ru: "Создать новое резюме",
  },
  "resume.new.subtitle": {
    en: "Start by giving your resume a title. You can always change it later.",
    uk: "Почніть з назви резюме. Ви завжди зможете змінити її пізніше.",
    ru: "Начните с названия резюме. Вы всегда сможете изменить его позже.",
  },
  "resume.new.input_label": {
    en: "Resume Title",
    uk: "Назва резюме",
    ru: "Название резюме",
  },
  "resume.new.placeholder": {
    en: "e.g. Senior Software Engineer - Google",
    uk: "напр., Senior Software Engineer - Google",
    ru: "напр., Senior Software Engineer - Google",
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
  "profile.title": {
    en: "My Profile",
    uk: "Мій профіль",
    ru: "Мой профиль",
  },
  "profile.subtitle": {
    en: "Manage your personal information",
    uk: "Керуйте особистою інформацією",
    ru: "Управляйте личной информацией",
  },
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
  "resume.new.error_failed": {
    en: "Failed to create resume",
    uk: "Не вдалося створити резюме",
    ru: "Не удалось создать резюме",
  },
  "resume.new.error_unexpected": {
    en: "An unexpected error occurred",
    uk: "Сталася неочікувана помилка",
    ru: "Произошла непредвиденная ошибка",
  },
  "profile.pdf_processing": {
    en: "Processing PDF...",
    uk: "Обробка PDF...",
    ru: "Обработка PDF...",
  },
  "profile.ai_analyzing": {
    en: "AI is analyzing your data... {seconds}s",
    uk: "ШІ аналізує ваші дані... {seconds}с",
    ru: "ИИ анализирует ваши данные... {seconds}с",
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
    ru: "Ошибка при изменении пароле",
  },
  "profile.danger_zone": {
    en: "Danger Zone",
    uk: "Зона ризику",
    ru: "Опасная зона",
  },
  "profile.delete_account": {
    en: "Delete Account",
    uk: "Видалити акаунт",
    ru: "Удалить аккаунт",
  },
  "profile.delete_account_desc": {
    en: "Once you delete your account, there is no going back. Please be certain.",
    uk: "Після видалення акаунта його неможливо буде відновити. Будь ласка, будьте впевнені.",
    ru: "После удаления аккаунта его невозможно будет восстановить. Пожалуйста, будьте уверены.",
  },
  "profile.delete_confirm_title": {
    en: "Are you absolutely sure?",
    uk: "Ви абсолютно впевнені?",
    ru: "Вы абсолютно уверены?",
  },
  "profile.delete_confirm_desc": {
    en: "This action cannot be undone. This will permanently delete your account and remove all your data from our servers.",
    uk: "Цю дію неможливо скасувати. Це назавжди видалить ваш акаунт та всі ваші дані з наших серверів.",
    ru: "Это действие нельзя отменить. Это навсегда удалит ваш аккаунт и все ваши данные с наших серверов.",
  },
  "profile.delete_success": {
    en: "Account deleted successfully",
    uk: "Акаунт успішно видалено",
    ru: "Аккаунт успешно удален",
  },
  "profile.delete_error": {
    en: "Error deleting account",
    uk: "Помилка при видаленні акаунта",
    ru: "Ошибка при удалении аккаунта",
  },

  "home.title": {
    en: "Create a Professional Resume",
    uk: "Створіть професійне резюме",
    ru: "Создайте профессиональное резюме",
  },
  "home.subtitle": {
    en: "Upload LinkedIn PDF, use AI recommendations and choose from multiple PDF templates",
    uk: "Завантажте профілю LinkedIn (PDF), використовуйте AI-рекомендації та оберіть з численних PDF-шаблонів",
    ru: "Загрузите профиль LinkedIn (PDF), используйте AI-рекомендации и выберите из множества шаблонов PDF",
  },
  "home.create_resume_btn": {
    en: "Create Resume",
    uk: "Створити резюме",
    ru: "Создать резюме",
  },
  "home.sign_in": { en: "Sign in", uk: "Увійти", ru: "Войти" },
  "home.feature.linkedin.title": {
    en: "LinkedIn PDF Upload",
    uk: "Завантаження LinkedIn PDF",
    ru: "Загрузка LinkedIn PDF",
  },
  "home.feature.linkedin.desc": {
    en: "Easily upload your profile export PDF from LinkedIn to get started in seconds",
    uk: "Легко завантажте PDF-експорт свого профілю з LinkedIn, щоб почати за лічені секунди",
    ru: "Легко загрузите PDF-экспорт своего профиля из LinkedIn, чтобы начать за считанные секунды",
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
  "common.create": {
    en: "Create Resume",
    uk: "Створити резюме",
    ru: "Создать резюме",
  },
  "common.back_to_dashboard": {
    en: "Back to Dashboard",
    uk: "Назад до панелі",
    ru: "Назад к панели",
  },

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
  "ai_settings.recommended": {
    en: "Recommended",
    uk: "Рекомендовано",
    ru: "Рекомендуется",
  },
  "ai_settings.get_groq_key": {
    en: "Get API Key ↗",
    uk: "Отримати API ключ ↗",
    ru: "Получить API ключ ↗",
  },
  "ai_settings.active_service": {
    en: "Active AI service:",
    uk: "Активний AI сервіс:",
    ru: "Активный AI сервис:",
  },
  "ai_settings.active": { en: "Active", uk: "Активний", ru: "Активный" },
  "ai_settings.set_active": {
    en: "Set as active",
    uk: "Зробити активним",
    ru: "Сделать активным",
  },
  "ai_settings.key_saved": {
    en: "API Key saved successfully",
    uk: "API ключ успішно збережено",
    ru: "API ключ успешно сохранен",
  },
  "ai_settings.unlink": {
    en: "Remove key",
    uk: "Видалити ключ",
    ru: "Удалить ключ",
  },
  "ai_settings.test_success": { en: "Success", uk: "Успішно", ru: "Успешно" },
  "ai_settings.test_failed": { en: "Failed", uk: "Помилка", ru: "Ошибка" },
  "ai_settings.key_hidden": {
    en: "Key is encrypted and hidden",
    uk: "Ключ зашифрований та прихований",
    ru: "Ключ зашифрован и скрыт",
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

  // LANDING PAGE TRANSLATIONS
  "landing.hero.title": {
    en: "Stop guessing what recruiters want. Let AI do it for you.",
    uk: "Припиніть вгадувати, чого хочуть рекрутери. Нехай AI зробить це за вас.",
    ru: "Перестаньте угадывать, что хочет рекрутер. Пусть AI сделает это за вас.",
  },
  "landing.hero.subtitle": {
    en: "Personal AI Career Agent that adapts your experience to any job description in 30 seconds.",
    uk: "Ваш особистий кар'єрний AI-агент, який адаптує ваш досвід під будь-яку вакансію за 30 секунд.",
    ru: "Личный AI-агент карьеры, который адаптирует твой опыт под любую вакансию за 30 секунд.",
  },
  "landing.hero.cta": {
    en: "Create Free Profile",
    uk: "Створити профіль безкоштовно",
    ru: "Создать профиль бесплатно",
  },
  "landing.hero.cta_secondary": {
    en: "Upload LinkedIn PDF",
    uk: "Завантажити LinkedIn PDF",
    ru: "Загрузить LinkedIn PDF",
  },

  "landing.problem.title": {
    en: "Why are you being ignored?",
    uk: "Чому вас ігнорують?",
    ru: "Почему вас игнорируют?",
  },
  "landing.problem.1": {
    en: "You send the same resume to everyone.",
    uk: "Ви надсилаєте те саме резюме всім підряд.",
    ru: "Вы отправляете одно и то же резюме всем подряд.",
  },
  "landing.problem.2": {
    en: "You spend hours rewriting Cover Letters.",
    uk: "Ви витрачаєте години на переписування супровідних листів.",
    ru: "Вы тратите часы на переписывание Cover Letter.",
  },
  "landing.problem.3": {
    en: "You forget the numbers ATS is looking for.",
    uk: "Ви забуваєте вказати цифри, які шукає ATS.",
    ru: "Вы забываете указать важные цифры, которые ищет ATS.",
  },

  "landing.solution.title": {
    en: "One Global Profile — Infinite Resumes",
    uk: "Один глобальний профіль — нескінченна кількість резюме",
    ru: "Один «Глобальный профиль» — бесконечное количество резюме",
  },
  "landing.solution.step1.title": {
    en: "Data Collection",
    uk: "Збір даних",
    ru: "Сбор данных",
  },
  "landing.solution.step1.desc": {
    en: "Upload your LinkedIn profile PDF once to create your Global Experience.",
    uk: "Завантажте PDF свого профілю LinkedIn один раз, щоб створити свій глобальний досвід.",
    ru: "Загрузите PDF своего профиля LinkedIn один раз, чтобы создать «Глобальный опыт».",
  },
  "landing.solution.step2.title": {
    en: "AI Analysis",
    uk: "Аналіз AI",
    ru: "Анализ AI",
  },
  "landing.solution.step2.desc": {
    en: "AI analyzes your achievements and skills.",
    uk: "AI аналізує ваші досягнення та навички.",
    ru: "AI анализирует твои достижения.",
  },
  "landing.solution.step3.title": {
    en: "Smart Matching",
    uk: "Розумний підбір",
    ru: "Мэтчинг",
  },
  "landing.solution.step3.desc": {
    en: "Paste a job link -> AI picks only relevant experience for this position.",
    uk: "Вставте посилання на вакансію -> AI вибирає лише релевантний досвід.",
    ru: "Вставляешь ссылку на вакансию → AI выбирает из твоего опыта только то, что релевантно этой позиции.",
  },

  "landing.features.cover_letter.title": {
    en: "Cover Letters you're not ashamed to send",
    uk: "Супровідні листи, які не соромно надіслати",
    ru: "Сопроводительные письма, которые не стыдно отправить",
  },
  "landing.features.cover_letter.desc": {
    en: "No fluff or templates. AI uses dry facts from your experience to prove you fit.",
    uk: "Без води та шаблонів. AI використовує сухі факти з вашого досвіду, щоб довести вашу відповідність.",
    ru: "Никакой «воды» и шаблонных фраз. AI берет сухие факты из твоего опыта и доказывает, почему ты подходишь.",
  },

  "landing.how_it_works.title": {
    en: "How it works",
    uk: "Як це працює",
    ru: "Как это работает",
  },
  "landing.how_it_works.step1": {
    en: "Upload PDF from LinkedIn",
    uk: "Завантаження PDF з LinkedIn",
    ru: "Загрузка PDF с LinkedIn",
  },
  "landing.how_it_works.step2": {
    en: "AI Analysis of Experience",
    uk: "AI аналіз досвіду",
    ru: "AI-анализ опыта",
  },
  "landing.how_it_works.step3": {
    en: "Insert Job Description",
    uk: "Вставте опис вакансії",
    ru: "Вставка вакансии",
  },
  "landing.how_it_works.step4": {
    en: "Download Tailored PDF",
    uk: "Завантажте адаптирований PDF",
    ru: "Скачивание PDF",
  },

  "landing.seo.faq.title": {
    en: "Frequently Asked Questions",
    uk: "Часті запитання",
    ru: "Часто задаваемые вопросы",
  },
  "landing.seo.q1": {
    en: "How to pass ATS systems?",
    uk: "Як пройти системи ATS?",
    ru: "Как пройти системы ATS?",
  },
  "landing.seo.a1": {
    en: "Our templates are 100% ATS-friendly. AI optimizes keywords from the job description directly into your resume.",
    uk: "Наші шаблони на 100% дружні до ATS. AI оптимізує ключові слова з опису вакансії прямо у ваше резюме.",
    ru: "Наши шаблоны на 100% ATS-friendly. AI оптимизирует ключевые слова из вакансии прямо в ваше резюме.",
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
    en: "Leading AI models like GPT-4o and o1 by OpenAI.",
    uk: "Провідні AI-моделі такі як GPT-4o та o1 від OpenAI.",
    ru: "Ведущие AI-модели, такие как GPT-4o и o1 от OpenAI.",
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
  "ai_service.claude.description": {
    en: "Powerful models by Anthropic, great for creative writing and coding.",
    uk: "Потужні моделі від Anthropic, чудові для творчого письма та програмування.",
    ru: "Мощные модели от Anthropic, отлично подходят для творческого письма и программирования.",
  },
  "ai_service.gemini.description": {
    en: "Google's most capable AI models with large context windows.",
    uk: "Найпотужніші моделі від Google з величезними вікнами контексту.",
    ru: "Самые мощные модели от Google с огромными окнами контекста.",
  },
  "ai_service.grok.description": {
    en: "xAI's latest models with a focus on real-time info and reasoning.",
    uk: "Останні моделі від xAI з фокусом на актуальну інформацію та логіку.",
    ru: "Последние модели от xAI с фокусом на актуальную информацию и логику.",
  },
  "ai_service.openrouter.description": {
    en: "Access multiple models (GPT-4, Claude, Llama) through a single API.",
    uk: "Доступ до безлічі моделей (GPT-4, Claude, Llama) через єдиний API.",
    ru: "Доступ ко многим моделям (GPT-4, Claude, Llama) через единый API.",
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
  "ai_setup.claude.step1": {
    en: "1. Go to https://console.anthropic.com/",
    uk: "1. Перейдіть на https://console.anthropic.com/",
    ru: "1. Перейдите на https://console.anthropic.com/",
  },
  "ai_setup.claude.step2": {
    en: "2. Register",
    uk: "2. Зареєструйтесь",
    ru: "2. Зарегистрируйтесь",
  },
  "ai_setup.claude.step3": {
    en: "3. Create API Keys",
    uk: "3. Створіть API ключі",
    ru: "3. Создайте API ключи",
  },
  "ai_setup.claude.step4": {
    en: "4. Add payment method (credits)",
    uk: "4. Додайте метод оплати",
    ru: "4. Добавьте метод оплаты",
  },
  "ai_setup.claude.step5": {
    en: "5. Highly recommended for parsing",
    uk: "5. Рекомендовано для парсингу",
    ru: "5. Рекомендуется для парсинга",
  },

  "ai_setup.gemini.step1": {
    en: "1. Go to https://aistudio.google.com/",
    uk: "1. Перейдіть на https://aistudio.google.com/",
    ru: "1. Перейдите на https://aistudio.google.com/",
  },
  "ai_setup.gemini.step2": {
    en: "2. Create free API key",
    uk: "2. Створіть безкоштовний API ключ",
    ru: "2. Создайте бесплатный API ключ",
  },
  "ai_setup.gemini.step3": {
    en: "3. Fast and large context window",
    uk: "3. Швидкий та велике вікно контексту",
    ru: "3. Быстрый и большое окно контекста",
  },

  "ai_setup.grok.step1": {
    en: "1. Go to https://console.x.ai/",
    uk: "1. Перейдіть на https://console.x.ai/",
    ru: "1. Перейдите на https://console.x.ai/",
  },
  "ai_setup.grok.step2": {
    en: "2. Create API key",
    uk: "2. Створіть API ключ",
    ru: "2. Создайте API ключ",
  },

  "ai_setup.openrouter.step1": {
    en: "1. Go to https://openrouter.ai/",
    uk: "1. Перейдіть на https://openrouter.ai/",
    ru: "1. Перейдите на https://openrouter.ai/",
  },
  "ai_setup.openrouter.step2": {
    en: "2. Single key for all models",
    uk: "2. Один ключ для всіх моделей",
    ru: "2. Один ключ для всех моделей",
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
  "cover_letter.format_label": {
    en: "Format",
    uk: "Формат",
    ru: "Формат",
  },
  "cover_letter.format_prose": {
    en: "Letter (prose)",
    uk: "Лист (проза)",
    ru: "Письмо (проза)",
  },
  "cover_letter.format_bullet": {
    en: "Bullet list",
    uk: "Список",
    ru: "Список",
  },

  // LinkedIn Import
  "resume.import_from_linkedin": {
    en: "Upload LinkedIn PDF",
    uk: "Завантажити LinkedIn PDF",
    ru: "Загрузить LinkedIn PDF",
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
    en: "Failed to parse profile from LinkedIn PDF",
    uk: "Не вдалося обробити профіль з LinkedIn PDF",
    ru: "Не удалось обработать профиль из LinkedIn PDF",
  },
  "resume.success.linkedin_imported": {
    en: "Profile uploaded successfully from LinkedIn PDF",
    uk: "Профіль успішно завантажено з LinkedIn PDF",
    ru: "Профиль успешно загружен из LinkedIn PDF",
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
    en: "GetHired helps you create professional resumes with AI-powered recommendations and LinkedIn PDF integration.",
    uk: "GetHired допомагає вам створювати професійні резюме за допомогою рекомендацій AI та інтеграції з LinkedIn PDF.",
    ru: "GetHired помогает вам создавать профессиональные резюме с помощью рекомендаций AI и интеграции с LinkedIn PDF.",
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
  "footer.product": { en: "Product", uk: "Продукт", ru: "Продукт" },
  "footer.solutions": { en: "Solutions", uk: "Рішення", ru: "Решения" },
  "footer.ai_analysis": {
    en: "AI Analysis",
    uk: "AI аналіз",
    ru: "AI анализ",
  },
  "footer.resume_templates": {
    en: "Resume Templates",
    uk: "Шаблони резюме",
    ru: "Шаблоны резюме",
  },
  "footer.pricing": { en: "Pricing", uk: "Ціни", ru: "Цены" },
  "footer.cover_letter": {
    en: "Cover Letter",
    uk: "Супровідний лист",
    ru: "Сопроводительное письмо",
  },
  "footer.linkedin_import": {
    en: "LinkedIn PDF Import",
    uk: "Імпорт LinkedIn PDF",
    ru: "Импорт LinkedIn PDF",
  },

  // LinkedIn Import Landing Page
  "li_landing.hero_title": {
    en: "LinkedIn PDF to Resume Converter",
    uk: "Конвертер LinkedIn PDF у резюме",
    ru: "Конвертер LinkedIn PDF в резюме",
  },
  "li_landing.hero_subtitle": {
    en: "Turn your LinkedIn profile export into a polished, professional resume in seconds using AI. No manual data entry required.",
    uk: "Перетворіть експорт вашого профілю LinkedIn у відшліфоване професійне резюме за лічені секунди за допомогою ШІ. Без ручного введення даних.",
    ru: "Превратите экспорт вашего профиля LinkedIn в отшлифованное профессиональное резюме за считанные секунды с помощью ИИ. Без ручного ввода данных.",
  },
  "li_landing.start_btn": {
    en: "Get Started Now",
    uk: "Почати зараз",
    ru: "Начать сейчас",
  },
  "li_landing.how_title": {
    en: "How It Works",
    uk: "Як це працює",
    ru: "Как это работает",
  },
  "li_landing.step1_title": {
    en: "1. Export LinkedIn PDF",
    uk: "1. Експортуйте PDF з LinkedIn",
    ru: "1. Экспортируйте PDF из LinkedIn",
  },
  "li_landing.step1_desc": {
    en: "Go to your profile, click 'More', and select 'Save to PDF'. It contains all your experience data.",
    uk: "Перейдіть у свій профіль, натисніть 'Більше' та оберіть 'Зберегти в PDF'. Він містить усі дані про ваш досвід.",
    ru: "Перейдите в свой профиль, нажмите 'Больше' и выберите 'Сохранить в PDF'. Он содержит все данные о вашем опыте.",
  },
  "li_landing.step2_title": {
    en: "2. Upload to GetHired",
    uk: "2. Завантажте в GetHired",
    ru: "2. Загрузите в GetHired",
  },
  "li_landing.step2_desc": {
    en: "Upload the PDF file to our platform. Our AI will automatically parse and structure your information.",
    uk: "Завантажте PDF-файл на нашу платформу. Наш ШІ автоматично розпізнає та структурує вашу інформацію.",
    ru: "Загрузите PDF-файл на нашу платформу. Наш ИИ автоматически распознает и стоит на вашей информации.",
  },
  "li_landing.step3_title": {
    en: "3. Choose Template & Save",
    uk: "3. Оберіть шаблон та збережіть",
    ru: "3. Выберите шаблон и сохраните",
  },
  "li_landing.step3_desc": {
    en: "Preview your data in professional layouts. Export a clean, ATS-friendly resume instantly.",
    uk: "Перегляньте свої дані у професійних макетах. Миттєво експортуйте чисте резюме, сумісне з ATS.",
    ru: "Просмотрите свои данные в профессиональных макетах. Мгновенно экспортируйте чистое резюме, совместимое с ATS.",
  },
  "li_landing.adv_title": {
    en: "Why Use PDF vs. Direct API?",
    uk: "Чому PDF краще за прямий API?",
    ru: "Почему PDF лучше прямого API?",
  },
  "li_landing.adv1_title": {
    en: "Complete Privacy",
    uk: "Повна приватність",
    ru: "Полная приватность",
  },
  "li_landing.adv1_desc": {
    en: "We don't need access to your LinkedIn account. You control what data you share by uploading the file.",
    uk: "Нам не потрібен доступ до вашого облікового запису LinkedIn. Ви самі контролюєте, якими даними ділитися, завантажуючи файл.",
    ru: "Нам не нужен доступ к вашему аккаунту LinkedIn. Вы сами контролируете, какими данными делиться, загружая файл.",
  },
  "li_landing.adv2_title": {
    en: "No API Limitations",
    uk: "Без обмежень API",
    ru: "Без ограничений API",
  },
  "li_landing.adv2_desc": {
    en: "LinkedIn's API often restricts access to full work history. The PDF export always includes your complete record.",
    uk: "API LinkedIn часто обмежує доступ до повної історії роботи. Експорт PDF завжди містить ваш повний запис.",
    ru: "API LinkedIn часто ограничивает доступ к полной истории работы. Экспорт PDF всегда содержит вашу полную запись.",
  },
  "li_landing.adv3_title": {
    en: "Rich Formatting",
    uk: "Багате форматування",
    ru: "Богатое форматирование",
  },
  "li_landing.adv3_desc": {
    en: "Semantic extraction identifies skills, responsibilities, and dates more accurately than raw API data.",
    uk: "Семантичний розбір ШІ виділяє навички, обов'язки та дати точніше, ніж сирі дані API.",
    ru: "Семантический разбор ИИ выделяет навыки, обязанности и даты точнее, чем сырые данные API.",
  },
  "li_landing.security_title": {
    en: "Safe & Secure",
    uk: "Надійно та безпечно",
    ru: "Надежно и безопасно",
  },
  "li_landing.security_desc": {
    en: "Your files are processed in real-time and never stored indefinitely. We use industry-standard encryption to protect your data.",
    uk: "Ваші файли обробляються в реальному часі та ніколи не зберігаються нескінченно. Ми використовуємо галузеві стандарти шифрування.",
    ru: "Ваши файлы обрабатываются в реальном времени и никогда не хранятся бесконечно. Мы используем отраслевые стандарты шифрования.",
  },

  // AI Landing Page
  "ai_landing.badge": {
    en: "AI Resume Analysis — trusted by professionals",
    uk: "AI‑аналіз резюме — довіряють професіонали",
    ru: "AI‑анализ резюме — доверяют профессионалы",
  },
  "ai_landing.hero_title": {
    en: "AI Resume Analysis that helps you get hired",
    uk: "AI‑аналіз резюме, який допомагає отримати роботу",
    ru: "AI‑анализ резюме, который помогает получить работу",
  },
  "ai_landing.hero_subtitle": {
    en: "Section-level scoring, ATS keyword recommendations and AI-written bullet rewrites — optimized for recruiters and applicant tracking systems.",
    uk: "Оцінка по розділах, рекомендації ключових слів для ATS та AI‑переписування пунктів — оптимізовано для рекрутерів та систем відбору.",
    ru: "Оценка по разделам, рекомендации ключевых слов для ATS и AI‑переписывание пунктов — оптимизировано для рекрутеров и систем отбора.",
  },
  "ai_landing.cta_analyze": {
    en: "Analyze your resume — free",
    uk: "Проаналізувати резюме — безкоштовно",
    ru: "Проанализировать резюме — бесплатно",
  },
  "ai_landing.cta_pricing": {
    en: "Compare plans",
    uk: "Порівняти плани",
    ru: "Сравнить планы",
  },
  "ai_landing.metric_avg_score": {
    en: "avg score increase",
    uk: "середнє підвищення балу",
    ru: "среднее увеличение балла",
  },
  "ai_landing.metric_ats_pass": {
    en: "ATS pass improvement",
    uk: "покращення проходження ATS",
    ru: "увеличение прохода ATS",
  },
  "ai_landing.metric_resumes_analyzed": {
    en: "resumes analyzed",
    uk: "проаналізованих резюме",
    ru: "проанализированных резюме",
  },
  "ai_landing.placeholder_screenshot": {
    en: "Resume screenshot placeholder",
    uk: "Заглушка скриншоту резюме",
    ru: "Заглушка скриншота резюме",
  },
  "ai_landing.placeholder_small": {
    en: "Placeholder",
    uk: "Заглушка",
    ru: "Заглушка",
  },

  "ai_landing.feature_ats_title": {
    en: "ATS-aware scoring",
    uk: "Оцінка для ATS",
    ru: "Оценка с учётом ATS",
  },
  "ai_landing.feature_ats_desc": {
    en: "Detects missing keywords and provides exact phrases to match target roles.",
    uk: "Виявляє відсутні ключові слова та пропонує точні фрази для відповідних вакансій.",
    ru: "Определяет отсутствующие ключевые слова и предлагает точные фразы для соответствующих ролей.",
  },
  "ai_landing.feature_actionable_title": {
    en: "Actionable edits",
    uk: "Практичні правки",
    ru: "Практичные правки",
  },
  "ai_landing.feature_actionable_desc": {
    en: "AI-written bullet rewrites and section-level suggestions you can apply instantly.",
    uk: "AI‑згенеровані варіанти пунктів і пропозиції по кожному розділу, які можна застосувати одразу.",
    ru: "AI‑переписанные пункты и рекомендации по разделам, которые можно применить сразу.",
  },
  "ai_landing.feature_private_title": {
    en: "Private & exportable",
    uk: "Приватно та експортовано",
    ru: "Конфиденциально и экспортируемо",
  },
  "ai_landing.feature_private_desc": {
    en: "Secure processing and polished PDF export ready for applications.",
    uk: "Безпечна обробка і стильний експорт у PDF, готовий до відправки.",
    ru: "Безопасная обработка и аккуратный экспорт в PDF, готовый к отправке.",
  },

  "ai_landing.seo_title": {
    en: "AI Resume Analysis — what to expect",
    uk: "AI‑аналіз резюме — чого очікувати",
    ru: "AI‑анализ резюме — чего ожидать",
  },
  "ai_landing.seo_paragraph": {
    en: "Our analysis combines ATS keyword matching, structure checks, and language-quality scoring so you can send resumes that pass automated filters and impress hiring teams. Suggestions are prioritized so small edits have measurable impact.",
    uk: "Наш аналіз поєднує відповідність ключових слів ATS, перевірки структури та оцінку якості мови, щоб ви могли надсилати резюме, які проходять автоматичні фільтри та справляють враження на рекрутерів. Пропозиції пріоритизовані, тому невеликі правки дають вимірний ефект.",
    ru: "Наш анализ сочетает соответствие ключевых слов ATS, проверки структуры и оценку качества языка, чтобы вы могли отправлять резюме, которые проходят автоматические фильтры и впечатляют рекрутеров. Предложения приоритизированы, поэтому небольшие правки дают измеримый эффект.",
  },
  "ai_landing.what_we_evaluate_title": {
    en: "What we evaluate",
    uk: "Що ми перевіряємо",
    ru: "Что мы оцениваем",
  },
  "ai_landing.eval_ats_label": {
    en: "ATS fit:",
    uk: "ATS відповідність:",
    ru: "ATS соответствие:",
  },
  "ai_landing.eval_ats": {
    en: "keyword density, role-focused phrasing and suggested terms.",
    uk: "щільність ключових слів, формулювання, орієнтовані на роль, та рекомендовані терміни.",
    ru: "плотность ключевых слов, фразы, ориентированные на роль, и предлагаемые термины.",
  },
  "ai_landing.eval_impact_label": {
    en: "Impact:",
    uk: "Вплив:",
    ru: "Влияние:",
  },
  "ai_landing.eval_impact": {
    en: "stronger action verbs, measurable results and concise bullets.",
    uk: "сильні дієслова, вимірювані результати та лаконічні пункти.",
    ru: "сильные глаголы действий, измеримые результаты и лаконичные пункты.",
  },
  "ai_landing.eval_structure_label": {
    en: "Structure:",
    uk: "Структура:",
    ru: "Структура:",
  },
  "ai_landing.eval_structure": {
    en: "section completeness and readable ordering for recruiters.",
    uk: "повнота розділів і зрозумілий порядок для рекрутерів.",
    ru: "полнота разделов и удобный порядок для рекрутеров.",
  },
  "ai_landing.how_increases_title": {
    en: "How it increases interview probability",
    uk: "Як це підвищує ймовірність співбесіди",
    ru: "Как это повышает вероятность интервью",
  },
  "ai_landing.how_increases_desc": {
    en: "By surfacing recruiter- and ATS-relevant changes, users see higher visibility in applicant pools — focused edits beat random changes.",
    uk: "Виявляючи зміни, важливі для рекрутерів та ATS, користувачі отримують вищу видимість у пулі кандидатів — цілеспрямовані правки працюють краще за випадкові.",
    ru: "Выявляя изменения, релевантные для рекрутеров и ATS, пользователи получают большую видимость в пуле соискателей — целевые правки работают лучше случайных.",
  },
  "ai_landing.metrics_title": {
    en: "Real results — real metrics",
    uk: "Реальні результати — реальні метрики",
    ru: "Реальные результаты — реальные метрики",
  },
  "ai_landing.faq_title": {
    en: "Frequently asked questions",
    uk: "Поширені запитання",
    ru: "Часто задаваемые вопросы",
  },
  "ai_landing.faq_q1": {
    en: "How does AI help with ATS?",
    uk: "Як AI допомагає з ATS?",
    ru: "Как AI помогает с ATS?",
  },
  "ai_landing.faq_a1": {
    en: "It highlights missing keywords and suggests phrasing aligned with job descriptions so your resume passes automated filters.",
    uk: "Виділяє відсутні ключові слова та пропонує формулювання відповідно до опису вакансії, щоб ваше резюме проходило автоматичні фільтри.",
    ru: "Выделяет отсутствующие ключевые слова и предлагает формулировки в соответствии с описанием вакансии, чтобы ваше резюме проходило автоматические фильтры.",
  },
  "ai_landing.faq_q2": {
    en: "Is my resume stored?",
    uk: "Чи зберігається моє резюме?",
    ru: "Сохраняется ли моё резюме?",
  },
  "ai_landing.faq_a2": {
    en: "No — files are processed securely and not stored indefinitely. Connect your own AI key for maximum control.",
    uk: "Ні — файли обробляються безпечно і не зберігаються довічно. Підключіть власний AI ключ для повного контролю.",
    ru: "Нет — файлы обрабатываются безопасно и не хранятся бесконечно. Подключите собственный AI‑ключ для полного контроля.",
  },
  "ai_landing.cta_try_free": {
    en: "Try AI Resume Analysis — free",
    uk: "Спробувати AI‑аналіз резюме — безкоштовно",
    ru: "Попробовать AI‑анализ резюме — бесплатно",
  },
  "ai_landing.cta_subtext": {
    en: "No credit card required • Export to PDF • Privacy-first",
    uk: "Без кредитної картки • Експорт у PDF • Приватність насамперед",
    ru: "Без карты • Экспорт в PDF • Конфиденциальность в приоритете",
  },

  // Cover Letter Landing Page
  "cl_landing.hero_title": {
    en: "AI Cover Letter Generator",
    uk: "AI генератор супровідних листів",
    ru: "AI генератор сопроводительных писем",
  },
  "cl_landing.hero_subtitle": {
    en: "Create a professional, high-impact cover letter tailored to any job description in seconds. Stop wasting time on manual writing.",
    uk: "Створіть професійний супровідний лист, адаптований до будь-якого опису вакансії за лічені секунди. Припиніть витрачати час на написання вручну.",
    ru: "Создайте профессиональное сопроводительное письмо, адаптированное к любому описанию вакансии за считанные секунды. Перестаньте тратить время на написание вручную.",
  },
  "cl_landing.how_title": {
    en: "The 3-Step Success Path",
    uk: "3 кроки до успіху",
    ru: "3 шага к успеху",
  },
  "cl_landing.step1_title": {
    en: "1. Upload Your Resume",
    uk: "1. Завантажте резюме",
    ru: "1. Загрузите резюме",
  },
  "cl_landing.step1_desc": {
    en: "Provide your background info or use our LinkedIn PDF import. Our AI needs your experience as a foundation.",
    uk: "Надайте свою інформацію або скористайтеся імпортом LinkedIn PDF. Наш ШІ потребує вашого досвіду як основи.",
    ru: "Предоставьте свою информацию или воспользуйтесь импортом LinkedIn PDF. Наш ИИ нуждается в вашем опыте как основе.",
  },
  "cl_landing.step2_title": {
    en: "2. Paste Job Description",
    uk: "2. Вставте опис вакансії",
    ru: "2. Вставьте описание вакансии",
  },
  "cl_landing.step2_desc": {
    en: "Copy the job requirements from LinkedIn, Indeed, or any portal. Our AI analyzes what the hiring manager is looking for.",
    uk: "Скопіюйте вимоги до вакансії з LinkedIn, Indeed або іншого порталу. Наш ШІ аналізує, що шукає менеджер з найму.",
    ru: "Скопируйте требования к вакансии из LinkedIn, Indeed или любого другого портала. Наш ИИ анализирует, что ищет менеджер по найму.",
  },
  "cl_landing.step3_title": {
    en: "3. Get Your Tailored Letter",
    uk: "3. Отримайте адаптований лист",
    ru: "3. Получите адаптированный письмо",
  },
  "cl_landing.step3_desc": {
    en: "Generate a polished letter that highlights your relevant skills and matches the company's tone perfectly.",
    uk: "Згенеруйте відшліфований лист, який підкреслює ваші відповідні навички та ідеально відповідає тону компанії.",
    ru: "Сгенерируйте отшлифованное письмо, которое подчеркивает ваши навыки и идеально соответствует тону компании.",
  },
  "cl_landing.adv_title": {
    en: "Why Use AI for Cover Letters?",
    uk: "Навіщо використовувати ШІ для листів?",
    ru: "Зачем использовать ИИ для писем?",
  },
  "cl_landing.adv1_title": {
    en: "Highly Personalized",
    uk: "Висока персоналізація",
    ru: "Высокая персонализация",
  },
  "cl_landing.adv1_desc": {
    en: "Generic templates don't work. Our AI creates unique content that directly addresses job requirements.",
    uk: "Шаблонні листи не працюють. Наш ШІ створює унікальний контент, який безпосередньо відповідає вимогам вакансії.",
    ru: "Шаблонные письма не работают. Наш ИИ создает уникальный контент, который напрямую отвечает требованиям вакансии.",
  },
  "cl_landing.adv2_title": {
    en: "ATS-Friendly Optimization",
    uk: "Оптимізація під ATS",
    ru: "Оптимизация под ATS",
  },
  "cl_landing.adv2_desc": {
    en: "We use relevant keywords from the job description to ensure your application passes automated screening.",
    uk: "Ми використовуємо ключові слова з опису вакансії, щоб ваша заявка пройшла автоматичний відбір.",
    ru: "Мы используем ключевые слова из описания вакансии, чтобы ваша заявка прошла автоматический отбор.",
  },
  "cl_landing.adv3_title": {
    en: "Massive Time Savings",
    uk: "Величезна економія часу",
    ru: "Огромная экономия времени",
  },
  "cl_landing.adv3_desc": {
    en: "Apply to more jobs faster. What used to take hours now takes less than a minute.",
    uk: "Подавайтеся на більше вакансій швидше. Те, що раніше займало години, тепер займає менше хвилини.",
    ru: "Подавайтесь на большее количество вакансий быстрее. То, что раньше занимало часы, теперь занимает меньше минуты.",
  },

  // Pricing Landing Page
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
  "pricing_landing.free_name": {
    en: "Starter",
    uk: "Стартовий",
    ru: "Стартовый",
  },
  "pricing_landing.free_price": {
    en: "Free",
    uk: "Безкоштовно",
    ru: "Бесплатно",
  },
  "pricing_landing.pro_name": { en: "Pro", uk: "Про", ru: "Про" },
  "pricing_landing.pro_tag": {
    en: "Coming Soon",
    uk: "Скоро буде",
    ru: "Скоро будет",
  },
  "pricing_landing.feature_resumes": {
    en: "4 Resumes per account",
    uk: "4 резюме на акаунт",
    ru: "4 резюме на аккаунт",
  },
  "pricing_landing.feature_template": {
    en: "1 Basic Template",
    uk: "1 базовий шаблон",
    ru: "1 базовый шаблон",
  },
  "pricing_landing.feature_ai_cl": {
    en: "Advanced AI Cover Letters",
    uk: "Просунуті AI супровідні листи",
    ru: "Продвинутые AI сопроводительные письма",
  },
  "pricing_landing.feature_li": {
    en: "LinkedIn PDF Import",
    uk: "Імпорт LinkedIn PDF",
    ru: "Импорт LinkedIn PDF",
  },
  "pricing_landing.feature_ai_resume": {
    en: "AI Resume Tailoring",
    uk: "Адаптація резюме за допомогою ШІ",
    ru: "Адаптация резюме с помощью ИИ",
  },
  "pricing_landing.feature_unlimited": {
    en: "Unlimited Resumes",
    uk: "Безліміт резюме",
    ru: "Безлимит резюме",
  },
  "pricing_landing.feature_premium_templates": {
    en: "All Premium Templates",
    uk: "Усі преміум шаблони",
    ru: "Все премиум шаблоны",
  },
  "pricing_landing.feature_analytics": {
    en: "Job Application Analytics",
    uk: "Аналітика відгуків",
    ru: "Аналитика откликов",
  },
  "pricing_landing.seo_title": {
    en: "Why Invest in Your Career?",
    uk: "Чому варто інвестувати у свою кар'єру?",
    ru: "Почему стоит инвестировать в свою карьеру?",
  },
  "pricing_landing.seo_desc": {
    en: "Building a professional resume shouldn't be expensive. We provide high-quality AI tools to help you stand out and land interviews faster.",
    uk: "Створення професійного резюме не повинно бути дорогим. Ми надаємо високоякісні інструменти ШІ, щоб допомогти вам виділитися та швидше отримувати запрошення на співбесіди.",
    ru: "Создание профессионального резюме не должно быть дорогим. Мы предоставляем высококачественные инструменты ИИ, чтобы помочь вам выделиться и быстрее получать приглашения на собеседования.",
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
    en: "We collect information you provide directly (such as email, resume data, and profile information) and information collected automatically (such as log data and cookies). We may also process information from your LinkedIn PDF export when you upload it.",
    uk: "Ми збираємо інформацію, яку ви надаєте безпосередньо (наприклад, електронну пошту, дані резюме та інформацію профілю) та інформацію, зібрану автоматично (наприклад, дані журналу та файли cookie). Ми також можемо обробляти інформацію з вашого експорту LinkedIn PDF, коли ви його завантажуєте.",
    ru: "Мы собираем информацию, которую вы предоставляете напрямую (такую как электронная почта, данные резюме и информацию профиля) и информацию, собранную автоматически (такую как данные журнала и файлы cookie). Мы также можем обрабатывать информацию из вашего экспорта LinkedIn PDF, когда вы его загружаете.",
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

  "ai_warning.title": {
    en: "AI Configuration Required",
    uk: "Налаштування AI",
    ru: "Настройка AI",
  },
  "ai_warning.description": {
    en: "To use AI features, please connect at least one AI provider. Groq offers free models for testing.",
    uk: "Для використання AI функцій, додайте хоча б один ключ. Groq надає безкоштовні моделі.",
    ru: "Для использования AI функций добавьте хотя бы один ключ. Groq предоставляет бесплатные модели.",
  },
  "ai_warning.setup_link": {
    en: "Setup Keys",
    uk: "Налаштувати",
    ru: "Настроить",
  },
  "ai_warning.get_groq": {
    en: "Get Free Groq Key",
    uk: "Отримати ключ Groq",
    ru: "Получить ключ Groq",
  },
  "ai.analyze_job": {
    en: "Analyze Job Description",
    uk: "Аналізувати опис вакансії",
    ru: "Анализировать описание вакансии",
  },
  "ai.generate_cover_letter": {
    en: "Generate Cover Letter",
    uk: "Згенерувати супровідний лист",
    ru: "Сгенерировать сопроводительное письмо",
  },
};

/** Server-side helper */
export function getT(locale: Language) {
  return (key: string): string => {
    const translation = translations[key];
    if (translation) {
      return translation[locale] || translation["en"] || key;
    }
    return key;
  };
}
