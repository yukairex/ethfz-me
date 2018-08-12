<template>
    <div class="">
        <div v-if="loading"
             class="loader-wrapper">
            <pulse-loader></pulse-loader>
        </div>

        <section class="section">
          <div class="container">
            <div class="subtitle">
              <p>抽卡将随机获得一阶物品或者二阶物品</p>
              <p>付费0.01eth可以抽卡一次</p>
              <p>抽卡10次可以获得采集的权利(每天两次)</p>
              <p>其中一阶物品包括: <strong class="has-text-danger">水 、空气 、火 、土</strong></p>
              <p>其中二阶物品包括: <strong class="has-text-danger">熔岩、水坑、陆地、压力、能量、泥</strong></p>
            </div>
            </div>
        </section>
        <hr/>
        <button class="button is-danger is-outlined" @click="lottery()">抽卡</button>

    </div>
</template>

<script>
    import PulseLoader from 'vue-spinner/src/PulseLoader';
    import {getMyAddress, lottery} from '@/api';
    import { toReadablePrice} from '@/util';

    export default {
        name: 'index',
        components: {
            PulseLoader,
        },

        data() {
            return {
                loading: true,
            };
        },

        computed: {},

        async created() {
            this.address = await getMyAddress();
            this.loading = false;
        },

        methods: {
            toDisplayedPrice(priceInWei) {
                const readable = toReadablePrice(priceInWei);
                return `${readable.price} ${readable.unit}`;
            },
            lottery() {
                lottery(this.address, 10000000000000000)
                    .then(() => {
                        alert(this.$t('BUY_SUCCESS_MSG'));
                    })
                    .catch((e) => {
                        alert(e);
                        alert(this.$t('BUY_FAIL_MSG'));
                    });
            },
        },
        watch: {},
    };
</script>
<style scoped>
    .loader-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
    }
</style>
