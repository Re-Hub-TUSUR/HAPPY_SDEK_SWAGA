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
from .analysis.llm_analyzer import recomendation
from .analysis.standard_tests import get_standard_questions

tests_bp = Blueprint('tests', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
            for result in user_results:
                if result.test_id == t.id and result.created_at.replace(tzinfo=timezone.utc) >= period_start:
                    is_completed = True
                    break

        if is_completed:
            if t.category == 'daily':
                next_date = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
                next_available_at = next_date.isoformat()
            elif t.category == 'weekly':
                next_date = (now + timedelta(weeks=1) - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
                next_available_at = next_date.isoformat()
            elif t.category == 'monthly':
                next_month_start = (now.replace(day=1) + timedelta(days=32)).replace(day=1)
                next_available_at = next_month_start.isoformat()

        response_data.append({
            "id": t.id, 
            "title": t.title, 
            "description": t.description, 
            "type": t.type,
            "category": t.category,
            "image_url": t.image_url,
            "next_available_at": next_available_at
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
    test = Test.query.get_or_404(test_id)
    data = request.get_json()
    answers_list = data.get('answers')
    if not answers_list:
        return jsonify(message="Ответы не предоставлены"), 400

    answers_dict = {item['question_id']: item['answer'] for item in answers_list}

    scores, interp, recs = {}, {}, ""
    
    if test.type in ['CBI', 'OLBI']:
        formatted_answers = {}
        for q in test.questions:
            if q.canonical_id and q.id in answers_dict:
                formatted_answers[str(q.canonical_id)] = answers_dict[q.id]
        
        if test.type == 'CBI':
            scores = score_cbi(formatted_answers)
            interp = interpret_cbi(scores)
            recs = recomendation(formatted_answers, "CBI")
        elif test.type == 'OLBI':
            scores = score_olbi(formatted_answers)
            interp = interpret_olbi(scores)
            recs = recomendation(formatted_answers, "OLBI")
    
    else:
        questions_map = {q.id: q.text for q in test.questions}
        prompt_data = {questions_map.get(qid): ans for qid, ans in answers_dict.items() if qid in questions_map}
        recs = recomendation(prompt_data, "small")

    new_result = TestResult(
        user_id=current_user_id,
        test_id=test_id,
        answers=answers_list,
        scores=scores,
        interpretation=interp,
        recommendations=recs
    )
    db.session.add(new_result)
    db.session.commit()

    return jsonify({"message": "Тест успешно пройден!", "resultId": new_result.id})

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
            'created_at': result.created_at.isoformat(),
            'interpretation': result.interpretation,
            'recommendations': result.recommendations,
            'scores': result.scores
        })
    return jsonify(output)