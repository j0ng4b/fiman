import os
from dotenv import load_dotenv

env_file = '.env'
if os.getenv('RUN_ENV') == 'development':
    env_file = '.env.development'
elif os.getenv('RUN_ENV') == 'production':
    env_file = '.env.production'


load_dotenv(env_file)


class Config:
    DEBUG = os.getenv('DEBUG', 'True') == 'True'

    SQLALCHEMY_DATABASE_URI = os.getenv('DB_URI', 'sqlite:///default.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

