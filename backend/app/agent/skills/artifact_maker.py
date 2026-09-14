"""
Artifact Maker: Generates and parses rich Markdown documents and
interactive, sandboxed HTML/CSS/JS web widgets based on Lenny's Podcast insights.
"""

import re
from typing import Dict, Any, Optional

def extract_artifact_from_text(text: str) -> Optional[Dict[str, str]]:
    """
    Parses LLM output for fenced code blocks containing HTML or Markdown artifacts.
    """
    # 1. Search for HTML artifacts
    html_pattern = re.compile(r"```html\s*([\s\S]*?)\s*```", re.IGNORECASE)
    match_html = html_pattern.search(text)
    if match_html:
        content = match_html.group(1).strip()
        # Extract title from <title> or <h1> if available
        title_match = re.search(r"<title>(.*?)</title>", content, re.IGNORECASE)
        if not title_match:
            title_match = re.search(r"<h1>(.*?)</h1>", content, re.IGNORECASE)
        title = title_match.group(1).strip() if title_match else "Interactive Growth Artifact"
        # Clean tags from title
        title = re.sub(r"<[^>]+>", "", title)
        return {
            "title": title[:80],
            "artifact_type": "html",
            "content": content
        }

    # 2. Search for dedicated markdown artifact blocks
    md_pattern = re.compile(r"```markdown\s*([\s\S]*?)\s*```", re.IGNORECASE)
    match_md = md_pattern.search(text)
    if match_md:
        content = match_md.group(1).strip()
        first_line = content.split("\n")[0].replace("#", "").strip()
        title = first_line if first_line else "Growth Framework Document"
        return {
            "title": title[:80],
            "artifact_type": "markdown",
            "content": content
        }

    return None

