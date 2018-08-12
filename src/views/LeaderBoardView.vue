<template>
    <div class="" style="background-color: #000000;">
        <div v-if="loading"
             class="loader-wrapper">
            <pulse-loader></pulse-loader>
        </div>

        <section class="section">
          <div class="container">
            <h1 class="title has-text-danger" style="margin-top: 2rem;">Leader Godness</h1>
          </div>
        </section>


        <div class="columns is-multiline">
        <div v-for="item in picList" class="column is-3">
          <div class="card">
            <div class="card-image">
              <figure class="image">
                <img :src="item.url">
              </figure>
            </div>

            <div class="has-text-centered has-text-danger" style="margin-top: 0.2rem; background-color: #ffffff;">
              <div class="button has-text-danger">
                <i v-if="!item.hasLiked" class="iconfont icon-like" style="font-size: 26px;" @click="likePic(item.id)"></i>
                <i v-else class="iconfont icon-heart" style="font-size: 26px;" @click="likePic(item.id)"></i>
              </div>
              <span class="is-size-4">
                {{item.likeNumber}}
              </span>
            </div>
          </div>
        </div>
        </div>
    </div>
</template>

<script>
    import PulseLoader from 'vue-spinner/src/PulseLoader';
    import {getAllPicInfo, getMyAddress, likePic, createNewPic} from '@/api';
    import { toReadablePrice } from '@/util';

    export default {
        name: 'index',
        components: {
            PulseLoader,
        },

        data() {
            return {
                picList: [],
                meinv_url: '',
                loading: true,
            };
        },

        computed: {},

        async created() {
            this.address = await getMyAddress();
            this.picList = await getAllPicInfo(this.address);
            this.picList.sort(function(a,b) {return a.likeNumber < b.likeNumber;});
            this.loading = false;
        },

        methods: {
            toDisplayedPrice(priceInWei) {
                const readable = toReadablePrice(priceInWei);
                return `${readable.price} ${readable.unit}`;
            },
            async likePic(picId) {
              if (this.picList[picId].hasLiked) {
                alert("You have already liked this pic~");
                return;
              }

              likePic(this.address, picId).then(() => {
                  alert("Success! Please wait for blockchain sync");
                  this.picList[picId].hasLiked = true;
                  this.picList[picId].likeNumber += 1;
              })
              .catch((e) => {
                  alert("Failed! Please try again later~~" + e);
              });
           },
          async createNewPic() {
            if (!this.meinv_url) {
              return;
            }
            if (!this.meinv_url.startsWith("http")) {
              alert("image url must start with http !!!");
              return;
            } 
            createNewPic(this.address, this.meinv_url).then(() => {
                alert("Success! Please wait for blockchain sync");
                this.meinv_url = "";
            })
            .catch((e) => {
                alert("Failed! Please try again later~~");
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
