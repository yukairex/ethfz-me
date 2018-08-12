<template>
  <div>
        <section class="section">
          <div class="container">
            <div class="subtitle">
              <p>玩家可以将自己的战力兑换成ether到自己账号</p>
              <p>可以兑换的总数量 = 玩家当前权重/所有用户权重*合约余额</p>
              <p>玩家当前权重: {{userTotalPower}}</p>
              <p>总权重: {{totalPower}}</p>
              <p>合约余额:  {{totalBalance}}</p>
            </div>
            </div>
        </section>
  </div>
</template>

<script>
import ItemList from '@/components/ItemList';
import { getItemsOf, getMyAddress, getUserPower, getOnSellCardIds, getTotalPower, getUserTotalPower, getContractBalance} from '@/api';
import getIdenticon from './Identicon';

export default {
  name: 'UserView',
  components: {
    ItemList,
  },
  data: () => ({
    itemIds: [],
    totalPower: 0,
    userTotalPower: 0,
    totalBalance: 0
  }),

  computed: {
    getEtherScanURL() {
      return `https://etherscan.io/address/${this.address}`;
    },
    getBlockie() {
      return getIdenticon(this.address);
    },
    me() {
      return this.$store.state.me;
    },
  },
  async created() {
    this.userAddress = await getMyAddress();
    this.totalPower = await getTotalPower();
    this.userTotalPower = await getUserTotalPower(this.address);
    this.totalBalance = await getContractBalance();
  },

  watch: {},

  methods: {
  },
};
</script>
<style scoped>
.user-info-wrapper {
  border-radius: 5px;
}
</style>
