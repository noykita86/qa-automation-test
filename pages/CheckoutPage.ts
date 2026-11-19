import { Page, Locator } from '@playwright/test';

export class CheckoutPage { // <-- Asegúrate de que diga "export class"
  readonly page: Page;
  readonly checkoutBtn: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly zipCode: Locator;
  readonly continueBtn: Locator;
  readonly finishBtn: Locator;
  readonly successHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutBtn = page.getByRole('button', { name: 'Checkout' });
    this.firstName = page.getByPlaceholder('First Name');
    this.lastName = page.getByPlaceholder('Last Name');
    this.zipCode = page.getByPlaceholder('Zip/Postal Code');
    this.continueBtn = page.getByRole('button', { name: 'Continue' });
    this.finishBtn = page.getByRole('button', { name: 'Finish' });
    this.successHeader = page.locator('.complete-header');
  }

  async startCheckout() {
    await this.checkoutBtn.click();
  }

  async fillInfo(fName: string, lName: string, zip: string) {
    await this.firstName.fill(fName);
    await this.lastName.fill(lName);
    await this.zipCode.fill(zip);
    await this.continueBtn.click();
  }

  async finishOrder() {
    await this.finishBtn.click();
  }
}