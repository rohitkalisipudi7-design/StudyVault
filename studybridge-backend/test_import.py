import traceback
try:
    from app.main import app
    print("Successfully imported app")
except Exception as e:
    with open("error_trace.txt", "w", encoding="utf-8") as f:
        traceback.print_exc(file=f)
