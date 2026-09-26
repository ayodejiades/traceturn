"use client";

import { useRef, useState, useTransition } from "react";
import { submitRecord } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewRecordForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <Button data-demo="new" onClick={() => setOpen(true)}>
        New record
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      className="flex items-center gap-2"
      action={(formData) => {
        startTransition(async () => {
          const result = await submitRecord(formData);
          if (result.ok) {
            formRef.current?.reset();
            setOpen(false);
          }
        });
      }}
    >
      <Input data-demo="title" name="title" placeholder="Exploit cited 14x from one origin" autoFocus required />
      <Button data-demo="submit" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Submit"}
      </Button>
    </form>
  );
}
