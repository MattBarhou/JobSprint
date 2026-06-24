"use client";

import { useEffect, useState } from "react";

const OUTPUT_SECTIONS = [
  {
    key: "coverLetter250",
    label: "Cover letter",
    detail: "250 words",
    description: "Short form for application portals",
  },
  {
    key: "coverLetter400",
    label: "Cover letter",
    detail: "400 words",
    description: "Extended version with more context",
  },
  {
    key: "recruiterEmail",
    label: "Recruiter email",
    detail: "Email",
    description: "Direct outreach to hiring teams",
  },
  {
    key: "linkedinMessage",
    label: "LinkedIn message",
    detail: "Message",
    description: "Connection request or follow-up",
  },
  {
    key: "atsVersion",
    label: "ATS version",
    detail: "Plain text",
    description: "Keyword-optimized for tracking systems",
  },
];

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function GeneratedOutputs({ outputs }) {
  const [activeTab, setActiveTab] = useState(OUTPUT_SECTIONS[0].key);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    setActiveTab(OUTPUT_SECTIONS[0].key);
    setCopiedKey(null);
  }, [outputs]);

  const activeSection = OUTPUT_SECTIONS.find((s) => s.key === activeTab);
  const activeText = outputs[activeTab];
  const wordCount = countWords(activeText);
  const charCount = activeText.length;

  async function handleCopy(key, text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setCopiedKey(null);
    }
  }

  return (
    <div id="results" className="mt-14">
      <div className="border border-base-300 rounded-2xl bg-base-100 overflow-hidden">
        {/* Panel header */}
        <div className="px-5 sm:px-6 py-4 border-b border-base-300 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-base-content/40 mb-0.5">
              Generated output
            </p>
            <h3 className="text-base font-semibold text-base-content">
              Application materials
            </h3>
          </div>
          <span className="text-xs text-base-content/40 tabular-nums shrink-0">
            5 documents
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:min-h-[28rem]">
          {/* Document list */}
          <nav
            aria-label="Output documents"
            className="lg:w-60 shrink-0 border-b lg:border-b-0 lg:border-r border-base-300 bg-base-200/40"
          >
            <ul className="flex lg:flex-col gap-0.5 p-2 overflow-x-auto lg:overflow-visible">
              {OUTPUT_SECTIONS.map((section) => {
                const isActive = activeTab === section.key;
                return (
                  <li key={section.key} className="shrink-0 lg:shrink">
                    <button
                      type="button"
                      onClick={() => setActiveTab(section.key)}
                      aria-current={isActive ? "true" : undefined}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-150 lg:min-w-0 ${
                        isActive
                          ? "bg-base-100 text-base-content shadow-sm ring-1 ring-base-300/80"
                          : "text-base-content/55 hover:text-base-content hover:bg-base-100/60"
                      }`}
                    >
                      <span className="flex items-baseline justify-between gap-2">
                        <span
                          className={`text-sm leading-tight ${isActive ? "font-medium" : ""}`}
                        >
                          {section.label}
                        </span>
                        <span className="text-[11px] text-base-content/35 tabular-nums shrink-0">
                          {section.detail}
                        </span>
                      </span>
                      <span className="hidden lg:block text-xs text-base-content/40 mt-0.5 leading-snug">
                        {section.description}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Document viewer */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-5 sm:px-6 py-3.5 border-b border-base-300 flex items-center justify-between gap-4 bg-base-100">
              <div className="min-w-0">
                <h4 className="text-sm font-medium text-base-content truncate">
                  {activeSection.label}
                </h4>
                <p className="text-xs text-base-content/40 mt-0.5">
                  {activeSection.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(activeTab, activeText)}
                className={`btn btn-ghost btn-sm h-8 min-h-8 px-3 font-normal shrink-0 ${
                  copiedKey === activeTab ? "text-success" : "text-base-content/70"
                }`}
              >
                {copiedKey === activeTab ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="flex-1 px-5 sm:px-8 py-6 sm:py-8 overflow-y-auto max-h-[32rem] lg:max-h-none">
              <div className="max-w-prose">
                <p className="whitespace-pre-wrap text-[15px] leading-[1.75] text-base-content/85">
                  {activeText}
                </p>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-2.5 border-t border-base-300 flex items-center justify-between text-[11px] text-base-content/35 tabular-nums">
              <span>
                {activeTab === "linkedinMessage"
                  ? `${charCount} characters`
                  : `${wordCount} words`}
              </span>
              <span>{activeSection.detail}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
