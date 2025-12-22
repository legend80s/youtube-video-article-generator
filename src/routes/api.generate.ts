import { createFileRoute } from "@tanstack/react-router"

type IGenerateRequestBody = {
  prompt: "请基于此 YouTube 视频生成文章：https://www.youtube.com/watch?v=4KdvcQKNfbQ"
  mode: "url"
  youtubeUrl: "https://www.youtube.com/watch?v=4KdvcQKNfbQ"
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

        // 创建流式响应
        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder()

            // 发送初始消息
            controller.enqueue(
              encoder.encode('data: {"content": "", "status": "start"}\n\n'),
            )

            // 模拟流式输出
            for (const chunk of chunks) {
              await new Promise(resolve => setTimeout(resolve, 50))

              const data = {
                content: chunk + " ",
                progress: Math.round((index / chunks.length) * 100),
                status: index === chunks.length - 1 ? "done" : "processing",
              }

              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
              )
              index++
            }

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
