import { Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';
import { ROUTES } from '@/constants/routes';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Card>
      <EmptyState
        icon={<Compass />}
        title="Page not found"
        description="The page you are looking for doesn't exist or has been moved."
        action={<Button onClick={() => navigate(ROUTES.DASHBOARD)}>Go to dashboard</Button>}
      />
    </Card>
  );
};

export default NotFound;
