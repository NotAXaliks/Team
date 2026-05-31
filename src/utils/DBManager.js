import Dexie from "dexie";

export const db = new Dexie('ChecksDB');

db.version(1).stores({
  checks_history: '++id, innOrUrl, timestamp, riskLevel, type',
  complaints: '++id, innOrUrl, violationType, status, timestamp'
});

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
