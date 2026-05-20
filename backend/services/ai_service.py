import logging
import os
import json
import requests
from transformers import pipeline, AutoTokenizer, AutoModel

logger = logging.getLogger(__name__)

# Load configurations safely
from config import GROQ_API_KEY, DEFAULT_MODEL, FALLBACK_MODEL

# Load local models only once
try:
    logger.info("Loading local AI model (flan-t5-small)... This might take a moment on first run.")
    generator = pipeline("text2text-generation", model="google/flan-t5-small")
    logger.info("Flan-T5 model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load flan-t5-small model: {e}")
    generator = None

try:
    logger.info("Loading local embedding model (all-MiniLM-L6-v2)...")
    embed_tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
    embed_model = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
    logger.info("Embedding model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load embedding model: {e}")
    embed_tokenizer = None
    embed_model = None


# ──────────── Groq API Helper ────────────

def query_groq(system_prompt: str, user_prompt: str, json_mode: bool = False) -> str:
    """Queries Groq API with DEFAULT_MODEL, falling back to FALLBACK_MODEL on failure."""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set.")

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    # Attempt DEFAULT_MODEL first, then FALLBACK_MODEL
    for model in [DEFAULT_MODEL, FALLBACK_MODEL]:
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.3
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        try:
            logger.info(f"Querying Groq API using model: {model}...")
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            if response.status_code == 200:
                res_data = response.json()
                return res_data["choices"][0]["message"]["content"]
            else:
                logger.error(f"Groq API error ({model}): {response.status_code} - {response.text}")
        except Exception as e:
            logger.error(f"Groq API request failed ({model}): {e}")

    raise RuntimeError("Both default and fallback Groq models failed to respond.")


# ──────────── Core Capabilities ────────────

def process_brain_dump(text: str) -> dict:
    """
    Takes chaotic user thoughts and returns an emotionally intelligent
    response along with actionable tasks and a focus suggestion.
    """
    system_prompt = (
        "You are HabitFlow OS, a calming, emotionally intelligent, and observant AI companion for overwhelmed minds. "
        "Your tone must be calming, grounded, supportive without sounding fake, and concise. "
        "Avoid motivational clichés, therapist clichés, corporate jargon, or generic productivity advice. "
        "Egyptian Arabic and mixed Arabic/English support is critical. If the user writes in Arabic, Egyptian Arabic, or a mix of Arabic and English, "
        "respond naturally and supportively in Egyptian Arabic (using warm local words like 'يا بطل', 'كلنا بنعدي بكده', 'خد نفس عميق'), avoiding overly formal Arabic. "
        "You must return a JSON object with the following keys:\n"
        "- 'calming_response': A short, warm, non-judgmental, calming acknowledgment of their thoughts (1-2 sentences).\n"
        "- 'extracted_tasks': A list of concrete, actionable, tiny next steps (1-4 items) extracted from their text. Keep tasks concise.\n"
        "- 'focus_suggestion': One single task to focus on first to reduce overwhelm, or suggesting a 'Tiny Mode' focus. Keep it simple.\n"
        "Example JSON format:\n"
        '{"calming_response": "I hear you. It is completely okay to feel this way...", "extracted_tasks": ["Write down the draft", "Send email"], "focus_suggestion": "Just write the first sentence of the draft."}'
    )
    user_prompt = f"User brain dump:\n'{text}'"

    try:
        res = query_groq(system_prompt, user_prompt, json_mode=True)
        return json.loads(res)
    except Exception as e:
        logger.error(f"Groq processing failed, falling back to local Flan-T5 model: {e}")
        return local_brain_dump_fallback(text)


def generate_daily_reflection(habits: list, tasks: list, focus_time_min: int, user_memory: dict = None) -> str:
    """
    Generates a beautiful, concise, contextual daily insight based on completed habits, tasks, and focus.
    Includes user life context (goals, stressors) to make the advice feel personal.
    """
    system_prompt = (
        "You are HabitFlow OS, a calming, emotionally intelligent, and observant AI companion. "
        "Generate a short, grounding daily reflection (1-2 sentences maximum) based on the user's progress. "
        "Your tone must be observant, warm, and concise. Avoid generic self-help advice, toxic positivity, or corporate clichés. "
        "You must explicitly use the user's active stressors and goals to write a highly tailored, calming reflection. "
        "If they completed a task related to an active stressor or goal, acknowledge that step towards relieving their pressure. "
        "If the user progress contains Arabic, or if you feel it's appropriate, respond in natural Egyptian Arabic. Otherwise, respond in English. "
        "Keep it highly personalized to their input."
    )
    
    context_str = ""
    if user_memory:
        current_focus = user_memory.get("current_focus", [])
        stressors = user_memory.get("stressors", [])
        phase = user_memory.get("academic_career_phase", "")
        context_str = (
            f"User Context:\n"
            f"- Phase of Life: {phase}\n"
            f"- Current Focus Goals: {', '.join(current_focus) if current_focus else 'None'}\n"
            f"- Active Stressors: {', '.join(stressors) if stressors else 'None'}\n\n"
        )
        
    user_prompt = (
        f"{context_str}"
        f"Today's stats:\n"
        f"- Completed Habits: {', '.join(habits) if habits else 'None'}\n"
        f"- Completed Tasks: {', '.join(tasks) if tasks else 'None'}\n"
        f"- Focus Sessions Duration: {focus_time_min} minutes."
    )

    try:
        res = query_groq(system_prompt, user_prompt, json_mode=False)
        return res.strip().replace('"', '')
    except Exception as e:
        logger.error(f"Groq daily reflection failed: {e}")
        return "برافو على مجهودك النهارده. خطوة بخطوة كل حاجة هتتظبط. خد وقت ترتاح فيه."


