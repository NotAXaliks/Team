import React, { useEffect, useState } from 'react';
import { Row, Col, Statistic, Card, Table, Tag, Typography } from 'antd';
import { 
  Line, 
  Doughnut 
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import Dexie from 'dexie';
import { getDashboardStats } from '../utils/DBManager';

const { Title: AntTitle } = Typography;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
    const [data, setData] = useState(null);

  useEffect(() => {
    // Загрузка данных при монтировании компонента
    const loadData = async () => {
      const data = await getDashboardStats();
      setData(data);
    };
    loadData();
  }, []);

  if (!data) return <div>Загрузка статистики...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <AntTitle level={2}>Общая статистика системы</AntTitle>
      
      <Row gutter={[10]}>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Всего проверок" value={data.stats.totalChecks} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Фишинг" value={data.stats.phishingFound} valueStyle={{ color: '#cf1322' }} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Жалоб в базе" value={data.stats.totalComplaints} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Нарушения организаций" value={data.stats.orgViolations} /></Card>
        </Col>
      </Row>

      <Row gutter={[7]} style={{ marginTop: '24px' }}>
        {/* 2. График активности (Chart.js) [2, 6] */}
        <Col xs={24} lg={16}>
          <Card title="Активность проверок (7 дней)">
            <div style={{ height: '300px' }}>
              <Line 
                data={{
                  labels: data.activity.labels,
                  datasets: [{
                    label: 'Проверки',
                    data: data.activity.data,
                    borderColor: '#1890ff',
                    fill: true,
                    backgroundColor: 'rgba(24, 144, 255, 0.1)'
                  }]
                }}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </Card>
        </Col>

        {/* 3. Уровни рисков [1, 6] */}
        <Col xs={24} lg={8}>
          <Card title="Распределение рисков">
            <div style={{ height: '300px' }}>
              <Doughnut 
                data={{
                  labels: data.riskDistribution.labels,
                  datasets: [{
                    data: data.riskDistribution.data,
                    backgroundColor: ['#f5222d', '#fa8c16', '#fadb14', '#52c41a']
                  }]
                }}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 4. Топ-5 рискованных ресурсов [2, 8] */}
      <Card title="Топ-5 опасных сайтов" style={{ marginTop: '24px' }}>
        <Table 
          dataSource={data.topRiskySites} 
          pagination={false}
          columns={[
            { title: 'Домен', dataIndex: 'innOrUrl', key: 'url' },
            { 
              title: 'ИИ-риск (0-100)', 
              dataIndex: 'riskScore', 
              render: (score) => <b>{score}/100</b> // Балл по формуле из ТЗ [9]
            },
            { 
              title: 'Уровень', 
              dataIndex: 'riskLevel', 
              render: (level) => <Tag color={level === 'КРИТИЧЕСКИЙ' ? 'red' : 'orange'}>{level}</Tag> 
            }
          ]}
        />
      </Card>
    </div>
  );
}