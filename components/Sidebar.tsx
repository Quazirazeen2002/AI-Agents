import React, { useRef } from 'react';
import { Upload, FileText, Trash2, Database, Github, Info, AlertCircle } from 'lucide-react';
import { UploadedDocument } from '../types';
import { formatBytes } from '../utils/textUtils';

interface SidebarProps {
  documents: UploadedDocument[];
  onUpload: (files: FileList | null) => void;
  onRemoveDocument: (id: string) => void;
  totalTokens: number;
}

const Sidebar: React.FC<SidebarProps> = ({ documents, onUpload, onRemoveDocument, totalTokens }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col h-full hidden md:flex">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">Gemini Omni-RAG</h1>
        </div>
        <p className="text-xs text-gray-500">Serverless Long-Context Agent</p>
      </div>

      {/* Knowledge Base Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Knowledge Base</h2>
          <span className="text-xs px-2 py-0.5 rounded bg-blue-900/30 text-blue-400 border border-blue-800">
            {documents.length} Files
          </span>
        </div>

        {/* Upload Area */}
        <div 
          onClick={handleFileClick}
          className="group border-2 border-dashed border-gray-700 hover:border-blue-500 hover:bg-gray-800/50 rounded-lg p-4 cursor-pointer transition-all duration-200 mb-6 text-center"
        >
          <input 
            type="file" 
            multiple 
            accept=".txt,.md,.json,.csv,.js,.ts,.tsx,.py" 
            className="hidden" 
            ref={fileInputRef}
            onChange={(e) => onUpload(e.target.files)}
          />
          <div className="flex justify-center mb-2">
            <Upload className="w-8 h-8 text-gray-500 group-hover:text-blue-400 transition-colors" />
          </div>
          <p className="text-sm text-gray-300 font-medium">Click to upload documents</p>
          <p className="text-xs text-gray-500 mt-1">TXT, MD, JSON, Code files</p>
        </div>

        {/* Document List */}
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="group flex items-start p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate" title={doc.name}>{doc.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500">{formatBytes(doc.size)}</p>
                  <span className="text-gray-600">•</span>
                  <p className="text-xs text-gray-500">~{doc.tokens?.toLocaleString()} tokens</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onRemoveDocument(doc.id); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {documents.length === 0 && (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-gray-500">No documents uploaded.</p>
              <p className="text-xs text-gray-600 mt-2">Upload files to enable RAG capabilities on your custom data.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-gray-950 border-t border-gray-800">
        <div className="flex items-center gap-2 mb-3">
           <div className={`w-2 h-2 rounded-full ${totalTokens > 900000 ? 'bg-red-500' : 'bg-green-500'}`}></div>
           <p className="text-xs font-mono text-gray-400">Context Usage: {totalTokens.toLocaleString()} / ~1M</p>
        </div>
        
        <div className="p-3 bg-blue-900/10 border border-blue-900/30 rounded text-xs text-blue-300 flex items-start gap-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>Using <b>Gemini 2.5 Flash</b> with Google Search Grounding.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
