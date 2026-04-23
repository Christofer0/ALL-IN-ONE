import os
import requests
import google.generativeai as genai
from sqlalchemy.orm import Session
import crud, models

import json

class AIService:
    def __init__(self):
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key and gemini_key != "YOUR_GEMINI_API_KEY_HERE":
            genai.configure(api_key=gemini_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None
            print("Warning: GEMINI_API_KEY not set correctly.")

        self.core_api_url = os.getenv("CORE_API_URL")

    def _get_context_data(self, active_contexts, auth_token: str = None):
        context_text = ""
        headers = {}
        if auth_token:
            headers["Authorization"] = auth_token

        for ctx in active_contexts:
            try:
                if ctx == "cashflow":
                    res = requests.get(f"{self.core_api_url}/cashflow", headers=headers)
                    if res.status_code == 200:
                        data = res.json()
                        context_text += f"\n[Context: Cashflow Data]\n{json.dumps(data, indent=2)}\n"
                elif ctx == "notes":
                    res = requests.get(f"{self.core_api_url}/notes", headers=headers)
                    if res.status_code == 200:
                        data = res.json()
                        context_text += f"\n[Context: Notes]\n{json.dumps(data, indent=2)}\n"
                elif ctx == "goals":
                    res = requests.get(f"{self.core_api_url}/goals", headers=headers)
                    if res.status_code == 200:
                        data = res.json()
                        context_text += f"\n[Context: Goals/OKR]\n{json.dumps(data, indent=2)}\n"
            except Exception as e:
                print(f"Error fetching context {ctx}: {e}")
        
        return context_text

    def generate_ai_response(self, db: Session, user_message: str, mode: str, active_contexts: list, session_id: str = None, auth_token: str = None):
        # 1. System Prompt Construction
        system_prompts = {
            "brainstorm": "You are a creative brainstorming assistant. Help the user explore new ideas, expand on concepts, and think outside the box.",
            "review": "You are a critical reviewer and analyst. Evaluate the data provided, find patterns, and give constructive feedback or insights.",
            "plan": "You are a strategic planner. Help the user breakdown their goals into actionable steps, milestones, and timelines."
        }
        
        base_prompt = system_prompts.get(mode, system_prompts["brainstorm"])
        context_data = self._get_context_data(active_contexts, auth_token)
        
        # 2. Get history if session_id exists
        history = []
        if session_id:
            db_messages = crud.get_messages(db, session_id)
            # Limit history to stay within tokens - last 10 messages
            for msg in db_messages[-10:]:
                role = "user" if msg.role == "user" else "model" # Gemini uses 'model' for assistant
                history.append({"role": role, "parts": [msg.content]})

        # 3. Final Prompt
        full_system_instruction = f"{base_prompt}\nHere is some additional context data from the user's personal OS:\n{context_data}\nPlease provide your response based on this context and the user's request."
        
        if not self.model:
            return "AI model is not configured. Please check GEMINI_API_KEY."

        try:
            # Using chat interface for history
            chat = self.model.start_chat(history=history)
            response = chat.send_message(f"[System Instruction: {full_system_instruction}]\n\nUser Message: {user_message}")
            ai_content = response.text
            
            # Save messages to DB
            if not session_id:
                # Create session if it doesn't exist
                session_title = user_message[:50] + ("..." if len(user_message) > 50 else "")
                new_session = crud.create_session(db, session_title)
                session_id = new_session.id
            
            crud.add_message(db, session_id, "user", user_message)
            ai_msg = crud.add_message(db, session_id, "ai", ai_content)
            
            return {
                "id": ai_msg.id,
                "session_id": session_id,
                "role": "ai",
                "content": ai_content,
                "timestamp": ai_msg.created_at.strftime("%H:%M")
            }
        except Exception as e:
            print(f"AI Generation Error: {e}")
            return f"Error generating response: {str(e)}"

# Singleton instance
ai_service = AIService()
