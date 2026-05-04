"use client";

import { useRef, useState } from "react";
import SubmitButton from "@/components/admin/SubmitButton";
import imgStyles from "@/components/admin/image-upload.module.css";

type Props = {
  uploadAction: (formData: FormData) => Promise<void>;
};

export default function LogoForm({ uploadAction }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

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
        await uploadAction(fd);
        formRef.current?.reset();
        setPreview(null);
        setFileName("");
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
            <span>Click para elegir logo</span>
            <small>JPG, PNG, WebP, AVIF · máx 5MB</small>
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
        <SubmitButton pendingLabel="Subiendo...">Guardar logo</SubmitButton>
      </div>

      {fileName && <p className={imgStyles.fileName}>{fileName}</p>}
    </form>
  );
}
