import httpx
import json

def test_live_system():
    client = httpx.Client(timeout=30.0)

    print("=== 1. Testing Health Endpoint ===")
    res_health = client.get("http://127.0.0.1:8000/api/health")
    print("Health Status:", res_health.status_code, res_health.json())
    assert res_health.status_code == 200

    print("\n=== 2. Testing Grounded Chat Query ===")
    payload_chat = {
        "message": "How does Elena Verna define Product-Led Growth vs Sales-Led Growth?",
        "provider": "fallback"
    }
    res_chat = client.post("http://127.0.0.1:8000/api/chat", json=payload_chat)
    print("Chat Status:", res_chat.status_code)
    data_chat = res_chat.json()
    print("Session ID:", data_chat.get("session_id"))
    print("Citations Count:", len(data_chat.get("citations", [])))
    for cit in data_chat.get("citations", [])[:3]:
        print(f" - [{cit.get('guest')}] {cit.get('title')} ({cit.get('timestamp')}) -> {cit.get('youtube_url')}")
    assert len(data_chat.get("citations", [])) > 0
    session_id = data_chat.get("session_id")

    print("\n=== 3. Testing Ship 30 for 30 Skill ===")
    payload_ship30 = {
        "session_id": session_id,
        "message": "Turn Elena Verna's retention insights into a Ship 30 for 30 essay",
        "generate_ship30": True,
        "provider": "fallback"
    }
    res_ship30 = client.post("http://127.0.0.1:8000/api/chat", json=payload_ship30)
    data_ship30 = res_ship30.json()
    essay = data_ship30.get("message", "")
    print("Ship 30 Essay Words:", len(essay.split()))
    print("Essay Hook Headline:", essay.split("\n")[0])
    assert len(essay.split()) > 400

    print("\n=== 4. Testing Claude-Style Artifact Generation ===")
    payload_art = {
        "session_id": session_id,
        "message": "Generate interactive growth calculator for Elena Verna",
        "generate_artifact": True,
        "provider": "fallback"
    }
    res_art = client.post("http://127.0.0.1:8000/api/chat", json=payload_art)
    data_art = res_art.json()
    art = data_art.get("artifact")
    print("Artifact Generated:", art is not None)
    if art:
        print("Artifact Title:", art.get("title"))
        print("Artifact Type:", art.get("artifact_type"))
        print("Artifact Content Length:", len(art.get("content", "")))
        assert "<script>" in art.get("content", "")
        assert "document.cookie" not in art.get("content", "")

    print("\n=== 5. Testing Frontend Server Assets ===")
    res_fe = client.get("http://localhost:5173/")
    print("Frontend Root Status:", res_fe.status_code)
    assert res_fe.status_code == 200
    assert "The Lenny Growth Assistant" in res_fe.text

    print("\n[SUCCESS] ALL LIVE VERIFICATION CHECKS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_live_system()
