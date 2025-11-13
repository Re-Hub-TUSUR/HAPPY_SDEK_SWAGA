from flask import jsonify, Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User
from app.extensions import db, jwt

main_bp = Blueprint('main', __name__)

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
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user:
        return jsonify(id=user.id, name=user.name, email=user.email, role=user.role)
    return jsonify(message="Пользователь не найден"), 404

@main_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify(message="Пользователь не найден"), 404

    data = request.get_json()
    new_name = data.get('name')

    if not new_name or len(new_name) < 2:
        return jsonify(message="Имя должно содержать минимум 2 символа"), 400

    user.name = new_name
    db.session.commit()

    return jsonify(id=user.id, name=user.name, email=user.email), 200