def generate_interactive_growth_calculator_html(query: str, guest: str = "Elena Verna") -> Dict[str, str]:
    """
    Generates a sleek, interactive Growth & Retention Model calculator
    styled with modern dark glassmorphism, responsive sliders, and live chart output.
    """
    title = f"Growth & PLG Funnel Simulator ({guest})"
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    :root {{
      --bg: #090d16;
      --card-bg: rgba(26, 34, 52, 0.7);
      --card-border: rgba(255, 255, 255, 0.08);
      --accent-primary: #3b82f6;
      --accent-secondary: #10b981;
      --accent-gradient: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }}
    body {{
      background-color: var(--bg);
      color: var(--text-main);
      padding: 24px;
      display: flex;
      justify-content: center;
      min-height: 100vh;
    }}
    .container {{
      max-width: 820px;
      width: 100%;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 28px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      backdrop-filter: blur(12px);
    }}
    header {{
      margin-bottom: 24px;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 16px;
    }}
    h1 {{
      font-size: 1.5rem;
      font-weight: 700;
      background: var(--accent-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 6px;
    }}
    p.subtitle {{
      color: var(--text-muted);
      font-size: 0.9rem;
    }}
    .grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }}
    @media (max-width: 640px) {{
      .grid {{ grid-template-columns: 1fr; }}
    }}
    .card {{
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px;
    }}
    .input-group {{
      margin-bottom: 16px;
    }}
    .input-group:last-child {{ margin-bottom: 0; }}
    .label-row {{
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 6px;
    }}
    .label-val {{
      color: var(--accent-primary);
      font-weight: 600;
    }}
    input[type=range] {{
      width: 100%;
      accent-color: #3b82f6;
      cursor: pointer;
    }}
    .results-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 16px;
    }}
    .stat-box {{
      background: rgba(30, 41, 59, 0.7);
      border-radius: 10px;
      padding: 14px;
      text-align: center;
      border: 1px solid rgba(255,255,255,0.05);
    }}
    .stat-label {{
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 4px;
    }}
    .stat-number {{
      font-size: 1.35rem;
      font-weight: 700;
      color: #38bdf8;
    }}
    .key-insights {{
      margin-top: 24px;
      padding: 16px;
      background: rgba(59, 130, 246, 0.08);
      border-left: 4px solid var(--accent-primary);
      border-radius: 0 10px 10px 0;
      font-size: 0.88rem;
      line-height: 1.5;
    }}
    .key-insights strong {{
      color: #60a5fa;
    }}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>{title}</h1>
      <p class="subtitle">Interactive Product-Led Growth and Retention projection model grounded in Lenny's Podcast frameworks.</p>
    </header>

    <div class="grid">
      <!-- Input Controls -->
      <div class="card">
        <h3 style="font-size: 1rem; margin-bottom: 14px; color: #cbd5e1;">Funnel Inputs</h3>
        
        <div class="input-group">
          <div class="label-row">
            <span>Monthly Visitors</span>
            <span class="label-val" id="val-traffic">50,000</span>
          </div>
          <input type="range" id="in-traffic" min="5000" max="250000" step="5000" value="50000" oninput="calculate()">
        </div>

        <div class="input-group">
          <div class="label-row">
            <span>Signup / Trial Rate (%)</span>
            <span class="label-val" id="val-signup">6.5%</span>
          </div>
          <input type="range" id="in-signup" min="1.0" max="20.0" step="0.5" value="6.5" oninput="calculate()">
        </div>

        <div class="input-group">
          <div class="label-row">
            <span>Aha / Activation Rate (%)</span>
            <span class="label-val" id="val-activation">42%</span>
          </div>
          <input type="range" id="in-activation" min="10" max="80" step="1" value="42" oninput="calculate()">
        </div>

        <div class="input-group">
          <div class="label-row">
            <span>Monthly Churn Rate (%)</span>
            <span class="label-val" id="val-churn">4.0%</span>
          </div>
          <input type="range" id="in-churn" min="1.0" max="15.0" step="0.5" value="4.0" oninput="calculate()">
        </div>

        <div class="input-group">
          <div class="label-row">
            <span>Average Revenue / User (ARPU $)</span>
            <span class="label-val" id="val-arpu">$49</span>
          </div>
          <input type="range" id="in-arpu" min="10" max="300" step="5" value="49" oninput="calculate()">
        </div>
      </div>

      <!-- Projection Overview -->
      <div class="card">
        <h3 style="font-size: 1rem; margin-bottom: 14px; color: #cbd5e1;">Projected Trajectory</h3>
        
        <div class="results-grid">
          <div class="stat-box">
            <div class="stat-label">Signups / Mo</div>
            <div class="stat-number" id="res-signups">3,250</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Activated / Mo</div>
            <div class="stat-number" id="res-activated" style="color: #34d399;">1,365</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Steady MAU</div>
            <div class="stat-number" id="res-mau">34,125</div>
          </div>
        </div>

        <div class="stat-box" style="margin-top: 14px; text-align: left; padding: 14px;">
          <div class="stat-label">Estimated Steady ARR</div>
          <div class="stat-number" id="res-arr" style="font-size: 1.8rem; color: #a78bfa;">$2,006,550</div>
        </div>
      </div>
    </div>

    <div class="key-insights">
      <strong>Elena Verna's PLG Law:</strong> "Retention is the engine; acquisition is merely fuel." If your churn rate exceeds 5%, increasing visitor traffic will only burn cash faster without growing steady MAU. Focus first on the activation step where users experience the core habit loop.
    </div>
  </div>

  <script>
    function calculate() {{
      const traffic = parseFloat(document.getElementById('in-traffic').value);
      const signupRate = parseFloat(document.getElementById('in-signup').value) / 100;
      const activationRate = parseFloat(document.getElementById('in-activation').value) / 100;
      const churnRate = parseFloat(document.getElementById('in-churn').value) / 100;
      const arpu = parseFloat(document.getElementById('in-arpu').value);

      document.getElementById('val-traffic').innerText = traffic.toLocaleString();
      document.getElementById('val-signup').innerText = (signupRate * 100).toFixed(1) + '%';
      document.getElementById('val-activation').innerText = (activationRate * 100).toFixed(0) + '%';
      document.getElementById('val-churn').innerText = (churnRate * 100).toFixed(1) + '%';
      document.getElementById('val-arpu').innerText = '$' + arpu;

      const signups = Math.round(traffic * signupRate);
      const activated = Math.round(signups * activationRate);
      const steadyMau = Math.round(activated / churnRate);
      const arr = Math.round(steadyMau * arpu * 12);

      document.getElementById('res-signups').innerText = signups.toLocaleString();
      document.getElementById('res-activated').innerText = activated.toLocaleString();
      document.getElementById('res-mau').innerText = steadyMau.toLocaleString();
      document.getElementById('res-arr').innerText = '$' + arr.toLocaleString();
    }}
    calculate();
  </script>
</body>
</html>"""
    return {
        "title": title,
        "artifact_type": "html",
        "content": html_content
    }
