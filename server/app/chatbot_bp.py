from flask import Blueprint, request, jsonify
from datetime import datetime
from gigachat.models import Messages, MessagesRole
import logging
import uuid

sessions = {}

# Импортируем наш новый сервис
from .analysis.chatbot_service import gigachat_service

logger = logging.getLogger(__name__)
chatbot_bp = Blueprint('chatbot', __name__, url_prefix='/api/v1/chatbot')

class ChatSession:
    def __init__(self):
        self.messages = []
    def add_message(self, role, content):
        self.messages.append(Messages(role=role, content=content))
    def get_chat_history(self):
        return self.messages

@chatbot_bp.route('/session/new', methods=['POST'])
def new_session():
    session_id = str(uuid.uuid4())
    sessions[session_id] = ChatSession()
    logger.info(f"Created new chat session: {session_id}")
    return jsonify({"success": True, "session_id": session_id})

@chatbot_bp.route('/chat', methods=['POST'])
def chat():
    data = request.json
    session_id = data.get('session_id')
    user_message = data.get('message')

    if not all([session_id, user_message]):
        return jsonify({"success": False, "error": "session_id and message are required"}), 400

    session = sessions.get(session_id)
    if not session:
        return jsonify({"success": False, "error": "Session not found"}), 404

    try:
        session.add_message(MessagesRole.USER, user_message)
        assistant_message = gigachat_service.get_response(session.get_chat_history())
        session.add_message(MessagesRole.ASSISTANT, assistant_message)
        
        return jsonify({"success": True, "message": assistant_message})
            
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({"success": False, "error": "Ошибка при обращении к AI-сервису"}), 500