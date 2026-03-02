import { HiOutlineDocumentText } from "react-icons/hi2";

export default function SectionCard({ chunk }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-surface-900/40 border border-white/5 text-xs">
      <HiOutlineDocumentText className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        {chunk.chapter_title && (
          <p className="font-medium text-primary-300 truncate">{chunk.chapter_title}</p>
        )}
        {chunk.page_number && (
          <p className="text-surface-200/40">Page {chunk.page_number}</p>
        )}
        {chunk.content && (
          <p className="text-surface-200/50 mt-1 line-clamp-2">{chunk.content}</p>
        )}
      </div>
    </div>
  );
}
