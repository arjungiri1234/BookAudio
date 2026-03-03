import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { HiOutlineCloudArrowUp, HiOutlineDocument } from "react-icons/hi2";
import toast from "react-hot-toast";
import useBookStore from "../store/bookStore";

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/epub+zip": [".epub"],
  "text/plain": [".txt"],
};
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export default function BookUploader({ onComplete }) {
  const { uploadBook } = useBookStore();

  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const err = rejectedFiles[0].errors[0];
        toast.error(err.code === "file-too-large"
          ? "File must be under 50MB"
          : "Only PDF, EPUB, and TXT files are allowed");
        return;
      }
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const toastId = toast.loading(`Uploading "${file.name}"...`);

      try {
        await uploadBook(file);
        toast.success(`"${file.name}" uploaded! Processing...`, { id: toastId });
        onComplete?.();
      } catch (err) {
        toast.error(err.message || "Upload failed", { id: toastId });
      }
    },
    [uploadBook, onComplete]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      id="dropzone"
      className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragActive
        ? "border-primary-400 bg-primary-50"
        : "border-surface-300 hover:border-primary-300 bg-surface-100/50 hover:bg-surface-100"
        }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4 relative z-10">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${isDragActive
            ? "bg-primary-600 scale-110 shadow-primary-600/20"
            : "bg-white border border-surface-200"
            }`}
        >
          <HiOutlineCloudArrowUp
            className={`w-8 h-8 transition-colors ${isDragActive ? "text-white" : "text-primary-600"}`}
          />
        </div>
        <div>
          <p className="font-semibold text-surface-800 text-lg">
            {isDragActive ? "Drop the file here" : "Drag & drop your book here"}
          </p>
          <p className="text-sm text-surface-500 mt-1.5 font-medium">
            or <span className="text-primary-600 underline underline-offset-2 decoration-primary-300">click to browse</span>
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-surface-400">
            <span className="px-2 py-1 bg-white rounded-md border border-surface-200">PDF</span>
            <span className="px-2 py-1 bg-white rounded-md border border-surface-200">EPUB</span>
            <span className="px-2 py-1 bg-white rounded-md border border-surface-200">TXT</span>
            <span className="mx-1">•</span>
            <span>Max 50MB</span>
          </div>
        </div>
      </div>

      {/* Decorative background circle */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-200/20 rounded-full blur-[50px] transition-opacity duration-500 ${isDragActive ? "opacity-100" : "opacity-0"}`} />
    </div>
  );
}
