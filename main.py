import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

SYSTEM_PROMPT = "You are a helpful, concise assistant."
SESSIONS: dict[str, list[dict]] = {}

class ChatRequest(BaseModel):
    session_id: str
    message: str

@app.get("/", response_class=HTMLResponse)
def home():
    return """
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Pri Chatbot</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; max-width: 760px; margin: 40px auto; }
      #chat { border: 1px solid #ddd; padding: 16px; border-radius: 12px; height: 420px; overflow-y: auto; }
      .msg { margin: 10px 0; }
      .role { font-weight: 600; }
      form { display: flex; gap: 8px; margin-top: 12px; }
      input { flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #ddd; }
      button { padding: 10px 14px; border-radius: 10px; border: 1px solid #ddd; cursor: pointer; }
    </style>
  </head>
  <body>
    <h2>Pri Chatbot</h2>
    <div id="chat"></div>
    <form id="form">
      <input id="input" placeholder="Type a message..." autocomplete="off" />
      <button type="submit">Send</button>
    </form>

    <script>
      const chat = document.getElementById("chat");
      const form = document.getElementById("form");
      const input = document.getElementById("input");
      const sessionId = crypto.randomUUID();

      function add(role, text) {
        const div = document.createElement("div");
        div.className = "msg";
        div.innerHTML = `<span class="role">${role}:</span> ${text.replaceAll("\\n","<br/>")}`;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
      }

      add("System", "Session started.");

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const msg = input.value.trim();
        if (!msg) return;
        input.value = "";
        add("You", msg);

        const res = await fetch("/chat", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ session_id: sessionId, message: msg })
        });

        const data = await res.json();
        add("Bot", data.reply);
      });
    </script>
  </body>
</html>
"""

@app.post("/chat")
def chat(req: ChatRequest):
    history = SESSIONS.get(req.session_id, [])
    history = history[-12:]  # keep last turns for cost/latency

    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + history + [
        {"role": "user", "content": req.message}
    ]

    resp = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=messages,
        temperature=0.7,
    )

    reply = resp.choices[0].message.content

    SESSIONS[req.session_id] = history + [
        {"role": "user", "content": req.message},
        {"role": "assistant", "content": reply},
    ]

    return {"reply": reply}


