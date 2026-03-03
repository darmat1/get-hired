import { getTranslation } from "./src/lib/translations-data";

function test() {
  console.log("Testing getTranslation...");

  const testCases = [
    {
      key: "work.employment_types.pet_project",
      lang: "ru",
      expected: "Личный проект",
    },
    {
      key: "work.employment_types.pet_project",
      lang: "uk",
      expected: "Власний проект",
    },
    {
      key: "work.employment_types.pet_project",
      lang: "en",
      expected: "Pet project",
    },
    { key: "form.work_experience", lang: "ru", expected: "Опыт работы" },
    { key: "invalid.key", lang: "en", expected: "invalid.key" },
  ];

  let passed = 0;
  testCases.forEach(({ key, lang, expected }) => {
    const result = getTranslation(key, lang);
    if (result === expected) {
      console.log(`✅ PASS: [${lang}] ${key} -> ${result}`);
      passed++;
    } else {
      console.log(
        `❌ FAIL: [${lang}] ${key} -> Expected "${expected}", got "${result}"`,
      );
    }
  });

  console.log(`\nResult: ${passed}/${testCases.length} tests passed.`);
}

test();
