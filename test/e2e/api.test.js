const { describe, it, before, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const path = require('path');
const CarService = require('./../../src/service/carService');
const Customer = require('./../../src/entities/customer');
const Car = require('./../../src/entities/car');

const SERVER_TEST_PORT = 4000;

const mocks = {
    validCar: require('./../mocks/valid-car.json'),
    validCarCategory: require('./../mocks/valid-carCategory.json'),
    validCustomer: require('./../mocks/valid-customer.json'),
};

describe('End2End API Suite Test', () => {
    let app;
    let server;
    let sandbox;
    let carService;

    before(async () => {
        const api = require('./../../src/api');
        carService = new CarService({
            cars: path.resolve(path.join(__dirname, '../', '../', 'database', 'cars.json'))
        });
        const instance = api({ carService });

        app = instance;
        server = instance.initialize(SERVER_TEST_PORT);
    });

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    after(() => {
        server.close();
    });

    describe('POST /calculateFinalPrice', () => {
        it('should calculate final amount in BRL given carCategory, customer and numberOfDays', async () => {
            const payload = {
                customer: { ...mocks.validCustomer, age: 50 },
                carCategory: { ...mocks.validCarCategory, price: 37.6 },
                numberOfDays: 5
            };

            const response = await request(server)
                .post('/calculateFinalPrice')
                .send(payload);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('result');
            expect(response.body.result).to.equal(app.carService.currencyFormat.format(244.40));
        });
    });

    describe('POST /getAvailableCar', () => {
        it('should return an available car given a carCategory', async () => {
            const car = mocks.validCar;
            const carCategory = {
                ...mocks.validCarCategory,
                carIds: [car.id]
            };

            const response = await request(server)
                .post('/getAvailableCar')
                .send(carCategory);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('result');
            expect(response.body.result).to.deep.equal(car);
        });


    });

    describe('POST /rent', () => {
        it('should return a transaction receipt given customer and carCategory', async () => {
            const payload = {
                customer: { ...mocks.validCustomer, age: 20 },
                carCategory: {
                    ...mocks.validCarCategory,
                    price: 37.6,
                    carIds: [mocks.validCar.id]
                },
                numberOfDays: 5
            };

            const response = await request(server)
                .post('/rent')
                .send(payload);
            const expected = carService.currencyFormat.format(206.80);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('result');

            const { result } = response.body;
            const expectedCar = new Car(result.car)
            expect(result).to.have.all.keys(['customer', 'car', 'amount', 'dueDate']);
            expect(result.customer).to.deep.equal(new Customer(payload.customer));
            expect(result.amount).to.be.deep.equal(expected);
            expect(result.car).to.be.deep.eq(expectedCar)
            expect(new Date(result.dueDate)).to.be.instanceOf(Date);
        });
    });
});