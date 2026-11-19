import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('SauceDemo E2E Tests', () => {
  
  test('Login fallido - Usuario bloqueado', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('locked_out_user', 'secret_sauce');
    await expect(loginPage.errorMessage).toContainText('Sorry, this user has been locked out.');
  });

  test('Flujo de compra exitoso', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const checkoutPage = new CheckoutPage(page);

    // 1. Inicio de sesión correcto
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    
    // 2. Añadir producto al carrito
    await inventoryPage.addBackpackToCart();
    await inventoryPage.goToCart();
    
    // 3. Completar la compra
    await checkoutPage.startCheckout();
    await checkoutPage.fillInfo('Noyka', 'Sierra', '12345');
    await checkoutPage.finishOrder();
    
    // 4. Verificar que la compra se completó
    await expect(checkoutPage.successHeader).toHaveText('Thank you for your order!');
  });
});