import { createDemoUser, demoInventory, demoProducts } from '../data/demo-data';

async function main() {
  const user = await createDemoUser();
  console.log('Seed data preview');
  console.log(JSON.stringify({ user, demoProducts, demoInventory }, null, 2));
}

void main();
