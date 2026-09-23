import { useRef, useState, type DragEvent } from 'react';
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import styled, { css } from 'styled-components';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { CategoryBadge } from '@/components/common/StatusBadges';
import QrTypePicker from '@/components/qr/QrTypePicker';
import { useData } from '@/context/DataContext';
import type { EventItem } from '@/types/event';
import type { QrType } from '@/types/qr';
import { buildSampleCsv, CSV_COLUMNS, parseInviteeCsv, type ParsedRow } from '@/utils/csv';
import { downloadText } from '@/utils/download';
import { QR_TYPES } from '@/utils/qr';

type Step = 'upload' | 'review' | 'qr' | 'generate';
const STEPS: { id: Step; label: string }[] = [
  { id: 'upload', label: 'Upload CSV' },
  { id: 'review', label: 'Review Data' },
  { id: 'qr', label: 'QR Code Type' },
  { id: 'generate', label: 'Generate' },
];

const Stepper = styled.ol`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};
  list-style: none;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StepItem = styled.li<{ $state: 'done' | 'active' | 'todo' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
  border-top: 3px solid
    ${({ theme, $state }) => ($state === 'todo' ? theme.colors.border : theme.colors.primary)};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ theme, $state }) => ($state === 'todo' ? theme.colors.textLight : theme.colors.text)};

  span {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: ${({ theme }) => theme.fontSizes.xs};
    background: ${({ theme, $state }) =>
      $state === 'todo' ? theme.colors.neutralSoft : theme.colors.primary};
    color: ${({ $state }) => ($state === 'todo' ? 'inherit' : '#fff')};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    em {
      display: none;
    }
  }
  em {
    font-style: normal;
  }
`;

const Dropzone = styled.div<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.lg}`};
  border: 2px dashed ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;

  ${({ $active, theme }) =>
    $active &&
    css`
      border-color: ${theme.colors.primary};
      background: ${theme.colors.primarySoft};
    `}

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  > svg {
    width: 40px;
    height: 40px;
    color: ${({ theme }) => theme.colors.primary};
  }

  h4 {
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`;

const ColumnsBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};

  div {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  strong {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    margin-right: 4px;
  }

  code {
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    padding: 2px 8px;
    border-radius: ${({ theme }) => theme.radii.sm};
    background: ${({ theme }) => theme.colors.neutralSoft};
  }

  code.req {
    background: ${({ theme }) => theme.colors.primarySoft};
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const Summary = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SummaryItem = styled.div<{ $color: string }>`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: 4px solid ${({ $color }) => $color};

  strong {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }

  span {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const PreviewScroll = styled.div`
  max-height: 320px;
  overflow: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};

  table {
    width: 100%;
    min-width: 820px;
    border-collapse: collapse;
  }

  th {
    position: sticky;
    top: 0;
    background: ${({ theme }) => theme.colors.surfaceAlt};
    text-align: left;
    font-size: ${({ theme }) => theme.fontSizes.xs};
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: ${({ theme }) => theme.colors.textMuted};
    padding: 10px 12px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  td {
    padding: 10px 12px;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    white-space: nowrap;
  }

  tr.bad td {
    background: ${({ theme }) => theme.colors.dangerSoft};
  }
`;

const Notice = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.accentSoft};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: #6b4f12;

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`;

const Progress = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.lg}`};
  text-align: center;

  > svg {
    width: 56px;
    height: 56px;
    color: ${({ theme }) => theme.colors.success};
  }

  h4 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }

  p {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Bar = styled.div<{ $pct: number }>`
  width: 100%;
  max-width: 420px;
  height: 10px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.neutralSoft};
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ $pct }) => $pct}%;
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 999px;
    transition: width 0.15s linear;
  }
