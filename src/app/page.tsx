import { ChatContainer } from '@/components/chat/ChatContainer'
import { PreviewPanel } from '@/components/preview/PreviewPanel'

export default function Home() {
  return (
    <main className="h-screen flex flex-col lg:flex-row">
      <div className="flex-1 lg:w-[60%] lg:flex-none border-b lg:border-b-0 lg:border-r h-[60vh] lg:h-full">
        <ChatContainer />
      </div>
      <div className="lg:w-[40%] lg:flex-none h-[40vh] lg:h-full">
        <PreviewPanel />
      </div>
    </main>
  )
}
