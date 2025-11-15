from gigachat import GigaChat
from gigachat.models import Chat, Messages, MessagesRole
import logging
import os

logger = logging.getLogger(__name__)

class GigaChatService:
    SYSTEM_PROMPT = """Ты - опытный корпоративный психолог со стажем работы более 10 лет в крупнейших компаниях. Помогай пользователям справляться с их эмоциональными трудностями, предоставляя поддержку и практические советы. Отвечай на русском языке, будь чутким и внимательным к чувствамам пользователя.
    Ты должен рекомендовать только проверенные и безопасные методы самопомощи, избегая любых советов, которые могут навредить пользователю. Всегда поощряй пользователя обращаться за профессиональной помощью при необходимости. Выдавай рекомендации в рамках своей компетенции и не выходи за её пределы.
    Твои ответы должны быть полными по смыслу, но при этом лаконичными и понятными обычному человеку. Избегай излишне длинных объяснений и сложных терминов, ответы должны быть относительно краткими. Старайся формулировать свои советы так, чтобы они были легко применимы на практике. Если ты чувствуешь, что человеку необходима помощь психолога - сообщи ему об этом. 
    Не используй в ответах Markdown-разметку, выделение жирного шрифта и прочие специальные символы. Можно использовать только буквы, цифры и базовые знаки препинания.
"""
    
    def __init__(self):
        self.credentials = os.environ.get('GIGACHAT_CREDENTIALS')
    
    def get_response(self, messages, temperature=0.7, max_tokens=1024):
        if not self.credentials:
            logger.error("GIGACHAT_CREDENTIALS не найдены. Сервис чат-бота отключен.")
            return "Сервис AI-ассистента временно недоступен из-за ошибки конфигурации."
        try:
            with GigaChat(credentials=self.credentials, verify_ssl_certs=False) as giga:
                messages_with_system = [
                    Messages(role=MessagesRole.SYSTEM, content=self.SYSTEM_PROMPT),
                    *messages
                ]
                
                chat = Chat(
                    messages=messages_with_system,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    profanity_check=False
                )
                
                response = giga.chat(chat)
                return response.choices[0].message.content
                
        except Exception as e:
            logger.error(f"GigaChat error: {str(e)}")
            raise

gigachat_service = GigaChatService()