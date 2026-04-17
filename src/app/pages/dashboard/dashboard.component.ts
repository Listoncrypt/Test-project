import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface EngagementTask {
  id: string;
  title: string;
  image: string;
  reward: number;
  boost: number;
  actions: string;
}

interface SidebarMenu {
  icon: string;
  label: string;
  href: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  username = 'user123';
  balance = 2.5;
  verified = true;
  boost = 10;
  tasksComplete = 5;
  earnings = 2.5;
  withdrawals = 0.0;

  sidebarMenus: SidebarMenu[] = [
    { icon: '📊', label: 'Dashboard', href: '#' },
    { icon: '💰', label: 'My Earnings', href: '#' },
    { icon: '💸', label: 'Withdraw Funds', href: '#' },
    { icon: '⚙️', label: 'Settings', href: '#' },
  ];

  engagementTasks: EngagementTask[] = [
    {
      id: '1',
      title: 'like & retweet @user_x post',
      image: 'image_0.png',
      reward: 0.5,
      boost: 0.05,
      actions: 'like + comment + retweet + bookmark @user_x',
    },
    {
      id: '2',
      title: 'like & retweet @user_x post',
      image: 'image_0.png',
      reward: 0.5,
      boost: 0.05,
      actions: 'like + comment + retweet + bookmark @user_x',
    },
    {
      id: '3',
      title: 'like & retweet @user_x post',
      image: 'image_0.png',
      reward: 0.5,
      boost: 0.05,
      actions: 'like + comment + retweet + bookmark @user_x',
    },
  ];

  showWithdrawal = false;
  withdrawalForm = {
    amount: 40,
    solanaAddress: '',
  };

  activeMenu = 'dashboard';
  userInitial = 'X';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.username = currentUser.email.split('@')[0];
      this.verified = currentUser.verified || false;
      this.boost = currentUser.boost || 0;
      this.balance = currentUser.balance || 0;
    }
    this.userInitial = this.username.charAt(0).toUpperCase();
  }

  engageOnX() {
    console.log('Opening X (Twitter)...');
    window.open('https://x.com', '_blank');
  }

  submitWithdrawal() {
    if (this.withdrawalForm.amount >= 40 && this.withdrawalForm.solanaAddress) {
      console.log('Withdrawal requested:', this.withdrawalForm);
      // Handle withdrawal submission
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  setActiveMenu(menu: string) {
    this.activeMenu = menu;
  }
}

