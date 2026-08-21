import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { createConversation } from "@/lib/api.functions";
import { errorMessage } from "@/lib/format";

export function useCreateChat() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { kbId?: string | null }) =>
      createConversation({ data: { kbId: input.kbId ?? null } }),
    onSuccess: (conversation) => {
      void queryClient.invalidateQueries();
      void navigate({ to: "/chat/$chatId", params: { chatId: conversation.id } });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
