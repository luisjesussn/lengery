import SubmitButton from "@/components/admin/SubmitButton";
import styles from "./settings.module.css";

export type FieldType = "text" | "textarea" | "url" | "tel" | "number";

export type SettingsField = {
  key: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  help?: string;
  defaultValue?: string;
  currentValue?: string | null;
  required?: boolean;
  step?: string;
  min?: string;
};

type Props = {
  section: string;
  title: string;
  description?: string;
  fields: SettingsField[];
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
};

export default function SettingsTextForm({
  section,
  title,
  description,
  fields,
  action,
  submitLabel = "Guardar",
}: Props) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {description && <p className={styles.help}>{description}</p>}

      <form action={action} className={styles.textForm}>
        <input type="hidden" name="__section" value={section} />

        {fields.map((f) => {
          const id = `field-${f.key}`;
          const value = f.currentValue ?? "";
          return (
            <div key={f.key} className={styles.field}>
              <label htmlFor={id} className={styles.fieldLabel}>
                {f.label}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  id={id}
                  name={f.key}
                  defaultValue={value}
                  placeholder={f.placeholder ?? f.defaultValue ?? ""}
                  className={styles.textarea}
                  rows={3}
                />
              ) : (
                <input
                  id={id}
                  name={f.key}
                  type={f.type ?? "text"}
                  defaultValue={value}
                  placeholder={f.placeholder ?? f.defaultValue ?? ""}
                  className={styles.input}
                  step={f.step}
                  min={f.min}
                  required={f.required}
                />
              )}
              {f.help && <small className={styles.fieldHelp}>{f.help}</small>}
              {f.defaultValue && !f.help && (
                <small className={styles.fieldHelp}>
                  Por defecto: <code>{f.defaultValue}</code>
                </small>
              )}
            </div>
          );
        })}

        <div className={styles.formRow}>
          <SubmitButton pendingLabel="Guardando...">{submitLabel}</SubmitButton>
        </div>
      </form>
    </section>
  );
}
