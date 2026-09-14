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
async def test_settings_endpoints(client):
    # 1. GET /api/settings
    get_res = await client.get("/api/settings")
    assert get_res.status_code == 200
    data = get_res.json()
    assert "provider" in data
    assert "database_type" in data
    assert "has_openai_key" in data

    # 2. POST /api/settings (update provider and test safe key handling)
    post_res = await client.post("/api/settings", json={
        "provider": "fallback",
        "openai_key": ""
    })
    assert post_res.status_code == 200
    post_data = post_res.json()
    assert post_data["status"] == "success"
    assert post_data["current_provider"] == "fallback"

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
async def test_delete_session_with_messages_and_artifacts(client):
    # 1. Chat to create a session with messages and artifacts
    req_payload = {
        "message": "Generate an interactive growth calculator",
        "provider": "fallback",
        "generate_artifact": True
    }
    chat_res = await client.post("/api/chat", json=req_payload)
    assert chat_res.status_code == 200
    data = chat_res.json()
    session_id = data["session_id"]
    assert session_id is not None
    assert data["artifact"] is not None

    # 2. Verify session has messages and artifacts
    session_res = await client.get(f"/api/sessions/{session_id}")
    assert session_res.status_code == 200
    session_data = session_res.json()
    assert len(session_data["messages"]) > 0
    assert len(session_data["artifacts"]) > 0

    # 3. Delete populated session - should succeed cleanly without lazy loading / foreign key error
    del_res = await client.delete(f"/api/sessions/{session_id}")
    assert del_res.status_code == 200

    # 4. Verify 404 after deletion
    verify_res = await client.get(f"/api/sessions/{session_id}")
    assert verify_res.status_code == 404

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

@pytest.mark.asyncio
async def test_chat_greeting_intent(client):
    req_payload = {
        "message": "hi",
        "provider": "fallback"
    }
    response = await client.post("/api/chat", json=req_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["grounded"] is False
    assert len(data["citations"]) == 0
    assert "Hello!" in data["message"]

@pytest.mark.asyncio
async def test_chat_closure_intent(client):
    req_payload = {
        "message": "thank you so much!",
        "provider": "fallback"
    }
    response = await client.post("/api/chat", json=req_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["grounded"] is False
    assert len(data["citations"]) == 0
    assert "welcome" in data["message"].lower()

@pytest.mark.asyncio
async def test_chat_meta_intent(client):
    req_payload = {
        "message": "who are you and what can you do?",
        "provider": "fallback"
    }
    response = await client.post("/api/chat", json=req_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["grounded"] is False
    assert len(data["citations"]) == 0
    assert "Lenny Growth Assistant" in data["message"]

