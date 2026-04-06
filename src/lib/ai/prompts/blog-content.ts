type BlogPromptLanguage = "en" | "ru" | "uk";

interface BlogPromptDefinition {
  lang: BlogPromptLanguage;
  systemPrompt: string;
  userPrompt: string;
}

const INTERNAL_LINKS: Record<BlogPromptLanguage, string[]> = {
  en: [
    "https://gethired.work/resume-builder",
    "https://gethired.work/cover-letter",
    "https://gethired.work/linkedin-import",
    "https://gethired.work/ai",
    "https://gethired.work/pricing",
  ],
  ru: [
    "https://gethired.work/ru/resume-builder",
    "https://gethired.work/ru/cover-letter",
    "https://gethired.work/ru/linkedin-import",
    "https://gethired.work/ru/ai",
    "https://gethired.work/ru/pricing",
  ],
  uk: [
    "https://gethired.work/uk/resume-builder",
    "https://gethired.work/uk/cover-letter",
    "https://gethired.work/uk/linkedin-import",
    "https://gethired.work/uk/ai",
    "https://gethired.work/uk/pricing",
  ],
};

const LANGUAGE_REQUIREMENTS: Record<
  BlogPromptLanguage,
  {
    languageName: string;
    languageWarning: string;
    keywordLine: string;
    ctaLine: string;
    userTopicLabel: string;
    userRequirementsLabel: string;
    userReminder: string;
  }
> = {
  en: {
    languageName: "English",
    languageWarning:
      'All text in "title", "excerpt", and "body" must be exclusively in English.',
    keywordLine:
      "Use these keywords naturally: resume builder, CV maker, AI career assistant, job application tips.",
    ctaLine:
      "End with a CTA inviting the reader to build an ATS-friendly resume at <a href='https://gethired.work'>gethired.work</a>.",
    userTopicLabel: "Topic",
    userRequirementsLabel: "Specific Requirements",
    userReminder:
      "Generate the English blog post JSON. All text must be in English only.",
  },
  ru: {
    languageName: "Russian",
    languageWarning:
      'Весь текст в "title", "excerpt" и "body" должен быть исключительно на русском языке.',
    keywordLine:
      "Ключевые слова: создать резюме, конструктор резюме, AI карьерный помощник.",
    ctaLine:
      "В конце добавьте CTA: создайте идеальное резюме на <a href='https://gethired.work'>gethired.work</a>.",
    userTopicLabel: "Тема",
    userRequirementsLabel: "Специфические требования",
    userReminder:
      "Сгенерируйте JSON статьи на русском языке. Весь текст должен быть только на русском.",
  },
  uk: {
    languageName: "Ukrainian",
    languageWarning:
      'Весь текст у "title", "excerpt" та "body" має бути виключно українською мовою.',
    keywordLine:
      "Ключові слова: створити резюме, конструктор резюме, AI кар'єрний помічник.",
    ctaLine:
      "Наприкінці додайте CTA: створіть ідеальне резюме на <a href='https://gethired.work'>gethired.work</a>.",
    userTopicLabel: "Тема",
    userRequirementsLabel: "Специфічні вимоги",
    userReminder:
      "Згенеруйте JSON статті українською мовою. Весь текст має бути тільки українською.",
  },
};

export function buildBlogContentPrompts(
  topic: string,
  requirements: string,
): BlogPromptDefinition[] {
  const languages: BlogPromptLanguage[] = ["en", "ru", "uk"];

  return languages.map((lang) => {
    const copy = LANGUAGE_REQUIREMENTS[lang];
    const links = INTERNAL_LINKS[lang].join("\n- ");

    return {
      lang,
      systemPrompt: `You are an expert career coach and SEO copywriter for "gethired.work", an AI resume builder and career assistant.

LANGUAGE REQUIREMENT:
- ${copy.languageWarning}

OUTPUT CONTRACT:
- Return a valid JSON object with exactly this shape: {"title":"...","excerpt":"...","body":"..."}
- excerpt must be 2 sentences and no more than 220 characters.
- body must be 500-1000 words of clean HTML using only <h2>, <h3>, <p>, <ul>, <li>, and <a>.
- Do not use Markdown.
- Do not include an <h1> tag in body.

JSON SAFETY:
- Use only single quotes inside HTML attributes.
- Do not include raw unescaped JSON-breaking quotes inside body.

LINKING:
- Use up to 3 internal links from this list:
- ${links}

CONTENT REQUIREMENTS:
- Write a strong intro, actionable main points, and a conclusion.
- ${copy.keywordLine}
- ${copy.ctaLine}

FINAL REMINDER:
- The response must be valid JSON.
- title, excerpt, and body must all be in ${copy.languageName}.`,
      userPrompt: `${copy.userTopicLabel}: ${topic}
${copy.userRequirementsLabel}: ${requirements}

${copy.userReminder}`,
    };
  });
}
