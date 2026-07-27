// types/webmcp.d.ts
// WebMCP type declarations for Next.js JSX and document.modelContext API
// Official spec: https://github.com/webmachinelearning/webmcp

declare namespace React {
  interface HTMLAttributes<T> {
    toolname?: string;
    tooldescription?: string;
    toolparamdescription?: string;
    toolautosubmit?: boolean;
  }
}

interface WebMCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  execute: (params: Record<string, any>) => Promise<any> | any;
}

interface WebMCPToolOptions {
  signal?: AbortSignal;
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
}

interface ModelContext {
  registerTool(tool: WebMCPTool, options?: WebMCPToolOptions): void;
  unregisterTool?(name: string): void;
}

interface Document {
  modelContext?: ModelContext;
}