`;

interface CsvImportModalProps {
  open: boolean;
  event: EventItem;
  onClose: () => void;
}

const CsvImportWizard = ({ event, onClose }: Omit<CsvImportModalProps, 'open'>) => {
  const { invitees, importInvitees } = useData();
  const fileInput = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [qrType, setQrType] = useState<QrType | null>(event.qrType);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const validRows = rows.filter((r) => r.status === 'valid');
  const invalidCount = rows.filter((r) => r.status === 'invalid').length;
  const duplicateCount = rows.filter((r) => r.status === 'duplicate').length;
  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const generating = step === 'generate' && !done;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a .csv file');
      return;
    }
    try {
      const parsed = await parseInviteeCsv(
        file,
        invitees.filter((i) => i.eventId === event.id),
      );
      if (parsed.length === 0) {
        toast.error('The file has no data rows');
        return;
      }
      setFileName(file.name);
      setRows(parsed);
      setStep('review');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not read the CSV file');
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const generate = () => {
    if (!qrType) return;
    setStep('generate');
    const total = validRows.length;
    let current = 0;
    // Visual progress; the actual generation is instant on the client.
    const timer = window.setInterval(() => {
      current = Math.min(total, current + Math.max(1, Math.ceil(total / 25)));
      setProgress(Math.round((current / total) * 100));
      if (current >= total) {
        window.clearInterval(timer);
        importInvitees(
          event.id,
          validRows.map((r) => r.data),
          qrType,
        );
        setDone(true);
        toast.success(`${total} invitees imported with unique QR tickets`);
      }
    }, 40);
  };

  const footer = (() => {
    switch (step) {
      case 'upload':
        return (
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        );
      case 'review':
        return (
          <>
            <Button variant="secondary" onClick={() => setStep('upload')}>
              Back
            </Button>
            <Button onClick={() => setStep('qr')} disabled={validRows.length === 0}>
              Continue with {validRows.length} valid rows
            </Button>
          </>
        );
      case 'qr':
        return (
          <>
            <Button variant="secondary" onClick={() => setStep('review')}>
              Back
            </Button>
            <Button onClick={generate} disabled={!qrType}>
              Generate {validRows.length} QR Tickets
            </Button>
          </>
        );
      case 'generate':
        return <Button onClick={onClose} disabled={!done}>Done</Button>;
    }
  })();

  return (
    <Modal
      open
      onClose={onClose}
      locked={generating}
      size="xl"
      title="Import Invitees from CSV"
      subtitle={`Adding guests to “${event.title}”`}
      footer={footer}
    >
      <Stepper>
        {STEPS.map((s, i) => (
          <StepItem key={s.id} $state={i < stepIndex || done ? 'done' : i === stepIndex ? 'active' : 'todo'}>
            <span>{i + 1}</span>
            <em>{s.label}</em>
          </StepItem>
        ))}
      </Stepper>

      {step === 'upload' && (
        <>
          <Dropzone
            $active={dragging}
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileInput.current?.click()}
          >
            <UploadCloud />
            <h4>Drag & drop your CSV file here</h4>
            <p>or click to browse · .csv files only</p>
            <input
              ref={fileInput}
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </Dropzone>
          <ColumnsBox>
            <div>
              <strong>Columns:</strong>
              {CSV_COLUMNS.map((c) => (
                <code key={c.key} className={c.required ? 'req' : undefined}>
                  {c.label}
                  {c.required && '*'}
                </code>
              ))}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => downloadText(buildSampleCsv(), 'invitees_sample.csv')}
            >
              <Download /> Sample CSV
            </Button>
          </ColumnsBox>
        </>
      )}

      {step === 'review' && (
        <>
          <Summary>
            <SummaryItem $color="#15803D">
              <strong>{validRows.length}</strong>
              <span>Ready to import</span>
            </SummaryItem>
            <SummaryItem $color="#DC2626">
              <strong>{invalidCount}</strong>
              <span>Invalid rows (skipped)</span>
            </SummaryItem>
            <SummaryItem $color="#B45309">
              <strong>{duplicateCount}</strong>
              <span>Duplicates (skipped)</span>
            </SummaryItem>
          </Summary>
          <PreviewScroll>
            <table>
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Status</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Designation</th>
                  <th>City</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.line} className={r.status === 'valid' ? undefined : 'bad'}>
                    <td>{r.line}</td>
                    <td>
                      {r.status === 'valid' ? (
                        <Badge tone="success" dot>
                          Valid
                        </Badge>
                      ) : (
                        <Badge tone={r.status === 'duplicate' ? 'warning' : 'danger'} dot>
                          {r.error}
                        </Badge>
                      )}
                    </td>
                    <td>{r.data.name || '—'}</td>
                    <td>{r.data.email || '—'}</td>
                    <td>{r.data.phone || '—'}</td>
                    <td>{r.data.company || '—'}</td>
                    <td>{r.data.designation || '—'}</td>
                    <td>{r.data.city || '—'}</td>
                    <td>
                      <CategoryBadge category={r.data.category} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PreviewScroll>
          <p style={{ marginTop: 12, fontSize: 13, color: '#64748B' }}>
            <FileSpreadsheet size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
            {fileName} · {rows.length} rows read
          </p>
        </>
      )}

      {step === 'qr' && (
        <>
          {event.qrType ? (
            <Notice>
              <AlertCircle />
              <span>
                This event already issues <strong>{QR_TYPES[event.qrType].label}</strong> QR codes. New tickets
                will use the same type so the scanner validates every guest the same way.
              </span>
            </Notice>
          ) : (
            <Notice>
              <AlertCircle />
              <span>
                Choose how guest QR codes are generated. Every guest gets a <strong>unique</strong> code, and
                this type is used for all future tickets of this event.
              </span>
            </Notice>
          )}
          <QrTypePicker value={qrType} onChange={setQrType} lockedTo={event.qrType} />
        </>
      )}

      {step === 'generate' && (
        <Progress>
          {done ? (
            <>
              <CheckCircle2 />
              <h4>{validRows.length} QR tickets generated</h4>
              <p>
                Every invitee now has a unique {qrType && QR_TYPES[qrType].label} code. You can send invitations
                from the event page.
              </p>
            </>
          ) : (
            <>
              <h4>Generating unique QR codes…</h4>
              <p>
                {Math.round((progress / 100) * validRows.length)} of {validRows.length}
              </p>
              <Bar $pct={progress} />
            </>
          )}
        </Progress>
      )}
    </Modal>
  );
};

const CsvImportModal = ({ open, ...props }: CsvImportModalProps) =>
  open ? <CsvImportWizard {...props} /> : null;

export default CsvImportModal;
