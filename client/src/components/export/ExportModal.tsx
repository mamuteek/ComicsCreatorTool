import React, { useState } from 'react';
import { ComicProject } from '../../types/comic';
import { X, Download, Printer, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project: ComicProject;
  activePageIndex: number;
}

export const ExportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  project,
  activePageIndex,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  if (!isOpen) return null;

  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportComplete(false);

    try {
      // Create A4 PDF (210 x 297 mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Target the active Konva canvas
      const canvasElement = document.querySelector('.konvajs-content canvas') as HTMLCanvasElement;
      if (!canvasElement) {
        throw new Error('Canvas element not found in DOM.');
      }

      const imgData = canvasElement.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);

      pdf.save(`${project.title || 'ComicBook'}_Page_${activePageIndex + 1}.pdf`);
      setExportComplete(true);
    } catch (err: any) {
      alert(`PDF Export Failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPNG = () => {
    const canvasElement = document.querySelector('.konvajs-content canvas') as HTMLCanvasElement;
    if (!canvasElement) return;

    const dataUrl = canvasElement.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `${project.title || 'ComicBook'}_Page_${activePageIndex + 1}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            Print & Export A4 Comic Book
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Page Size</span>
              <span className="text-xs text-white font-bold bg-slate-900 px-2 py-1 rounded border border-slate-700">
                A4 Portrait (210 x 297 mm)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Pages in Book</span>
              <span className="text-xs text-white font-bold">
                {project.pages.length} Pages
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Active Page</span>
              <span className="text-xs text-blue-400 font-bold">
                Page {activePageIndex + 1} of {project.pages.length}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs py-3 px-4 rounded-xl shadow-lg transition disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating High-Res A4 PDF...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Export Current Page to PDF (Print-Ready)
                </>
              )}
            </button>

            <button
              onClick={handleExportPNG}
              className="w-full flex items-center justify-center gap-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs py-2.5 px-4 rounded-xl transition"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Download High-Res PNG Image
            </button>
          </div>

          {exportComplete && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle className="w-4 h-4 shrink-0" />
              PDF exported! Ready to send to your photo book printer or home printer.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

