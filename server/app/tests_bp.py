from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
import os
import uuid
import json
from werkzeug.utils import secure_filename
from .models import User, Test, Question, TestResult
from .extensions import db
from .analysis.burnout_scores import score_cbi, interpret_cbi, score_olbi, interpret_olbi
from .analysis.llm_analyzer import recomendation

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
    """Безопасно удаляет файл изображения, если это не файл по умолчанию."""
    if filename and filename != 'default_test_image.png':
        try:
            upload_folder = os.path.join(current_app.root_path, '..', 'static', 'uploads')
            os.remove(os.path.join(upload_folder, filename))
        except OSError as e:
            print(f"Ошибка при удалении файла {filename}: {e}")

@tests_bp.route('/', methods=['POST'])
@psychologist_required()
def create_test():
    title = request.form.get('title')
    description = request.form.get('description')
    type = request.form.get('type')
    questions_json = request.form.get('questions')
    questions = json.loads(questions_json)
    
    new_test = Test(title=title, description=description, type=type)

    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename != '' and allowed_file(file.filename):
            filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
            upload_folder = os.path.join(current_app.root_path, '..', 'static', 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            file.save(os.path.join(upload_folder, filename))
            new_test.image_url = filename
    
    for q_text in questions:
        new_test.questions.append(Question(text=q_text))
        
    db.session.add(new_test)
    db.session.commit()
    return jsonify({"message": "Тест успешно создан", "id": new_test.id}), 201

@tests_bp.route('/<int:test_id>', methods=['PUT'])
@psychologist_required()
def update_test(test_id):
    test = Test.query.get_or_404(test_id)
    
    test.title = request.form.get('title', test.title)
    test.description = request.form.get('description', test.description)
    test.type = request.form.get('type', test.type)

    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename != '' and allowed_file(file.filename):
            delete_image_file(test.image_url)
            filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
            upload_folder = os.path.join(current_app.root_path, '..', 'static', 'uploads')
            file.save(os.path.join(upload_folder, filename))
            test.image_url = filename
    
    questions_json = request.form.get('questions')
    if questions_json:
        Question.query.filter_by(test_id=test.id).delete()
        new_questions = json.loads(questions_json)
        for q_text in new_questions:
            test.questions.append(Question(text=q_text))
            
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

@tests_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_tests():
    tests = Test.query.all()
    return jsonify([{"id": t.id, "title": t.title, "description": t.description, "type": t.type, "image_url": t.image_url} for t in tests])

@tests_bp.route('/<int:test_id>', methods=['GET'])
@jwt_required()
def get_test_details(test_id):
    test = Test.query.get_or_404(test_id)
    return jsonify({
        "id": test.id,
        "title": test.title,
        "description": test.description,
        "questions": [{"id": q.id, "text": q.text} for q in test.questions]
    })

@tests_bp.route('/<int:test_id>/submit', methods=['POST'])
@jwt_required()
def submit_test(test_id):
    current_user_id = get_jwt_identity()
    test = Test.query.get_or_404(test_id)
    data = request.get_json()
    answers = data.get('answers')

    questions_ordered = sorted(test.questions, key=lambda q: q.id)
    formatted_answers = {str(i + 1): answers.get(str(q.id)) for i, q in enumerate(questions_ordered)}

    scores, interp, recs = {}, {}, ""
    
    if test.type == 'CBI':
        scores = score_cbi(formatted_answers)
        interp = interpret_cbi(scores)
        recs = recomendation(formatted_answers, "CBI")
    elif test.type == 'OLBI':
        scores = score_olbi(formatted_answers)
        interp = interpret_olbi(scores)
        recs = recomendation(formatted_answers, "OLBI")
    elif test.type == 'small':
        recs = recomendation(answers, "small")
    
    new_result = TestResult(
        user_id=current_user_id,
        test_id=test_id,
        scores=scores,
        interpretation=interp,
        recommendations=recs
    )
    db.session.add(new_result)
    db.session.commit()

    return jsonify({
        "message": "Тест успешно пройден!",
        "resultId": new_result.id
    })