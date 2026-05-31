import React, { useState, useEffect } from 'react';
import { Layout, Menu, ConfigProvider, theme, Grid } from 'antd';
import { 
  DashboardOutlined, 
  SafetyCertificateOutlined, 
  GlobalOutlined, 
  WarningOutlined, 
  UserOutlined 
} from '@ant-design/icons';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import InnCheck from './pages/InnCheck';
import SiteCheck from './pages/SiteCheck';
import ComplaintForm from './pages/ComplaintForm';
// import Profile from './pages/Profile';

const { Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

export default function App() {
  const screens = useBreakpoint();
  
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ConfigProvider theme={{ algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Header style={{ display: 'flex', alignItems: 'center', padding: screens.xs ? '0 10px' : '0 20px' }}>
            <div className="logo" style={{ color: '#fff', fontWeight: 'bold', marginRight: '20px' }}>
              🛡️ ЦИФРОВОЙ ЩИТ
            </div>
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={['1']}
              style={{ flex: 1, minWidth: 0 }}
              items={[
                { key: '1', icon: <DashboardOutlined />, label: <Link to="/">Дашборд</Link> },
                { key: '2', icon: <SafetyCertificateOutlined />, label: <Link to="/inn">ИНН</Link> },
                { key: '3', icon: <GlobalOutlined />, label: <Link to="/site">Сайт</Link> },
                { key: '4', icon: <WarningOutlined />, label: <Link to="/complaint">Жалоба</Link> },
                { key: '5', icon: <UserOutlined />, label: <Link to="/profile">Кабинет</Link> },
              ]}
            />
          </Header>

          <Content style={{ padding: screens.xs ? '10px' : '20px 50px' }}>
            <div style={{ background: isDarkMode ? '#141414' : '#fff', padding: 24, borderRadius: 8, minHeight: '80vh' }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/inn" element={<InnCheck />} />
                <Route path="/site" element={<SiteCheck />} />
                <Route path="/complaint" element={<ComplaintForm />} />
                <Route path="/profile" element={<div>Личный кабинет, история и экспорт PDF/CSV</div>} />
              </Routes>
            </div>
          </Content>

          <Footer style={{ textAlign: 'center' }}>
            Цифровой щит ©2026 — Защита персональных данных
          </Footer>
        </Layout>
      </Router>
    </ConfigProvider>
  );
};
