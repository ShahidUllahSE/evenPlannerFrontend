import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Button from '@/components/common/Button';
import { useData } from '@/context/DataContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Shell = styled.div`
  min-height: 100vh;
  padding-left: ${({ theme }) => theme.layout.sidebarWidth};
  overflow-x: clip;

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    padding-left: 0;
  }
`;

const Backdrop = styled.div`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 45;
    background: rgba(15, 27, 45, 0.45);
  }
`;

const Content = styled.main`
  width: 100%;
  max-width: ${({ theme }) => theme.layout.contentMaxWidth};
  min-width: 0;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
  overflow-x: clip;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.md}`};
  }
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.dangerSoft};
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 500;
`;

const PanelLayout = () => {
  const { loadError, loading, reload } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Shell>
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      {sidebarOpen && <Backdrop onClick={() => setSidebarOpen(false)} />}
      <Topbar onMenuClick={() => setSidebarOpen(true)} />
      <Content>
        {loadError && (
          <ErrorBanner role="alert">
            {loadError}
            <Button size="sm" variant="secondary" onClick={reload} loading={loading}>
              Retry
            </Button>
          </ErrorBanner>
        )}
        {/* Keeps sidebar/topbar visible while a lazy page loads. */}
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </Content>
    </Shell>
  );
};

export default PanelLayout;
