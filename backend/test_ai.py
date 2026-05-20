import logging
import sys

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

try:
    from services import ai_service
    print("AI service imported successfully.")
except Exception as e:
    print(f"Failed to import AI service: {e}")
    sys.exit(1)

print("\n--- Testing Local Embeddings Model ---")
emb = ai_service.get_embedding("عندي مليون حاجة ومشتتة")
print(f"Generated embedding vector length: {len(emb)}")
if emb:
    print(f"First 5 elements: {emb[:5]}")
else:
    print("Warning: Embedding was empty.")

print("\n--- Testing Groq API (Arabic Test) ---")
try:
    res = ai_service.process_brain_dump("عندي مليون حاجة عايزة اقدم internships بس مشتتة وورايا كمان امتحان HCI بكره ومش عارفة ابدأ منين")
    print("Groq response succeeded:")
    import json
    print(json.dumps(res, indent=2, ensure_ascii=False))
except Exception as e:
    print(f"Groq API call failed (expected if network is blocked or key invalid): {e}")

print("\n--- Testing Daily Reflection ---")
try:
    reflection = ai_service.generate_daily_reflection(
        habits=["Morning Study Session", "Drink 8 Glasses Water"],
        tasks=["HCI Quiz Prep", "Submit Form"],
        focus_time_min=50
    )
    print(f"Reflection response: {reflection}")
except Exception as e:
    print(f"Daily reflection failed: {e}")
