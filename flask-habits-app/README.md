# Flask Habits App

## Overview
Flask Habits App is a web application built using Flask that allows users to track their habits. Users can add new habits, view their existing habits, and see their progress over time.

## Project Structure
```
flask-habits-app
├── app.py                # Main entry point of the Flask application
├── models.py             # SQLAlchemy models for the application
├── requirements.txt      # List of dependencies
├── templates             # HTML templates
│   └── index.html        # Main page template
├── static                # Static files (e.g., images, CSS)
│   └── icons
│       └── logo.png      # Logo image
└── README.md             # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd flask-habits-app
   ```

2. **Create a virtual environment:**
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies:**
   ```
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```
   python app.py
   ```

5. **Access the application:**
   Open your web browser and go to `http://127.0.0.1:5000`.

## Usage
- Users can add new habits using the form on the main page.
- Existing habits will be displayed below the form.
- The application stores habits in a SQL database, ensuring persistence across sessions.

## Dependencies
- Flask
- Flask-SQLAlchemy

## License
This project is licensed under the MIT License.