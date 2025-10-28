import { Page } from '@playwright/test';

export interface MockUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

export class MockSupabaseAuth {
  constructor(private page: Page) {}

  async mockUnauthenticated() {
    await this.page.route('**/auth/v1/**', async (route) => {
      const url = route.request().url();
      
      if (url.includes('/session')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: null,
            refresh_token: null,
            user: null,
          }),
        });
      } else {
        await route.continue();
      }
    });
  }

  async mockAuthenticatedUser(user: MockUser) {
    await this.page.route('**/auth/v1/**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      if (url.includes('/session') || url.includes('/user')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            user: {
              id: user.id,
              email: user.email,
              user_metadata: user.user_metadata || {},
              aud: 'authenticated',
              role: 'authenticated',
            },
          }),
        });
      } else if (method === 'POST' && url.includes('/token')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            token_type: 'bearer',
            expires_in: 3600,
            user: {
              id: user.id,
              email: user.email,
              user_metadata: user.user_metadata || {},
            },
          }),
        });
      } else {
        await route.continue();
      }
    });
  }

  async mockSignIn(email: string, shouldSucceed: boolean = true) {
    await this.page.route('**/auth/v1/token**', async (route) => {
      if (shouldSucceed) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            token_type: 'bearer',
            expires_in: 3600,
            user: {
              id: 'mock-user-id',
              email: email,
              user_metadata: {},
              aud: 'authenticated',
              role: 'authenticated',
            },
          }),
        });
      } else {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Invalid credentials',
            error_description: 'Invalid login credentials',
          }),
        });
      }
    });
  }

  async mockSupabaseAPIs() {
    await this.page.route('**/rest/v1/**', async (route) => {
      const url = route.request().url();
      
      if (url.includes('/profiles')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'mock-user-id',
              email: 'test@example.com',
              usage: 5,
              plan: 'Free',
            },
          ]),
        });
      } else if (url.includes('/activity')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });
  }

  async setupAuthenticatedSession(user?: MockUser) {
    const mockUser = user || {
      id: 'mock-user-id',
      email: 'test@example.com',
      user_metadata: { name: 'Test User' },
    };

    await this.mockAuthenticatedUser(mockUser);
    await this.mockSupabaseAPIs();

    await this.page.addInitScript((userData) => {
      localStorage.setItem(
        'sb-' + 'mock-project-ref' + '-auth-token',
        JSON.stringify({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          user: userData,
        })
      );
    }, mockUser);
  }
}
