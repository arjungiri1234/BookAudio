import { HiOutlineDocumentText } from "react-icons/hi2";

export default function SectionCard({ chunk, onClick }) {
  return (
    <button
      onClick={() => onClick?.(chunk)}
      className="w-full text-left flex items-start gap-2 p-2 rounded-lg bg-surface-100 border border-surface-300 text-xs hover:bg-surface-200 hover:border-primary-300 transition-all cursor-pointer group"
    >
      <HiOutlineDocumentText className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5 group-hover:text-primary-700" />
      <div className="min-w-0 flex-1">
        {chunk.chapter_title && (
          <p className="font-medium text-primary-700 truncate">{chunk.chapter_title}</p>
        )}
        {chunk.page_number && (
          <p className="text-surface-500">Page {chunk.page_number}</p>
        )}
        {chunk.content && (
          <p className="text-surface-600 mt-1 line-clamp-2">{chunk.content}</p>
        )}
        <p className="text-primary-600 mt-1 text-[10px] uppercase tracking-wider group-hover:text-primary-700">
          Click to view full content →
        </p>
      </div>
    </button>
  );
}
