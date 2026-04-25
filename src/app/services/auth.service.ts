import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of, combineLatest } from 'rxjs';
import { map, switchMap, catchError, filter } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

export interface User {
  id: string;
  email: string;
  twitterHandle?: string;
  twitterId?: string;
  verified?: boolean;
  boost?: number;
  balance?: number;
  role?: string;
  is_approved?: boolean;
  followersCount?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private supabaseService: SupabaseService, private router: Router) {
    // Merge currentUser and currentProfile to create the app's User object
    combineLatest([
      this.supabaseService.currentUser$,
      this.supabaseService.currentProfile$
    ]).subscribe(([supabaseUser, profile]) => {
      if (supabaseUser) {
        // Extract Twitter info if it exists
        const twitterIdentity = supabaseUser.identities?.find(id => id.provider === 'twitter' || id.provider === 'x');
        const twitterHandle = twitterIdentity?.identity_data?.['preferred_username'] || supabaseUser.user_metadata?.['user_name'];
        const twitterId = twitterIdentity?.id || supabaseUser.user_metadata?.['provider_id'];

        const user: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          role: profile?.role || 'user',
          is_approved: profile?.is_approved || false,
          verified: profile?.is_approved || false,
          twitterHandle: twitterHandle,
          twitterId: twitterId
        };
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
      }
    });
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User> {
    return from(this.supabaseService.client.auth.signInWithPassword({ email, password })).pipe(
      map(response => {
        if (response.error) throw response.error;
        // Wait for currentProfile$ to update the subject
        return this.currentUserSubject.value as User;
      })
    );
  }

  signup(email: string, password: string): Observable<User> {
    const hasSession = !!this.currentUserSubject.value;
    const request = hasSession 
      ? this.supabaseService.client.auth.updateUser({ email, password })
      : this.supabaseService.client.auth.signUp({ email, password });

    return from(request).pipe(
      map(response => {
        if (response.error) throw response.error;
        return { id: response.data.user?.id || '', email: response.data.user?.email || '' } as User;
      })
    );
  }

  resetPassword(email: string): Observable<void> {
    return from(this.supabaseService.client.auth.resetPasswordForEmail(email)).pipe(
      map(response => {
        if (response.error) throw response.error;
      })
    );
  }

  async initiateTwitterAuth(): Promise<void> {
    const { error } = await this.supabaseService.client.auth.signInWithOAuth({
      provider: 'x',
      options: {
        redirectTo: `${window.location.origin}/auth/twitter/callback`,
        scopes: 'users.read tweet.read'
      }
    });
    if (error) console.error('Error with Twitter Auth', error);
  }

  exchangeCodeForToken(code: string): Observable<User> {
    // Supabase handles the callback automatically on the client side when redirecting to a page.
    // We just need to check the session.
    return from(this.supabaseService.client.auth.getSession()).pipe(
      map(response => {
        if (response.error) throw response.error;
        if (!response.data.session) throw new Error('No session');
        return this.currentUserSubject.value as User;
      })
    );
  }

  signupWithTwitter(): Observable<User> {
    return this.exchangeCodeForToken('');
  }

  updateUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  logout(redirect: boolean = true): Promise<void> {
    return this.supabaseService.client.auth.signOut().then(() => {
      this.currentUserSubject.next(null);
      localStorage.removeItem('currentUser');
      if (redirect) {
        this.router.navigate(['/login']);
      }
    });
  }

  async getTwitterFollowers(): Promise<{ followersCount: number, isVerified: boolean } | null> {
    const { data: { session }, error: sessionError } = await this.supabaseService.client.auth.getSession();
    if (sessionError || !session) {
      console.warn('DEBUG: No active session found.');
      return null;
    }

    // RECURSIVE DEEP SEARCH FUNCTION
    const findFollowersDeep = (obj: any): number | undefined => {
      if (!obj || typeof obj !== 'object') return undefined;
      
      // Known keys
      const keys = ['followers_count', 'followers', 'follower_count', 'public_metrics'];
      for (const key of keys) {
        if (key === 'public_metrics' && obj[key]?.followers_count !== undefined) {
          return Number(obj[key].followers_count);
        }
        if (obj[key] !== undefined && typeof obj[key] === 'number') {
          return obj[key];
        }
      }

      // Recursive search
      for (const key in obj) {
        if (typeof obj[key] === 'object') {
          const result = findFollowersDeep(obj[key]);
          if (result !== undefined) return result;
        }
      }
      return undefined;
    };

    const findVerifiedDeep = (obj: any): boolean => {
      if (!obj || typeof obj !== 'object') return false;
      if (obj['verified'] === true) return true;
      for (const key in obj) {
        if (typeof obj[key] === 'object') {
          if (findVerifiedDeep(obj[key])) return true;
        }
      }
      return false;
    };

    // 1. TRY DEEP SEARCH IN SESSION
    const followers = findFollowersDeep(session);
    const verified = findVerifiedDeep(session);

    if (followers !== undefined) {
      console.log('DEBUG: Found followers via deep search:', followers);
      return { followersCount: followers, isVerified: verified };
    }

    // 2. TRY FRESH USER FETCH + DEEP SEARCH
    const { data: { user: freshUser } } = await this.supabaseService.client.auth.getUser();
    const freshFollowers = findFollowersDeep(freshUser);
    const freshVerified = findVerifiedDeep(freshUser);

    if (freshFollowers !== undefined) {
      console.log('DEBUG: Found followers via fresh user deep search:', freshFollowers);
      return { followersCount: freshFollowers, isVerified: freshVerified };
    }

    // 3. API FALLBACK WITH DIRECT PROXY (No wrapper)
    const providerToken = session?.provider_token;
    if (providerToken) {
      console.log('DEBUG: Attempting direct API fallback...');
      const targetUrl = 'https://api.twitter.com/2/users/me?user.fields=public_metrics,verified';
      
      try {
        // Use a more reliable proxy for Vercel
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        const response = await fetch(proxyUrl);
        if (response.ok) {
          const json = await response.json();
          const data = JSON.parse(json.contents);
          const apiFollowers = data?.data?.public_metrics?.followers_count;
          if (apiFollowers !== undefined) {
            return { 
              followersCount: apiFollowers, 
              isVerified: data?.data?.verified || false 
            };
          }
        }
      } catch (e) {
        console.error('DEBUG: API Fallback failed', e);
      }
    }

    // 4. LAST RESORT: Check for ANY number > 100 in user metadata
    // This is a safety net for production users who might have the data but in an unknown field
    const metadata = freshUser?.user_metadata || session.user?.user_metadata || {};
    for (const key in metadata) {
      if (typeof metadata[key] === 'number' && metadata[key] > 100) {
        return { followersCount: metadata[key], isVerified: false };
      }
    }

    return null;
  }
}
