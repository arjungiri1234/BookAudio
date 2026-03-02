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
      className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragActive
          ? "border-primary-400 bg-primary-500/5"
          : "border-white/10 hover:border-white/20 bg-surface-900/30"
        }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragActive ? "bg-primary-500/20" : "bg-surface-800"
            }`}
        >
          <HiOutlineCloudArrowUp
            className={`w-7 h-7 ${isDragActive ? "text-primary-400" : "text-surface-200/50"}`}
          />
        </div>
        <div>
          <p className="font-medium text-white">
            {isDragActive ? "Drop the file here" : "Drag & drop your book here"}
          </p>
          <p className="text-sm text-surface-200/50 mt-1">
            or click to browse · PDF, EPUB, TXT · Max 50MB
          </p>
        </div>
      </div>
    </div>
  );
}
