const faker = require("faker");
const Car = require("./../src/entities/car");
const CarCategory = require("./../src/entities/carCategory");
const Costumer = require("./../src/entities/costumer");
const { join } = require("path");
const { writeFile } = require("fs/promises");
const seederBaseFolder = join(__dirname, "../", "database");
const ITEMS_AMOUNT = 2;
const carCategory = new CarCategory({
  id: faker.random.uuid(),
  name: faker.vehicle.type(),
  carIds: [],
  price: faker.finance.amount(20, 100),
});
const cars = [];
const costumers = [];
for (let index = 0; index <= ITEMS_AMOUNT; index++) {
  const car = new Car({
    id: faker.random.uuid(),
    name: faker.vehicle.model(),
    available: true,
    gasAvailable: true,
    releaseYear: faker.date.past().getFullYear(),
  });
  carCategory.carIds.push(car.id);
  cars.push(car);
  const costumer = new Costumer({
    id: faker.random.uuid(),
    name: faker.name.findName(),
    age: faker.random.number({ min: 18, max: 50 }),
  });
  costumers.push(costumer);
}
const write = (filename, data) =>
  writeFile(join(seederBaseFolder, filename), JSON.stringify(data));
(async () => {
  await write("cars.json", cars);
  await write("costumers.json", costumers);
  await write("carCategory.json", [carCategory]);
  console.log(cars);
  console.log(costumers);
  console.log(carCategory);
})();
