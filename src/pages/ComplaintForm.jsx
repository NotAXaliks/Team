import { Input, Select, Upload, Card, Form, Button } from 'antd';
import { useState } from 'react';
const { TextArea } = Input;

export default function ComplaintForm() {
  const [text, setText] = useState('');

  return (
    <Card title="Подать жалобу">
      <Form layout="vertical">
        <Form.Item label="ИНН или URL объекта" name="target" rules={[{ required: true }]}>
          <Input placeholder="77023241771 или example.ru" />
        </Form.Item>
        <Form.Item label="Тип нарушения" name="type" rules={[{ required: true }]}>
          <Select options={[
            { value: 'phishing', label: 'Фишинг' },
            { value: 'leak', label: 'Утечка данных' },
            { value: 'spam', label: 'Спам' }
          ]} />
        </Form.Item>
        <Form.Item label="Описание (макс. 500 симв.)">
          <TextArea 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            maxLength={500} 
            showCount 
          />
        </Form.Item>
        <Form.Item label="Доказательства (скриншот)">
          <Upload maxCount={1} listType="picture-card">Загрузить</Upload>
        </Form.Item>
        <Button type="primary" danger>Отправить жалобу</Button>
      </Form>
    </Card>
  );
};