def generate_task_breakdown(task_title: str, user_memory: dict = None) -> dict:
    """
    Converts a massive or overwhelming task into 3-5 tiny, manageable, actionable steps.
    """
    system_prompt = (
        "You are HabitFlow OS, a calming and supportive cognitive assistant. "
        "Break down the user's overwhelming task/goal into a list of 3 to 5 tiny, manageable, and actionable steps. "
        "Ensure each step represents a very small, concrete action to minimize cognitive friction and make starting easy. "
        "If appropriate, align the breakdown steps with their current goals or keep active stressors in mind to reduce anxiety. "
        "If the task is in Arabic, respond in natural Egyptian Arabic. "
        "You must return a JSON object with the key 'steps', containing a list of strings.\n"
        "Example JSON format:\n"
        '{"steps": ["Open the folder", "Read the first page", "Write down one paragraph"]}'
    )
    
    context_str = ""
    if user_memory:
        current_focus = user_memory.get("current_focus", [])
        stressors = user_memory.get("stressors", [])
        phase = user_memory.get("academic_career_phase", "")
        context_str = (
            f"User Context:\n"
            f"- Phase: {phase}\n"
            f"- Focus: {', '.join(current_focus) if current_focus else 'None'}\n"
            f"- Stressors: {', '.join(stressors) if stressors else 'None'}\n\n"
        )

    user_prompt = f"{context_str}Break down this task: '{task_title}'"

    try:
        res = query_groq(system_prompt, user_prompt, json_mode=True)
        return json.loads(res)
    except Exception as e:
        logger.error(f"Groq task breakdown failed: {e}")
        return {"steps": ["ابدأ بـ 5 دقائق بس", "اكتب أول خطوة بسيطة", "اعمل كوباية شاي وركز في حاجة واحدة"]}


def generate_focus_rescue(q1_tasks: list[str], user_memory: dict = None) -> dict:
    """
    Evaluates overwhelm and suggests a single focus action or activation of Tiny Mode.
    Includes user life context (goals, stressors) to make the focus selection relevant.
    """
    system_prompt = (
        "You are HabitFlow OS, a calming, grounding cognitive rescue assistant. "
        "The user has several urgent/important tasks pending and is experiencing overwhelm. "
        "Write a short, highly calming focus rescue message (1-2 sentences) and suggest a single task they should focus on first. "
        "You MUST prioritize suggesting a task that directly aligns with their current life goals or helps mitigate their active stressors. "
        "Explain in your message why focusing on this task helps reduce their specific stressor or moves them closer to their goal. "
        "If the tasks are in Arabic, respond in supportive, grounding Egyptian Arabic. "
        "You must return a JSON object with the keys 'message' and 'suggested_task'.\n"
        "Example JSON format:\n"
        '{"message": "خد نفس عميق، الدوشة دي كلها هتخلص. خلينا نركز في حاجة واحدة بس دلوقتي.", "suggested_task": "اكتب أول صفحة في التقرير"}'
    )
    
    context_str = ""
    if user_memory:
        current_focus = user_memory.get("current_focus", [])
        stressors = user_memory.get("stressors", [])
        phase = user_memory.get("academic_career_phase", "")
        context_str = (
            f"User Context:\n"
            f"- Phase: {phase}\n"
            f"- Focus: {', '.join(current_focus)}\n"
            f"- Stressors: {', '.join(stressors)}\n\n"
        )
        
    tasks_str = ", ".join(q1_tasks) if q1_tasks else "No tasks listed but general overwhelm"
    user_prompt = f"{context_str}Pending urgent tasks: {tasks_str}"

    try:
        res = query_groq(system_prompt, user_prompt, json_mode=True)
        return json.loads(res)
    except Exception as e:
        logger.error(f"Groq focus rescue failed: {e}")
        first_task = q1_tasks[0] if q1_tasks else "التركيز على التنفس لمدة دقيقة"
        return {
            "message": "خد نفس عميق. متفكرش في كل اللي وراك دلوقتي. خلينا نركز في حاجة واحدة بس.",
            "suggested_task": first_task
        }


