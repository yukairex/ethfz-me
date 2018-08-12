<template>
    <div class="">
        <div v-if="loading"
             class="loader-wrapper">
            <pulse-loader></pulse-loader>
        </div>

        <section class="section">
          <div class="container">
            <div class="subtitle">
              <p>融合是指将两个物品融合成一个物品, 从而获得权重更高物品</p>
              <p>假设有两个物品A/B权重分别为a/b, 如果他们可以融合, 那么融合后将获得权重为2*(a+b)的新物品</p>
              <p>通过合理的合成路线，安排自己手中的卡, 就有可能获得利润 </p>
              <p>希望你能融的开心~</p>
            </div>
            </div>
        </section>
        <hr/>
        <input v-model="card1Id" placeholder="card1编号"></input>
        <input v-model="card2Id" placeholder="card2编号"></input>
        <p> {{card1Id}} x {{card2Id}}</p>
        <button class="button is-danger is-outlined" @click="mergeCard()"> 合卡 </button>

    </div>
</template>

<script>
    import PulseLoader from 'vue-spinner/src/PulseLoader';
    import {getMyAddress, mergeCard} from '@/api';
    import { toReadablePrice } from '@/util';

    export default {
        name: 'index',
        components: {
            PulseLoader,
        },

        data() {
            return {
                card1Id: '',
                card2Id: '',
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
            mergeCard() {
                // 如果没有登录 就跳转到登录界面
                if (this.$store.state.signInError) {
                    return this.$router.push({ name: 'Login' });
                }
                mergeCard(this.address, this.card1Id, this.card2Id)
                    .then(() => {
                        alert(this.$t('BUY_SUCCESS_MSG'));
                    })
                    .catch((e) => {
                        alert(e);
                        alert(this.$t('BUY_FAIL_MSG'));
                    });
            }
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
