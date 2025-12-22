import { createFileRoute } from "@tanstack/react-router"

type IGenerateRequestBody = {
  prompt: string
  mode: "url" | "transcript"
  youtubeUrl: `https://www.youtube.com/watch?v=${string}`
}

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body: IGenerateRequestBody = await request.json()
        console.log("body:", body)

        const { prompt, mode = "url" } = body

        // 模拟内容
        const content =
          mode === "url"
            ? `# 基于 YouTube 视频生成的文章\n\n## 视频分析\n\n正在分析视频内容...\n\n### 关键要点\n\n1. 视频主题概述\n2. 主要观点分析\n3. 实际应用建议\n\n## 详细内容\n\n视频深入探讨了...`
            : `# 基于文稿生成的文章\n\n## 文稿摘要\n\n正在分析文稿内容...\n\n### 核心观点\n\n1. 主要论点分析\n2. 支持证据总结\n3. 结论和建议\n\n## 扩展分析\n\n文稿中提到的关键概念...`

        const chunks = content.split(" ")
        let index = 0

        // 创建流式响应 - Vercel AI SDK 格式
        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder()
            const id = `stream-${Date.now()}`

            // Vercel AI SDK 期待的正确格式 - 流式文本响应
            // 开始发送流
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ id, type: "text-start" })}\n\n`,
              ),
            )

            // 流式输出文本片段
            for (const chunk of chunks) {
              await new Promise(resolve => setTimeout(resolve, 580))

              // 发送文本增量
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ id, type: "text-delta", delta: chunk + " " })}\n\n`,
                ),
              )
              index++
            }

            // 结束流
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ id, type: "text-end" })}\n\n`,
              ),
            )

            // 发送完成标记
            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
          },
        })

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        })
      },
    },
  },
})
