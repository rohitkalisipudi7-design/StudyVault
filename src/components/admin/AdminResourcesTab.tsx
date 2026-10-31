'use client';

import { Search, FileText, Link as LinkIcon, ExternalLink, Edit3, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AdminResourcesTabProps {
  institutionName?: string;
  resources: any[];
  resourceSearch: string;
  setResourceSearch: (val: string) => void;
  onEditResource: (res: any) => void;
  onDeleteResource: (id: string) => void;
}

export function AdminResourcesTab({
  institutionName,
  resources,
  resourceSearch,
  setResourceSearch,
  onEditResource,
  onDeleteResource,
}: AdminResourcesTabProps) {
  const filteredResources = resources.filter((r) => {
    if (!resourceSearch.trim()) return true;
    const term = resourceSearch.toLowerCase();
    return (
      r.title.toLowerCase().includes(term) ||
      r.course_name?.toLowerCase().includes(term) ||
      r.course_code?.toLowerCase().includes(term) ||
      r.branch_code?.toLowerCase().includes(term)
    );
  });

  return (
    <section className="bg-white p-6 rounded-2xl border border-[#b19681]/50 shadow-xs space-y-4 animate-ink">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#b19681]/30 pb-3">
        <div>
          <h3 className="font-serif font-bold text-lg text-[#2D3822]">
            Institutional Study Resources
          </h3>
          <p className="text-xs text-[#5c4b3e]/70">
            All files and links stored under {institutionName}.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#5c4b3e]/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            value={resourceSearch}
            onChange={(e) => setResourceSearch(e.target.value)}
            placeholder="Filter resources..."
            className="pl-9 bg-[#FDFBF7] border-[#b19681]/50 text-xs h-9"
          />
        </div>
      </div>

      {/* Resources Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#b19681]/40 text-[#5c4b3e]/80 font-mono uppercase text-[10px]">
              <th className="py-2.5 px-3">Format</th>
              <th className="py-2.5 px-3">Title & Details</th>
              <th className="py-2.5 px-3">Branch & Course</th>
              <th className="py-2.5 px-3">Uploaded</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#b19681]/20">
            {filteredResources.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#5c4b3e]/60 font-serif">
                  No resources matching your search.
                </td>
              </tr>
            ) : (
              filteredResources.map((res) => (
                <tr key={res.id} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="py-3 px-3 align-top">
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        res.type === 'file'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {res.type === 'file' ? <FileText className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                      <span>{res.type}</span>
                    </span>
                  </td>

                  <td className="py-3 px-3 align-top max-w-sm">
                    <span className="font-serif font-bold text-[#2D3822] block leading-snug">
                      {res.title}
                    </span>
                    <p className="text-[11px] text-[#5c4b3e]/70 line-clamp-1 mt-0.5">
                      {res.description}
                    </p>
                    <a
                      href={res.type === 'file' ? `/api/resources/${res.id}/download` : res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#8d9d4f] font-mono hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      {res.file_name || res.url} <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </td>

                  <td className="py-3 px-3 align-top font-mono text-[11px]">
                    <span className="font-bold text-[#2D3822]">{res.course_code}</span>
                    <span className="text-[#5c4b3e]/60 block">{res.branch_code}</span>
                  </td>

                  <td className="py-3 px-3 align-top text-[11px] text-[#5c4b3e]/70 font-mono">
                    {new Date(res.created_at).toLocaleDateString()}
                  </td>

                  <td className="py-3 px-3 align-top text-right space-x-1">
                    <button
                      type="button"
                      aria-label={`Edit ${res.title}`}
                      onClick={() => onEditResource(res)}
                      className="p-1.5 rounded-lg text-[#5c4b3e] hover:bg-[#8d9d4f]/20 hover:text-[#2D3822] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${res.title}`}
                      onClick={() => onDeleteResource(res.id)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
