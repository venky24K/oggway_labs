import pytest
from backend.app.agent.skills.ship30 import generate_fallback_ship30_essay
from backend.app.agent.skills.artifact_maker import (
    extract_artifact_from_text,
    generate_interactive_growth_calculator_html
)

def test_ship30_essay_structure_and_length():
    mock_citations = [
        {
            "guest": "Elena Verna",
            "title": "Elena Verna on PLG",
            "timestamp": "12:30",
            "youtube_url": "https://www.youtube.com/watch?v=bxghtN-OlJQ&t=750s",
            "text": "Elena Verna (12:30): Retention is the single engine of sustainable growth. Without it, you are pouring water into a sieve."
        },
        {
            "guest": "Shreyas Doshi",
            "title": "Shreyas Doshi on High Leverage Product Management",
            "timestamp": "05:10",
            "youtube_url": "https://www.youtube.com/watch?v=mock&t=310s",
            "text": "Shreyas Doshi (05:10): Most PMs spend 80% of their time on low-impact operational tasks."
        }
    ]

    essay = generate_fallback_ship30_essay("Product-Led Growth Retention", mock_citations)
    
    # Check length: should be comprehensive (~800 to 1400 words)
    words = len(essay.split())
    assert words > 500, f"Expected long-form essay, got {words} words"

    # Check key Ship 30 for 30 components:
    # 1. Hook & Headline
    assert "# The Elena Verna Playbook" in essay
    # 2. Skimmable headings
    assert "### 1. The Death Spiral of \"Feature-First\" Thinking" in essay
    assert "### 2. The Power of Asymmetric Input Metrics" in essay
    # 3. Grounded attribution
    assert "Elena Verna" in essay
    assert "Lenny's Podcast" in essay
    # 4. Actionable Checklist
    assert "The 48-Hour Implementation Checklist" in essay

def test_artifact_extraction():
    sample_text = """
    Here is an interactive calculator:
    ```html
    <!DOCTYPE html>
    <html>
    <head><title>Viral Coefficient Calculator</title></head>
    <body><h1>Viral Growth</h1></body>
    </html>
    ```
    You can test it now!
    """
    extracted = extract_artifact_from_text(sample_text)
    assert extracted is not None
    assert extracted["artifact_type"] == "html"
    assert "Viral Coefficient Calculator" in extracted["title"]
    assert "<h1>Viral Growth</h1>" in extracted["content"]

def test_interactive_growth_calculator_generation():
    artifact = generate_interactive_growth_calculator_html("PLG Model", "Elena Verna")
    assert artifact["artifact_type"] == "html"
    assert "Elena Verna" in artifact["title"]
    assert "<script>" in artifact["content"]
    assert "function calculate()" in artifact["content"]
    # Check sandboxing security: should not contain harmful network calls or document.cookie
    assert "document.cookie" not in artifact["content"]
    assert "window.location" not in artifact["content"]
