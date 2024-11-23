const http = require('http');
const { join } = require('path');

const DEFAULT_PORT = 3000;
const DEFAULT_HEADERS = {
    'Content-Type': 'application/json'
};

const defaultFactory = () => ({
    carService: new (require('./service/carService'))({
        cars: join(__dirname, '../database/cars.json')
    })
});

class Api {
    constructor(dependencies = defaultFactory()) {
        this.carService = dependencies.carService;
    }

    async parseJSON(request) {
        const data = await new Promise((resolve) => {
            let body = '';
            request.on('data', chunk => body += chunk);
            request.on('end', () => resolve(body));
        });

        return JSON.parse(data);
    }

    sendResponse(response, { statusCode = 200, data = null, error = null }) {
        response.writeHead(statusCode, DEFAULT_HEADERS);
        response.end(JSON.stringify(error ? { error } : { result: data }));
    }

    async handleRent(request, response) {
        try {
            const { customer, carCategory, numberOfDays } = await this.parseJSON(request);

            if (!customer || !carCategory || !numberOfDays) {
                return this.sendResponse(response, {
                    statusCode: 400,
                    error: 'Missing required fields'
                });
            }

            const result = await this.carService.rent(
                customer,
                carCategory,
                numberOfDays
            );

            return this.sendResponse(response, { data: result });
        } catch (error) {
            console.error('Error in /rent:', error);
            return this.sendResponse(response, {
                statusCode: 500,
                error: 'Internal server error'
            });
        }
    }

    async handleCalculateFinalPrice(request, response) {
        try {
            const { customer, carCategory, numberOfDays } = await this.parseJSON(request);

            if (!customer || !carCategory || !numberOfDays) {
                return this.sendResponse(response, {
                    statusCode: 400,
                    error: 'Missing required fields'
                });
            }

            const result = await this.carService.calculateFinalPrice(
                customer,
                carCategory,
                numberOfDays
            );

            return this.sendResponse(response, { data: result });
        } catch (error) {
            console.error('Error in /calculateFinalPrice:', error);
            return this.sendResponse(response, {
                statusCode: 500,
                error: 'Internal server error'
            });
        }
    }

    async handleGetAvailableCar(request, response) {
        try {
            const carCategory = await this.parseJSON(request);

            if (!carCategory || !carCategory.carIds) {
                return this.sendResponse(response, {
                    statusCode: 400,
                    error: 'Invalid car category'
                });
            }

            const result = await this.carService.getAvailableCar(carCategory);

            if (!result) {
                return this.sendResponse(response, {
                    statusCode: 404,
                    error: 'No cars available'
                });
            }

            return this.sendResponse(response, { data: result });
        } catch (error) {
            console.error('Error in /getAvailableCar:', error);
            return this.sendResponse(response, {
                statusCode: 500,
                error: 'Internal server error'
            });
        }
    }

    handleDefault(request, response) {
        return this.sendResponse(response, {
            statusCode: 404,
            error: 'Route not found'
        });
    }

    routes() {
        return {
            '/rent:post': this.handleRent.bind(this),
            '/calculateFinalPrice:post': this.handleCalculateFinalPrice.bind(this),
            '/getAvailableCar:post': this.handleGetAvailableCar.bind(this),
            default: this.handleDefault.bind(this)
        };
    }

    handler(request, response) {
        const { url, method } = request;
        const routeKey = `${url}:${method.toLowerCase()}`;
        const routes = this.routes();
        const chosen = routes[routeKey] || routes.default;

        return chosen(request, response);
    }

    initialize(port = DEFAULT_PORT) {
        const server = http.createServer(this.handler.bind(this));

        server.listen(port, () => {
            if (process.env.NODE_ENV !== 'test') {
                console.log(`Server running at http://localhost:${port}`);
            }
        });

        return server;
    }
}

// Only create instance if not being required as a module
if (require.main === module) {
    const api = new Api();
    api.initialize();
}

module.exports = (dependencies) => new Api(dependencies);