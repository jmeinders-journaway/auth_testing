import { MailOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Divider, Input, Typography } from 'antd';
import { Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import apiLayer from '../../api';
import { clearAuth, setUser } from '../../redux/authSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';

const { Title, Paragraph, Text } = Typography;

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState(user.name);

  useEffect(() => {
    setName(user.name);
  }, [user.name]);

  const handleLogOut = async () => {
    try {
      await apiLayer.logout();
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      dispatch(clearAuth());
      navigate('/sign-in');
    }
  };

  const handleUpdateName = async () => {
    const newName = name.trim();
    if (!newName) {
      toast.error('Please enter a valid name');
      return;
    }

    if (newName === user.name) {
      toast.info('Name did not change');
      return;
    }

    const response = await apiLayer.updateProfile({ name: newName });
    if (!response) {
      return;
    }

    dispatch(setUser(response.data.user));
    localStorage.setItem('user', JSON.stringify(response.data.user));
    toast.success('Profile updated successfully');
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

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', maxWidth: '500px', width: '100%' }}>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder='Change name'
                size='large'
              />
              <Button
                type='primary'
                onClick={handleUpdateName}
                disabled={!name.trim() || name.trim() === user.name}
              >
                Update Name
              </Button>
            </div>

            <Divider style={{ margin: '16px 0' }} />
            <Paragraph style={{ maxWidth: '600px', textAlign: 'left' }}>
             'No bio available. Just random words'
            </Paragraph>
            <Button type='primary' style={{ marginRight: '8px' }}>
              <Link to='/asset'>Go to protected page (test)</Link>
            </Button>
            <Button danger onClick={handleLogOut}>
              Log Out
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
