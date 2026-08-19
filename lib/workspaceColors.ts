import type { CustomWorkspace } from "@/lib/storage";

export const WORKSPACE_COLORS=["#2DD4BF","#F59E0B","#60A5FA","#A78BFA","#F472B6","#FB7185","#34D399","#F97316"] as const;
export function fallbackWorkspaceColor(id:string){
  let hash=0;
  for(let i=0;i<id.length;i++) hash=(hash*31+id.charCodeAt(i))>>>0;
  return WORKSPACE_COLORS[hash%WORKSPACE_COLORS.length];
}

export function workspaceColor(workspace:CustomWorkspace){
  const color=workspace.color;
  return color&&/^#[0-9a-f]{6}$/i.test(color)?color:fallbackWorkspaceColor(workspace.id);
}

export function withWorkspaceColor(workspace:CustomWorkspace,color:string):CustomWorkspace{
  return {...workspace,color:/^#[0-9a-f]{6}$/i.test(color)?color:workspaceColor(workspace)};
}
