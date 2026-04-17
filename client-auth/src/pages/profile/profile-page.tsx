import { MailOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Divider, Typography } from 'antd';
import { useNavigate } from 'react-router';
import { clearAuth } from '../../redux/authSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';

const { Title, Paragraph, Text } = Typography;

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    dispatch(clearAuth());
    navigate('/sign-in');
  };

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
              {user.name}
            </Title>
            <Text type='secondary' style={{ fontSize: '16px' }}>
              <MailOutlined style={{ marginRight: '8px' }} />
              {user.email}
            </Text>
            <Divider style={{ margin: '16px 0' }} />
            <Paragraph style={{ maxWidth: '600px', textAlign: 'left' }}>
             'No bio available. Just random words'
            </Paragraph>
            <Button danger onClick={handleLogOut}>
              Log Out
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
