<template>
    <div class="mainpage">
        <div v-if="loading"
             class="loader-wrapper">
            <pulse-loader></pulse-loader>
        </div>

        <div>
        <div class="columns">
          <div class="column is-1">
            <figure class="image is-64x64" style="margin-top:1rem; margin-left:3rem;">
              <img src="static/assets/logo_150.png"></img>
            </figure>
          </div>
          <div class="column is-3">
            <figure class="image">
              <img src="static/assets/name.png" style="width: 15rem; padding-top: 1rem;"></img>
            </figure>
          </div>
          <div class="column is-4"></div>
          <div class="column is-4">
            <div class="shadow-bg has-text-white is-size-6 has-text-centered" style="border-radius: 1rem; margin-top: 2rem; height:2.5rem; margin-right: 3rem;">
              <div style="padding-top:0.5rem; ">
                {{address}}
              </div>
            </div>
          </div>
        </div>
        <div v-if="gameStats.startCountdown" class="has-text-white" style="padding-bottom: 2rem;">
          <dapp-countdown v-bind:diff="gameStats.startCountdown"></dapp-countdown>
        </div>
        <div class="has-text-centered ite-logo has-text-white is-size-1" style="padding-top: 0rem; margin-top: -2rem;">{{gameStats.prizePool}} <span class="is-size-3">ETH</span></div>
        <div class="has-text-centered has-text-white is-size-6" style="margin-top: -0.9rem; padding-top: 0rem;"><b>鲲主奖励: {{gameStats.winnerPrizePool}} ETH (预估MAX) </b></div>


        <div class="columns main-panel" style="padding-top: 2rem;">
          <div class="column is-3">
            <div class="shadow-bg" style="border-radius: 1rem; height: 30rem; margin-left:2rem; width: 18rem; overflow:hidden;">
              <div class="tabs is-fullwidth" style="">
                <ul>
                  <li class="is-active tab-history tab-item" @click="showHistory()" style="width: 5rem;"><a class="tab-text has-text-white is-size-7"><b>修真界操作记录</b></a></li>
                  <li class="tab-intro tab-item" @click="showIntro()">
                    <a class="tab-text has-text-white is-size-7"><b>游戏介绍</b></a>
                  </li>
                </ul>
              </div>
              <div class="tab-intro-content has-text-white scrollbar" style="padding-left: 1rem; padding-right: 0.8rem; overflow-y: scroll; height: 25rem; display: none;">
                <div class="is-size-7"><b>游戏概要:</b></div>
                <div class="is-size-7" style="text-indent:1.5rem;"><b> 仙妖纷争是一款基于以太坊开发并使用
