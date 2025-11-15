from flask import jsonify, Blueprint, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User
from app.extensions import db, jwt
import os
import uuid
from werkzeug.utils import secure_filename

main_bp = Blueprint('main', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def delete_image_file(filename):
    if filename and filename != 'default_avatar.png':
        try:
            upload_folder = os.path.join(current_app.root_path, '..', 'static', 'uploads')
            os.remove(os.path.join(upload_folder, filename))
        except OSError as e:
            print(f"Ошибка при удалении файла {filename}: {e}")

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"--- SERVER ERROR: Invalid Token received. Reason: {error} ---")
    return jsonify(message=f"Неверный или поврежденный токен: {error}"), 422

@jwt.unauthorized_loader
def missing_token_callback(error):
    print(f"--- SERVER ERROR: Missing Authorization Header. Details: {error} ---")
    return jsonify(message="Отсутствует токен доступа"), 401

@main_bp.route("/health")
def health_check():
    return jsonify(status="ok", message="Бэкенд запущен и работает!")

@main_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user = User.query.get(get_jwt_identity())
    if user:
        return jsonify(
            id=user.id,
            username=user.username,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            patronymic=user.patronymic,
            role=user.role, 
            avatar_url=user.avatar_url,
            is_manager=user.is_manager,
            department=user.department,
            gender=user.gender,
            city=user.city,
            position=user.position,
            experience=user.experience,
            age=user.age,
            points=user.points,
            additional_info=user.additional_info
        )
    return jsonify(message="Пользователь не найден"), 404

@main_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify(message="Пользователь не найден"), 404

    data = request.get_json()
    
    new_name = data.get('name')
    if new_name:
        if len(new_name) < 2:
            return jsonify(message="Имя должно содержать минимум 2 символа"), 400
        user.name = new_name
        
    new_email = data.get('email')
    if new_email:
        if User.query.filter(User.email == new_email, User.id != user.id).first():
            return jsonify(message="Этот email уже используется"), 409
        user.email = new_email

    db.session.commit()
    return jsonify(id=user.id, name=user.name, email=user.email, role=user.role, avatar_url=user.avatar_url), 200

@main_bp.route("/profile/avatar", methods=["POST"])
@jwt_required()
def upload_avatar():
    user = User.query.get(get_jwt_identity())
    if 'image' not in request.files:
        return jsonify(message="Файл не найден"), 400
    file = request.files['image']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify(message="Некорректный тип файла"), 400

    delete_image_file(user.avatar_url)
    filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
    upload_folder = os.path.join(current_app.root_path, '..', 'static', 'uploads')
    file.save(os.path.join(upload_folder, filename))
    user.avatar_url = filename
    db.session.commit()
    
    return jsonify(
        id=user.id, 
        username=user.username, 
        email=user.email, 
        role=user.role, 
        avatar_url=user.avatar_url,
        first_name=user.first_name,
        last_name=user.last_name,
        patronymic=user.patronymic
    ), 200

@main_bp.route("/profile/password", methods=["PUT"])
@jwt_required()
def change_password():
    user = User.query.get(get_jwt_identity())
    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')

    if not user or not user.check_password(current_password):
        return jsonify(message="Текущий пароль неверен"), 400
    if not new_password or len(new_password) < 6:
        return jsonify(message="Новый пароль должен содержать минимум 6 символов"), 400

    user.set_password(new_password)
    db.session.commit()
    return jsonify(message="Пароль успешно изменен"), 200