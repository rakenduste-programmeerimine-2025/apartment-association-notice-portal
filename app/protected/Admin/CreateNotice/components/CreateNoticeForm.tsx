"use client";

import {
  TextInput,
  Textarea,
  Button,
  Card,
  Stack,
  Title,
  Select,
  Text,
  LoadingOverlay,
} from "@mantine/core";
import { useState, useTransition } from "react";
import { createNotice } from "../actions";
import { notifications } from "@mantine/notifications";

export default function CreateNoticeForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");

  function validate(formData: FormData) {
    const t = String(formData.get("title") ?? "").trim();
    const c = String(formData.get("content") ?? "").trim();

    if (!t) return "Title is required.";
    if (!c) return "Content is required.";
    return null;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const v = validate(formData);

    if (v) {
      setError(v);
      return;
    }

    startTransition(async () => {
      try {
        await createNotice(formData);

        notifications.show({
          title: "Notice created",
          message: "The notice was successfully created!",
          color: "green",
        });
        setTitle("");
        setContent("");
        setCategory("General");

        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error");
        }
      }
    });
  }

  return (
    <Card
      radius="lg"
      padding="xl"
      withBorder
      style={{ maxWidth: 650, margin: "0 auto", position: "relative" }}
    >
      <LoadingOverlay visible={isPending} />

      <Title order={2} mb="lg">
        Create Notice
      </Title>

      {error && <Text c="red" mb="sm">{error}</Text>}
      {success && <Text c="green" mb="sm">{success}</Text>}

      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            name="title"
            label="Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            name="content"
            label="Notice Content"
            required
            minRows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <Select
            name="category"
            label="Category"
            data={["General", "Maintenance", "Safety"]}
            value={category}
            onChange={(val) => setCategory(val || "General")}
          />

          <Button type="submit">Create</Button>
        </Stack>
      </form>
    </Card>
  );
}
