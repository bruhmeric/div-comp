import type { ComparisonResponse, ChatMessage } from '../../types';

export const generateComparison = async (device1Name: string, device2Name: string): Promise<ComparisonResponse> => {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'compare', device1Name, device2Name }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "An unknown error occurred." }));
    throw new Error(errorData.error || 'Failed to fetch comparison from the server.');
  }

  return response.json();
};

export const sendFollowUpMessage = async (
    chatContext: ComparisonResponse,
    chatHistory: ChatMessage[],
): Promise<string> => {
    
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', chatContext, chatHistory }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "An unknown error occurred." }));
        throw new Error(errorData.error || 'Failed to send follow-up message to the server.');
    }

    const data = await response.json();
    return data.response;
};
