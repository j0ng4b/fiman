import importlib
import os
import os.path
from typing import Any, Dict, Optional

from flask import Flask, Blueprint
from kink import di


def create_app(test_config: Optional[Dict[str, Any]] = None) -> Flask:
    app = Flask(__name__.split('.')[0], instance_relative_config=True)

    # Load configurations
    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    # Create instance directory
    try:
        os.mkdir(app.instance_path)
    except OSError:
        pass

    # Bootstrap components
    bootstrap_di(app)
    bootstrap_blueprints(app)

    return app


def bootstrap_di(app: Flask) -> None:
    from .uow import IUnitOfWork

    # TODO: specify Unit Of Work implementation
    if app.config['TESTING']:
        di[IUnitOfWork] = None
    else:
        di[IUnitOfWork] = None

    bootstrap_services(app)


def bootstrap_services(app: Flask) -> None:
    services_root = os.path.join(app.root_path, 'services')
    for service_file in os.listdir(services_root):
        if service_file.startswith('__') \
                or not service_file.endswith('.py'):
            continue

        service_name = service_file.strip('.py')

        # Dynamic import the services
        service_module = importlib.import_module(
            f'.services.{service_name}', __package__
        )

        service_name = f'{service_name.title().replace('_', '')}Service'

        service_interface = service_module.__dict__[f'I{service_name}']
        service_implementation = service_module.__dict__[service_name]

        di[service_interface] = di[service_implementation]
        app.logger.info(f"Service {service_name} successfully registered")


def bootstrap_blueprints(app: Flask) -> None:
    api = Blueprint('api', __name__)

    controllers_root = os.path.join(app.root_path, 'controllers')
    for controller_file in os.listdir(controllers_root):
        if controller_file.startswith('__') \
                or not controller_file.endswith('.py'):
            continue

        controller_name = controller_file.strip('.py')

        # Dynamic import the route blueprint
        controller_module_name = f'.controllers.{controller_name}'
        controller_module = importlib.import_module(
            controller_module_name, __package__
        )

        blueprint_name = f'{controller_name}_bp'
        if blueprint_name in controller_module.__dict__:
            # Try to register the blueprint <blueprint_name>_bp
            api.register_blueprint(controller_module.__dict__[blueprint_name])
        else:
            app.logger.warning(f'Blueprint {blueprint_name} not found in {controller_module_name}')

    app.register_blueprint(api, url_prefix='/api')

