<template>
  <div>
        <section class="section">
          <div class="container">
            <div class="subtitle">
              <p>玩家可以将自己的战力兑换成ether到自己账号</p>
              <p>可以兑换的总数量 = 玩家当前权重/所有用户权重*合约余额</p>
              <p>暂时只支持单件物品变现</p>
              <p>玩家当前权重: {{userTotalPower}}</p>
              <p>总权重: {{totalPower}}</p>
              <p>合约余额:  {{toDisplayedPrice(totalBalance)}}</p>
            </div>
            </div>
        </section>
  </div>
</template>

<script>
import ItemList from '@/components/ItemList';
import { getItemsOf, getMyAddress, getUserPower, getOnSellCardIds, getTotalPower, getUserTotalPower, getContractBalance} from '@/api';
import { toReadablePrice } from '@/util';
import getIdenticon from './Identicon';

export default {
  name: 'UserView',
  components: {
    ItemList,
  },
  data: () => ({
    totalPower: 0,
    userTotalPower: 0,
    totalBalance: 0,
    itemIds: [],
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
    this.address = await getMyAddress();
    this.totalPower = await getTotalPower();
    this.userTotalPower = await getUserTotalPower(this.address);
    this.totalBalance = await getContractBalance();
  },

  watch: {},

  methods: {
    toDisplayedPrice(priceInWei) {
        const readable = toReadablePrice(priceInWei);
        return `${readable.price} ${readable.unit}`;
    },
  },
};
</script>
<style scoped>
.user-info-wrapper {
  border-radius: 5px;
}
</style>
