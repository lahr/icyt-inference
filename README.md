[![Unit tests](https://github.com/lahr/icyt-inference/actions/workflows/main.yml/badge.svg)](https://github.com/lahr/icyt-inference/actions)
[![codecov](https://codecov.io/gh/lahr/icyt-inference/branch/main/graph/badge.svg?token=ER8VUK91DK)](https://codecov.io/gh/lahr/icyt-inference)

# iCyt Inference

![Demo](https://github.com/lahr/icyt-inference/blob/assets/demo.gif?raw=true)

## Development

You need to convert your TensorFlow or Keras model with the [command line utility](https://www.tensorflow.org/js/guide/conversion) to use it with TensorFlow.js.
The converted model must be placed in the `src/assets/models` directory.

### npm

- Build: `npm run build`
- Serve: `npm start`. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the
  source files.
- Tests: `npm test`
- Linting: `npm lint`

### Docker

1. Build the image: `docker build -t icyt-inference .`
2. Start the container: `docker run --rm -p 4400:80 icyt-inference`