# ── Context Memory Extraction Layer ──

def update_user_memory(existing_memory: dict, brain_dump_text: str) -> dict:
    """
    Analyzes the user's brain dump text to extract/update their current goals,
    stressors, and career/academic phase. Returns a merged JSON dictionary.
    """
    system_prompt = (
        "You are HabitFlow OS, a supportive cognitive companion. "
        "You maintain a concise JSON profile of the user's current life context:\n"
        "- 'current_focus': A list of strings (max 3 items) describing their main active goals/projects (e.g. ['exams', 'cv improvement']).\n"
        "- 'stressors': A list of strings (max 3 items) describing current concerns or feelings (e.g. ['burnout', 'fear of falling behind']).\n"
        "- 'academic_career_phase': A string summarizing their active phase of life (e.g. 'Seeking design internships').\n"
        "\n"
        "Given the existing user profile context and a new Brain Dump text, update the profile. "
        "Integrate any new goals, stressors, or career phases described in the text, and remove outdated ones to keep it minimal and tidy. "
        "Keep entries extremely short. Return ONLY valid JSON."
    )
    user_prompt = (
        f"Existing profile: {json.dumps(existing_memory)}\n"
        f"New brain dump text: '{brain_dump_text}'"
    )

    try:
        res = query_groq(system_prompt, user_prompt, json_mode=True)
        return json.loads(res)
    except Exception as e:
        logger.error(f"Failed to update user memory: {e}")
        return existing_memory


# ── Dynamic Tiny Mode Steps Recommendation ──

def suggest_next_tiny_step(tasks: list[dict], completed_task_title: str, user_memory: dict = None) -> dict:
    """
    Suggests the next low-pressure task and its very first tiny step, celebrating the completed win gently.
    """
    system_prompt = (
        "You are HabitFlow OS, a calming, low-pressure cognitive coach helping an overwhelmed user rebuild momentum. "
        "First, briefly acknowledge the task they completed with a warm, gentle, low-pressure celebration (1 sentence, e.g. 'Nice work on that step, ya bital!'). "
        "Then, suggest which task from the list they should do next, and write the very first 'tiny step' (e.g. 'Just open the slides') to make starting effortless. "
        "You MUST prioritize recommending the next task that aligns closest with the user's active focus/goals or active stressors (to relieve pressure). "
        "Egyptian Arabic dialect is preferred if tasks are in Arabic. "
        "You must return a JSON object with the keys:\n"
        "- 'celebration': A short, gentle win acknowledgment.\n"
        "- 'next_task_id': The ID of the suggested next task (select from the provided list).\n"
        "- 'tiny_step': A single, tiny, effortless step to start that next task (e.g., 'Open the document')."
    )
    
    tasks_data = [{"id": t["id"], "title": t["title"], "quadrant": t.get("quadrant", "q1")} for t in tasks]
    user_prompt = (
        f"Completed task title: '{completed_task_title}'\n"
        f"Remaining tasks list: {json.dumps(tasks_data)}\n"
        f"User life context: {json.dumps(user_memory) if user_memory else '{}'}"
    )

    try:
        res = query_groq(system_prompt, user_prompt, json_mode=True)
        return json.loads(res)
    except Exception as e:
        logger.error(f"Failed to suggest next tiny step: {e}")
        next_task = tasks[0] if tasks else None
        return {
            "celebration": "خطوة ممتازة، برافو عليك!",
            "next_task_id": next_task["id"] if next_task else None,
            "tiny_step": "ابدأ بـ 5 دقائق بس في الخطوة الجاية."
        }


# ──────────── Local Embeddings Helper ────────────

def get_embedding(text: str) -> list[float]:
    """Generates a 384-dimensional embedding vector for the text using all-MiniLM-L6-v2."""
    if not embed_tokenizer or not embed_model:
        logger.warning("Embedding model is not loaded. Cannot generate embeddings.")
        return []
    try:
        import torch
        encoded_input = embed_tokenizer(text, padding=True, truncation=True, return_tensors='pt')
        with torch.no_grad():
            model_output = embed_model(**encoded_input)
        
        token_embeddings = model_output[0]
        attention_mask = encoded_input['attention_mask']
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        pooled = torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)
        
        import torch.nn.functional as F
        normalized = F.normalize(pooled, p=2, dim=1)
        return normalized[0].tolist()
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        return []


