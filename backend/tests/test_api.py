import pytest

@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "indexed_episodes" in data
    assert data["indexed_episodes"] > 0
    assert data["indexed_chunks"] > 0

@pytest.mark.asyncio
async def test_models_endpoint(client):
    response = await client.get("/api/models")
    assert response.status_code == 200
    data = response.json()
    assert "available_providers" in data
    assert "fallback" in data["available_providers"]

@pytest.mark.asyncio
async def test_sessions_lifecycle(client):
    # 1. Create session
    create_res = await client.post("/api/sessions", json={"title": "Test PLG Strategy"})
    assert create_res.status_code == 200
    session_data = create_res.json()
    session_id = session_data["id"]
    assert session_data["title"] == "Test PLG Strategy"

    # 2. List sessions
    list_res = await client.get("/api/sessions")
    assert list_res.status_code == 200
    sessions = list_res.json()
    assert any(s["id"] == session_id for s in sessions)

    # 3. Get session by ID
    get_res = await client.get(f"/api/sessions/{session_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == session_id

    # 4. Delete session
    del_res = await client.delete(f"/api/sessions/{session_id}")
    assert del_res.status_code == 200

    # 5. Verify deletion
    get_after_del = await client.get(f"/api/sessions/{session_id}")
    assert get_after_del.status_code == 404

@pytest.mark.asyncio
async def test_chat_grounded_response(client):
    req_payload = {
        "message": "What does Elena Verna say about B2B Product-Led Growth?",
        "provider": "fallback"
    }
    response = await client.post("/api/chat", json=req_payload)
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert "message" in data
    assert len(data["citations"]) > 0
    # Top citation should reference Elena Verna
    top_citation = data["citations"][0]
    assert "Elena Verna" in top_citation["guest"]
    assert "youtube.com" in top_citation["youtube_url"]
