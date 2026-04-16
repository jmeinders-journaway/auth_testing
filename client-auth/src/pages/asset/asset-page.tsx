import { Card, Typography } from 'antd';
import { useEffect } from 'react';
import apiLayer from '../../api';

const { Title, Paragraph } = Typography;

export default function AssetPage() {
  useEffect(() => {
    const fetchProtectedData = async () => {
      const response = await apiLayer.getProtected();
      if (response) {
        console.log('Protected data:', response);
      }
    };

    fetchProtectedData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ width: 420 }}>
        <Title level={3}>Asset Page</Title>
        <Paragraph>You are logged in and can call protected APIs from here.</Paragraph>
      </Card>
    </div>
  );
}
