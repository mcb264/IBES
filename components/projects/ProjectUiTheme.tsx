"use client";

/**
 * Visual theme for the project workspace.
 *
 * Important: this component contains presentation-only rules. Project/task
 * behaviour must stay in ProjectsPanelV2 and its future child components.
 * Keeping the theme isolated prevents the wrapper from becoming a mix of
 * business logic and DOM-dependent patches again.
 */
export default function ProjectUiTheme() {
  return (
    <style jsx global>{`
      .workspace-mode-locked > .space-y-8 > .rounded-2xl > .grid + .grid {
        display: none;
      }

      .workspace-mode-locked > .space-y-8 > .rounded-2xl > div:first-child > p.mt-1 {
        display: none;
      }

      .workspace-mode-standard [class*="Mode Sport"] {
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

      .workspace-mode-locked article .space-y-2 > div[draggable] {
        min-height: 64px;
        padding: 14px !important;
        border-color: rgba(255, 255, 255, 0.075) !important;
        background: rgba(5, 8, 11, 0.32) !important;
        border-radius: 13px !important;
        transition: border-color 140ms ease, background 140ms ease;
      }

      .workspace-mode-locked article .space-y-2 > div[draggable]:hover {
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

      /* Menus are deliberately opaque. */
      .workspace-mode-locked div.absolute.right-0 {
        background: #0c1116 !important;
        background-image: linear-gradient(180deg, #10161c 0%, #0b0f13 100%) !important;
        border: 1px solid rgba(255, 255, 255, 0.16) !important;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.72), 0 0 0 1px rgba(0, 0, 0, 0.35) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        opacity: 1 !important;
        border-radius: 14px !important;
        padding: 7px !important;
        isolation: isolate;
      }

      .workspace-mode-locked div.absolute.right-0 button {
        border-radius: 8px;
        transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
      }

      .workspace-mode-locked div.absolute.right-0 button:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.075) !important;
      }

      .workspace-mode-locked div.absolute.right-0 .border-t {
        border-color: rgba(255, 255, 255, 0.09) !important;
        margin-top: 7px !important;
        margin-bottom: 7px !important;
      }

      .workspace-mode-locked .absolute.right-0.top-7.z-30.w-56 {
        width: 250px !important;
        max-height: min(72vh, 450px);
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.16) transparent;
      }

      /* Temporary recurrence layout until TaskMenu is extracted in phase 2. */
      .workspace-mode-locked .absolute.right-0.top-7.z-30.w-56 > button:nth-child(n + 8):nth-child(-n + 14) {
        display: inline-flex;
        width: calc(33.333% - 6px);
        min-height: 34px;
        margin: 3px;
        padding: 6px 3px;
        align-items: center;
        justify-content: center;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.13);
        border-radius: 8px;
        background: #10161b !important;
        font-size: 10px;
      }

      .workspace-mode-locked .absolute.right-0.top-7.z-30.w-56 > button:nth-child(15) {
        display: block;
        width: 100%;
        margin-top: 5px;
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
        .workspace-mode-locked .absolute.right-0.top-7.z-30.w-56 {
          width: min(250px, 82vw) !important;
        }
      }
    `}</style>
  );
}
