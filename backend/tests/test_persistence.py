import pytest

@pytest.mark.asyncio
async def test_session_message_history_persistence(client):
    # 1. Create a session
    sess_res = await client.post("/api/sessions", json={"title": "Multi-turn Persistence Test"})
    session_id = sess_res.json()["id"]

    # 2. First turn
    turn1 = await client.post("/api/chat", json={
        "session_id": session_id,
        "message": "Who is Brian Chesky?",
        "provider": "fallback"
    })
    assert turn1.status_code == 200
    assert turn1.json()["session_id"] == session_id

    # 3. Follow-up turn in the same session
    turn2 = await client.post("/api/chat", json={
        "session_id": session_id,
        "message": "What did he say about founder mode?",
        "provider": "fallback"
    })
    assert turn2.status_code == 200
    assert turn2.json()["session_id"] == session_id

    # 4. Fetch the session and verify both user & assistant messages are persisted
    sess_detail = await client.get(f"/api/sessions/{session_id}")
    assert sess_detail.status_code == 200
    messages = sess_detail.json()["messages"]
    # 2 user messages + 2 assistant messages = 4 messages
    assert len(messages) == 4
    assert messages[0]["role"] == "user"
    assert "Brian Chesky" in messages[0]["content"]
    assert messages[1]["role"] == "assistant"
    assert messages[2]["role"] == "user"
    assert "founder mode" in messages[2]["content"]
    assert messages[3]["role"] == "assistant"

@pytest.mark.asyncio
async def test_artifact_persistence_with_session(client):
    sess_res = await client.post("/api/sessions", json={"title": "Artifact Session"})
    session_id = sess_res.json()["id"]

    # Request artifact generation
    chat_res = await client.post("/api/chat", json={
        "session_id": session_id,
        "message": "Generate interactive growth calculator for Elena Verna",
        "generate_artifact": True,
        "provider": "fallback"
    })
    assert chat_res.status_code == 200
    art = chat_res.json()["artifact"]
    assert art is not None
    artifact_id = art["id"]

    # Verify artifact is attached to session
    sess_detail = await client.get(f"/api/sessions/{session_id}")
    artifacts = sess_detail.json()["artifacts"]
    assert len(artifacts) >= 1
    assert artifacts[0]["id"] == artifact_id

    # Fetch individual artifact endpoint
    art_res = await client.get(f"/api/artifacts/{artifact_id}")
    assert art_res.status_code == 200
    assert art_res.json()["title"] == art["title"]
