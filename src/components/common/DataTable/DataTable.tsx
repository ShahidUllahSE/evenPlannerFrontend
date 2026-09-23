import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from '../EmptyState';
import {
  Checkbox,
  Footer,
  HeaderButton,
  PageButton,
  PageControls,
  PageInfo,
  PageSizeSelect,
  Scroll,
  Table,
  Td,
  Th,
  Tr,
} from './DataTable.styles';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T, index: number) => ReactNode;
  sortValue?: (row: T) => string | number;
  width?: string;
  align?: 'left' | 'center' | 'right';
  /** Pin the column to the right edge while scrolling horizontally (actions). */
  stickyRight?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  minWidth?: string;
  empty?: { title: string; description?: string; action?: ReactNode; icon?: ReactNode };
}

type SortState = { key: string; dir: 'asc' | 'desc' } | null;

const IndeterminateCheckbox = ({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
  label: string;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return <Checkbox ref={ref} type="checkbox" checked={checked} onChange={onChange} aria-label={label} />;
};

function DataTable<T>({
  columns,
  rows,
  rowKey,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  pageSize: initialPageSize = 10,
  minWidth = '960px',
  empty,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) return rows;
    const getValue = column.sortValue;
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * factor;
      return String(va).localeCompare(String(vb)) * factor;
    });
  }, [rows, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);

  const selected = new Set(selectedIds);
  const allIds = rows.map(rowKey);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = !allSelected && allIds.some((id) => selected.has(id));

  const toggleAll = () => onSelectionChange?.(allSelected ? [] : allIds);
  const toggleOne = (id: string) =>
    onSelectionChange?.(selected.has(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);

  const toggleSort = (key: string) =>
    setSort((s) =>
      !s || s.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null,
    );

  const pageNumbers = useMemo(() => {
    const pages: (number | '…')[] = [];
    for (let p = 1; p <= pageCount; p++) {
      if (p === 1 || p === pageCount || Math.abs(p - currentPage) <= 1) pages.push(p);
      else if (pages[pages.length - 1] !== '…') pages.push('…');
    }
    return pages;
  }, [pageCount, currentPage]);

  if (rows.length === 0 && empty) {
    return <EmptyState {...empty} />;
  }

  return (
    <>
      <Scroll>
        <Table $minWidth={minWidth}>
          <thead>
            <tr>
              {selectable && (
                <Th style={{ width: 48 }}>
                  <IndeterminateCheckbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                    label="Select all rows"
                  />
                </Th>
              )}
              {columns.map((col) => (
                <Th
                  key={col.key}
                  style={{ width: col.width }}
                  $align={col.align}
                  $stickyRight={col.stickyRight}
                  aria-sort={
                    sort?.key === col.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                >
                  {col.sortValue ? (
                    <HeaderButton onClick={() => toggleSort(col.key)} $active={sort?.key === col.key}>
                      {col.header}
                      {sort?.key !== col.key ? (
                        <ArrowUpDown />
                      ) : sort.dir === 'asc' ? (
                        <ArrowUp />
                      ) : (
                        <ArrowDown />
                      )}
                    </HeaderButton>
                  ) : (
                    col.header
                  )}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <Td colSpan={columns.length + (selectable ? 1 : 0)} $align="center">
                  <EmptyState title="No matching records" description="Try adjusting your search or filters." />
                </Td>
              </tr>
            ) : (
              pageRows.map((row, index) => {
                const id = rowKey(row);
                return (
                  <Tr
                    key={id}
                    $clickable={!!onRowClick}
                    $selected={selected.has(id)}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <Td onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          type="checkbox"
                          checked={selected.has(id)}
                          onChange={() => toggleOne(id)}
                          aria-label="Select row"
                        />
                      </Td>
                    )}
                    {columns.map((col) => (
                      <Td key={col.key} $align={col.align} $stickyRight={col.stickyRight}>
                        {col.render(row, start + index)}
                      </Td>
                    ))}
                  </Tr>
                );
              })
            )}
          </tbody>
        </Table>
      </Scroll>

      <Footer>
        <PageInfo>
          Showing <strong>{sorted.length === 0 ? 0 : start + 1}</strong>–
          <strong>{Math.min(start + pageSize, sorted.length)}</strong> of <strong>{sorted.length}</strong>
          <PageSizeSelect
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            aria-label="Rows per page"
          >
            {[10, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </PageSizeSelect>
        </PageInfo>
        <PageControls>
          <PageButton
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </PageButton>
          {pageNumbers.map((p, i) =>
            p === '…' ? (
              <PageButton key={`gap-${i}`} disabled>
                …
              </PageButton>
            ) : (
              <PageButton key={p} $active={p === currentPage} onClick={() => setPage(p)}>
                {p}
              </PageButton>
            ),
          )}
          <PageButton
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === pageCount}
            aria-label="Next page"
          >
            <ChevronRight />
          </PageButton>
        </PageControls>
      </Footer>
    </>
  );
}

export default DataTable;
