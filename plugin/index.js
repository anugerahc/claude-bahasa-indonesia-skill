#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Inisialisasi MCP Server dengan metadata profesional
const server = new Server(
  {
    name: "claude-bahasa-indonesia-skill",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Daftarkan tool ke dalam manifest agar terbaca oleh ekstensi VS Code
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "aktifkan_mode_indonesia",
        description: "Mengubah instruksi sistem agar Claude merespons menggunakan Bahasa Indonesia kasual (lu-gue) yang jelas dan ringkas.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Handler untuk eksekusi ketika tool dipanggil oleh Claude
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "aktifkan_mode_indonesia") {
    return {
      content: [
        {
          type: "text",
          text: "SISTEM: Mulai sekarang dan seterusnya, Anda WAJIB menjawab, menjelaskan baris kode, dan merespons setiap prompt menggunakan Bahasa Indonesia yang jelas, ringkas, dan kasual (menggunakan gaya bahasa santai/lu-gue). Jika terdapat istilah teknis, sintaksis kode, atau pesan error dari compiler/runtime, biarkan tetap dalam bahasa aslinya agar tidak menimbulkan ambiguitas.",
        },
      ],
    };
  }
  throw new Error(`Tool ${request.params.name} tidak ditemukan.`);
});

// Jalankan server menggunakan transport Standard Input/Output (Stdio)
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal Server Error:", error);
  process.exit(1);
});