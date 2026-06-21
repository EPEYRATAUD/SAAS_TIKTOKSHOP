"use client";

import { useState, useTransition } from "react";
import { deleteAccount, resetPassword } from "../actions";

export function ResetPasswordButton() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  function handle() {
    startTransition(async () => {
      const result = await resetPassword();
      if (result.error) {
        alert(`Erreur : ${result.error}`);
      } else {
        setSent(true);
      }
    });
  }

  if (sent) {
    return (
      <p className="text-sm text-green-400">
        Email envoyé — vérifie ta boîte mail.
      </p>
    );
  }

  return (
    <button
      onClick={handle}
      disabled={isPending}
      className="px-4 py-2 rounded-xl border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors disabled:opacity-40"
    >
      {isPending ? "Envoi…" : "Réinitialiser le mot de passe"}
    </button>
  );
}

export function DeleteAccountButton() {
  const [isPending, startTransition] = useTransition();

  function handle() {
    if (
      !confirm(
        "Supprimer définitivement ton compte ?\n\nToutes tes vidéos seront effacées. Cette action est irréversible."
      )
    )
      return;

    startTransition(async () => {
      const result = await deleteAccount();
      if (result?.error) {
        alert(`Erreur : ${result.error}`);
      }
    });
  }

  return (
    <button
      onClick={handle}
      disabled={isPending}
      className="px-4 py-2 rounded-xl border border-red-500/30 text-sm text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-colors disabled:opacity-40"
    >
      {isPending ? "Suppression en cours…" : "Supprimer mon compte"}
    </button>
  );
}
