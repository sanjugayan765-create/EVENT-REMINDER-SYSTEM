import { useState, useEffect, useRef } from 'react';
import { Upload, File, Download, Trash2, Paperclip } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface FileAttachment {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  download_url?: string;
  created_at: string;
  uploader: {
    id: string;
    name: string;
  };
}

interface FileUploadProps {
  entityType: 'assignment' | 'submission' | 'event' | 'exam';
  entityId: string;
  accessToken: string;
  currentUserId: string;
  allowUpload?: boolean;
}

export function FileUpload({ 
  entityType, 
  entityId, 
  accessToken, 
  currentUserId, 
  allowUpload = true 
}: FileUploadProps) {
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, [entityType, entityId]);

  async function fetchFiles() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/files/${entityType}/${entityId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await response.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(selectedFiles)) {
        // In a real implementation, you would upload to Supabase Storage first
        // For now, we'll create a mock storage path
        const storagePath = `${entityType}/${entityId}/${Date.now()}-${file.name}`;
        
        // Save file metadata
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/files`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              entity_type: entityType,
              entity_id: entityId,
              file_name: file.name,
              file_size: file.size,
              file_type: file.type,
              storage_path: storagePath,
              is_public: false,
            }),
          }
        );

        if (response.ok) {
          toast.success(`${file.name} uploaded successfully!`);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      fetchFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Error uploading files');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleDeleteFile(fileId: string) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9780152/files/${fileId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        setFiles(files.filter(f => f.id !== fileId));
        toast.success('File deleted successfully!');
      } else {
        toast.error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Error deleting file');
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  function getFileIcon(fileType: string) {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('video')) return '🎥';
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
    return '📎';
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg">Attachments ({files.length})</h3>
        </div>

        {allowUpload && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload Files'}
            </label>
          </div>
        )}
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <File className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No files attached</p>
          {allowUpload && (
            <p className="text-sm text-gray-400 mt-1">Upload files to get started</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl">{getFileIcon(file.file_type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate">{file.file_name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>•</span>
                    <span>Uploaded by {file.uploader.name}</span>
                    <span>•</span>
                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => {
                    // In a real implementation, this would download from Supabase Storage
                    toast.info('Download functionality would be implemented with Supabase Storage');
                  }}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                {file.uploader.id === currentUserId && (
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
