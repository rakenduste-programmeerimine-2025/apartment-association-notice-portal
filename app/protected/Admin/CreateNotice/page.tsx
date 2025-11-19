"use client";

import { Flex } from "@mantine/core";
import CreateNoticeForm from "./components/CreateNoticeForm";

export default function CreateNoticePage() {
  return (
    <Flex justify="center" style={{ paddingTop: "3rem" }}>
      <CreateNoticeForm />
    </Flex>
  );
}
