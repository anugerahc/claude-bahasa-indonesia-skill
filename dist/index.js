#!/usr/bin/env node

// Standar input/output handler untuk protokol MCP (JSON-RPC)
process.stdin.on('data', (data) => {
  try {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      const request = JSON.parse(line);
      
      // Handler saat Claude meminta daftar tools (ListTools)
      if (request.method === 'tools/list') {
        respond(request.id, {
          tools: [
            {
              name: "aktifkan_mode_indonesia",
              description: "Mengubah instruksi sistem agar Claude merespons menggunakan Bahasa Indonesia kasual (lu-gue) yang jelas dan ringkas.",
              inputSchema: { type: "object", properties: {} }
            }
          ]
        });
      } 
      // Handler saat Claude mengeksekusi tool (CallTool)
      else if (request.method === 'tools/call') {
        if (request.params.name === 'aktifkan_mode_indonesia') {
          respond(request.id, {
            content: [
              {
                type: "text",
                text: "SISTEM: Mulai sekarang dan seterusnya, Anda WAJIB menjawab, menjelaskan baris kode, dan merespons setiap prompt menggunakan Bahasa Indonesia yang jelas, ringkas, dan kasual (menggunakan gaya bahasa santai/lu-gue). Jika terdapat istilah teknis, sintaksis kode, atau pesan error dari compiler/runtime, biarkan tetap dalam bahasa aslinya agar tidak menimbulkan ambiguitas."
              }
            ]
          });
        } else {
          respondError(request.id, -32601, `Tool ${request.params.name} tidak ditemukan.`);
        }
      } 
      // Respon standar untuk inisialisasi protokol
      else if (request.method === 'initialize') {
        respond(request.id, {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "claude-bahasa-indonesia-skill", version: "1.0.0" }
        });
      } else {
        // Abaikan notifikasi atau request lain agar tidak crash
        if (request.id) respond(request.id, {});
      }
    }
  } catch (err) {
    // Jalur aman jika terjadi error parsing
    console.error("Error handling MCP request:", err);
  }
});

function respond(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + '\n');
}

function respondError(id, code, message) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }) + '\n');
}