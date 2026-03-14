# 🚀 Quick Start Guide

## One-Command Setup (After Creating Files)

```bash
# 1. Create and navigate to project folder
mkdir optiplus && cd optiplus

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install Flask==3.0.0 Werkzeug==3.0.1

# 5. Create templates folder
mkdir templates

# 6. Add your files:
# - app.py (root)
# - templates/index.html
# - templates/profile.html

# 7. Run the application
python app.py
```

## 📂 File Locations

```
optiplus/
├── app.py                    ← Place here
├── requirements.txt          ← Place here
├── database.db              ← Auto-created
└── templates/
    ├── index.html           ← Place here
    └── profile.html         ← Place here
```

## ✅ Test It

1. Open browser: `http://localhost:5000`
2. Register a new user
3. Login with created credentials
4. View/Update profile
5. Logout

## 🔑 Default Configuration

- **Host**: `0.0.0.0` (accessible from network)
- **Port**: `5000`
- **Debug Mode**: `True` (disable in production!)
- **Database**: `database.db` (SQLite)
- **Session Secret**: Change in `app.py` for production!

## 🎯 Key Features Working

✅ User Registration with Password Hashing     
✅ Secure Login with Session Management  
✅ Profile Image Upload (Base64)  
✅ Eye Prescription Tracking  
✅ Profile Updates  
✅ Logout Functionality

## 🔒 Security Notes

⚠️ **Before Production:**

1. Change `app.secret_key` in `app.py`
2. Set `debug=False`
3. Use environment variables for secrets
4. Add HTTPS
5. Implement rate limiting
6. Add CSRF protection

## 📱 Access Points

- **Home/Login**: http://localhost:5000/
- **Profile**: http://localhost:5000/profile
- **Logout**: http://localhost:5000/logout

---

**That's it! Your authentication system is ready to use!** 🎉
