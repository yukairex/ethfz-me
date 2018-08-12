<template>
  <div>
    <ItemList :itemIds='itemIds' />
  </div>
</template>

<script>
import ItemList from '@/components/ItemList';
import { getItemsOf, getMyAddress, getUserPower, getOnSellCardIds} from '@/api';
import getIdenticon from './Identicon';

export default {
  name: 'UserView',
  components: {
    ItemList,
  },
  data: () => ({
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
    this.userAddress = await getMyAddress();
    this.itemIds = await getOnSellCardIds();
    // const cardIds = await getOnSellCardIds();
    // this.itemIds = cardIds.filter(x => x != 0).map(x => x-1);
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
