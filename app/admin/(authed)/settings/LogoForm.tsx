"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import SubmitButton from "@/components/admin/SubmitButton";
import imgStyles from "@/components/admin/image-upload.module.css";

type Props = {
  uploadAction: (formData: FormData) => Promise<void>;
  label?: string;
  pickerText?: string;
  hint?: string;
};

export default function LogoForm({
  uploadAction,
  label = "Guardar",
  pickerText = "Click para elegir imagen",
  hint = "JPG, PNG, WebP, AVIF · máx 5MB",
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) {
      setPreview(null);
      setFileName("");
      return;
    }
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = () =>
      setPreview(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(f);
  }

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        setError(null);
        try {
          await uploadAction(fd);
          formRef.current?.reset();
          setPreview(null);
          setFileName("");
          router.refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Error al subir");
        }
      }}
      className={imgStyles.form}
    >
      <button
        type="button"
        className={imgStyles.dropzone}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="preview" className={imgStyles.preview} />
        ) : (
          <div className={imgStyles.placeholder}>
            <span className={imgStyles.icon}>＋</span>
            <span>{pickerText}</span>
            <small>{hint}</small>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        name="file"
        accept="image/*"
        required
        onChange={handleChange}
        className={imgStyles.fileInput}
      />

      <div className={imgStyles.row}>
        <SubmitButton pendingLabel="Subiendo...">{label}</SubmitButton>
      </div>

      {fileName && <p className={imgStyles.fileName}>{fileName}</p>}
      {error && (
        <p style={{ color: "#b8362a", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          {error}
        </p>
      )}
    </form>
  );
}