Bancor算法设计的修真背景博弈游戏，由
智能合约控制游戏的开局，由参与玩家的博
弈结果来决定仙界和妖界之间的输赢。</b></div>
                <br/>
                <div class="is-size-7"><b>操作说明:</b></div>
                <li class="is-size-7"><b>净化 : 调动天地灵气，将ETH转换成仙力注入结界，净化鲲兽增加仙化程度。</b></li>
                <li class="is-size-7"><b>还原：调动天地灵气，将仙力转换回ETH抽离结界，复原净化程度。</b></li>
                <li class="is-size-7"><b>
                    蛊惑：调动天地灵气，转换结界内仙力，将仙力转化为妖力，按90%的价格回收ETH，使鲲兽堕落增加妖化程度。
                  </b></li>
                <br/>
                <div class="is-size-7"><b>玩家说明:</b></div>
                <li class="is-size-7"><b>孵化者：任何参与者在游戏结束时都会以留着结界内的法力获得孵化者奖励。</b></li>
                <li class="is-size-7"><b>鲲兽之主：无论最终是仙化还是妖化了"洪荒巨鲲"，作为最后给鲲兽施法的玩家将成为鲲兽的主人，获得饲鲲者的奖励。</b></li>
                <li class="is-size-7"><b>修真者：在鲲兽未仙化或妖化之前，修真者可以选择净化、还原、蛊惑来获取利益。</b></li>
                <li class="is-size-7"><b>接引人：修真界的任何一位修真者都可以生成邀请码成为接引人，接引修真者来参与鲲孵化，获得10%的收益。</b></li>
                <li class="is-size-7"><b>灵气散人：被结界周围流失的灵气而吸引，只为收集流失的灵气，获得法力的增长。</b></li>
              </div>
              <div class="tab-history-content">
                <div v-for="item in gameStats.operationList" class="has-text-white has-text-left is-size-7" style="margin-top: 0.5rem; margin-left: 1.5rem;">
                  <b v-if="item.opType==1" class="has-text-success">
                    净化 &nbsp;{{timestampToStr(item.timestamp)}} &nbsp;{{shortAddress(item.owner)}} &nbsp;{{item.amount}} ETH
                  </b>
                  <b v-else-if="item.opType==2" class="has-text-warning">还原&nbsp;{{timestampToStr(item.timestamp)}} &nbsp;{{shortAddress(item.owner)}} &nbsp;{{item.realAmount}} 仙力</b>
                  <b v-else class="has-text-danger">蛊惑 &nbsp;{{timestampToStr(item.timestamp)}} &nbsp;{{shortAddress(item.owner)}} &nbsp;{{item.realAmount}} 仙力</b>
                </div>
                <div class="has-text-success has-text-centered is-size-6" style="margin-top: 0.6rem;"> 总净化量: {{gameStats.buyTotalSum}} ETH </div>
              </div>
            </div>
            <audio id="myAudio" loop="loop" src="static/assets/bgm.mp3">
            </audio>
          </div>

          <div class="column is-6">
            <div class="columns">
              <div class="column is-2"></div>
              <div class="column is-2">
                <div class="has-text-white is-size-5 has-text-right">
                  <b>仙化程度:</b>
                </div>
              </div>
              <div class="column is-6">
                <progress class="progress is-success" :value="gameStats.gameTotalReserved*100/gameStats.maxReserved" max="100" style="height: 100%;">15%</progress>
                <div class="has-text-white is-size-5 has-text-left" style="padding-top: 0.1rem; padding-left: 1rem;">
                  <b>{{gameStats.gameTotalReserved}}/{{gameStats.maxReserved}}</b>
                </div>
              </div>
            </div>

            <div class="columns" style="margin-top: 1rem;">
              <div class="column is-2"></div>
              <div class="column is-2">
                <div class="has-text-white is-size-5 has-text-right">
                  <b>妖化程度:</b>
                </div>
              </div>
              <div class="column is-6">
                <progress class="progress is-danger" :value="gameStats.gameTotalBurn*100/gameStats.maxBurn" max="100" style="height: 100%;">15%</progress>
                <div class="has-text-white is-size-5 has-text-left" style="padding-top: 0.1rem; padding-left: 1rem;">
                  <b>{{gameStats.gameTotalBurn}}/{{gameStats.maxBurn}}</b>
                </div>
              </div>
            </div>

            <div class="columns" style="margin-top: 3rem;">
              <div class="column is-3">
                <div class="shadow-bg has-text-white has-text-centered" style="border-top-left-radius: 2rem; padding-left: 0.4rem;">
                  <div class="is-size-3" style="padding-top: 2rem;"><b>{{gameStats.userHolderNumber}}</b></div>
                  <div class="is-size-5" style="padding-top: 0.3rem; padding-bottom: 2rem;"><b>拥有仙力</b></div>
                </div>

                <div class="shadow-bg has-text-white has-text-centered" style="border-bottom-left-radius: 2rem; margin-top: 0.8rem;">
                  <div class="is-size-3" style="padding-top: 2rem;"><b>{{gameStats.buyPrice}}</b></div>
                  <div class="is-size-5" style="padding-top: 0.3rem; padding-bottom: 2rem;"><b>ETH/仙力</b></div>
                </div>
              </div>
              <div class="column is-9 shadow-bg" style="margin-top: 0.75rem; border-top-right-radius: 2rem; border-bottom-right-radius: 2rem; height: 19.2rem;">
                <div class="tabs" style="">
                <ul v-if="!gameStats.gameEnded">
                  <li class="is-active tab-jinghua" @click="showJinghua()"><a class="tab-text has-text-white is-size-6"><b>净化</b></a></li>
                  <li class="tab-huanyuan" @click="showHuanyuan()"><a class="tab-text has-text-white is-size-6"><b>还原</b></a></li>
                  <li class="tab-guhuo" @click="showGuhuo()"><a class="tab-text has-text-white is-size-6"><b>蛊惑</b></a></li>
                </ul>
                <ul v-else>
                  <li class="is-active tab-jinghua"><a class="tab-text has-text-white is-size-6"><b>提取</b></a></li>
                </ul>
                </div>
                <div v-if="!gameStats.gameEnded" class="tab-jinghua-content has-text-white" style="">
                  <figure class="image is-128x128" style="margin: 0 auto; margin-top: -1rem;">
                    <img src="static/assets/jinghua.gif">
                  </figure>
                  <div class="columns" style="margin-top: 0.5rem;">
                    <div class="column is-2"></div>
                    <div class="column is-7">
                      <input class="input input-success" type="text" v-model="jinghuaValue" placeholder="请输入数量">
                    </div>
                    <div class="column is-1">
                      <div class="is-size-5"> ETH </div>
                    </div>
                  </div>

                  <div class="columns" style="margin-top: -1.5rem;" >
                    <div class="column is-2"></div>
                    <div class="column is-4">
                      <div class="is-size-4"><b>≈ {{jinghuaAmount()}}仙力</b></div>
                    </div>
                    <div class="column is-3"></div>
                    <div class="column is-3">
                      <div class="button is-success" style="width: 100%" @click="buy(jinghuaValue)"> 净化 </div>
                    </div>
                  </div>
                </div>

                <div v-if="gameStats.gameEnded" class="tab-tiqu-content has-text-white" style="">
                  <figure class="image is-128x128" style="margin: 0 auto; margin-top: -1rem;">
                    <img src="static/assets/jinghua.gif">
                  </figure>
                  <div class="columns" style="margin-top: 0.5rem;">
                    <div class="column is-2"></div>
                    <div class="column is-7">
                      <div class="is-size-5"><b> 共有 &nbsp;&nbsp;&nbsp;{{gameStats.userHolderNumber}}&nbsp;&nbsp;&nbsp;</b>仙力</div>
                    </div>
                  </div>

                  <div class="columns" style="margin-top: -1.5rem;" >
                    <div class="column is-2"></div>
                    <div class="column is-4">
                      <div class="is-size-4"><b>≈ {{tiquAmount()}} ETH</b></div>
                    </div>
                    <div class="column is-3"></div>
                    <div class="column is-3">
                      <div class="button is-success" style="width: 100%" @click="claim()"> 提取 </div>
                    </div>
                  </div>
                </div>

                <div class="tab-huanyuan-content has-text-white" style="display: none;">
                  <figure class="image is-128x128" style="margin: 0 auto; margin-top: -1rem;">
                    <img src="static/assets/huanyuan.gif">
                  </figure>
                  <div class="columns" style="margin-top: 0.5rem;">
                    <div class="column is-2"></div>
                    <div class="column is-7">
                      <input class="input input-warning" type="text" v-model="huanyuanValue" placeholder="请输入数量">
                    </div>
                    <div class="column is-2">
                      <div class="is-size-5"> 仙力 </div>
                    </div>
                  </div>

                  <div class="columns" style="margin-top: -1.5rem;" >
                    <div class="column is-2"></div>
                    <div class="column is-4">
                      <div class="is-size-4"><b>≈  {{huanyuanAmount()}} eth</b></div>
                    </div>
                    <div class="column is-3"></div>
                    <div class="column is-3">
                      <div class="button is-warning" style="width: 100%" @click="sell(huanyuanValue)"> 还原 </div>
                    </div>
                  </div>
                </div>

                <div class="tab-guhuo-content has-text-white" style="display: none;">
                  <figure class="image is-128x128" style="margin: 0 auto; margin-top: -1rem;">
                    <img src="static/assets/guhuo.gif">
                  </figure>
                  <div class="columns" style="margin-top: 0.5rem;">
                    <div class="column is-2"></div>
                    <div class="column is-7">
                      <input class="input input-danger" type="text" v-model="guhuoValue" placeholder="请输入数量">
                    </div>
                    <div class="column is-2">
                      <div class="is-size-5"> 仙力 </div>
                    </div>
                  </div>

                  <div class="columns" style="margin-top: -1.5rem;" >
                    <div class="column is-2"></div>
                    <div class="column is-4">
                      <div class="is-size-4"><b>≈  {{guhuoAmount()}} eth</b></div>
                    </div>
                    <div class="column is-3"></div>
                    <div class="column is-3">
                      <div class="button is-danger" style="width: 100%" @click="destroy(guhuoValue)"> 蛊惑 </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div class="column is-3 has-text-white">
            <div class="shadow-bg" style="border-radius: 1rem; height: 30rem; margin-left:2rem; width: 18rem; overflow:hidden;">
              <div class="tabs is-fullwidth" style="">
                <ul>
                  <li class="is-active tab-liushi tab-item" @click="showLiushi()"><a class="tab-text has-text-white is-size-6"><b>灵气流失</b></a></li>
                  <li class="tab-jieyin tab-item" @click="showJieyin()">
                    <a class="tab-text has-text-white is-size-6"><b>接引</b></a>
                  </li>
                </ul>
              </div>

              <div class="tab-liushi-content has-text-white" style="padding-left: 1rem; padding-right: 0.8rem; overflow-y: scroll; height: 25rem;">
                <div class="has-text-centered">
                  <div class="is-size-5"><b>净化次数:</b> <span class="is-size-1"> {{gameStats.buyTotalNumber}}</span></div>
                  <div class="has-text-success has-text-centered"> 当前流失奖池: {{gameStats.buyBalanceSum}} ETH </div>
                  <div v-for="item in gameStats.stepBonusList" class="columns" style="margin-top: 1rem;">
                    <p class="column slim-column is-2"><b>{{item.stepCount}}</b></p>
                    <p class="column slim-column is-5"><b>{{shortAddress(item.owner)}}</b></p>
                    <p class="column slim-column is-5"><b>{{item.prize}} eth</b></p>
                  </div>
                </div>
              </div>
              <div class="tab-jieyin-content" style="display: none;">
                <div v-if="gameStats.inviteCode">
                  <div class="is-size-6" style="margin-top: 3rem; padding-left: 2rem;"><b> 你的接引地址: </b></div>
                  <div class="is-size-5 has-text-centered" style="margin-top: 0.5rem;"><b>http://ethfz.me/?r={{gameStats.inviteCode}}</b></div>
                </div>
                <div v-else>
                  <div style="padding: 1rem;">
                    <div>
                      <div> 生成接引地址需要0.01 ETH </div>
                      <div style="margin-top: 1rem;"> 输入合作公会Q群号可免费生成 </div>
                      <input class="input input-success" style="margin-top: 0.5rem;" type="text" v-model="qqcode" placeholder="请输入qq群号" @keyup="checkQQCode()">
                      <div class="columns" style="margin-top: 0.5rem;">
                        <div class="column is-3" style="margin-top: 0.4rem;"> 名称: </div>
                        <div class="column is-6">
                          <input class="input input-success" type="text" v-model="mySetInviteCode" placeholder="Name">
                        </div>
                      </div>
                      <div class="has-text-centered">
                        <div v-if="qqcode=='89378889'" class="button is-success" @click="setInviteCodeFree()"> 免费生成接引地址 </div>
                        <div v-else class="button is-link" @click="setInviteCode()"> 生成接引地址 </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
        </div>

        <div class="float:right: margin-right: 10rem;" style="margin-bottom: 3rem;">
          <div class="button bottom-button has-text-white" @click="togglePlay()" style="float:right; margin-right: 2rem;">
            <i class="iconfont icon-music is-size-6" style="display: none;"></i>
            <i class="iconfont icon-play"></i>
          </div>

          <a href="https://discord.gg/5A4TyNm" class="button bottom-button has-text-white" target="_blank" style="float: right; margin-right: 1rem;">
            <i class="iconfont icon-discord is-size-6"></i>
          </a>

          <a href="https://docs.qq.com/doc/Bu8tM71r2iDY3dk7vw0L1e9Q4jdnh83j1Wu215BGA62tyoU037DWSi2aO9z63puqdS1skgNI3" target="_blank" style="float:right; margin-right: 1rem; margin-top: -0.15rem;">
            <img src="static/assets/paper.png" style="width: 10rem;">
          </a>
        </div>

        <div class="container" style="margin-top: 8rem;">
          <div class="is-size-1 has-text-white has-text-centered">
            <div><b>合作伙伴</b></div>
          </div>
          <div class="columns partner is-variable is-8" style="margin-top: 1rem;">
            <div class="column is-1"></div>
            <div class="column is-2">
              <figure class="image is-6by3">
                <img src="static/assets/yihong.png" style="border-radius: 10px;">
              </figure>
            </div>
            <div class="column is-2">
              <figure class="image is-6by3">
                <img src="static/assets/dapdap.png" style="border-radius: 10px; height: 50px; width: auto; margin: auto;">
              </figure>
            </div>
            <div class="column is-2">
              <figure class="image is-6by3">
                <img src="static/assets/dappsoft.png" style="border-radius: 10px;">
              </figure>
            </div>
            <div class="column is-2">
              <figure class="image is-6by3">
                <img src="static/assets/luckgame.png" style="border-radius: 10px;">
              </figure>
            </div>

            <div class="column is-2">
              <figure class="image is-6by3">
                <img src="static/assets/dappworld.png" style="border-radius: 10px;">
              </figure>
            </div>
            <div class="column is-1"> </div>
          </div>
        </div>

        <div class="has-text-white has-text-centered" style="padding-top: 14rem;"> </div>
        <div class="has-text-white has-text-centered" style="padding-bottom: 1rem;">
          <div class="">Copyright 2018 ethfz.me</div>
        </div>
        </div>
    </div>
