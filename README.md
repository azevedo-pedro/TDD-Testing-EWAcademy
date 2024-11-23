# Car Rental Service

A Node.js application for managing car rentals with test-driven development using Mocha, Chai, Sinon, and Istanbul (NYC).

## 🚗 Project Overview

This project implements a car rental system with three main use cases:
1. Random car selection from a category
2. Price calculation with age-based tax
3. Rental transaction registration with localized formatting

## 🛠 Requirements

- Node.js 18.x
- npm 8.x or higher

## 📦 Dependencies

```json
{
  "engines": {
    "node": "18.x"
  },
  "dependencies": {
  },
  "devDependencies": {
    "mocha": "^8.4.0",
    "chai": "^4.5.0",
    "sinon": "^9.2.4",
    "nyc": "^15.1.0",
    "supertest": "^6.2.2"
  }
}
```

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/azevedo-pedro/TDD-Testing-EWAcademy.git

# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:cov
```

## 🧪 Testing Strategy

### Unit Tests

```javascript
// test/unit/carService.test.js
const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const CarService = require('../../src/service/carService');

describe('CarService Suite Tests', () => {
    let carService;
    let sandbox;

    beforeEach(() => {
        carService = new CarService();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should retrieve a random car from category', async () => {
        // Test implementation
    });
});
```

### Test Coverage

Using NYC (Istanbul) for code coverage:

```json
{
  "scripts": {
    "test:dev": "NODE_ENV=test npx mocha -w --parallel **/**/*.test.js",
    "test": "NODE_ENV=test npx mocha --parallel **/**/*.test.js",
    "test:cov": "NODE_ENV=test npx nyc npx mocha --exit --parallel **/**/*.test.js",
  },
  "nyc":{
    "branches": 80,
    "lines": 80,
    "functions": 80,
    "statements": 80,
    "checkCoverage": true,
    "exclude": [
        "src/repository/base/*.js",
        "test/"
    ],
    "reporter": [
        "html",
        "text"
    ]
}
}
```

## 📝 Use Cases Implementation

### Use Case 1: Getting Available Car

```javascript
class CarService {
    async getAvailableCar(carCategory) {
        const carId = this.chooseRandomCar(carCategory);
        const car = await this.carRepository.find(carId);
        return car;
    }
}
```

### Use Case 2: Calculate Final Price

```javascript
class CarService {
    calculateFinalPrice(costumer, carCategory, numberOfDays) {
        const { age } = costumer;
        const { price } = carCategory;
        const { then: tax } = this.taxesBasedOnAge.find(
        (tax) => age >= tax.from && age <= tax.to
        );
        const finalPrice = tax * price * numberOfDays;
        const formattedPrice = this.currencyFormat.format(finalPrice);
        return formattedPrice;
  }
}
```

### Use Case 3: Rent Registration

```javascript
class CarService {
    async rent(customer, carCategory, numberOfDays) {
        const car = await this.getAvailableCar(carCategory);
        const finalPrice = this.calculateFinalPrice(
        customer,
        carCategory,
        numberOfDays
        );
        const today = new Date();
        today.setDate(today.getDate() + numberOfDays);
        const options = { year: "numeric", month: "long", day: "numeric" };
        const dueDate = today.toLocaleString("pt-br", options);
        const transaction = new Transaction({
        customer,
        dueDate,
        car,
        amount: finalPrice,
        });
        return transaction;
  }
}
```

## 🌐 API Endpoints

### POST /getAvailableCar
Request:
```json
{
  "carCategory": {
    "id": "string",
    "name": "string",
    "carIds": ["string"],
    "price": "number"
  }
}
```

### POST /calculateFinalPrice
Request:
```json
{
  "customer": {
    "id": "string",
    "name": "string",
    "age": "number"
  },
  "carCategory": {
    "id": "string",
    "name": "string",
    "carIds": ["string"],
    "price": "number"
  },
  "numberOfDays": "number"
}
```

### POST /rent
Request:
```json
{
  "customer": {
    "id": "string",
    "name": "string",
    "age": "number"
  },
  "carCategory": {
    "id": "string",
    "name": "string",
    "carIds": ["string"],
    "price": "number"
  },
  "numberOfDays": "number"
}
```

## 📊 Test Coverage Requirements

- Statements: 80% minimum
- Branches: 80% minimum
- Functions: 80% minimum
- Lines: 80% minimum

Run coverage report:
```bash
npm run test:cov
```

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ✨ Acknowledgments

- [Mocha](https://mochajs.org/)
- [Chai](https://www.chaijs.com/)
- [Sinon](https://sinonjs.org/)
- [NYC](https://istanbul.js.org/)

## 📫 Contact

Pedro Azevedo - [My Blog](https://azevedo.dev) - azevedodev@outlook.com

Project Link: [https://github.com/azevedo-pedro/TDD-Testing-EWAcademy](https://github.com/azevedo-pedro/TDD-Testing-EWAcademy)