import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Shell = styled.div`
  min-height: 100vh;
  padding-left: ${({ theme }) => theme.layout.sidebarWidth};

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
  max-width: ${({ theme }) => theme.layout.contentMaxWidth};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.md}`};
  }
`;

const PanelLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Shell>
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      {sidebarOpen && <Backdrop onClick={() => setSidebarOpen(false)} />}
      <Topbar onMenuClick={() => setSidebarOpen(true)} />
      <Content>
        {/* Keeps sidebar/topbar visible while a lazy page loads. */}
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </Content>
    </Shell>
  );
};

export default PanelLayout;
