// app/signup/page.js
import SignUpForm from '../components/auth/SignUpForm';

export default function SignupPage() {
  return <SignUpForm />;
}

export const metadata = {
  title: 'Sign Up - Projevo',
  description: 'Create your Projevo account to connect with qualified contractors and project owners.',
};
