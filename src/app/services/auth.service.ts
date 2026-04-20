import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  twitterHandle?: string;
  twitterId?: string;
  verified?: boolean;
  boost?: number;
  balance?: number;
}

// Twitter OAuth Configuration
const TWITTER_CLIENT_ID = 'ZUhBODVVZF82WFNtSC1FdmNDWjI6MTpjaQ'; // Replace with your Twitter API Key
const TWITTER_REDIRECT_URI = 'http://127.0.0.1:4201/auth/twitter/callback';
const TWITTER_SCOPES = ['users.read', 'tweet.read', 'follows.read'];

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getUserFromStorage()
  );
  public currentUser$ = this.currentUserSubject.asObservable();
  private twitterAuthState = Math.random().toString(36).substring(7);
  private backendUrl = 'http://localhost:3000'; // Your NestJS backend URL

  constructor(private http: HttpClient, private router: Router) {
    // Twitter callback is now handled by TwitterCallbackComponent
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  private saveUserToStorage(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User> {
    return new Observable((observer) => {
      setTimeout(() => {
        if (email && password.length >= 6) {
          const user: User = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            verified: false,
            boost: 0,
            balance: 0,
          };
          this.saveUserToStorage(user);
          this.currentUserSubject.next(user);
          observer.next(user);
          observer.complete();
        } else {
          observer.error({ message: 'Invalid email or password' });
        }
      }, 500);
    });
  }

  signup(email: string, password: string): Observable<User> {
    return new Observable((observer) => {
      setTimeout(() => {
        if (email && password.length >= 8) {
          const user: User = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            verified: false,
            boost: 0,
            balance: 0,
          };
          this.saveUserToStorage(user);
          this.currentUserSubject.next(user);
          observer.next(user);
          observer.complete();
        } else {
          observer.error({ message: 'Invalid email or password too short' });
        }
      }, 500);
    });
  }

  async initiateTwitterAuth(): Promise<void> {
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);

    sessionStorage.setItem('twitter_code_verifier', codeVerifier);
    sessionStorage.setItem('twitter_auth_state', this.twitterAuthState);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: TWITTER_CLIENT_ID,
      redirect_uri: TWITTER_REDIRECT_URI,
      scope: TWITTER_SCOPES.join(' '),
      state: this.twitterAuthState,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
    window.location.href = authUrl;
  }

  exchangeCodeForToken(code: string): Observable<User> {
    const codeVerifier = sessionStorage.getItem('twitter_code_verifier');

    if (!codeVerifier) {
      console.error('Missing code verifier in sessionStorage');
      return new Observable((observer) => {
        observer.error({ message: 'Missing code verifier' });
      });
    }

    return new Observable((observer) => {
      this.http
        .post<{ user: any; success: boolean }>(
          `${this.backendUrl}/auth/twitter/callback`,
          {
            code,
            codeVerifier,
          }
        )
        .subscribe({
          next: (response) => {
            if (response.success && response.user) {
              const twitterUser: User = {
                id: Math.random().toString(36).substr(2, 9),
                email: `twitter_${response.user.id}@ungodly.achv`,
                twitterHandle: `@${response.user.username}`,
                twitterId: response.user.id,
                verified: response.user.verified || false,
                boost: 10,
                balance: 5,
              };

              this.saveUserToStorage(twitterUser);
              this.currentUserSubject.next(twitterUser);
              observer.next(twitterUser);
              observer.complete();

              sessionStorage.removeItem('twitter_code_verifier');
              sessionStorage.removeItem('twitter_auth_state');
            } else {
              observer.error({ message: 'Invalid response from backend' });
            }
          },
          error: (error) => {
            console.error('Backend OAuth exchange failed:', error);
            observer.error({
              message: error.error?.message || 'Failed to authenticate with Twitter',
            });
          },
        });
    });
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.arrayToBase64Url(array);
  }

  private generateCodeChallenge(codeVerifier: string): string {
    const buffer = new TextEncoder().encode(codeVerifier);
    return crypto.subtle.digest('SHA-256', buffer).then((hash) => {
      return this.arrayToBase64Url(new Uint8Array(hash));
    }) as any;
  }

  private arrayToBase64Url(array: Uint8Array): string {
    const binString = String.fromCharCode(...array);
    return btoa(binString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  signupWithTwitter(): Observable<User> {
    return new Observable((observer) => {
      const twitterUser = this.currentUserSubject.value;
      if (twitterUser?.twitterId) {
        observer.next(twitterUser);
        observer.complete();
      } else {
        observer.error({ message: 'Twitter authentication required' });
      }
    });
  }

  updateUser(user: User): void {
    this.saveUserToStorage(user);
    this.currentUserSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
