"use client";

/** Presentation-only theme for project workspaces. */
export default function ProjectUiTheme() {
  return (
    <style jsx global>{`
      .workspace-mode-locked > .space-y-8 > .rounded-2xl > .grid + .grid {
        display: none;
      }

      .workspace-mode-locked > .space-y-8 > .rounded-2xl > div:first-child > p.mt-1 {
        display: none;
      }

      .workspace-mode-locked article {
        background: linear-gradient(180deg, #12161a 0%, #101418 100%) !important;
        border-color: rgba(255, 255, 255, 0.09) !important;
        border-radius: 18px !important;
        box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22) !important;
      }

      .workspace-mode-locked article > div:first-child {
        padding-top: 24px !important;
        padding-bottom: 20px !important;
      }

      .workspace-mode-locked article > div:last-child {
        background: rgba(255, 255, 255, 0.008) !important;
        border-top-color: rgba(255, 255, 255, 0.075) !important;
        padding-top: 22px !important;
        padding-bottom: 22px !important;
      }

      .workspace-mode-locked .task-row {
        min-height: 64px;
        padding: 14px !important;
        border-color: rgba(255, 255, 255, 0.075) !important;
        background: rgba(5, 8, 11, 0.32) !important;
        border-radius: 13px !important;
        transition: border-color 140ms ease, background 140ms ease;
      }

      .workspace-mode-locked .task-row:hover {
        border-color: rgba(255, 255, 255, 0.13) !important;
        background: rgba(10, 14, 18, 0.58) !important;
      }

      .workspace-mode-locked article span.rounded-full,
      .workspace-mode-locked article button.rounded-full {
        background: rgba(4, 7, 10, 0.34) !important;
        border-color: rgba(255, 255, 255, 0.11) !important;
        letter-spacing: 0.04em;
      }

      .workspace-mode-locked button:not(:disabled):hover {
        background-color: rgba(255, 255, 255, 0.055);
      }

      .workspace-mode-locked .task-menu,
      .workspace-mode-locked .subproject-menu {
        background: #0c1116 !important;
        border-color: rgba(255, 255, 255, 0.16) !important;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.72), 0 0 0 1px rgba(0, 0, 0, 0.35) !important;
        opacity: 1 !important;
        isolation: isolate;
      }

      .workspace-mode-locked > .space-y-8 > .rounded-2xl {
        background: #11161a !important;
        border-color: rgba(255, 255, 255, 0.09) !important;
        box-shadow: 0 20px 48px rgba(0, 0, 0, 0.22);
      }

      .workspace-mode-locked input,
      .workspace-mode-locked textarea {
        background-color: #0d1216 !important;
        border-color: rgba(255, 255, 255, 0.11) !important;
      }

      @media (max-width: 760px) {
        .workspace-mode-locked .task-menu {
          width: min(250px, 82vw) !important;
        }
        .workspace-mode-locked .task-row {
          padding: 12px 10px !important;
        }
      }
    `}</style>
  );
}
