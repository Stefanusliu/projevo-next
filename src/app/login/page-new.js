// app/login/page.js
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  return <LoginForm />;
}

export const metadata = {
  title: 'Sign In - Projevo',
  description: 'Sign in to your Projevo account to manage your projects and connect with professionals.',
};
