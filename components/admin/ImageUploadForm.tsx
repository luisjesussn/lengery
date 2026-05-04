"use client";

import { useRef, useState } from "react";
import SubmitButton from "./SubmitButton";
import styles from "./image-upload.module.css";

type Props = {
  action: (formData: FormData) => Promise<void> | void;
  productId: string;
};

export default function ImageUploadForm({ action, productId }: Props) {
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
    reader.onload = () => setPreview(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(f);
  }

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await action(fd);
        formRef.current?.reset();
        setPreview(null);
        setFileName("");
      }}
      className={styles.form}
    >
      <input type="hidden" name="productId" value={productId} />

      <button
        type="button"
        className={styles.dropzone}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="preview" className={styles.preview} />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.icon}>＋</span>
            <span>Click para elegir imagen</span>
            <small>JPG, PNG, WebP, AVIF</small>
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
        className={styles.fileInput}
      />

      <div className={styles.row}>
        <input type="text" name="color" placeholder="Color (opcional)" className={styles.colorInput} />
        <SubmitButton pendingLabel="Subiendo...">Subir imagen</SubmitButton>
      </div>

      {fileName && <p className={styles.fileName}>{fileName}</p>}
    </form>
  );
}
