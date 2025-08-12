FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/data && chmod 777 /app/data

EXPOSE 8000

CMD ["gunicorn", "-b", "0.0.0.0:8000", "app:app", "--workers=4", "--threads=4", "--timeout=0", "--log-level=info", "--access-logfile=-", "--error-logfile=-"]
