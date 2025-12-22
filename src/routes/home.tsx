/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/home")({
  component: YouTubeArticleGenerator,
})

// function RouteComponent() {
// 	return <div>Hello "/home"!</div>;
// }

import { useCompletion } from "@ai-sdk/react"
import {
  AlertCircle,
  ChevronRight,
  Copy,
  Download,
  FileText,
  Link,
  Loader2,
  Moon,
  Sparkles,
  Sun,
  ThumbsDown,
  ThumbsUp,
  Video,
  X,
} from "lucide-react"
import { useRef, useState } from "react"

export default function YouTubeArticleGenerator() {
  const [activeTab, setActiveTab] = useState<"url" | "transcript">("url")
  const [youtubeUrl, setYoutubeUrl] = useState(
    "https://www.youtube.com/watch?v=4KdvcQKNfbQ",
  )
  const [transcriptText, setTranscriptText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [generatedArticles, setGeneratedArticles] = useState<
    Array<{
      id: string
      title: string
      content: string
      videoUrl?: string
      timestamp: string
    }>
  >([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const transcriptRef = useRef<HTMLTextAreaElement>(null)

  const { completion, complete, input, handleSubmit, isLoading, error, stop } =
    useCompletion({
      api: "/api/generate",
      onFinish: (prompt, completion) => {
        setIsProcessing(false)
        const newArticle = {
          id: Date.now().toString(),
          title:
            extractTitle(completion) ||
            `生成文章 ${new Date().toLocaleTimeString()}`,
          content: completion,
          videoUrl: youtubeUrl || undefined,
          timestamp: new Date().toISOString(),
        }
        setGeneratedArticles(prev => [newArticle, ...prev])
      },
      onError: error => {
        setIsProcessing(false)
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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (activeTab === "url" && !youtubeUrl.trim()) {
      alert("请输入 YouTube 链接")
      return
    }

    if (activeTab === "transcript" && !transcriptText.trim()) {
      alert("请输入视频文稿")
      return
    }

    setIsProcessing(true)

    const prompt =
      activeTab === "url"
        ? `请基于此 YouTube 视频生成文章：${youtubeUrl}`
        : `请基于以下视频文稿生成文章：\n\n${transcriptText}`

    // 使用 complete 方法手动触发，传递额外参数
    await complete(prompt, {
      body: {
        prompt,
        mode: activeTab,
        ...(youtubeUrl && { youtubeUrl }),
        ...(transcriptText && { transcript: transcriptText }),
      },
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = e => {
        setTranscriptText(e.target?.result as string)
      }
      reader.readAsText(file)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // 可以添加 toast 提示
  }

  const exportArticle = (article: any) => {
    const blob = new Blob([article.content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${article.title.replace(/\s+/g, "_")}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setYoutubeUrl("")
    setTranscriptText("")
    setGeneratedArticles([])
  }

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
                  YouTube AI 文章生成器
                </h1>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  输入视频链接或文稿，AI 为您创作精彩文章
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
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={clearAll}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <X className="w-4 h-4" />
                <span>清空所有</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧输入区域 */}
            <div className="lg:col-span-1 space-y-6">
              <div
                className={`rounded-2xl p-6 shadow-xl border ${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                  输入视频内容
                </h2>

                {/* 标签切换 */}
                <div className="flex space-x-2 mb-6">
                  <button
                    onClick={() => setActiveTab("url")}
                    className={`flex-1 py-3 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                      activeTab === "url"
                        ? darkMode
                          ? "bg-red-900/30 text-red-300 border border-red-700"
                          : "bg-red-50 text-red-600 border border-red-200"
                        : darkMode
                          ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Link className="w-4 h-4" />
                    <span>视频链接</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("transcript")}
                    className={`flex-1 py-3 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                      activeTab === "transcript"
                        ? darkMode
                          ? "bg-blue-900/30 text-blue-300 border border-blue-700"
                          : "bg-blue-50 text-blue-600 border border-blue-200"
                        : darkMode
                          ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>视频文稿</span>
                  </button>
                </div>

                {/* URL 输入 */}
                {activeTab === "url" && (
                  <div className="space-y-4">
                    <div>
                      {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                      <label className="block text-sm font-medium mb-2">
                        粘贴 YouTube 视频链接
                      </label>
                      <div className="relative">
                        <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="url"
                          value={youtubeUrl}
                          onChange={e => setYoutubeUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                            darkMode
                              ? "bg-gray-900 border-gray-700 text-white"
                              : "bg-gray-50 border-gray-300 text-gray-900"
                          }`}
                        />
                      </div>
                      <p
                        className={`text-xs mt-2 ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        支持 YouTube 视频链接或短链接
                      </p>
                    </div>

                    {/* 示例链接 */}
                    <div
                      className={`rounded-xl p-4 ${
                        darkMode ? "bg-gray-900/50" : "bg-gray-50"
                      }`}
                    >
                      <h4 className="text-sm font-medium mb-2">示例链接：</h4>
                      <button
                        onClick={() =>
                          setYoutubeUrl(
                            "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                          )
                        }
                        className={`text-sm text-left w-full p-2 rounded transition-all ${
                          darkMode
                            ? "hover:bg-gray-800 text-blue-400"
                            : "hover:bg-gray-100 text-blue-600"
                        }`}
                      >
                        https://www.youtube.com/watch?v=dQw4w9WgXcQ
                      </button>
                    </div>
                  </div>
                )}

                {/* 文稿输入 */}
                {activeTab === "transcript" && (
                  <div className="space-y-4">
                    <div>
                      {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                      <label className="block text-sm font-medium mb-2">
                        输入或粘贴视频文稿
                      </label>
                      <textarea
                        ref={transcriptRef}
                        value={transcriptText}
                        onChange={e => setTranscriptText(e.target.value)}
                        placeholder="在这里粘贴您的视频文稿内容..."
                        rows={10}
                        className={`w-full p-4 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                          darkMode
                            ? "bg-gray-900 border-gray-700 text-white"
                            : "bg-gray-50 border-gray-300 text-gray-900"
                        }`}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex-1 py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                          darkMode
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        <span>上传文稿文件</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.md,.srt,.vtt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      <button
                        onClick={() => {
                          navigator.clipboard.readText().then(text => {
                            setTranscriptText(text)
                          })
                        }}
                        className={`flex-1 py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                          darkMode
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        <Copy className="w-4 h-4" />
                        <span>从剪贴板粘贴</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 生成按钮 */}
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || isProcessing}
                  className={`w-full mt-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 text-lg font-semibold ${
                    isLoading || isProcessing
                      ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  }`}
                >
                  {isLoading || isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>AI 正在创作中...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      <span>✨ AI 生成文章</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              {/* 历史记录 */}
              {generatedArticles.length > 0 && (
                <div
                  className={`rounded-2xl p-6 shadow-xl border ${
                    darkMode
                      ? "bg-gray-800/50 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <h3 className="text-lg font-semibold mb-4">生成历史</h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {generatedArticles.map(article => (
                      // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                      // biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
                      <div
                        key={article.id}
                        className={`p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${
                          darkMode
                            ? "bg-gray-900 hover:bg-gray-800"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                        onClick={() => {
                          // 可以实现在右侧显示文章详情
                        }}
                      >
                        <h4 className="font-medium truncate">
                          {article.title}
                        </h4>
                        <p
                          className={`text-sm mt-1 truncate ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {new Date(article.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 右侧生成区域 */}
            <div className="lg:col-span-2">
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
                    AI 生成的文章
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

                      {/* 进度指示器 */}
                      <div className="mt-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span
                            className={`${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            生成进度
                          </span>
                          <span
                            className={`font-medium ${
                              darkMode ? "text-yellow-400" : "text-yellow-600"
                            }`}
                          >
                            {Math.round(
                              ((completion?.length || 0) / 500) * 100,
                            )}
                            %
                          </span>
                        </div>
                        <div
                          className={`h-2 rounded-full overflow-hidden ${
                            darkMode ? "bg-gray-700" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
                            style={{
                              width: `${Math.min(((completion?.length || 0) / 500) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ) : completion || generatedArticles.length > 0 ? (
                    <div>
                      <div className="prose dark:prose-invert max-w-none">
                        {completion ? (
                          <pre
                            className={`whitespace-pre-wrap font-sans ${
                              darkMode ? "text-gray-100" : "text-gray-900"
                            }`}
                          >
                            {completion}
                          </pre>
                        ) : (
                          <div>
                            <h1 className="text-3xl font-bold mb-6">
                              {generatedArticles[0]?.title}
                            </h1>
                            <div
                              className={`whitespace-pre-wrap leading-relaxed ${
                                darkMode ? "text-gray-200" : "text-gray-800"
                              }`}
                            >
                              {generatedArticles[0]?.content}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 文章操作按钮 */}
                      <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() =>
                            copyToClipboard(
                              completion || generatedArticles[0]?.content || "",
                            )
                          }
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                            darkMode
                              ? "bg-gray-800 hover:bg-gray-700"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          <Copy className="w-4 h-4" />
                          <span>复制文章</span>
                        </button>

                        <button
                          onClick={() => exportArticle(generatedArticles[0])}
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
                              darkMode
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-200"
                            }`}
                            title="点赞"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button
                            className={`p-2 rounded-lg transition-all ${
                              darkMode
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-200"
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
                      <h3 className="text-xl font-semibold mb-2">
                        等待生成文章
                      </h3>
                      <p
                        className={`max-w-md ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        输入 YouTube 视频链接或粘贴视频文稿， 点击"AI
                        生成文章"按钮开始创作
                      </p>
                      <div
                        className={`mt-8 p-4 rounded-xl ${
                          darkMode ? "bg-gray-800" : "bg-gray-100"
                        }`}
                      >
                        <p className="text-sm">
                          💡 提示：AI 将根据视频内容生成包含：
                          <br />• 视频摘要 • 关键观点 • 深入分析 • 个人见解
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 底部信息 */}
      <footer
        className={`mt-12 py-6 border-t ${
          darkMode ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div className="container mx-auto px-4 text-center">
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            使用 AI 技术将 YouTube 视频转化为精彩文章 •
            支持流式生成和多种导出格式
          </p>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <span className="text-xs opacity-70">
              Powered by Next.js • Vercel AI SDK
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
