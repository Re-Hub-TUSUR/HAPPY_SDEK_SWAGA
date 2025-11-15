from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from sqlalchemy import func, case
from datetime import timezone

from .models import User, TestResult
from .extensions import db

analytics_bp = Blueprint('analytics', __name__)

def psychologist_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            user = User.query.get(get_jwt_identity())
            if user and user.role == 'psychologist':
                return fn(*args, **kwargs)
            else:
                return jsonify(message="Доступ разрешен только для психологов"), 403
        return decorator
    return wrapper

@analytics_bp.route('/users', methods=['GET'])
@psychologist_required()
def get_all_users():
    users = User.query.filter_by(role='user').order_by(User.last_name).all()
    user_list = [
        {"id": u.id, "name": f"{u.last_name} {u.first_name}"} for u in users
    ]
    return jsonify(user_list)

@analytics_bp.route('/overview', methods=['GET'])
@psychologist_required()
def get_analytics_overview():
    total_users = User.query.filter_by(role='user').count()
    total_results = TestResult.query.count()

    avg_score_query = db.session.query(func.avg(TestResult.scores['overall'].as_float())).scalar()
    average_score = round(avg_score_query / 10) if avg_score_query else 0

    level_distribution = db.session.query(
        TestResult.interpretation['overall_level'].as_string(),
        func.count(TestResult.id)
    ).group_by(TestResult.interpretation['overall_level'].as_string()).all()
    
    distribution = {level: count for level, count in level_distribution}

    overview_data = {
        "total_users": total_users,
        "total_tests_passed": total_results,
        "average_stress_level": average_score,
        "level_distribution": {
            "low": distribution.get('Низкий', 0),
            "medium": distribution.get('Умеренный', 0),
            "high": distribution.get('Высокий', 0),
        }
    }
    return jsonify(overview_data)

@analytics_bp.route('/user/<int:user_id>/results', methods=['GET'])
@psychologist_required()
def get_results_by_user_id(user_id):
    user = User.query.get_or_404(user_id)
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