/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  Copy,
  FileText,
  Link as LinkIcon,
  Moon,
  Sparkles,
  Sun,
  Video,
  X,
} from "lucide-react"
import { useRef, useState } from "react"

interface RouteState {
  mode: "url" | "transcript"
  youtubeUrl?: string
  transcript?: string
  prompt: string
}

export const Route = createFileRoute("/youtube-article-generator/")({
  component: YouTubeArticleGenerator,
})

export default function YouTubeArticleGenerator() {
  const [activeTab, setActiveTab] = useState<"url" | "transcript">("url")
  const [youtubeUrl, setYoutubeUrl] = useState(
    "https://www.youtube.com/watch?v=4KdvcQKNfbQx",
  )
  const [transcript, setTranscriptText] = useState("")
  const [darkMode, setDarkMode] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const transcriptRef = useRef<HTMLTextAreaElement>(null)

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

  const clearAll = () => {
    setYoutubeUrl("")
    setTranscriptText("")
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
        <div className="max-w-4xl mx-auto">
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
                <LinkIcon className="w-4 h-4" />
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
                    value={transcript}
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

            {/* 生成按钮 - 使用 Link 组件跳转 */}
            <Link
              to="/youtube-article-generator/articles/$id"
              params={{ id: Date.now().toString() }}
              state={{
                mode: activeTab,
                youtubeUrl: activeTab === "url" ? youtubeUrl : undefined,
                transcriptText:
                  activeTab === "transcript"
                    ? transcript
                    : "00:00:02 This is the most important property of\n00:00:05 exclusive or operation also known as\n00:00:08 zor. If you apply the same value twice,\n00:00:12 you get the original value. And to\n00:00:15 demonstrate that this is actually true,\n00:00:16 we can bust out Python and take all of\n00:00:19 the possible combinations of two beats.\n00:00:21 So let take a in a range from 0 to 1\n00:00:24 and b in a range from 0 to 1.",
                prompt:
                  activeTab === "url"
                    ? `请基于此 YouTube 视频生成文章：${youtubeUrl}`
                    : `请基于以下视频文稿生成文章：\n\n${transcript}`,
              }}
              className="w-full text-gray-100 mt-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 text-xl font-semibold bg-gradient-to-r from-red-600 to-orange-500 cursor-pointer hover:from-red-700 hover:to-orange-600 shadow-lg hover:shadow-xl"
              onClick={e => {
                if (activeTab === "url" && !youtubeUrl.trim()) {
                  e.preventDefault()
                  alert("请输入 YouTube 链接")
                  return
                }
                if (activeTab === "transcript" && !transcript.trim()) {
                  e.preventDefault()
                  alert("请输入视频文稿")
                  return
                }
              }}
            >
              <span>✨</span>
              <span>AI 生成文章</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
