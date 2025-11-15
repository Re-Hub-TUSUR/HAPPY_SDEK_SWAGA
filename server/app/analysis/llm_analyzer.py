import logging
import os
from gigachat import GigaChat
from ..analysis.standard_tests import get_standard_questions
import json

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
Ты — эмпатичный AI-ассистент, выступающий в роли профессионального корпоративного психолога и карьерного коуча. 
Твоя задача — дать человеку персонализированные, действенные и поддерживающие рекомендации, основываясь на всей предоставленной информации.

КРАЙНЕ ВАЖНЫЕ ПРАВИЛА ФОРМАТИРОВАНИЯ:
1.  Твой ответ должен быть ИСКЛЮЧИТЕЛЬНО в формате простого текста (plain text).
2.  ЗАПРЕЩЕНО использовать любую Markdown-разметку. Не используй символы: #, *, -, _, ```, >.
3.  Для структурирования используй только абзацы (пустые строки) и нумерованные списки (например, "1. ", "2. ").
4.  Адаптируй свои советы под контекст сотрудника (руководитель, стажер, динамика KPI и т.д.).
5.  Обращайся к человеку уважительно, на "вы".
6.  Перед тем как отдать ответ, еще раз проверь, что в нем нет Markdown символов.
"""

ANSWER_SCALE_TEXT = """
Шкала ответов, использованная в тесте:
"1": "Никогда" или "Совсем не согласен"
"2": "Редко" или "Скорее не согласен"
"3": "Иногда" или "Ни да, ни нет"
"4": "Часто" или "Скорее согласен"
"5": "Почти всегда" или "Полностью согласен"
"""

def recomendation(test_data: dict, test_type: str, user_profile: dict):
    if not giga:
        return "AI-анализатор в данный момент недоступен. Попробуйте позже."

    profile_summary = (
        f"Вот профиль сотрудника, для которого ты готовишь рекомендации:\n"
        f"- Должность: {user_profile.get('position', 'не указана')}\n"
        f"- Стаж в компании: {user_profile.get('experience', 'не указан')}\n"
        f"- Возраст: {user_profile.get('age', 'не указан')}\n"
        f"- Роль: {'Руководитель' if user_profile.get('is_manager') else 'Сотрудник'}\n"
        f"- Город: {user_profile.get('city', 'не указан')}\n"
    )
    
    kpi_info = user_profile.get('additional_info', {}).get('kpi')
    if kpi_info:
        kpi_summary = ", ".join([f"{month}: {val}%" for month, val in kpi_info.items()])
        profile_summary += f"- Динамика KPI (последние месяцы): {kpi_summary}\n"

    test_summary = ""
    if test_type in ["CBI", "OLBI"]:
        standard_questions = get_standard_questions(test_type)
        if standard_questions:
            questions_map = {str(q['id']): q['text'] for q in standard_questions}
            answered_questions = {questions_map[qid]: ans for qid, ans in test_data.items() if qid in questions_map}
            
            test_summary = (
                f"\nСотрудник прошел стандартный тест на выгорание '{test_type}'.\n"
                f"{ANSWER_SCALE_TEXT}\n"
                f"Его ответы (Вопрос: Оценка):\n{json.dumps(answered_questions, indent=2, ensure_ascii=False)}"
            )
    else:
        test_summary = (
            f"\nСотрудник прошел короткий опрос о самочувствии.\n"
            f"{ANSWER_SCALE_TEXT}\n"
            f"Его ответы (Вопрос: Оценка):\n{json.dumps(test_data, indent=2, ensure_ascii=False)}"
        )

    full_prompt = f"{BASE_PROMPT}\n{profile_summary}{test_summary}"

    try:
        response = giga.chat(full_prompt)
        evaluation_text = response.choices[0].message.content
        logger.info("GigaChat успешно сгенерировал персонализированный совет.")
        return evaluation_text
    except Exception as e:
        logger.error(f"Ошибка при взаимодействии с GigaChat: {e}", exc_info=True)
        return "К сожалению, не удалось получить персонализированные рекомендации. Пожалуйста, попробуйте пройти тест позже."

def summary_recommendation(user_profile: dict, recent_results_summary: str):
    if not giga:
        return "AI-анализатор в данный момент недоступен. Попробуйте позже."

    summary_prompt = """
Ты — эмпатичный AI-коуч. Твоя задача — проанализировать динамику состояния сотрудника за последние несколько тестов и дать одну, самую важную и актуальную рекомендацию на сегодня. 
Будь краток, но содержателен. Твой совет должен умещаться в один-два абзаца.
"""

    full_prompt = (
        f"{BASE_PROMPT}\n{summary_prompt}\n"
        f"Вот профиль сотрудника:\n"
        f"- Должность: {user_profile.get('position', 'не указана')}\n"
        f"- Роль: {'Руководитель' if user_profile.get('is_manager') else 'Сотрудник'}\n"
        f"- Стаж: {user_profile.get('experience', 'не указан')}\n\n"
        f"А вот краткая история его последних результатов:\n{recent_results_summary}"
    )

    try:
        response = giga.chat(full_prompt)
        evaluation_text = response.choices[0].message.content
        logger.info("GigaChat успешно сгенерировал сводную рекомендацию.")
        return evaluation_text
    except Exception as e:
        logger.error(f"Ошибка при генерации сводной рекомендации: {e}", exc_info=True)
        return "Не удалось сгенерировать сводную рекомендацию. Попробуйте позже."