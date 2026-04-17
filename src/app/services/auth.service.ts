import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  verified?: boolean;
  boost?: number;
  balance?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getUserFromStorage()
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

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
      // Simulate API call
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
      // Simulate API call
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

  signupWithTwitter(twitterHandle: string): Observable<User> {
    return new Observable((observer) => {
      // Simulate API call with Twitter OAuth
      setTimeout(() => {
        const user: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: `${twitterHandle}@twitter.local`,
          verified: true,
          boost: 10,
          balance: 5,
        };
        this.saveUserToStorage(user);
        this.currentUserSubject.next(user);
        observer.next(user);
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
