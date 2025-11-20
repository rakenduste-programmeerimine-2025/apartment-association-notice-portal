"use client";

import { Flex } from "@mantine/core";
import CreateWorryForm from "./components/CreateWorryForm";

export default function CreateWorryPage() {
  return (
    <Flex justify="center" style={{ paddingTop: "3rem" }}>
      <CreateWorryForm />
    </Flex>
  );
}
