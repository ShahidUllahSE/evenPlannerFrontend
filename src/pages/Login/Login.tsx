import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, MailCheck, QrCode, ScanLine, Upload } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import { Input } from '@/components/common/Form';
import Logo from '@/components/layout/Logo';
import { homeFor } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { errorMessage } from '@/services/api';
import {
  BrandPanel,
  ErrorBox,
  Feature,
  FeatureList,
  FieldGroup,
  FormCard,
  FormPanel,
  Headline,
  IconInput,
  MobileBrand,
  MobileTagline,
  Page,
  PasswordToggle,
  Quote,
  RememberRow,
} from './Login.styles';

const FEATURES = [
  { icon: Upload, title: 'Import guest lists', text: 'Upload CSV files and validate every row instantly.' },
  { icon: QrCode, title: 'Unique QR passes', text: 'Every guest gets a one-of-a-kind entry code.' },
  { icon: MailCheck, title: 'Beautiful invitations', text: 'Send designed emails with ready templates.' },
  { icon: ScanLine, title: 'Fast door check-in', text: 'Scan tickets from any phone; each pass works only once.' },
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

  const from = (location.state as { from?: string } | null)?.from;

  if (user) return <Navigate to={from ?? homeFor(user.role)} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const signedIn = await login(email, password, remember);
      navigate(from ?? homeFor(signedIn.role), { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not sign in. Please try again.'));
      setLoading(false);
    }
  };

  return (
    <Page>
      <MobileBrand>
        <Logo light size="lg" tagline="Event Management" />
        <MobileTagline>
          <strong>Plan, invite and check in guests</strong> — sign in to continue.
        </MobileTagline>
      </MobileBrand>

      <BrandPanel>
        <Logo light size="lg" tagline="Event Management" />
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
          <h2>Welcome back</h2>
          <p>Sign in with the account your administrator or event planner gave you.</p>

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
        </FormCard>
      </FormPanel>
    </Page>
  );
};

export default Login;
