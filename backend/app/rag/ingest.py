import os
import re
import json
import yaml
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

logger = logging.getLogger("lenny_assistant.ingest")

def parse_time_to_seconds(time_str: str) -> int:
    """Converts HH:MM:SS or MM:SS to seconds."""
    parts = time_str.strip().split(":")
    try:
        if len(parts) == 3:
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
        elif len(parts) == 2:
            return int(parts[0]) * 60 + int(parts[1])
        elif len(parts) == 1:
            return int(parts[0])
    except ValueError:
        return 0
    return 0

def format_seconds_to_time(seconds: int) -> str:
    """Formats seconds to HH:MM:SS or MM:SS."""
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    if h > 0:
        return f"{h:02d}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"

def extract_frontmatter_and_content(markdown_text: str):
    """Extracts YAML frontmatter and raw body content from a transcript markdown file."""
    if markdown_text.startswith("---"):
        parts = markdown_text.split("---", 2)
        if len(parts) >= 3:
            try:
                frontmatter = yaml.safe_load(parts[1])
            except Exception:
                frontmatter = {}
            body = parts[2]
            return frontmatter, body
    return {}, markdown_text

def parse_transcript_turns(body_text: str) -> List[Dict[str, Any]]:
    """
    Parses speaker turns and timestamps.
    Format is typically:
    Speaker Name (HH:MM:SS):
    Spoken text...
    or (HH:MM:SS):
    Spoken text...
    """
    turn_pattern = re.compile(
        r"(?:([A-Za-z0-9\s\.\,\'-]+?)\s*)?\(([\d]{1,2}:[\d]{2}:[\d]{2}|[\d]{1,2}:[\d]{2})\):"
    )
    
    lines = body_text.split("\n")
    turns = []
    current_speaker = "Unknown"
    current_time_str = "00:00"
    current_text_buffer = []

    for line in lines:
        match = turn_pattern.match(line.strip())
        if match:
            # Save previous turn if exists
            if current_text_buffer:
                turns.append({
                    "speaker": current_speaker,
                    "timestamp": current_time_str,
                    "seconds": parse_time_to_seconds(current_time_str),
                    "text": " ".join(current_text_buffer).strip()
                })
                current_text_buffer = []

            speaker_candidate = match.group(1)
            time_str = match.group(2)
            if speaker_candidate and speaker_candidate.strip():
                current_speaker = speaker_candidate.strip()
            current_time_str = time_str
        else:
            cleaned = line.strip()
            # Ignore headers like ## Transcript or # Title
            if cleaned and not cleaned.startswith("#") and not cleaned == "---":
                current_text_buffer.append(cleaned)

    if current_text_buffer:
        turns.append({
            "speaker": current_speaker,
            "timestamp": current_time_str,
            "seconds": parse_time_to_seconds(current_time_str),
            "text": " ".join(current_text_buffer).strip()
        })

    return turns

