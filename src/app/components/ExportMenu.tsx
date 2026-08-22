import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Download, FileText, FileEdit, Sheet, BarChart2, Loader2 } from 'lucide-react';

export type ExportFormat = 'pdf' | 'pdf-editable' | 'csv' | 'word' | 'pdf-analisis' | 'csv-analisis';

interface ExportOption {
  id: ExportFormat;
  label: string;
  desc: string;
  ext: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}

const HC_HN_OPTIONS: ExportOption[] = [
  { id: 'pdf',          label: 'PDF',           desc: 'Documento listo para imprimir', ext: '.pdf',  Icon: FileText },
  { id: 'pdf-editable', label: 'PDF editable',  desc: 'Con campos rellenables',        ext: '.pdf',  Icon: FileEdit },
  { id: 'csv',          label: 'CSV',            desc: 'Para hoja de cálculo',          ext: '.csv',  Icon: Sheet },
  { id: 'word',         label: 'Word editable',  desc: 'Documento .docx',               ext: '.docx', Icon: FileText },
];

const ANALISIS_OPTIONS: ExportOption[] = [
  { id: 'pdf-analisis',  label: 'PDF con gráficas', desc: 'Gráficas e información del paciente', ext: '.pdf', Icon: BarChart2 },
  { id: 'csv-analisis',  label: 'CSV',               desc: 'Glucosa y alimentos en hoja de cálculo', ext: '.csv', Icon: Sheet },
];

interface ExportMenuProps {
  mode: 'historia' | 'analisis';
  onExport: (format: ExportFormat) => Promise<void>;
  disabled?: boolean;
}

export function ExportMenu({ mode, onExport, disabled }: ExportMenuProps) {
  const [loadingFormat, setLoadingFormat] = useState<ExportFormat | null>(null);
  const options = mode === 'historia' ? HC_HN_OPTIONS : ANALISIS_OPTIONS;

  const handleSelect = async (format: ExportFormat) => {
    setLoadingFormat(format);
    try {
      await onExport(format);
    } finally {
      setLoadingFormat(null);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          disabled={disabled || !!loadingFormat}
          className="flex items-center gap-[8px] bg-[#39588a] hover:bg-[#2d4570] text-white font-[Poppins] font-semibold text-[15px] px-[20px] py-[10px] rounded-[12px] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
        >
          {loadingFormat
            ? <Loader2 size={18} className="animate-spin" />
            : <Download size={18} />
          }
          Exportar
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 bg-white rounded-[14px] shadow-2xl border border-[#e1e9f2] p-[6px] min-w-[230px]"
        >
          <p className="font-[Poppins] font-semibold text-[11px] text-gray-400 uppercase tracking-wide px-[14px] py-[6px]">
            Formato de exportación
          </p>
          {options.map(({ id, label, desc, ext, Icon }) => {
            const isLoading = loadingFormat === id;
            return (
              <DropdownMenu.Item
                key={id}
                onSelect={() => handleSelect(id)}
                disabled={!!loadingFormat}
                className="flex items-center gap-[12px] px-[14px] py-[10px] rounded-[10px] cursor-pointer outline-none
                  hover:bg-[#f0f4ff] transition-colors
                  data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
              >
                {isLoading
                  ? <Loader2 size={20} className="text-[#39588a] animate-spin flex-shrink-0" />
                  : <Icon size={20} className="text-[#39588a] flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="font-[Poppins] font-semibold text-[14px] text-black leading-tight">{label}</p>
                  <p className="font-[Poppins] font-normal text-[11px] text-gray-400 leading-tight">{desc}</p>
                </div>
                <span className="font-mono text-[11px] text-gray-300 flex-shrink-0">{ext}</span>
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
