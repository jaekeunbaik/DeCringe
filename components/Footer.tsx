import React from "react";
import { Coffee, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full mt-20 border-t border-border bg-card/60 py-12 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-6">
        {/* Ko-fi / Coffee Callout Box */}
        <div className="w-full max-w-2xl bg-zinc-950/90 border-2 border-accent-yellow/50 p-6 rounded-lg shadow-brutal-black relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 font-mono text-xs text-accent-yellow font-extrabold uppercase tracking-wider">
                <Coffee className="w-4 h-4 text-accent-yellow" />
                <span>Support Independent Dev Tools</span>
              </div>
              <p className="text-sm sm:text-base text-zinc-200 font-sans italic">
                "I built this for free to save my eyes from cringe. If it saved you from embarrassing yourself, buying me a coffee means the world!"
              </p>
            </div>

            {/* Direct Link Button to Ko-fi */}
            <div className="shrink-0 flex flex-col items-center">
              <a
                href="https://ko-fi.com/ethan0117"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-md bg-accent-yellow text-black font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 border-2 border-black hover:bg-[#FFF066] shadow-brutal-black transition-transform active:scale-95"
              >
                <Coffee className="w-4 h-4 fill-black" />
                <span>Buy Me a Coffee</span>
              </a>
            </div>
          </div>
        </div>

        {/* Dethan AI Cross Promotion Card */}
        <div className="w-full max-w-2xl bg-indigo-950/60 border-2 border-indigo-500/40 p-5 rounded-lg shadow-brutal-black relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 font-mono text-xs text-indigo-300 font-extrabold uppercase tracking-wider">
                <span>📝 AI Resume & Cover Letter Architect</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-200 font-sans">
                취업 준비중이신가요? 대기업 채용담당자 관점 팩폭 첨삭 & 실전 면접 질문까지! <strong>Dethan (디든) AI</strong>를 경험해 보세요.
              </p>
            </div>

            <div className="shrink-0">
              <a
                href="https://draft-ethan.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-md bg-indigo-600 text-white font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-indigo-400 hover:bg-indigo-500 shadow-sm transition-transform active:scale-95"
              >
                <span>Dethan AI 바로가기 🚀</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Credit & Copy */}
        <div className="text-xs font-mono text-zinc-500 space-y-2">
          <p className="flex items-center justify-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-accent-pink fill-accent-pink" /> by Indie Hackers for Indie Hackers.
          </p>
          <p>
            Antidote for Flex • Stateless & Privacy First • Vercel Ready
          </p>
        </div>
      </div>
    </footer>
  );
}