def calculate_similarity(vec1: list[float], vec2: list[float]) -> float:
    """Calculates cosine similarity (dot product of normalized vectors) between two embeddings."""
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0
    return sum(a * b for a, b in zip(vec1, vec2))


# ──────────── Local Fallback Implementation ────────────

def local_brain_dump_fallback(text: str) -> dict:
    """Flan-T5-Small fallback when Groq is unavailable."""
    if not generator:
        return {
            "calming_response": "I hear you. Take a deep breath. Let's take it one step at a time.",
            "extracted_tasks": ["Take a deep breath", "Review your checklist"],
            "focus_suggestion": "Focus on the absolute smallest thing you can do right now."
        }

    try:
        prompt_calming = f"Write a short, emotionally intelligent, and calming acknowledgment to someone who said: '{text}'"
        res_calming = generator(prompt_calming, max_length=50, num_return_sequences=1)
        calming_response = res_calming[0]['generated_text']

        prompt_tasks = f"Extract a concise list of actionable next steps from this text, separated by commas. If none, output none: '{text}'"
        res_tasks = generator(prompt_tasks, max_length=50, num_return_sequences=1)
        tasks_text = res_tasks[0]['generated_text']
        
        extracted_tasks = []
        if tasks_text.lower().strip() != 'none':
            extracted_tasks = [t.strip() for t in tasks_text.split(',') if t.strip()]

        prompt_focus = f"Based on this text, what is one single thing the person should focus on first? '{text}'"
        res_focus = generator(prompt_focus, max_length=20, num_return_sequences=1)
        focus_suggestion = res_focus[0]['generated_text']

        return {
            "calming_response": calming_response,
            "extracted_tasks": extracted_tasks,
            "focus_suggestion": focus_suggestion
        }
    except Exception as e:
        logger.error(f"Error during local AI inference fallback: {e}")
        return {
            "calming_response": "I hear you. Let's start with a breath.",
            "extracted_tasks": [],
            "focus_suggestion": "Just do the first simple action."
        }


def generate_matrix_recommendation(tasks: list[dict], user_memory: dict = None) -> dict:
    """
    Analyzes the user's matrix tasks and current cognitive context (goals, stressors) to recommend
    which task to tackle next and provides a grounding, empathetic 1-sentence explanation.
    """
    system_prompt = (
        "You are HabitFlow OS, a grounding and supportive cognitive coach. "
        "Analyze the user's Eisenhower Matrix tasks and their cognitive context (current goals/focus, active stressors). "
        "Recommend exactly one task they should focus on first, explaining *why* working on this specific task will directly "
        "help relieve their specific stressor or move them closer to their goals. "
        "The recommendation and rationale MUST be a single, warm, comforting, and highly explainable sentence. E.g., 'Finishing your CV reduces your internship anxiety directly.' "
        "Do not use generic messages like 'AI selected this task' or 'This is in Q1'. Make it feel grounded and empathetic. "
        "If there are no matching tasks or if the matrix is empty, suggest a helpful general task related to their focus (e.g., adding a task for it) and return null for task ID. "
        "You must return a JSON object with keys:\n"
        "- 'recommendation': A warm, grounding 1-sentence explanation of why they should do this task.\n"
        "- 'suggested_task_id': The ID of the recommended task from the list (or null if recommending adding a new task).\n"
        "- 'target_quadrant': The quadrant of the recommended task (e.g., 'q1', 'q2', 'q3', 'q4')."
    )
    
    tasks_data = [{"id": t["id"], "title": t["title"], "quadrant": t["quadrant"]} for t in tasks]
    user_prompt = (
        f"Remaining Matrix Tasks: {json.dumps(tasks_data)}\n"
        f"User Cognitive Context: {json.dumps(user_memory) if user_memory else '{}'}"
    )

    try:
        res = query_groq(system_prompt, user_prompt, json_mode=True)
        return json.loads(res)
    except Exception as e:
        logger.error(f"Failed to generate matrix recommendation: {e}")
        # Deterministic fallback: find any uncompleted task in q1 or q2
        q1_q2_tasks = [t for t in tasks if t["quadrant"] in ["q1", "q2"]]
        suggested = q1_q2_tasks[0] if q1_q2_tasks else (tasks[0] if tasks else None)
        if suggested:
            return {
                "recommendation": f"Focusing on '{suggested['title']}' will help you regain momentum and reduce your cognitive load.",
                "suggested_task_id": suggested["id"],
                "target_quadrant": suggested["quadrant"]
            }
        else:
            return {
                "recommendation": "Try adding a small, actionable step related to your active focus to get started.",
                "suggested_task_id": None,
                "target_quadrant": "q1"
            }

