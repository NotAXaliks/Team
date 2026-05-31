import Dexie from "dexie";

export const db = new Dexie('ChecksDB');

db.version(1).stores({
  checks_history: '++id, innOrUrl, timestamp, riskLevel, type',
  complaints: '++id, innOrUrl, violationType, status, timestamp'
});

export const seedDatabase = async () => {
  // Очистка текущих данных (опционально)
  await db.checks_history.clear();
  await db.complaints.clear();

  // 1. Тестовые данные для истории проверок (последние 100 записей по ТЗ) [2]
  const testChecks = [
    {
      innOrUrl: 'sberbank-login.ru',
      type: 'site',
      riskScore: 95, // фишинг (+50) + блокировка (+30) + SSL (+15)
      riskLevel: 'КРИТИЧЕСКИЙ',
      timestamp: Date.now() - 1000 * 60 * 60 * 2 // 2 часа назад
    },
    {
      innOrUrl: '77023241771', // ИНН из ТЗ [4]
      type: 'organization',
      riskScore: 0,
      riskLevel: 'НИЗКИЙ',
      timestamp: Date.now() - 1000 * 60 * 60 * 24 // 1 день назад
    },
    {
      innOrUrl: 'crypto-trust.net',
      type: 'site',
      riskScore: 70, // новый домен (+5) + фишинг (+50) + SSL (+15)
      riskLevel: 'ВЫСОКИЙ',
      timestamp: Date.now() - 1000 * 60 * 60 * 48 // 2 дня назад
    },
    {
      innOrUrl: 'gosuslugi-verify.com',
      type: 'site',
      riskScore: 85,
      riskLevel: 'КРИТИЧЕСКИЙ',
      timestamp: Date.now() - 1000 * 60 * 60 * 5 // 5 часов назад
    }
  ];

  // Добавление проверок в БД
  await db.checks_history.bulkAdd(testChecks);

  // 2. Тестовые данные для системы жалоб [1, 5]
  const testComplaints = [
    {
      innOrUrl: 'sberbank-login.ru',
      violationType: 'Фишинг',
      description: 'Сайт полностью копирует дизайн личного кабинета банка для кражи паролей.',
      evidence: null, // Здесь может быть base64 строка изображения [1]
      email: 'user1@example.com',
      timestamp: Date.now() - 1000 * 60 * 30,
      status: 'ожидает модерации',
      votes: 12 // Положительный рейтинг [6]
    },
    {
      innOrUrl: '77023241771',
      violationType: 'Утечка',
      description: 'База данных клиентов этой организации была обнаружена в открытом доступе.',
      evidence: null,
      email: 'security_audit@test.ru',
      timestamp: Date.now() - 1000 * 60 * 60 * 10,
      status: 'на модерации',
      votes: 5
    },
    {
      innOrUrl: 'bad-ads.com',
      violationType: 'Спам',
      description: 'Рассылка нежелательной рекламы по почте без согласия.',
      evidence: null,
      email: null,
      timestamp: Date.now() - 1000 * 60 * 5,
      status: 'отклонена автоматически', // Пример срабатывания стоп-слова "реклама" [7]
      votes: -2
    }
  ];

  await db.complaints.bulkAdd(testComplaints);
  console.log('Тестовые данные успешно добавлены в IndexedDB');
};

// seedDatabase();

export const saveCheckResult = async (result) => {
  await db.checks_history.add({
    innOrUrl: result.target,
    riskScore: result.aiRisk.score,
    riskLevel: result.aiRisk.level,
    type: result.type, // 'organization' или 'site'
    timestamp: Date.now()
  });
  
  const count = await db.checks_history.count();
  if (count > 100) {
    const oldest = await db.checks_history.orderBy('timestamp').first();
    await db.checks_history.delete(oldest.id);
  }
};

export const getDashboardStats = async () => {
  // 1. Получаем последние 100 проверок (лимит по ТЗ) [1, 3]
  const history = await db.checks_history
    .orderBy('timestamp')
    .reverse()
    .limit(100)
    .toArray();

console.log(history);

  const complaints = await db.complaints.toArray();

  // 2. Агрегированная статистика системы [6, 7]
  const stats = {
    totalChecks: history.length,
    phishingFound: history.filter(item => item.riskLevel === 'КРИТИЧЕСКИЙ').length,
    totalComplaints: complaints.length,
    orgViolations: history.filter(item => item.type === 'organization' && item.riskScore > 0).length
  };

  // 3. Распределение уровней риска для Doughnut chart [1, 6]
  const riskDistribution = {
    labels: ['Критический', 'Высокий', 'Средний', 'Низкий'],
    data: [
      history.filter(i => i.riskLevel === 'КРИТИЧЕСКИЙ').length,
      history.filter(i => i.riskLevel === 'ВЫСОКИЙ').length,
      history.filter(i => i.riskLevel === 'СРЕДНИЙ').length,
      history.filter(i => i.riskLevel === 'НИЗКИЙ').length,
    ]
  };

  // 4. Активность проверок по дням (последние 7 дней) [2, 8]
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const activity = {
    labels: [],
    data: []
  };

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const nextDay = new Date(d);
    nextDay.setDate(d.getDate() + 1);

    const count = await db.checks_history
      .where('timestamp')
      .between(d.getTime(), nextDay.getTime())
      .count();

    activity.labels.push(days[d.getDay()]);
    activity.data.push(count);
  }

  // 5. Топ-5 самых рискованных сайтов [2, 8]
  const topRiskySites = history
    .filter(item => item.type === 'site')
    .sort((a, b) => b.riskScore - a.riskScore) // Сортировка по баллу ИИ-риска [9]
    .slice(0, 5);

  return { stats, riskDistribution, activity, topRiskySites };
};
