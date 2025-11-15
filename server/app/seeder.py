import click
from flask.cli import with_appcontext
from .models import User, Test, TestResult
from .extensions import db
import json
from datetime import datetime, timedelta
import random

MOCK_DATA = [
    {"full_name": "Звёздкина Анна Борисовна", "department": "филиал", "city": "Санкт-Петербург", "position": "Старший менеджер по работе с клиентами", "experience": "5 лет 4 месяца", "age": 28, "is_manager": True, "kpi": {"июнь": 100, "июль": 96, "август": 80, "сентябрь": 90, "октябрь": 90}, "attestation": "прошел", "training": "в процессе", "last_vacation": "фев.25", "sick_leave": True, "reprimand": False, "corp_activity": True, "burnout_state": "все хорошо"},
    {"full_name": "Рассветная Юлия Николаевна", "department": "филиал", "city": "Санкт-Петербург", "position": "Менеджер по работе с клиентами", "experience": "2 года 10 месяцев", "age": 32, "is_manager": False, "kpi": {"июнь": 75, "июль": 60, "август": 100, "сентябрь": 100, "октябрь": 80}, "attestation": "прошел", "training": "завершена", "last_vacation": "мар.25", "sick_leave": True, "reprimand": False, "corp_activity": False, "burnout_state": "усталость"},
    {"full_name": "Ключевская Татьяна Михайловна", "department": "филиал", "city": "Самара", "position": "Старший менеджер группы регионального развития", "experience": "4 года 1 месяц", "age": 25, "is_manager": True, "kpi": {"июнь": 100, "июль": 75, "август": 80, "сентябрь": 80, "октябрь": 95}, "attestation": "прошел", "training": "в процессе", "last_vacation": "мар.25", "sick_leave": False, "reprimand": False, "corp_activity": True, "burnout_state": "выгорел"},
    {"full_name": "Зарецкая Лидия Романовна", "department": "филиал", "city": "Санкт-Петербург", "position": "Менеджер по работе с клиентами", "experience": "5 лет 6 месяцев", "age": 26, "is_manager": False, "kpi": {"июнь": 100, "июль": 100, "август": 100, "сентябрь": 100, "октябрь": 100}, "attestation": "прошел", "training": "завершена", "last_vacation": "авг.25", "sick_leave": False, "reprimand": False, "corp_activity": False, "burnout_state": "все хорошо"},
    {"full_name": "Вишневская Елена Станиславовна", "department": "филиал", "city": "Санкт-Петербург", "position": "Старший менеджер по работе с клиентами", "experience": "5 лет, 6 месяцев", "age": 30, "is_manager": True, "kpi": {"июнь": 100, "июль": 80, "август": 100, "сентябрь": 100, "октябрь": 90}, "attestation": "прошел", "training": "в процессе", "last_vacation": "окт.25", "sick_leave": False, "reprimand": False, "corp_activity": False, "burnout_state": "устал"},
    {"full_name": "Штормов Павел Николаевич", "department": "СК", "city": "Москва", "position": "Юрист", "experience": "1 год 2 месяца", "age": 28, "is_manager": False, "kpi": None, "attestation": "не проходил", "training": "в процессе", "last_vacation": "фев.25", "sick_leave": False, "reprimand": False, "corp_activity": True, "burnout_state": None},
    {"full_name": "Громов Никита Семёнович", "department": "СК", "city": "Москва", "position": "Бухгалтер", "experience": "4 года 9 месяцев", "age": 35, "is_manager": False, "kpi": None, "attestation": "не проходил", "training": "в процессе", "last_vacation": "июн.25", "sick_leave": False, "reprimand": False, "corp_activity": True, "burnout_state": None},
]

TRANSLIT_MAP = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
}

def transliterate(name):
    return "".join([TRANSLIT_MAP.get(char, char) for char in name.lower()])

def split_full_name(full_name):
    parts = full_name.split()
    last_name = parts[0]
    first_name = parts[1]
    patronymic = parts[2] if len(parts) > 2 else ""
    return last_name, first_name, patronymic

