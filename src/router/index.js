import Vue from 'vue';
import Router from 'vue-router';
import IndexView from '@/views/IndexView';
import ItemView from '@/views/ItemView';
import ListView from '@/views/ListView';
import LoginView from '@/views/LoginView';
import FaqView from '@/views/FaqView';
import UserView from '@/views/UserView';
import TermView from '@/views/TermView';
import PrivacyView from '@/views/PrivacyView';
import BirthdayGiftView from '@/views/BirthdayGiftView';
import LotteryView from '@/views/LotteryView';
import GatherView from '@/views/GatherView';
import MergeCardView from '@/views/MergeCardView';
import MarketView from '@/views/MarketView';
import WithdrawView from '@/views/WithdrawView';
import LeaderBoardView from '@/views/LeaderBoardView';

Vue.use(Router);

export default new Router({
  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      name: 'Home',
      path: '/',
      component: IndexView,
    },
    {
      name: 'LeaderBoard',
      path: '/LeaderBoard',
      component: LeaderBoardView,
    },
    {
      name: 'Merge',
      path: '/Merge',
      component: MergeCardView,
    },
    {
      name: 'Withdraw',
      path: '/Withdraw',
      component: WithdrawView,
    },
    {
      name: 'Market',
      path: '/Market',
      component: MarketView,
    },
    {
      name: 'Lottery',
      path: '/Lottery',
      component: LotteryView,
    },
    {
      name: 'Gather',
      path: '/Gather',
      component: GatherView,
    },
    {
      name: 'Login',
      path: '/Login',
      component: LoginView,
    },

    {
      name: 'Item',
      path: '/item/:id(\\d+)',
      component: ItemView,
    },
    {
      name: 'User',
      path: '/user/:address',
      component: UserView,
    },
    {
      name: 'FAQ',
      path: '/faq',
      component: FaqView,
    },
    {
      name: 'Privacy',
      path: '/privacy-policy',
      component: PrivacyView,
    },
    {
      name: 'Term',
      path: '/terms-of-us',
      component: TermView,
    },
    {
      name: 'BirthdayGift',
      path: '/birthday-gift',
      component: BirthdayGiftView,
    },    
  ],
});
