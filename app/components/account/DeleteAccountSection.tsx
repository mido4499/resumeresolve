"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import Button from "../Button";
import { Field, formButtonClass, inputClass, Notice } from "../FormFields";
import { sendJson } from "./Section";

// Saves the export from /api/account/export through a temporary link, using the server's filename
async function downloadExport(): Promise<boolean> {
    const res = await fetch("/api/account/export");
    if (!res.ok) return false;
    const fileName = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ?? "resume-diary-export.json";
    const url = URL.createObjectURL(await res.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
}

export default function DeleteAccountSection({ hasPassword }: { hasPassword: boolean }) {
    const [open, setOpen] = useState(false);
    const [wantsDownload, setWantsDownload] = useState(true);
    const [downloaded, setDownloaded] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    async function handleDelete(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setDeleting(true);
        setError("");

        // The data is saved before anything is deleted; a retry (e.g. after a wrong password) doesn't download it again
        if (wantsDownload && !downloaded) {
            if (!(await downloadExport())) {
                setError("We couldn't prepare your data download, so your account wasn't deleted. Please try again.");
                setDeleting(false);
                return;
            }
            setDownloaded(true);
        }

        const deleteError = await sendJson("/api/account", "DELETE", { password, confirmation });
        if (deleteError) {
            setError(deleteError);
            setDeleting(false);
            return;
        }
        await signOut({ callbackUrl: "/" });
    }

    function cancel() {
        setOpen(false);
        setPassword("");
        setConfirmation("");
        setError("");
    }

    return (
        <section className="flex flex-col gap-5 rounded-3xl border border-(--rust)/50 bg-(--metal) p-7 sm:p-8">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-semibold text-(--platinum)">Delete account</h2>
                <p className="text-(--steel)">
                    Permanently deletes your account, experiences, diary entries, and education. This can&apos;t be undone.
                </p>
            </div>

            {!open ? (
                <div className="flex justify-end">
                    <Button type="button" variant="secondary" className={`bg-transparent text-(--rust) ring-1 ring-(--rust) ${formButtonClass} hover:bg-(--rust)/15`} onClick={() => setOpen(true)}>
                        Delete my account
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleDelete} className="flex flex-col gap-5">
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-(--charcoal) p-4 text-(--chrome)">
                        <input
                            type="checkbox"
                            checked={wantsDownload}
                            onChange={e => setWantsDownload(e.target.checked)}
                            className="mt-0.5 h-5 w-5 shrink-0 accent-(--oxide)"
                        />
                        <span className="flex flex-col gap-1">
                            <span className="text-(--platinum)">Download my experiences and diary as a .json file first</span>
                            <span className="text-sm text-(--steel)">
                                {downloaded ? "Downloaded. Check your downloads folder." : "Your profile and education are included too."}
                            </span>
                        </span>
                    </label>

                    {hasPassword ? (
                        <Field label="Enter your password to confirm">
                            <input className={inputClass} type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required autoFocus />
                        </Field>
                    ) : (
                        <Field label="Type DELETE to confirm">
                            <input className={inputClass} value={confirmation} onChange={e => setConfirmation(e.target.value)} required autoFocus />
                        </Field>
                    )}

                    {error && <Notice tone="error">{error}</Notice>}

                    <div className="flex flex-wrap justify-end gap-3">
                        <Button type="button" variant="secondary" className={`bg-transparent ring-1 ring-(--steel) ${formButtonClass} hover:bg-(--charcoal)`} onClick={cancel} disabled={deleting}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="secondary" className={`bg-(--rust) ${formButtonClass} hover:bg-(--rust)/80`} disabled={deleting}>
                            {deleting ? "Deleting..." : "Permanently delete account"}
                        </Button>
                    </div>
                </form>
            )}
        </section>
    );
}
