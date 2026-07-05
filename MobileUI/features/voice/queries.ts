import { useMutation } from "@tanstack/react-query";

import { voiceApi } from "@/lib/api";

export function useParseVoiceExpense() {
  return useMutation({
    mutationFn: (transcript: string) => voiceApi.parse({ transcript }),
  });
}
