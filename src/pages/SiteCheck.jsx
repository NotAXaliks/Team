import { Progress, Typography, Alert, Card } from 'antd';
import { useState } from "react";

export default function SiteCheck() {
  const [result, setResult] = useState(null);

  const calculateAiRisk = (checks) => {
    let score = 0;
    if (checks.phishing) score += 50;
    if (checks.blocked) score += 30;
    if (checks.sslIssue) score += 15;
    if (checks.isNew) score += 5;
    
    let level = 'НИЗКИЙ';
    if (score >= 80) level = 'КРИТИЧЕСКИЙ';
    else if (score >= 50) level = 'ВЫСОКИЙ';
    else if (score >= 20) level = 'СРЕДНИЙ';
    
    return { score, level };
  };

  return (
    <Card title="Проверка безопасности сайта">
      {result && (
        <div style={{ textAlign: 'center' }}>
          <Typography.Title level={4}>ИИ-риск: {result.ai.level}</Typography.Title>
          <Progress type="circle" percent={result.ai.score} status={result.ai.score > 70 ? 'exception' : 'normal'} />
          <div style={{ marginTop: 20, textAlign: 'left' }}>
            <Alert message="РКН: Разрешен" type="success" showIcon style={{ marginBottom: 10 }} />
            <Alert message="SSL: Действующий" type="success" showIcon style={{ marginBottom: 10 }} />
            <Alert message="Возраст домена: Старый" type="success" showIcon />
          </div>
        </div>
      )}
    </Card>
  );
};