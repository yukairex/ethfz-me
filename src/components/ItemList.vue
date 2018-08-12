<template>
  <div class="columns is-multiline is-mobile">
    <router-link v-for="item in items"
                 v-if="item"
                 :to="{ name: 'Item', params:{id: item.id}}"
                 :key=item.id.toString()
                 class="column
           is-full-mobile
           is-one-quarter-tablet
           is-one-quarter-desktop
           is-one-quarter-widescreen
           is-one-quarter-fullhd">
      <template>
        <div class="card">
          <div class="card-image">
            <figure class="image is-5by4">
              <img v-lazy="getCardImage(item.typeId)">
            </figure>
          </div>
          <div class="card-content">
            <div class="content is-small">
              <h4>{{item.name}}</h4>
              <ul>
                <li>{{$t('Owner')}}：
                  <router-link v-if="item.owner"
                               :to="{ name: 'User', params:{address: item.owner}}">
                    {{item.owner.slice(-6).toUpperCase()}}
                  </router-link>
                </li>
                <li> 物品编号: {{item.id}} </li>
                <li v-if="item.onSell">{{$t('Current Price')}}: {{toDisplayedPrice(item.sellPrice)}}</li>
              </ul>
            </div>
          </div>
        </div>
      </template>
    </router-link>
  </div>
</template>

<script>
import { toReadablePrice } from '@/util';
import { getMyAddress } from '@/api';

export default {
  name: 'item-lists',
  props: ['itemIds'],

  data: () => ({
  }),

  computed: {
    items() {
      return this.itemIds.map((id) => {
        const item = this.$store.state.items[id];
        return item || { id };
      });
    },
  },

  methods: {
    toDisplayedPrice(priceInWei) {
      const readable = toReadablePrice(priceInWei);
      return `${readable.price} ${readable.unit}`;
    },
    getCardImage(typeId) {
      return `http://static.togetthere.cn/sm${typeId}.jpg`;
    },
  },

  created() {
  },

  watch: {
    itemIds(newItemIds) {
      newItemIds.forEach((itemId) => {
        this.$store.dispatch('FETCH_ITEM', itemId);
        this.$store.dispatch('FETCH_AD', itemId);
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

