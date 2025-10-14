from flask import Blueprint, render_template, request, redirect, url_for, session
from .models import Habit, Streak
from .db import db_session

routes = Blueprint('routes', __name__)

@routes.route('/habits', methods=['GET', 'POST'])
def habits():
    if not session.get('logged_in'):
        return redirect(url_for('routes.login'))
    
    if request.method == 'POST':
        habit_name = request.form.get('habit_name')
        if habit_name:
            new_habit = Habit(name=habit_name)
            db_session.add(new_habit)
            db_session.commit()
    
    habits = db_session.query(Habit).all()
    return render_template('habits.html', habits=habits)

@routes.route('/streaks', methods=['GET'])
def streaks():
    if not session.get('logged_in'):
        return redirect(url_for('routes.login'))
    
    streaks = db_session.query(Streak).all()
    return render_template('streaks.html', streaks=streaks)

@routes.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        if email and password:
            session['logged_in'] = True
            return redirect(url_for('routes.index'))
        else:
            return render_template('login.html', error="Please enter email and password.")
    return render_template('login.html')

@routes.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('routes.login'))

@routes.route('/')
def index():
    if not session.get('logged_in'):
        return redirect(url_for('routes.login'))
    return render_template('index.html')