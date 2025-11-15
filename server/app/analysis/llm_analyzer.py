import logging
import os
from gigachat import GigaChat
from ..analysis.standard_tests import get_standard_questions

logger = logging.getLogger(__name__)

giga = None
GIGACHAT_CREDENTIALS = os.environ.get('GIGACHAT_CREDENTIALS')

if GIGACHAT_CREDENTIALS:
    try:
        giga = GigaChat(
            credentials=GIGACHAT_CREDENTIALS,
            verify_ssl_certs=False,
            model="GigaChat-Max"
        )
        logger.info("GigaChat клиент успешно инициализирован.")
    except Exception as e:
        giga = None
        logger.error(f"Не удалось инициализировать GigaChat: {e}")
else:
    logger.warning("GIGACHAT_CREDENTIALS не найдена в переменных окружения. LLM-анализатор будет отключен.")

BASE_PROMPT = """
Ты — эмпатичный AI-ассистент, выступающий в роли профессионального психолога. 
Твоя задача — проанализировать предоставленные результаты теста и дать человеку развернутые, полезные и поддерживающие рекомендации по его состоянию.

ВАЖНЫЕ ПРАВИЛА ФОРМАТИРОВАНИЯ:
1.  Твой ответ должен быть отформатирован как простой текст (plain text).
2.  НЕ ИСПОЛЬЗУЙ Markdown-разметку (никаких символов #, *, -, _, и т.д. для заголовков, списков или выделения).
3.  Разделяй логические блоки пустыми строками, чтобы создать абзацы.
4.  Структурируй ответ: сначала краткий анализ состояния, затем конкретные рекомендации. Ты можешь нумеровать пункты рекомендаций (например, "1. Коррекция образа жизни:", "2. Работа над ...").
"""

ANSWER_SCALE_TEXT = """
Оценки (варианты ответов):
"1": "Полностью не согласен",
"2": "Скорее не согласен",
"3": "Ни согласен, ни не согласен",
"4": "Скорее согласен",
"5": "Полностью согласен"
"""

def recomendation(test_data: dict, test_type: str):
    if not giga:
        return "AI-анализатор в данный момент недоступен. Попробуйте позже."

    context_prompt = ""

    if test_type in ["CBI", "OLBI"]:
        standard_questions = get_standard_questions(test_type)
        if not standard_questions:
            return "Ошибка: не найдены стандартные вопросы для теста."
        
        questions_text = "\n".join([f"{q['id']}. {q['text']}" for q in standard_questions])
        
        context_prompt = (
            f"Тебе будут даны результаты теста {test_type}.\n\n"
            f"Вопросы:\n{questions_text}\n\n"
            f"{ANSWER_SCALE_TEXT}\n\n"
            f"Ниже результаты теста в формате (ID вопроса : ответ):\n"
            f"{test_data}"
        )
        
    elif test_type == "small":
        context_prompt = (
            f"Тебе будут даны ответы на вопросы короткого ежедневного опроса.\n\n"
            f"{ANSWER_SCALE_TEXT}\n\n"
            f"Ниже результаты теста в формате (Вопрос : ответ):\n"
            f"{test_data}"
        )
    
    else:
        return f"Рекомендации для типа теста '{test_type}' пока не настроены."

    full_prompt = f"{BASE_PROMPT}\n\nВот данные для анализа:\n{context_prompt}"

    try:
        response = giga.chat(full_prompt)
        evaluation_text = response.choices[0].message.content
        logger.info("GigaChat успешно сгенерировал совет.")
        return evaluation_text

    except Exception as e:
        logger.error(f"Ошибка при взаимодействии с GigaChat: {e}", exc_info=True)
        return "К сожалению, не удалось получить рекомендации от AI-ассистента. Пожалуйста, попробуйте пройти тест позже."