import { Download, FileSpreadsheet } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface ExportButtonProps {
  type: 'events' | 'exams' | 'assignments';
  accessToken: string;
}

export function ExportButton({ type, accessToken }: ExportButtonProps) {
  async function handleExport() {
    try {
      toast.info('Preparing export...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/export/${type}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`${type} exported successfully!`);
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error exporting data');
    }
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
    >
      <Download className="w-4 h-4" />
      <span>Export CSV</span>
    </button>
  );
}
