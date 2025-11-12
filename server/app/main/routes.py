from flask import jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User

main_bp = Blueprint('main', __name__)

@main_bp.route("/health")
def health_check():
    return jsonify(status="ok", message="Бэкенд запущен и работает!")

@main_bp.route("/profile")
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user:
        return jsonify({'id': user.id, 'name': user.name, 'email': user.email})
    return jsonify({'message': "Пользователь не найден"}), 404
