"use client";

import { Upload, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface VideoUploaderProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime", // .mov
  "video/x-matroska", // .mkv
  "video/x-msvideo", // .avi
  "video/webm",
];

const ACCEPTED_EXTENSIONS = [".mp4", ".mov", ".mkv", ".avi", ".webm"];

export function VideoUploader({
  onFilesSelected,
  disabled,
}: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const validateFile = (file: File): boolean => {
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    return (
      ACCEPTED_VIDEO_TYPES.includes(file.type) ||
      ACCEPTED_EXTENSIONS.includes(extension)
    );
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(validateFile);
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
        ? Array.from(e.target.files).filter(validateFile)
        : [];
      if (files.length > 0) {
        setSelectedFiles(files);
      }
    },
    []
  );

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
      setSelectedFiles([]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "border-2 border-dashed transition-all",
          isDragging && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center p-6 sm:p-8 text-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Upload className="size-8 text-primary" />
          </div>
          <h3 className="font-semibold text-base sm:text-lg mb-2">
            Drop videos here or click to browse
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Supported formats: MP4, MOV, MKV, AVI, WEBM
          </p>
          <input
            type="file"
            multiple
            accept={ACCEPTED_EXTENSIONS.join(",")}
            onChange={handleFileInput}
            disabled={disabled}
            className="hidden"
            id="video-upload"
          />
          <label htmlFor="video-upload">
            <Button variant="outline" disabled={disabled} asChild>
              <span>Browse Files</span>
            </Button>
          </label>
        </CardContent>
      </Card>

      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">
                Selected Files ({selectedFiles.length})
              </h4>
              <Button onClick={handleUpload} disabled={disabled}>
                Upload {selectedFiles.length}{" "}
                {selectedFiles.length === 1 ? "Video" : "Videos"}
              </Button>
            </div>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    disabled={disabled}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
