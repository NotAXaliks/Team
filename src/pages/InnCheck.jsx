import React, { useState } from 'react';
import { Form, Input, Button, Table, Tag, Card, Space, message } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';

export default function InnCheck() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const validateInn = (_, value) => {
    if (!value || /^\d{10}$|^\d{12}$/.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Введите корректный ИНН (10 или 12 цифр)'));
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Имитация запросов к API ФНС и РКН [1-3]
      // В реальности здесь fetch(`/nalog-inn?inn=${values.inn}`)
      const mockResult = [
        { key: '1', source: 'ФНС', data: 'ООО "Вектор", Статус: Действующая', risk: 'Низкий' },
        { key: '2', source: 'РКН (Операторы)', data: 'Цель: Обработка заказов. Нарушений не найдено', risk: 'Низкий' },
      ];
      setData(mockResult);
    } catch (error) {
        console.error(error);
      message.error('Сервис временно недоступен, данные загружены из кэша'); [4]
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Источник', dataIndex: 'source', key: 'source' },
    { title: 'Данные', dataIndex: 'data', key: 'data' },
    { 
      title: 'Риск', 
      dataIndex: 'risk', 
      key: 'risk',
      render: (risk) => (
        <Tag color={risk === 'Низкий' ? 'green' : 'red'}>
          {risk === 'Низкий' ? '✅ Низкий' : '⚠️ Высокий'}
        </Tag>
      )
    },
  ];

  return (
    <Card title="Проверка организации по ИНН">
      <Form onFinish={onFinish} layout="inline">
        <Form.Item name="inn" rules={[{ validator: validateInn }]}>
          <Input placeholder="Введите ИНН" maxLength={12} />
        </Form.Item>
        <Form.Item shouldUpdate>
          {({ getFieldsError, getFieldValue }) => (
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              disabled={!!getFieldsError().filter(({ errors }) => errors.length).length || !getFieldValue('inn')}
            >
              Проверить [1]
            </Button>
          )}
        </Form.Item>
      </Form>
      {data.length > 0 && <Table columns={columns} dataSource={data} style={{ marginTop: 20 }} pagination={false} />}
    </Card>
  );
};