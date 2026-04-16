import { MailOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Divider, Typography } from 'antd';
import { useMemo } from 'react';

const { Title, Paragraph, Text } = Typography;

interface StoredUser {
  name: string;
  email: string;
}

export default function ProfilePage() {
  const userData = useMemo<StoredUser>(() => {
    // Read and parse user data from localStorage safely.
    const userFromStorage = localStorage.getItem('user');
    if (!userFromStorage) {
      return {
        name: 'Guest User',
        email: 'No email available'
      };
    }

    try {
      const parsedUser = JSON.parse(userFromStorage) as Partial<StoredUser>;
      return {
        name: parsedUser.name || 'Guest User',
        email: parsedUser.email || 'No email available'
      };
    } catch {
      return {
        name: 'Guest User',
        email: 'No email available'
      };
    }
  }, []);

  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <Card style={{ borderRadius: '8px' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <Avatar
            size={120}
            icon={<UserOutlined />}
            style={{ marginBottom: '16px' }}
          />

          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ marginBottom: '4px' }}>
              {userData.name}
            </Title>
            <Text type='secondary' style={{ fontSize: '16px' }}>
              <MailOutlined style={{ marginRight: '8px' }} />
              {userData.email}
            </Text>
            <Divider style={{ margin: '16px 0' }} />
            <Paragraph style={{ maxWidth: '600px', textAlign: 'left' }}>
            'No bio available'
            </Paragraph>
          </div>
        </div>
      </Card>
    </div>
  );
}
