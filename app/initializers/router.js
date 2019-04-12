export function initialize(application) {
  application.inject('route', 'router', 'router:main');
  application.inject('component', 'router', 'router:main');
  application.inject('controller', 'router', 'router:main');
}

export default {
  name: 'router',
  initialize
};

