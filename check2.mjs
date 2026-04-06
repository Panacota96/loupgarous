import { chromium } from 'playwright';
const browser = await chromium.launch({ headless:true });
const page = await browser.newPage();
page.on('console', msg => console.log('console', msg.type(), msg.text()));
page.on('pageerror', err => console.log('pageerror', err.message, err.stack));
await page.goto('http://localhost:4173/');
const roles=['werewolf','werewolf','villager','villager','villager','villager'];
for(let i=0;i<roles.length;i++){
  const row = page.getByTestId(`player-row-${i}`);
  await row.getByTestId('role-select').selectOption(roles[i]);
}
console.log('start disabled?', await page.isDisabled('[data-testid=start-game]'));
await page.click('[data-testid=start-game]');
await page.waitForTimeout(1000);
console.log('phase counts', await page.locator('[data-testid=night-phase]').count(), await page.locator('[data-testid=day-phase]').count());
await browser.close();
