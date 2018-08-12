<template>
    <div class="">
        <div v-if="loading"
             class="loader-wrapper">
            <pulse-loader></pulse-loader>
        </div>

        <section class="section">
          <div class="container">
            <div class="subtitle">
              <p>抽奖抽过10次的用户, 每天可以进行两次采集(12小时冷却) </p>
              <p>为了系统稳定, 避免玩家资产贬值, 采集系统每分钟会产生两个采集单位 </p>
              <p>可以将低阶物品合成高级物品,来获取收益</p>
              <p>采集只能采集到4种一阶物品: <strong class="has-text-danger">水 、空气 、火 、土</strong></p>
            </div>
            </div>
        </section>
        <hr/>

        <div> 
          <li> 抽奖数: {{userLotteryCount}} </li>
          <li> 上次采集时间:  {{43200 - gatherWaitSeconds}}秒前 (大于43200可采集)</li>
          <li> 当前采集额度: {{currentGatherQuota}} </li>
        </div>
        <hr/>
        <div v-if="userLotteryCount < 2"> 无法收集 => <strong class="has-text-danger"> 抽卡数量小于10 </strong></div>
        <div v-if="currentGatherQuota <= 0"> 无法收集 => <strong class="has-text-danger"> 没有采集单位了 </strong></div>
        <div v-if="gatherWaitSeconds > 0"> 无法收集 => <strong class="has-text-danger"> 采集尚未冷却 还需 {{gatherWaitSeconds}}秒</strong> </div>
        <div v-if="userLotteryCount >= 2 && currentGatherQuota > 0 && gatherWaitSeconds <= 0">
          <button class="button is-danger is-outlined" @click="gather()"> 采集 </button>
        </div>

    </div>
</template>

<script>
    import PulseLoader from 'vue-spinner/src/PulseLoader';
    import {getUserLastGatherTimestamp, getUserLotteryCount, getCurrentGatherQuota, gather, getMyAddress} from '@/api';
    import { toReadablePrice } from '@/util';

    export default {
        name: 'index',
        components: {
            PulseLoader,
        },

        data() {
            return {
                gatherWaitSeconds: 0,
                loading: true,
            };
        },

        computed: {},

        async created() {
            this.address = await getMyAddress();
            this.userLastGatherTimestamp = await getUserLastGatherTimestamp(this.address);
            this.userLotteryCount = await getUserLotteryCount(this.address);
            this.currentGatherQuota = await getCurrentGatherQuota();
            this.currentTimestamp = Math.floor(Date.now() / 1000);
            this.gatherWaitSeconds = 43200 - (this.currentTimestamp - this.userLastGatherTimestamp);
            this.loading = false;

            let time = setInterval(()=>{
              this.gatherWaitSeconds -= 1;
            }, 1000);
        },

        methods: {
            toDisplayedPrice(priceInWei) {
                const readable = toReadablePrice(priceInWei);
                return `${readable.price} ${readable.unit}`;
            },
            gather() {
              gather(this.address)
                    .then(() => {
                        alert("采集成功, 等待结果");
                    })
                    .catch((e) => {
                        alert("采集失败");
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
