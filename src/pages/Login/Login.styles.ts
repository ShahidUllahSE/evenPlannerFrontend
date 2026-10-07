import styled from 'styled-components';

export const Page = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  min-height: 100vh;
  min-height: 100dvh;

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
`;

export const BrandPanel = styled.aside`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xxl};
  padding: ${({ theme }) => theme.spacing.xxl};
  color: #fff;
  background:
    radial-gradient(circle at 85% 15%, rgba(212, 164, 55, 0.28), transparent 38%),
    radial-gradient(circle at 10% 90%, rgba(20, 163, 161, 0.35), transparent 45%),
    linear-gradient(160deg, #0f1b2d 0%, #13263f 55%, #0c3b44 100%);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px);
    background-size: 22px 22px;
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: none;
  }
`;

/** Compact brand strip for phones/tablets — replaces the hidden BrandPanel. */
export const MobileBrand = styled.header`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px 20px 22px;
    padding-top: max(20px, env(safe-area-inset-top));
    color: #fff;
    background:
      radial-gradient(circle at 90% 0%, rgba(212, 164, 55, 0.25), transparent 42%),
      linear-gradient(160deg, #0f1b2d 0%, #0c3b44 100%);
  }
`;

export const MobileTagline = styled.p`
  max-width: 280px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.sidebarText};

  strong {
    color: #fff;
    font-weight: 600;
  }
`;

export const Headline = styled.h1`
  max-width: 520px;
  font-size: ${({ theme }) => theme.fontSizes.display};
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;

  span {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

export const FeatureList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
  max-width: 460px;
`;

export const Feature = styled.li`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(4px);

  > svg {
    width: 38px;
    height: 38px;
    padding: 9px;
    flex-shrink: 0;
    border-radius: ${({ theme }) => theme.radii.sm};
    background: rgba(212, 164, 55, 0.15);
    color: ${({ theme }) => theme.colors.accent};
  }

  strong {
    display: block;
    font-weight: 600;
  }

  p {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.sidebarText};
    margin-top: 2px;
  }
`;

export const Quote = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.sidebarText};
`;

export const FormPanel = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.colors.background};

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    align-items: flex-start;
    padding: 20px 16px 28px;
    padding-bottom: max(28px, env(safe-area-inset-bottom));
  }
`;

export const FormCard = styled.form`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  h2 {
    font-size: ${({ theme }) => theme.fontSizes.xxl};
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  > p {
    color: ${({ theme }) => theme.colors.textMuted};
    margin-top: -6px;
    margin-bottom: 4px;
    font-size: ${({ theme }) => theme.fontSizes.md};
    line-height: 1.45;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    max-width: 440px;
    padding: 22px 18px;
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.lg};
    box-shadow: ${({ theme }) => theme.shadows.md};
    gap: 14px;

    h2 {
      font-size: 1.35rem;
    }

    > p {
      font-size: ${({ theme }) => theme.fontSizes.sm};
      margin-bottom: 2px;
    }
  }
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: 600;
  }
`;

export const IconInput = styled.div`
  position: relative;

  > svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme.colors.textLight};
    pointer-events: none;
  }

  input {
    height: 46px;
    padding-left: 42px;
    padding-right: 44px;
    background: ${({ theme }) => theme.colors.surface};
    /* Prevents iOS Safari from zooming the page on focus */
    font-size: 16px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    input {
      height: 48px;
      background: ${({ theme }) => theme.colors.surfaceAlt};
    }
  }
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.textMuted};

  &:hover {
    background: ${({ theme }) => theme.colors.neutralSoft};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const RememberRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 28px;

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: pointer;
    user-select: none;
  }

  input {
    width: 16px;
    height: 16px;
    accent-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const ErrorBox = styled.div`
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.dangerSoft};
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  line-height: 1.4;
`;