</template>

<script>
    import PulseLoader from 'vue-spinner/src/PulseLoader';
    import {getAllPicInfo, getMyAddress, addWinnerPrize, createNewPic, getGameStats, buy, joinGame, getItemName, sell, destroy, setInviteCode, setInviteCodeFree, claim} from '@/api';
    import { toReadablePrice } from '@/util';
    import FlipCountdown from 'vue2-flip-countdown';
    import swal from 'sweetalert';
    import DappCountdown from '@/components/DappCountdown';


  export default {
        name: 'index',
        components: {
            PulseLoader,
            DappCountdown,
        },

        data() {
            return {
                meinv_url: '',
                qqcode: '',
                sendPrize: 0,
                realPrize: 0,
                gameStats: {
                  maxReserved: 1,
                  maxBurn: 1,
                  gameTotalReserved: 0,
                  gameTotalBurn: 0,
                  gameStarted: true,
                  startCountdown: 0,
                  gameEnded: false
                },
                hasJieyin: false,
                jinghuaValue: '',
                huanyuanValue: '',
                tiquValue: '',
                guhuoValue: '',
                mySetInviteCode: '',
                address: '',
                loading: true,
            };
        },

        computed: {},

        async created() {
            var hasAddress = true;
            try {
              this.address = await getMyAddress();
            } catch(e) {
              hasAddress = false;
            }
            if (hasAddress) {
              this.inviteCode = this.getInviteCode();
              this.gameStats = await getGameStats(this.address);
              this.updateGameStats();
            }
            this.loading = false;
        },

        methods: {
          async updateGameStats() {
            function sleep(ms) {
              return new Promise(resolve => setTimeout(resolve, ms));
            }
            for (var i=0;i<1000;i++) {
              await sleep(10000);
              this.gameStats = await getGameStats(this.address);
            }
          },
            setInviteCode() {
              if (!this.address) {
                swal({
                  title: "需要Metamask!",
                  text: "Metamask可以通过chrome app商店下载",
                  icon: "warning",
                  dangerMode: true,
                });
                return ;
              }
              if (!this.mySetInviteCode) {
                swal("邀请码不能为空");
              }
              setInviteCode(this.address, this.mySetInviteCode.toLowerCase());
            },
            setInviteCodeFree() {
              if (!this.address) {
                swal({
                  title: "需要Metamask!",
                  text: "Metamask可以通过chrome app商店下载",
                  icon: "warning",
                  dangerMode: true,
                });
                return ;
              }
              if (!this.mySetInviteCode) {
                swal("邀请码不能为空");
              }
              setInviteCodeFree(this.address, this.mySetInviteCode.toLowerCase());
            },
            getInviteCode() {
              var sPageURL = decodeURIComponent(window.location.search.substring(1)),
              sURLVariables = sPageURL.split('&'),
              sParameterName,
              i;

              for (i = 0; i < sURLVariables.length; i++) {
                  sParameterName = sURLVariables[i].split('=');

                  if (sParameterName[0] === "r") {
                      return sParameterName[1] === undefined ? "": sParameterName[1];
                 }
              }
              return "";
            },
            jinghuaAmount() {
              if (this.jinghuaValue) {
                return parseInt(parseFloat(this.jinghuaValue)*0.9/this.gameStats.buyPrice);
              } else {
                return 0;
              }
            },
            huanyuanAmount() {
              if (this.huanyuanValue) {
                return parseFloat((parseFloat(this.huanyuanValue*0.9)*this.gameStats.buyPrice).toFixed(3));
              } else {
                return 0;
              }
            },
            tiquAmount() {
              if (this.gameStats.userHolderNumber) {
                return parseFloat((parseFloat(this.gameStats.userHolderNumber)*this.gameStats.claimEthPrice).toFixed(4));
              } else {
                return 0;
              }
            },
            guhuoAmount() {
              if (this.guhuoValue) {
                return parseFloat((parseFloat(this.guhuoValue)*this.gameStats.buyPrice*0.9*0.9).toFixed(3));
              } else {
                return 0;
              }
            },
            shortAddress(address) {
              var result = "0x..." + address.slice(-6);
              return result;
            },
            timestampToStr(timestamp) {
              timestamp += 8*60*60;
              var result = new Date(parseInt(timestamp) * 1000).toISOString().replace('T', ' ').slice(5,16);
              return result;
            },
            timestampToFullStr(timestamp) {
              timestamp += 8*60*60;
              var result = new Date(parseInt(timestamp) * 1000).toISOString().replace('T', ' ').slice(0,16);
              alert(result);
              return result;
            },
            togglePlay() {
              var myAudio = $("#myAudio").get(0);
              if (myAudio.paused) {
                myAudio.play();
                $(".icon-music").show();
                $(".icon-play").hide();
              } else {
                myAudio.pause();
                $(".icon-music").hide();
                $(".icon-play").show();
              }
            },
            showIntro() {
              $(".tab-intro").addClass("is-active");
              $(".tab-intro").addClass("active");
              $(".tab-history").removeClass("is-active");
              $(".tab-history").removeClass("active");
              $(".tab-intro-content").show();
              $(".tab-history-content").hide();
            },
            showHistory() {
              $(".tab-history").addClass("is-active");
              $(".tab-history").addClass("active");
              $(".tab-intro").removeClass("is-active");
              $(".tab-intro").removeClass("active");
              $(".tab-history-content").show();
              $(".tab-intro-content").hide();
            },
            showLiushi() {
              $(".tab-liushi").addClass("is-active");
              $(".tab-liushi").addClass("active");
              $(".tab-jieyin").removeClass("is-active");
              $(".tab-jieyin").removeClass("active");
              $(".tab-liushi-content").show();
              $(".tab-jieyin-content").hide();
            },
            showJieyin() {
              $(".tab-jieyin").addClass("is-active");
              $(".tab-jieyin").addClass("active");
              $(".tab-liushi").removeClass("is-active");
              $(".tab-liushi").removeClass("active");
              $(".tab-jieyin-content").show();
              $(".tab-liushi-content").hide();
            },
            showJinghua() {
              $(".tab-jinghua").addClass("is-active");
              $(".tab-jinghua").addClass("active");
              $(".tab-huanyuan").removeClass("is-active");
              $(".tab-huanyuan").removeClass("active");
              $(".tab-guhuo").removeClass("is-active");
              $(".tab-guhuo").removeClass("active");
              $(".tab-jinghua-content").show();
              $(".tab-huanyuan-content").hide();
              $(".tab-guhuo-content").hide();
            },
            showHuanyuan() {
              $(".tab-huanyuan").addClass("is-active");
              $(".tab-huanyuan").addClass("active");
              $(".tab-jinghua").removeClass("is-active");
              $(".tab-jinghua").removeClass("active");
              $(".tab-guhuo").removeClass("is-active");
              $(".tab-guhuo").removeClass("active");
              $(".tab-huanyuan-content").show();
              $(".tab-jinghua-content").hide();
              $(".tab-guhuo-content").hide();
            },
            showGuhuo() {
              $(".tab-guhuo").addClass("is-active");
              $(".tab-guhuo").addClass("active");
              $(".tab-huanyuan").removeClass("is-active");
              $(".tab-huanyuan").removeClass("active");
              $(".tab-jinghua").removeClass("is-active");
              $(".tab-jinghua").removeClass("active");
              $(".tab-guhuo-content").show();
              $(".tab-huanyuan-content").hide();
              $(".tab-jinghua-content").hide();
            },
            toDisplayedPrice(priceInWei) {
                const readable = toReadablePrice(priceInWei);
                return `${readable.price} ${readable.unit}`;
            },
            getItemName(itemId) {
              return getItemName(itemId);
            },
            async buy(ethAmount) {
              if (!this.address) {
                swal({
                  title: "需要Metamask!",
                  text: "Metamask可以通过chrome app商店下载",
                  icon: "warning",
                  dangerMode: true,
                });
                return ;
              }
              buy(this.address, ethAmount, this.inviteCode.toLowerCase()).then(() => {
                  swal("净化成功! 请等待区块链同步~");
                }).catch((e) => {
                  alert("净化失败" + e);
                })
            },
            async claim() {
              claim(this.address).then(() => {
                  swal("提取成功! 请等待区块链同步~");
                }).catch((e) => {
                  alert("提取失败" + e);
                })
            },
            async sell(quantity) {
              if (!this.address) {
                swal({
                  title: "需要Metamask!",
                  text: "Metamask可以通过chrome app商店下载",
                  icon: "warning",
                  dangerMode: true,
                });
                return ;
              }
              sell(this.address, quantity).then(() => {
                  swal("还原成功! 请等待区块链同步~");
                }).catch((e) => {
                  alert("还原失败" + e);
                })
            },
            async destroy(quantity) {
              if (!this.address) {
                swal({
                  title: "需要Metamask!",
                  text: "Metamask可以通过chrome app商店下载",
                  icon: "warning",
                  dangerMode: true,
                });
                return ;
              }
                destroy(this.address, quantity).then(() => {
                  swal("蛊惑成功! 请等待区块链同步~");
                }).catch((e) => {
                  alert("蛊惑失败" + e);
                })
            },
          async startSendPriceIncrement() {
              function sleep(ms) {
                  return new Promise(resolve => setTimeout(resolve, ms));
              }

              for (var i = 0; i < 10000; i++) {
                  await sleep(330);
                  this.realPrize += 0.1;
                  this.sendPrize = this.realPrize.toFixed(1);
              }
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
    .mainpage {
    }
    /*
    @font-face {
       font-family: 'font1' ;
       src: url('../../static/assets/HYShangWeiShouShuW.ttf') format('truetype');
    }*/
    .ite-logo {
      /*font-family: 'font1';*/
    }
    .shadow-bg {
      background: rgba(0,0,0,0.5);
    }
    .tab-item.is-active {
      background: linear-gradient(to right, #0b642f , #217d47);
    }
    .scrollbar {
	    float: left;
	    overflow-y: scroll;
    }
    .bottom-button {
      background-color: rgba(0,0,0,0.9);
      background-repeat:no-repeat;
      border: 3px;
      cursor: pointer;
      overflow: hidden;
    }
    .row{
      display:flex;
      align-items:center;
    }
    .progress {
      margin:0;
    }
    input.input-success[type="text"]
    {
      background: transparent;
      border: 2px;
      box-shadow: 0 0 2px #31cf65;
      color: white;
    }
    input.input-warning[type="text"]
    {
      background: transparent;
      border: 2px;
      box-shadow: 0 0 2px #fedc62;
      color: white;
    }
    input.input-danger[type="text"]
    {
      background: transparent;
      border: 2px;
      box-shadow: 0 0 2px #fc3c63;
      color: white;
    }
    ::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
     color: grey;
     opacity: 1; /* Firefox */
    }
    .bottom-right-button {
      position: absolute;
      right:    0;
      bottom:   0;
    }
    .tab-huanyuan li.is-active a{
      border-bottom: 3px solid #fedc62;
      border-bottom-color: #fedc62;
    }
    .tabs li.tab-jinghua.is-active a {
      border-bottom-color: #31cf65;
    }
    .tabs li.tab-huanyuan.is-active a {
      border-bottom-color: #fedc62;
    }
    .tabs li.tab-guhuo.is-active a {
      border-bottom-color: #fc3c63;
    }
    .slim-column {
      padding: 0.1rem;
    }
</style>
