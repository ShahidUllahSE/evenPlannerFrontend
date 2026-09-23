import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, MailCheck, QrCode, Upload } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import { Input } from '@/components/common/Form';
import Logo from '@/components/layout/Logo';
import { DEMO_CREDENTIALS } from '@/constants/auth';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  BrandPanel,
  DemoBox,
  ErrorBox,
  Feature,
  FeatureList,
  FieldGroup,
  FormCard,
  FormPanel,
  Headline,
  IconInput,
  Page,
  PasswordToggle,
  Quote,
  RememberRow,
} from './Login.styles';

const FEATURES = [
  { icon: Upload, title: 'Import guest lists', text: 'Upload CSV files and validate every row instantly.' },
  { icon: QrCode, title: 'Unique QR passes', text: 'Every guest gets a one-of-a-kind entry code.' },
  { icon: MailCheck, title: 'Beautiful invitations', text: 'Send designed emails with ready templates.' },
];

const Login = () => {
  useDocumentTitle('Sign in');
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.DASHBOARD;

  if (user) return <Navigate to={from} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    const ok = await login(email, password, remember);
    setLoading(false);
    if (ok) navigate(from, { replace: true });
    else setError('Invalid email or password. Use the demo credentials below.');
  };

  return (
    <Page>
      <BrandPanel>
        <Logo light tagline="Event Management" />
        <div>
          <Headline>
            Plan, invite and welcome your guests <span>effortlessly.</span>
          </Headline>
          <FeatureList>
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <Feature key={title}>
                <Icon />
                <div>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              </Feature>
            ))}
          </FeatureList>
        </div>
        <Quote>© {new Date().getFullYear()} EventSphere · Crafted for memorable events</Quote>
      </BrandPanel>

      <FormPanel>
        <FormCard onSubmit={submit} noValidate>
          <h2>Welcome back 👋</h2>
          <p>Sign in to manage your events and guests.</p>

          {error && <ErrorBox role="alert">{error}</ErrorBox>}

          <FieldGroup>
            <label htmlFor="email">Email address</label>
            <IconInput>
              <Mail />
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </IconInput>
          </FieldGroup>

          <FieldGroup>
            <label htmlFor="password">Password</label>
            <IconInput>
              <Lock />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </PasswordToggle>
            </IconInput>
          </FieldGroup>

          <RememberRow>
            <label>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
          </RememberRow>

          <Button type="submit" size="lg" fullWidth loading={loading}>
            Sign in <ArrowRight />
          </Button>

          <DemoBox>
            <div>
              <strong>Demo credentials</strong>
              <span>
                {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEmail(DEMO_CREDENTIALS.email);
                setPassword(DEMO_CREDENTIALS.password);
                setError('');
              }}
            >
              Autofill
            </Button>
          </DemoBox>
        </FormCard>
      </FormPanel>
    </Page>
  );
};

export default Login;
