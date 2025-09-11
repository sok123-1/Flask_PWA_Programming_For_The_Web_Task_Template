from flask import Flask, render_template, request, redirect, url_for, session
import database_manager as dbHandler

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Needed for session

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # For demo: accept any email/password
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
    return render_template('habits.html')

@app.route('/sign-in', methods=['GET', 'POST'])
def sign_in():
    return render_template('sign-in.html')

@app.route('/streaks')
def streaks():
    return render_template('streaks.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)








