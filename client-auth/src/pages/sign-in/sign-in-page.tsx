import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Typography } from 'antd';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import apiLayer, { type SignInPayload } from '../../api';
import { useAppDispatch } from '../../redux/hooks';
import { setAuth } from '../../redux/authSlice';
import {
  cardStyle,
  containerStyle,
  footerStyle,
  headerStyle,
  iconStyle,
  titleStyle,
} from './style';

const { Title, Paragraph } = Typography;

export default function SignInPage() {
  const [form] = Form.useForm();
  //this allows to navigate between routes without links
  //Examples: navigate('/profile'), navigate('/sign-up'), navigate(-1) for back
  const navigate = useNavigate();
  //allows to dispatch actions to redux store
  const dispatch = useAppDispatch();

  /**
   * Form Submission Handler
   * Triggered when user clicks "Log In" button and validation passes
   *
   * @param values - Contains { email, password } from form fields
   *
   * Complete Authentication Flow:
   * 1. Send credentials to backend API
   * 2. Receive JWT token + user data
   * 3. Persist auth state in localStorage (survives page refresh)
   * 4. Update Redux store (triggers UI updates)
   * 5. Show success feedback
   * 6. Redirect to protected profile page
   */
  const onFinish = async (values: SignInPayload) => {
    const response = await apiLayer.signIn(values);
    if (response) {
      //at this point persists data with local storage, will be updated later
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('isAuthenticated', 'true');
      // This triggers:
      // - AuthSlice state update
      // - components using useAuth() or useSelector re-render depending on IsAuthenticated update
      // - Protected routes become accessible
      dispatch(
        setAuth({
          accessToken: response.data.accessToken,
          user: response.data.user,
        }),
      );
      toast.success('Login successfully');
      navigate('/profile');
    }
  };

  return (
    <div style={containerStyle}>
      <Card style={cardStyle}>
        <div style={headerStyle}>
          <Title level={2} style={titleStyle}>
            Log In
          </Title>
        </div>

        <Form
          form={form}
          name='signup'
          layout='vertical'
          onFinish={onFinish}
          autoComplete='off'
          requiredMark={false}
        >
          <Form.Item
            name='email'
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={iconStyle} />}
              placeholder='Email Address'
              size='large'
            />
          </Form.Item>

          <Form.Item
            name='password'
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={iconStyle} />}
              placeholder='Password'
              size='large'
            />
          </Form.Item>

          <Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              size='large'
              style={{ width: '100%', marginTop: '8px' }}
            >
              Log In
            </Button>
          </Form.Item>
        </Form>

        <div style={footerStyle}>
          <Paragraph style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
            Don't have an account? <Link to='/sign-up'>Sign Up</Link>
          </Paragraph>
        </div>
      </Card>
    </div>
  );
}