def generate_credentials(last_name, first_name):
    trans_last = transliterate(last_name)
    trans_first_initial = transliterate(first_name)[0]
    username = f"{trans_first_initial}.{trans_last}"
    email = f"{username}@sdek.ru"
    return username, email

@click.command("seed-db")
@with_appcontext
def seed_db_command():
    if User.query.first():
        print("База данных уже содержит пользователей. Команда отменена.")
        return

    print("Начало заполнения базы данных...")
    for user_data in MOCK_DATA:
        last_name, first_name, patronymic = split_full_name(user_data["full_name"])
        username, email = generate_credentials(last_name, first_name)
        
        additional_info = {
            "kpi": user_data.get("kpi"),
            "attestation_status": user_data.get("attestation"),
            "training_status": user_data.get("training"),
            "last_vacation": user_data.get("last_vacation"),
            "sick_leave_2025": user_data.get("sick_leave"),
            "has_reprimand": user_data.get("reprimand"),
            "corp_activity": user_data.get("corp_activity"),
            "burnout_self_assessment": user_data.get("burnout_state")
        }

        new_user = User(
            username=username,
            email=email,
            last_name=last_name,
            first_name=first_name,
            patronymic=patronymic,
            is_manager=user_data["is_manager"],
            department=user_data["department"],
            city=user_data["city"],
            position=user_data["position"],
            experience=user_data["experience"],
            age=user_data["age"],
            additional_info=additional_info,
            role='user'
        )
        new_user.set_password("password123")
        db.session.add(new_user)
        print(f"Пользователь {username} ({email}) подготовлен к добавлению.")

    db.session.commit()
    print("\nВсе пользователи успешно добавлены в базу данных!")
    print("Стандартный пароль для всех: password123")

def get_interpretation_level(score):
    if score >= 75:
        return "Высокий"
    elif score >= 50:
        return "Умеренный"
    else:
        return "Низкий"

@click.command("seed-results")
@with_appcontext
@click.argument("email")
def seed_results_command(email):
    user = User.query.filter_by(email=email).first()
    if not user:
        print(f"Ошибка: Пользователь с email {email} не найден.")
        return

    test = Test.query.first()
    if not test:
        print("Ошибка: В базе данных нет ни одного теста. Пожалуйста, создайте хотя бы один тест под ролью психолога.")
        return

    if TestResult.query.filter_by(user_id=user.id).first():
        print(f"У пользователя {email} уже есть результаты тестов. Команда отменена, чтобы избежать дублирования.")
        return

    print(f"Генерация моковых результатов для пользователя {user.email}...")

    for i in range(40, -1, -random.randint(2, 4)):
        date = datetime.utcnow() - timedelta(days=i)
        
        overall_score = random.randint(20, 90)
        personal_score = overall_score * random.uniform(0.8, 1.2)
        work_score = overall_score * random.uniform(0.8, 1.2)
        
        scores = {
            "overall": round(overall_score, 1),
            "personal": round(personal_score, 1),
            "work_related": round(work_score, 1)
        }
        
        interpretation = {
            "note": ">=50 — признак выраженного выгорания.",
            "work_level": get_interpretation_level(work_score),
            "personal_level": get_interpretation_level(personal_score),
            "overall_level": get_interpretation_level(overall_score)
        }

        new_result = TestResult(
            user_id=user.id,
            test_id=test.id,
            created_at=date,
            scores=scores,
            interpretation=interpretation,
            recommendations="Это автоматически сгенерированная рекомендация для мокового результата теста.",
            answers=[{"question_id": i, "answer": random.randint(1, 5)} for i in range(1, 20)] # Dummy answers
        )
        db.session.add(new_result)
        print(f"  - Создан результат за {date.strftime('%Y-%m-%d')} с общим баллом {scores['overall']}")

    db.session.commit()
    print("\nВсе моковые результаты успешно добавлены в базу данных!")

def register_seeder(app):
    app.cli.add_command(seed_db_command)
    app.cli.add_command(seed_results_command)