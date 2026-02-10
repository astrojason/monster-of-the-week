"use client";

import { useState, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Camera, Upload, X } from "lucide-react";
import imageCompression from "browser-image-compression";

interface ImageUploadProps {
  hunterId: string;
  onUploaded: (dataUrl: string) => void;
}

export function ImageUpload({ hunterId, onUploaded }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dataUrlRef = useRef<string>("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 600,
      useWebWorker: true,
    };

    try {
      const compressed = await imageCompression(file, options);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        dataUrlRef.current = result;
        setPreview(result);
        setShowModal(true);
      };
      reader.readAsDataURL(compressed);
    } catch {
      alert("Failed to process image. Try a different file.");
    }

    if (fileRef.current) fileRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!dataUrlRef.current) return;
    setSaving(true);

    try {
      await updateDoc(doc(db, "hunters", hunterId), {
        imageData: dataUrlRef.current,
      });
      onUploaded(dataUrlRef.current);
      setShowModal(false);
      setPreview(null);
      dataUrlRef.current = "";
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save image. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const cancelUpload = () => {
    setShowModal(false);
    setPreview(null);
    dataUrlRef.current = "";
  };

  return (
    <>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="absolute bottom-2 right-2 bg-surface/80 hover:bg-surface border border-border rounded-full p-1.5 transition-colors"
      >
        <Camera className="w-4 h-4" />
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Upload Hunter Image</h3>
              <button onClick={cancelUpload} className="text-muted hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            {preview && (
              <div className="mb-4 rounded-lg overflow-hidden aspect-square">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <button
              onClick={handleUpload}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-md py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {saving ? "Saving..." : "Save Image"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
