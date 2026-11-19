import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config(); // Nos aseguramos de leer el .env

test.describe.serial('Restful-Booker API CRUD Tests', () => {
  // Aviso Senior: Evitamos que las pruebas de API corran en Firefox (ahorramos tiempo)
  test.skip(({ browserName }) => browserName !== 'chromium', 'API tests run only once');

  let token: string;
  let bookingId: number;
  // Usamos fallback por si el .env falla
  const apiUrl = process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com';

  test('1. Autenticación - Obtener Token', async ({ request }) => {
    const response = await request.post(`${apiUrl}/auth`, {
      data: {
        username: process.env.API_USER || 'admin',
        password: process.env.API_PASS || 'password123'
      }
    });

    // Comprobar código de estado
    expect(response.status()).toBe(200);
    
    // Comprobar contenido de la respuesta
    const body = await response.json();
    expect(body).toHaveProperty('token');
    token = body.token;
  });

  test('2. Crear Reserva (POST)', async ({ request }) => {
    const response = await request.post(`${apiUrl}/booking`, {
      data: {
        firstname: 'Noyka',
        lastname: 'Sierra',
        totalprice: 150,
        depositpaid: true,
        bookingdates: {
          checkin: '2024-01-01',
          checkout: '2024-01-05'
        },
        additionalneeds: 'Breakfast'
      }
    });

    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.booking.firstname).toBe('Noyka');
    expect(body.booking.totalprice).toBe(150);
    
    // Guardamos el ID para las siguientes pruebas
    bookingId = body.bookingid;
  });

  test('3. Consultar Reserva (GET)', async ({ request }) => {
    const response = await request.get(`${apiUrl}/booking/${bookingId}`);

    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.firstname).toBe('Noyka');
    expect(body.lastname).toBe('Sierra');
  });

  test('4. Modificar Reserva (PUT)', async ({ request }) => {
    const response = await request.put(`${apiUrl}/booking/${bookingId}`, {
      headers: {
        // Autenticación por token (Restful-Booker lo pide en la Cookie)
        Cookie: `token=${token}` 
      },
      data: {
        firstname: 'Noyka',
        lastname: 'Sierra Martinez', // Cambiamos el apellido
        totalprice: 200,             // Cambiamos el precio
        depositpaid: true,
        bookingdates: {
          checkin: '2024-01-01',
          checkout: '2024-01-05'
        },
        additionalneeds: 'Dinner'
      }
    });

    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.lastname).toBe('Sierra Martinez'); // Verificamos el cambio
    expect(body.totalprice).toBe(200);
  });

  test('5. Borrar Reserva (DELETE)', async ({ request }) => {
    const response = await request.delete(`${apiUrl}/booking/${bookingId}`, {
      headers: {
        Cookie: `token=${token}` 
      }
    });

    // Restful-Booker devuelve 201 Created cuando borras exitosamente
    expect(response.status()).toBe(201);
  });
    test('6. Verificar que la reserva fue borrada (GET -> 404)', async ({ request }) => {
    const response = await request.get(`${apiUrl}/booking/${bookingId}`);
    // Si la reserva se borró de verdad, debe dar 404
    //console.log('Código de estado recibido al buscar reserva borrada:', response.status());
    expect(response.status()).toBe(404); 
  });
});