def chunk_turns(
    turns: List[Dict[str, Any]], 
    metadata: Dict[str, Any], 
    target_words: int = 350, 
    overlap_words: int = 60
) -> List[Dict[str, Any]]:
    """
    Groups speaker turns into coherent semantic chunks with rich metadata.
    Preserves speaker attribution and timestamps.
    """
    chunks = []
    current_chunk_turns = []
    current_word_count = 0
    chunk_index = 0

    video_id = metadata.get("video_id", "")
    base_youtube_url = metadata.get("youtube_url", "")
    guest = metadata.get("guest", "Lenny's Guest")
    title = metadata.get("title", "Lenny's Podcast Episode")
    publish_date = str(metadata.get("publish_date", ""))
    keywords = metadata.get("keywords", [])

    for turn in turns:
        turn_words = len(turn["text"].split())
        current_chunk_turns.append(turn)
        current_word_count += turn_words

        if current_word_count >= target_words:
            # Build chunk
            first_turn = current_chunk_turns[0]
            start_seconds = first_turn.get("seconds", 0)
            start_time_str = first_turn.get("timestamp", "00:00")
            
            # Direct YouTube timestamp deep link
            if video_id:
                yt_link = f"https://www.youtube.com/watch?v={video_id}&t={start_seconds}s"
            elif base_youtube_url:
                yt_link = f"{base_youtube_url}&t={start_seconds}s" if "?" in base_youtube_url else f"{base_youtube_url}?t={start_seconds}s"
            else:
                yt_link = ""

            chunk_text = "\n".join([f"{t['speaker']} ({t['timestamp']}): {t['text']}" for t in current_chunk_turns])
            
            chunks.append({
                "id": f"{metadata.get('slug', 'ep')}_{chunk_index}",
                "slug": metadata.get("slug", ""),
                "guest": guest,
                "title": title,
                "publish_date": publish_date,
                "youtube_url": yt_link,
                "video_id": video_id,
                "start_seconds": start_seconds,
                "timestamp": start_time_str,
                "keywords": keywords,
                "text": chunk_text,
                "word_count": current_word_count
            })
            chunk_index += 1

            # Handle overlap: keep the last turn if reasonable
            if len(current_chunk_turns) > 1:
                last_turn = current_chunk_turns[-1]
                current_chunk_turns = [last_turn]
                current_word_count = len(last_turn["text"].split())
            else:
                current_chunk_turns = []
                current_word_count = 0

    if current_chunk_turns:
        first_turn = current_chunk_turns[0]
        start_seconds = first_turn.get("seconds", 0)
        start_time_str = first_turn.get("timestamp", "00:00")
        if video_id:
            yt_link = f"https://www.youtube.com/watch?v={video_id}&t={start_seconds}s"
        else:
            yt_link = base_youtube_url

        chunk_text = "\n".join([f"{t['speaker']} ({t['timestamp']}): {t['text']}" for t in current_chunk_turns])
        chunks.append({
            "id": f"{metadata.get('slug', 'ep')}_{chunk_index}",
            "slug": metadata.get("slug", ""),
            "guest": guest,
            "title": title,
            "publish_date": publish_date,
            "youtube_url": yt_link,
            "video_id": video_id,
            "start_seconds": start_seconds,
            "timestamp": start_time_str,
            "keywords": keywords,
            "text": chunk_text,
            "word_count": current_word_count
        })

    return chunks

def build_index_from_directory(
    episodes_dir: str, 
    output_index_path: str, 
    max_episodes: Optional[int] = None
) -> Dict[str, Any]:
    """
    Parses all episodes in the directory and produces a unified index file.
    """
    episodes_path = Path(episodes_dir)
    if not episodes_path.exists():
        raise FileNotFoundError(f"Episodes directory {episodes_dir} does not exist.")

    episode_dirs = [d for d in episodes_path.iterdir() if d.is_dir()]
    episode_dirs.sort(key=lambda x: x.name)
    
    if max_episodes:
        episode_dirs = episode_dirs[:max_episodes]

    all_chunks = []
    episodes_catalog = []

    logger.info("Processing %d episodes from %s...", len(episode_dirs), episodes_dir)

    for ep_dir in episode_dirs:
        transcript_file = ep_dir / "transcript.md"
        if not transcript_file.exists():
            continue

        try:
            content = transcript_file.read_text(encoding="utf-8", errors="replace")
            metadata, body = extract_frontmatter_and_content(content)
            metadata["slug"] = ep_dir.name
            
            episodes_catalog.append({
                "slug": ep_dir.name,
                "guest": metadata.get("guest", ep_dir.name),
                "title": metadata.get("title", ""),
                "publish_date": str(metadata.get("publish_date", "")),
                "duration": str(metadata.get("duration", "")),
                "youtube_url": metadata.get("youtube_url", ""),
                "keywords": metadata.get("keywords", [])
            })

            turns = parse_transcript_turns(body)
            chunks = chunk_turns(turns, metadata)
            all_chunks.extend(chunks)
        except Exception as e:
            logger.error("Error processing %s: %s", ep_dir.name, e)

    index_data = {
        "total_episodes": len(episodes_catalog),
        "total_chunks": len(all_chunks),
        "catalog": episodes_catalog,
        "chunks": all_chunks
    }

    out_path = Path(output_index_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(index_data, f, ensure_ascii=False)

    logger.info("Successfully generated index with %d chunks across %d episodes.", len(all_chunks), len(episodes_catalog))
    logger.info("Saved to %s", output_index_path)
    return index_data

if __name__ == "__main__":
    import sys
    ep_dir = sys.argv[1] if len(sys.argv) > 1 else "temp_transcripts/episodes"
    out_file = sys.argv[2] if len(sys.argv) > 2 else "data/transcripts_index.json"
    build_index_from_directory(ep_dir, out_file)
