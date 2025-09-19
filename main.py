from flask import Flask, render_template, request, redirect, url_for, session

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Needed for session

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        if email and password:
            session['logged_in'] = True
            return redirect(url_for('index'))
        else:
            return render_template('login.html', error="Please enter email and password.")
    return render_template('login.html')

@app.route('/', methods=['GET'])
def index():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('index.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/habits', methods=['GET', 'POST'])
def habits():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    habits = []
    if request.method == 'POST':
        habit_name = request.form.get('habit_name')
        if habit_name:
            habits.append(habit_name)
    return render_template('habits.html', habits=habits)

@app.route('/sign-in', methods=['GET', 'POST'])
def sign_in():
    return render_template('sign-in.html')

@app.route('/streaks', methods=['GET', 'POST'])
def streaks():
    return render_template(
        'streaks.html',
        image_url="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
    )

@app.context_processor
def inject_logo():
    return dict(logo_url='/static/icons/logo.png')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)








