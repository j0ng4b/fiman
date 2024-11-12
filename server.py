from app import create_app
from app.config import Config


def main() -> None:
    if not Config.DEBUG:
        return

    app = create_app()
    app.run(debug=True)


if __name__ == '__main__':
    main()

