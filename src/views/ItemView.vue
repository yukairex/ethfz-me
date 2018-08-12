<template>
  <div class="item-view">
    <div v-if="item">
      <div class="columns is-multiline is-mobile">
        <div class="column
           is-full-mobile">
          <img :src="getCardImage">
        </div>
        <div class="column
           is-full-mobile">
          <div class="content">
            <h2> {{item.name}}</h2>
            <ul>
              <li>卡片编号: {{item.id}} </li>
              <li>{{$t('Owner')}}：
                <router-link :to="{ name: 'User', params:{address: item.owner}}">
                  {{item.owner.slice(-6).toUpperCase()}}
                </router-link>
              </li>
              <li>权重: {{item.power}} </li>
              <li v-if="item.onSell">{{$t('Current Price')}}：{{toDisplayedPrice(item.sellPrice)}}</li>
            </ul>
          </div>

          <template v-if="notOwner">
            <div class="buttons">
              <button class="button is-danger is-outlined"
                      @click="buyCard()">{{ $t('BUY_BTN') }}</button>
            </div>
          </template>

          <template v-if="isOwner">
            <div class="buttons">
              <button v-if="item.onSell" class="button is-danger is-outlined" @click="cancelSell()"> 撤销卖出 </button>
              <div v-else>
                <input v-model="sellEtherPrice" placeholder="售出价格(ether)"> ether </input>
                <button class="button is-danger is-outlined" @click="sellCard()"> 卖出 </button>
                <button class="button is-danger is-outlined" @click="convertCard()">提现</button>
              </div>
            </div>

          </template>

        </div>
      </div>
    </div>
    <div v-else-if="item === null">
      Token doesn't exist
    </div>
  </div>
</template>

<script>
import { buyItem, exchangeLuckyToken, setGg, setNextPrice, sellCard, cancelSell, getMyAddress, buyCard, convertCard} from '@/api';
import { toReadablePrice } from '@/util';

export default {
  name: 'item-view',

  data: () => ({}),

  computed: {
    itemId() {
      return this.$route.params.id;
    },
    me() {
      return this.$store.state.me || {};
    },
    item() {
      return this.$store.state.items[this.itemId];
    },
    ad() {
      return this.$store.state.ads[this.itemId];
    },
    getCardImage() {
      return `http://static.togetthere.cn/sm${this.item.typeId}.jpg`;
    },
    isOwner() {
      return this.item.owner === this.me.address;
    },
    notOwner() {
      return !this.isOwner;
    },
  },
  async created() {
    this.address = await getMyAddress();
    this.$store.dispatch('FETCH_ITEM', this.itemId);
  },

  watch: {},

  methods: {
    onBuy(rate) {
      if (this.$store.state.signInError) {
        return this.$router.push({ name: 'Login' });
      }
      const buyPrice = this.item.price.times(rate).toFixed(0);
      buyItem(this.itemId, buyPrice)
        .then(() => {
          alert(this.$t('BUY_SUCCESS_MSG'));
          setNextPrice(this.itemId, buyPrice);
        })
        .catch((e) => {
          alert(this.$t('BUY_FAIL_MSG'));
          console.log(e);
        });
    },
    toDisplayedPrice(priceInWei) {
      const readable = toReadablePrice(priceInWei);
      return `${readable.price} ${readable.unit}`;
    },
    buyCard() {
      // 如果没有登录 就跳转到登录界面
      if (this.$store.state.signInError) {
        return this.$router.push({ name: 'Login' });
      }
      buyCard(this.address, this.itemId, this.item.sellPrice)
                    .then(() => {
                        alert(this.$t('BUY_SUCCESS_MSG'));
                    })
                    .catch((e) => {
                        alert(e);
                        alert(this.$t('BUY_FAIL_MSG'));
                    });
    },
    async sellCard() {
      // 如果没有登录 就跳转到登录界面
      if (this.$store.state.signInError) {
        return this.$router.push({ name: 'Login' });
      }
      const sellEtherPriceInWei = this.sellEtherPrice * 1000000000000000000;
      if (sellEtherPriceInWei <= 0) {
        alert("invalid sell price");
        return ;
      }
      sellCard(this.address, this.itemId, sellEtherPriceInWei)
                    .then(() => {
                        alert(this.$t('BUY_SUCCESS_MSG'));
                    })
                    .catch((e) => {
                      alert(e);
                        alert(this.$t('BUY_FAIL_MSG'));
                    });
    },
    async convertCard() {
      // 如果没有登录 就跳转到登录界面
      if (this.$store.state.signInError) {
        return this.$router.push({ name: 'Login' });
      }
      convertCard(this.address, this.itemId)
                    .then(() => {
                        alert(this.$t('BUY_SUCCESS_MSG'));
                    })
                    .catch((e) => {
                      alert(e);
                        alert(this.$t('BUY_FAIL_MSG'));
                    });
    },
    async cancelSell() {
      // 如果没有登录 就跳转到登录界面
      if (this.$store.state.signInError) {
        return this.$router.push({ name: 'Login' });
      }
      cancelSell(this.address, this.itemId)
                    .then(() => {
                        alert(this.$t('BUY_SUCCESS_MSG'));
                    })
                    .catch((e) => {
                        alert(this.$t('BUY_FAIL_MSG'));
                    });

    },
  },
};
</script>
 <style scoped>
.item-slogan {
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-all;
}
</style>
