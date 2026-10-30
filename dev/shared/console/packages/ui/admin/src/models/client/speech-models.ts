/** 已接入企业实时语音协议的 Qwen 模型；不注册到对话模型或 Agent 模型选择器。 */
export const qwenSpeechModels = [
  { id: 'qwen-audio-3.1-asr-flash-streaming', name: 'Qwen Audio 3.1 ASR Streaming', inputModalities: ['audio'], endpointPath: '/inference' },
  { id: 'qwen3-asr-flash-realtime', name: 'Qwen3 ASR Flash Realtime', inputModalities: ['audio'], endpointPath: '/realtime' },
  { id: 'qwen3-asr-flash-realtime-2026-02-10', name: 'Qwen3 ASR Flash Realtime · 2026-02-10', inputModalities: ['audio'], endpointPath: '/realtime' },
] as const
export type QwenSpeechModel = typeof qwenSpeechModels[number]
export function findSpeechModel(id: string | undefined): QwenSpeechModel | undefined {
  return qwenSpeechModels.find(model => model.id === id)
}
