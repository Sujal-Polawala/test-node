const middy = require('middy');
const { initDB } = require('../middleware/initDb');
const { errorHandler } = require('../middleware/errorHandler');
const { creatTestDoc } = require('../repository/test.repository');
const { success } = require('../utils/responses');

const testHandler = async () => {
  await creatTestDoc({
    name: 'test',
    title: 'test',
  });

  return success({ message: 'Test document created successfully.' });
};

module.exports.handler = middy(testHandler).use(initDB).use(errorHandler);
// const middy = require('middy');
// const { initDB } = require('../middleware/initDb');
// const { errorHandler } = require('../middleware/errorHandler');
// const { getWeather, togglePin } = require('../routes/weather');

// exports.handler = middy(async (event) => {
//   const { httpMethod, path } = event;

//   if (httpMethod === 'GET' && path === '/api/weather') {
//     return await getWeather(event);
//   } else if (httpMethod === 'POST' && path === '/api/weather/togglePin') {
//     const { providerName } = JSON.parse(event.body || '{}');
//     return await togglePin(providerName);
//   } else {
//     return {
//       statusCode: 404,
//       body: JSON.stringify({ message: 'Route not found' }),
//     };
//   }
// })
//   .use(initDB)
//   .use(errorHandler);
