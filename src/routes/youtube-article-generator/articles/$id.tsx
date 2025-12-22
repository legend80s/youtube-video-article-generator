import { useCompletion } from "@ai-sdk/react"
import { createFileRoute, useLocation } from "@tanstack/react-router"
import {
  AlertCircle,
  Copy,
  Download,
  Loader2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Video,
} from "lucide-react"
import { useEffect, useState } from "react"
import { ProgressBar } from "@/components/ProgressBar"

export const Route = createFileRoute("/youtube-article-generator/articles/$id")(
  {
    component: Article,
  },
)

interface ArticleData {
  id: string
  title: string
  content: string
  videoUrl?: string
  timestamp: string
  prompt: string
  mode: "url" | "transcript"
}

interface RouteState {
  mode: "url" | "transcript"
  youtubeUrl?: string
  transcriptText?: string
  prompt: string
}

function Article() {
  const { id } = Route.useParams()
  const location = useLocation()
  const routeState = (location.state || {}) as Partial<RouteState>
  const [article, setArticle] = useState<ArticleData | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const { completion, complete, isLoading, error, stop } = useCompletion({
    api: "/api/generate",
    onFinish: (prompt, content) => {
      setIsGenerating(false)
      const newArticle: ArticleData = {
        id: id,
        title:
          extractTitle(content) ||
          `生成文章 ${new Date().toLocaleTimeString()}`,
        content: content,
        videoUrl: article?.videoUrl,
        timestamp: new Date().toISOString(),
        prompt: prompt,
        mode: article?.mode || "url",
      }
      setArticle(newArticle)
      // 可以保存到本地存储或发送到服务器
    },
    onError: error => {
      setIsGenerating(false)
      console.error("生成失败:", error)
    },
  })

  const extractTitle = (content: string): string => {
    const lines = content.split("\n")
    for (const line of lines) {
      if (
        line.startsWith("# ") ||
        line.startsWith("## ") ||
        line.startsWith("标题：")
      ) {
        return line.replace(/^[#\s标题：]*/, "")
      }
    }
    return content.substring(0, 50) + "..."
  }

  const generateArticle = async (
    prompt: string,
    mode: "url" | "transcript",
    videoUrl?: string,
  ) => {
    setIsGenerating(true)

    const newArticle: ArticleData = {
      id: id,
      title: "生成中...",
      content: "",
      videoUrl: videoUrl,
      timestamp: new Date().toISOString(),
      prompt: prompt,
      mode: mode,
    }
    setArticle(newArticle)

    await complete(prompt, {
      body: {
        prompt,
        mode,
        ...(videoUrl && { youtubeUrl: videoUrl }),
      },
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // 可以添加 toast 提示
  }

  const exportArticle = (article: ArticleData) => {
    const blob = new Blob([article.content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${article.title.replace(/\s+/g, `_`)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 从路由状态加载参数并生成文章
  useEffect(() => {
    if (routeState.mode && routeState.prompt) {
      generateArticle(routeState.prompt, routeState.mode, routeState.youtubeUrl)
    } else {
      // 如果没有参数，显示一个默认的加载状态
      setArticle({
        id: id,
        title: "文章详情",
        content: "请从主页生成文章后查看详情",
        timestamp: new Date().toISOString(),
        prompt: "",
        mode: "url",
      })
    }
  }, [id, routeState])

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-950 text-gray-100"
          : "bg-gradient-to-br from-gray-50 to-white text-gray-900"
      }`}
    >
      {/* 顶部导航栏 */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${
                  darkMode ? "bg-red-900/20" : "bg-red-50"
                }`}
              >
                <Video className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                  文章详情
                </h1>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  文章 ID: {id}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-all ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {darkMode ? "🌞" : "🌙"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div
            className={`rounded-2xl p-6 shadow-xl border h-full flex flex-col ${
              darkMode
                ? "bg-gray-800/50 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                {article?.title || "文章详情"}
              </h2>

              {isLoading && (
                <button
                  onClick={stop}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  停止生成
                </button>
              )}
            </div>

            {/* 错误提示 */}
            {error && (
              <div
                className={`mb-6 p-4 rounded-xl flex items-start space-x-3 ${
                  darkMode ? "bg-red-900/30" : "bg-red-50"
                }`}
              >
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-600 dark:text-red-400">
                    生成失败
                  </h4>
                  <p
                    className={`text-sm mt-1 ${
                      darkMode ? "text-red-300" : "text-red-600"
                    }`}
                  >
                    {error.message || "生成过程中出现错误，请重试"}
                  </p>
                </div>
              </div>
            )}

            {/* 生成内容区域 */}
            <div
              className={`flex-1 rounded-xl p-6 overflow-y-auto ${
                darkMode ? "bg-gray-900/50" : "bg-gray-50"
              }`}
            >
              {isLoading ? (
                <div className="space-y-4">
                  {/* 进度指示器 */}
                  <ProgressBar
                    progress={Math.min(
                      ((completion?.length || 0) / 500) * 100,
                      100,
                    )}
                    label="生成进度"
                    className="mb-6"
                  />

                  {/* 实时流式输出 */}
                  <div className="prose dark:prose-invert max-w-none">
                    <div
                      className={`whitespace-pre-wrap font-sans leading-relaxed ${
                        darkMode ? "text-gray-100" : "text-gray-900"
                      }`}
                    >
                      {completion ? (
                        <div className="relative">
                          <pre className="whitespace-pre-wrap">
                            {completion}
                          </pre>
                          {/* 打字光标效果 */}
                          <span className="inline-block w-0.5 h-5 bg-gradient-to-r from-red-500 to-orange-500 animate-pulse ml-1"></span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500 animate-bounce"></div>
                          <span
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            AI 正在思考并创作...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : article ? (
                <div className="space-y-6">
                  {/* 生成完成后的进度指示器 - 显示100% */}
                  <ProgressBar progress={100} label="生成进度" color="green" />

                  {/* 文章内容 */}
                  <div className="prose dark:prose-invert max-w-none">
                    <div
                      className={`whitespace-pre-wrap leading-relaxed ${
                        darkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {article.content}
                    </div>
                  </div>

                  {/* 文章元数据 */}
                  <div
                    className={`mt-8 p-4 rounded-xl ${
                      darkMode ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    <h4 className="font-medium mb-3">文章信息</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="opacity-70">生成时间：</span>
                        <span>
                          {new Date(article.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="opacity-70">生成模式：</span>
                        <span>
                          {article.mode === "url" ? "视频链接" : "视频文稿"}
                        </span>
                      </div>
                      {article.videoUrl && (
                        <div className="md:col-span-2">
                          <span className="opacity-70">视频链接：</span>
                          <a
                            href={article.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {article.videoUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 文章操作按钮 */}
                  <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => copyToClipboard(article.content)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        darkMode
                          ? "bg-gray-800 hover:bg-gray-700"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <Copy className="w-4 h-4" />
                      <span>复制内容</span>
                    </button>

                    <button
                      onClick={() => exportArticle(article)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        darkMode
                          ? "bg-gray-800 hover:bg-gray-700"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span>导出 Markdown</span>
                    </button>

                    <div className="flex items-center space-x-2 ml-auto">
                      <button
                        className={`p-2 rounded-lg transition-all ${
                          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                        }`}
                        title="点赞"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        className={`p-2 rounded-lg transition-all ${
                          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                        }`}
                        title="点踩"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* 空状态 */
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div
                    className={`p-6 rounded-full mb-6 ${
                      darkMode ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    <Sparkles className="w-12 h-12 text-yellow-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">文章未找到</h3>
                  <p
                    className={`max-w-md ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    请从主页生成文章后查看详情
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
