from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
import os
import uuid
import json
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta, timezone

from .models import User, Test, Question, TestResult
from .extensions import db
from .analysis.burnout_scores import score_cbi, interpret_cbi, score_olbi, interpret_olbi
from .analysis.llm_analyzer import recomendation, summary_recommendation
from .analysis.standard_tests import get_standard_questions

tests_bp = Blueprint('tests', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_points_for_category(category: str) -> int:
    if category == 'daily':
        return 10
    elif category == 'weekly':
        return 25
    elif category == 'monthly':
        return 50
    elif category == 'specialized':
        return 30
    return 0

def psychologist_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            if user and user.role == 'psychologist':
                return fn(*args, **kwargs)
            else:
                return jsonify(message="Доступ разрешен только для психологов"), 403
        return decorator
    return wrapper

def delete_image_file(filename):
    if filename and filename != 'default_test_image.png':
        try:
            upload_folder = os.path.join(current_app.root_path, '..', 'static', 'uploads')
            os.remove(os.path.join(upload_folder, filename))
        except OSError as e:
            print(f"Ошибка при удалении файла {filename}: {e}")

@tests_bp.route('/', methods=['POST'])
@psychologist_required()
def create_test():
    data = request.form
    category = data.get('category')
    valid_from = data.get('valid_from')
    valid_until = data.get('valid_until')
    
    new_test = Test(
        title=data.get('title'),
        description=data.get('description'),
        type=data.get('type'),
        is_anonymous=data.get('is_anonymous', 'false').lower() == 'true',
        category=category
    )

    if category == 'specialized':
        if valid_from:
            new_test.valid_from = datetime.fromisoformat(valid_from)
        if valid_until:
            new_test.valid_until = datetime.fromisoformat(valid_until).replace(hour=23, minute=59, second=59)

    standard_questions = get_standard_questions(new_test.type)
    if standard_questions:
        for i, q_data in enumerate(standard_questions):
            new_question = Question(
                text=q_data['text'],
                question_type='scale',
                order=i,
                canonical_id=q_data['id'],
                config={"min": 1, "max": 5, "min_label": "Никогда", "max_label": "Всегда"}
            )
            new_test.questions.append(new_question)
    else:
        questions_json = data.get('questions')
        if not questions_json:
            return jsonify(message="Для пользовательского теста необходимо предоставить вопросы"), 400
        try:
            questions_data = json.loads(questions_json)
            for q_data in questions_data:
                new_question = Question(
                    text=q_data.get('text'),
                    question_type=q_data.get('question_type'),
                    order=q_data.get('order', 0),
                    config=q_data.get('config', {})
                )
                new_test.questions.append(new_question)
        except (json.JSONDecodeError, TypeError):
            return jsonify(message="Неверный формат JSON для вопросов"), 400
    
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename != '' and allowed_file(file.filename):
            filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
            upload_folder = os.path.join(current_app.root_path, '..', 'static', 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            file.save(os.path.join(upload_folder, filename))
            new_test.image_url = filename

    db.session.add(new_test)
    db.session.commit()
    return jsonify({"message": "Тест успешно создан", "id": new_test.id}), 201

@tests_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_tests():
    current_user_id = get_jwt_identity()
    now = datetime.now(timezone.utc)

    tests = Test.query.filter(
        (Test.category != 'specialized') | 
        ((Test.category == 'specialized') & (Test.valid_from <= now) & (Test.valid_until >= now))
    ).all()
    
    one_month_ago = now - timedelta(days=32)
    user_results = TestResult.query.filter(
        TestResult.user_id == current_user_id,
        TestResult.created_at >= one_month_ago
    ).all()

    response_data = []
    for t in tests:
        is_completed = False
        next_available_at = None 
        period_start = None

        if t.category == 'daily':
            period_start = now.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
        elif t.category == 'weekly':
            period_start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
        elif t.category == 'monthly':
            period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
        
        if period_start:
            last_result_in_period = None
            for result in user_results:
                if result.test_id == t.id and result.created_at.replace(tzinfo=timezone.utc) >= period_start:
                    if last_result_in_period is None or result.created_at > last_result_in_period.created_at:
                        last_result_in_period = result
            
            if last_result_in_period:
                is_completed = True
                completion_time = last_result_in_period.created_at.replace(tzinfo=timezone.utc)

                next_date = None
                if t.category == 'daily':
                    next_date = (completion_time.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1))
                elif t.category == 'weekly':
                    start_of_completion_week = completion_time - timedelta(days=completion_time.weekday())
                    next_date = (start_of_completion_week.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(weeks=1))
                elif t.category == 'monthly':
                    start_of_completion_month = completion_time.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                    next_month_year = start_of_completion_month.year
                    next_month_month = start_of_completion_month.month + 1
                    if next_month_month > 12:
                        next_month_month = 1
                        next_month_year += 1
                    next_date = start_of_completion_month.replace(year=next_month_year, month=next_month_month)
                
                if next_date and now < next_date:
                    next_available_at = next_date.isoformat()
                else:
                    is_completed = False

        response_data.append({
            "id": t.id, 
            "title": t.title, 
            "description": t.description, 
            "type": t.type,
            "category": t.category,
            "image_url": t.image_url,
            "next_available_at": next_available_at if is_completed else None,
            "points": get_points_for_category(t.category)
        })
        
    return jsonify(response_data)

@tests_bp.route('/<int:test_id>', methods=['GET'])
@jwt_required()
def get_test_details(test_id):
    test = Test.query.get_or_404(test_id)
    questions = sorted(test.questions, key=lambda q: q.order)
    return jsonify({
        "id": test.id,
        "title": test.title,
        "description": test.description,
        "type": test.type,
        "category": test.category,
        "questions": [
            {
                "id": q.id, 
                "text": q.text,
                "order": q.order,
                "question_type": q.question_type,
                "config": q.config
            } for q in questions
        ]
    })

@tests_bp.route('/<int:test_id>', methods=['PUT'])
@psychologist_required()
def update_test(test_id):
    test = Test.query.get_or_404(test_id)
    data = request.form
    
    test.title = data.get('title', test.title)
    test.description = data.get('description', test.description)
    test.is_anonymous = data.get('is_anonymous', str(test.is_anonymous)).lower() == 'true'
    test.category = data.get('category', test.category)

    if test.category == 'specialized':
        valid_from = data.get('valid_from')
        valid_until = data.get('valid_until')
        if valid_from:
            test.valid_from = datetime.fromisoformat(valid_from)
        if valid_until:
            test.valid_until = datetime.fromisoformat(valid_until).replace(hour=23, minute=59, second=59)

    if test.type not in ['CBI', 'OLBI']:
        questions_json = data.get('questions')
        if questions_json:
            try:
                Question.query.filter_by(test_id=test.id).delete()
                questions_data = json.loads(questions_json)
                for q_data in questions_data:
                    new_question = Question(
                        text=q_data.get('text'),
                        question_type=q_data.get('question_type'),
                        order=q_data.get('order', 0),
                        config=q_data.get('config', {})
                    )
                    test.questions.append(new_question)
            except (json.JSONDecodeError, TypeError):
                return jsonify(message="Неверный формат JSON для вопросов"), 400
    
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename != '' and allowed_file(file.filename):
            delete_image_file(test.image_url)
            filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
            upload_folder = os.path.join(current_app.root_path, '..', 'static', 'uploads')
            file.save(os.path.join(upload_folder, filename))
            test.image_url = filename
            
    db.session.commit()
    return jsonify({"message": "Тест успешно обновлен"}), 200

@tests_bp.route('/<int:test_id>', methods=['DELETE'])
@psychologist_required()
def delete_test(test_id):
    test = Test.query.get_or_404(test_id)
    delete_image_file(test.image_url)
    db.session.delete(test)
    db.session.commit()
    return jsonify({"message": "Тест успешно удален"}), 200

@tests_bp.route('/<int:test_id>/submit', methods=['POST'])
@jwt_required()
def submit_test(test_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    test = Test.query.get_or_404(test_id)
    data = request.get_json()
    answers_list = data.get('answers')
    if not answers_list:
        return jsonify(message="Ответы не предоставлены"), 400

    answers_dict = {item['question_id']: item['answer'] for item in answers_list}

    scores, interp, recs = {}, {}, ""
    
    user_profile = {
        "position": user.position,
        "experience": user.experience,
        "age": user.age,
        "is_manager": user.is_manager,
        "city": user.city,
        "additional_info": user.additional_info
    }

    try:
        if test.type in ['CBI', 'OLBI']:
            formatted_answers = {}
            for q in test.questions:
                if q.canonical_id and q.id in answers_dict:
                    formatted_answers[str(q.canonical_id)] = answers_dict[q.id]
            
            total_questions = len(get_standard_questions(test.type))
            if len(formatted_answers) < total_questions:
                return jsonify(message=f"Пожалуйста, ответьте на все вопросы. Ожидалось {total_questions} ответов, получено {len(formatted_answers)}."), 400

            if test.type == 'CBI':
                scores = score_cbi(formatted_answers)
                interp = interpret_cbi(scores)
                recs = recomendation(formatted_answers, "CBI", user_profile)
            elif test.type == 'OLBI':
                scores = score_olbi(formatted_answers)
                interp = interpret_olbi(scores)
                recs = recomendation(formatted_answers, "OLBI", user_profile)
        
        else:
            if len(answers_dict) < len(test.questions):
                 return jsonify(message=f"Пожалуйста, ответьте на все вопросы. Ожидалось {len(test.questions)} ответов, получено {len(answers_dict)}."), 400
            
            questions_map = {q.id: q.text for q in test.questions}
            prompt_data = {questions_map.get(qid): ans for qid, ans in answers_dict.items() if qid in questions_map}
            recs = recomendation(prompt_data, "small", user_profile)
    
    except ValueError as e:
        return jsonify(message=f"Ошибка обработки ответов: {str(e)}"), 400

    new_result = TestResult(
        user_id=current_user_id,
        test_id=test_id,
        answers=answers_list,
        scores=scores,
        interpretation=interp,
        recommendations=recs
    )
    db.session.add(new_result)
    
    points_to_add = get_points_for_category(test.category)
    
    user.points = (user.points or 0) + points_to_add
    
    try:
        db.session.flush()

        latest_results = TestResult.query.filter_by(user_id=current_user_id)\
            .order_by(TestResult.created_at.desc()).limit(5).all()

        history_summary = ""
        for res in reversed(latest_results):
            date_str = res.created_at.strftime('%d.%m.%Y')
            score_str = ""
            if res.scores and 'overall' in res.scores:
                score_str = f"Общий балл: {res.scores['overall']}/100."
            elif res.interpretation:
                score_str = ", ".join([f"{k.replace('_level', '')}: {v}" for k, v in res.interpretation.items() if k != 'note'])
            history_summary += f"- {date_str} ({res.test.title}): {score_str}\n"
        
        user_profile = {
            "position": user.position, "experience": user.experience, "is_manager": user.is_manager
        }

        summary_text = summary_recommendation(user_profile, history_summary)
        
        user.current_recommendation = summary_text
        user.recommendation_updated_at = datetime.now(timezone.utc)

    except Exception as e:
        print(f"Не удалось сгенерировать сводную рекомендацию после теста: {e}")

    db.session.commit()

    return jsonify({
        "message": "Тест успешно пройден!", 
        "resultId": new_result.id,
        "new_points": user.points
    })

@tests_bp.route('/results', methods=['GET'])
@jwt_required()
def get_user_results():
    user_id = get_jwt_identity()
    results = TestResult.query.filter_by(user_id=user_id).order_by(TestResult.created_at.desc()).all()
    
    output = []
    for result in results:
        output.append({
            'id': result.id,
            'test_id': result.test.id,
            'test_title': result.test.title,
            'created_at': result.created_at.replace(tzinfo=timezone.utc).isoformat(),
            'interpretation': result.interpretation,
            'recommendations': result.recommendations,
            'scores': result.scores
        })
    return jsonify(output)

@tests_bp.route('/summary-recommendation', methods=['GET'])
@jwt_required()
def get_summary_recommendation():
    user = User.query.get(get_jwt_identity())
    
    if not user.current_recommendation:
        return jsonify({"recommendation": "Пройдите свой первый тест, чтобы получить персональную рекомендацию!"})
    
    return jsonify({"recommendation": user.current_recommendation})