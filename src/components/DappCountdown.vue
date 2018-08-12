<template>
    <div class="container flip-clock" v-show="show">
        <template v-for="data in timeData">
            <span v-bind:key="data.label" class="flip-clock__piece" :id="data.elementId">
                <span class="flip-clock__card flip-card">
                <b class="flip-card__top">{{data.current | twoDigits}}</b>
                <b class="flip-card__bottom" v-bind:data-value="data.current | twoDigits"></b>
                <b class="flip-card__back" v-bind:data-value="data.previous | twoDigits"></b>
                <b class="flip-card__back-bottom" v-bind:data-value="data.previous | twoDigits"></b>
                </span>
                <span class="flip-clock__slot">{{data.label}}</span>
            </span>
        </template>
    </div>
</template>

<script>
let interval = null

export default {
  name: 'DappCountdown',
  props: {
    diff: {
      type: Number 
    },
    stop: {
      type: Boolean
    }
  },
  data () {
    return {
      now: Math.trunc(new Date().getTime() / 1000),
      date: null,
      diffNumber: this.diff,
      show: false,
      timeData: [
        {
          current: 0,
          previous: 0,
          label: 'Days',
          elementId: 'flip-card-days'
        },
        {
          current: 0,
          previous: 0,
          label: 'Hours',
          elementId: 'flip-card-hours'
        },
        {
          current: 0,
          previous: 0,
          label: 'Minutes',
          elementId: 'flip-card-minutes'
        },
        {
          current: 0,
          previous: 0,
          label: 'Seconds',
          elementId: 'flip-card-seconds'
        }
      ]
    }
  },
  created () {
    if (!this.diffNumber) {
      alert("bad diffNumber");
      throw new Error("Missing props 'diff'")
    }
    interval = setInterval(() => {
      this.diffNumber -= 1;
    }, 1000)
  },
  mounted () {
    if (this.diffNumber !== 0) {
      this.show = true; 
    }
  },
  computed: {
    seconds () {
      return Math.trunc(this.diffNumber) % 60
    },
    minutes () {
      return Math.trunc(this.diffNumber / 60) % 60
    },
    hours () {
      return Math.trunc(this.diffNumber / 60 / 60) % 24
    },
    days () {
      return Math.trunc(this.diffNumber / 60 / 60 / 24)
    }
  },
  watch: {
    diffNumber (value) {
      if (this.diffNumber <= 0 || this.stop) {
        this.diffNumber = 0
        this.show = false;
        clearInterval(interval)
      } else {
        this.updateTime(0, this.days)
        this.updateTime(1, this.hours)
        this.updateTime(2, this.minutes)
        this.updateTime(3, this.seconds)
      }
    }
  },
  filters: {
    twoDigits (value) {
      if (value.toString().length <= 1) {
        return '0' + value.toString()
      }
      return value.toString()
    }
  },
  methods: {
    updateTime (idx, newValue) {
      if (idx >= this.timeData.length || newValue === undefined) {
        return
      }

      if (window['requestAnimationFrame']) {
        this.frame = requestAnimationFrame(this.updateTime.bind(this))
      }

      const d = this.timeData[idx]
      const val = (newValue < 0 ? 0 : newValue)

      if (val !== d.current) {
        d.previous = d.current
        d.current = val

        const el = document.querySelector(`#${d.elementId}`)
        if (el) {
          el.classList.remove('flip')
          void el.offsetWidth
          el.classList.add('flip')
        }
      }
    }
  },
  beforeDestroy () {
    if (window['cancelAnimationFrame']) {
      cancelAnimationFrame(this.frame)
    }
  },
  destroyed () {
    clearInterval(interval)
  }
}
</script>

<style scoped lang="less">
.flip-clock {
  text-align: center;
  perspective: 600px;
  margin: 0 auto;

  *,
  *:before,
  *:after { box-sizing: border-box; }
}


.flip-clock__piece {
  display: inline-block;
  margin: 0 0.2vw;
  
  @media (min-width: 1000px) {
    margin: 0 5px;
  }
}

.flip-clock__slot {
  font-size: 1rem;
  line-height: 1.5;
  display: block;
}

@halfHeight: 0.72em;
@borderRadius: 0.15em;

.flip-card {
  display: block;
  position: relative;
  padding-bottom: @halfHeight;
  font-size: 2.25rem;
  line-height: 0.95;
}

@media (min-width: 1000px) {
  .flip-clock__slot { font-size: 1.2rem; }
  .flip-card { font-size: 3rem; }
}

.flip-card__top,
.flip-card__bottom,
.flip-card__back-bottom,
.flip-card__back::before,
.flip-card__back::after {
  display: block;
  height: @halfHeight;
  color: #eeeeee;
  background: #222;
  padding: 0.23em 0.15em 0.4em;
  border-radius: @borderRadius @borderRadius 0 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform-style: preserve-3d;
  width: 2.1em;
  height: @halfHeight;
}

.flip-card__bottom,
.flip-card__back-bottom {
  color: #ffffff;
  position: absolute;
  top: 50%;
  left: 0;
  border-top: solid 1px #000;
  background: #393939;
  border-radius: 0 0 @borderRadius @borderRadius;
  pointer-events: none;
  overflow: hidden;
  z-index: 2;
}

.flip-card__back-bottom {
  z-index: 1;
}

.flip-card__bottom::after,
.flip-card__back-bottom::after {
  display: block;
  margin-top: -@halfHeight;
}

.flip-card__back::before,
.flip-card__bottom::after,
.flip-card__back-bottom::after {
  content: attr(data-value);
}

.flip-card__back {
  position: absolute;
  top: 0;
  height: 100%;
  left: 0%;
  pointer-events: none;
}

.flip-card__back::before {
  position: relative;
  overflow: hidden;
  z-index: -1;
}

.flip .flip-card__back::before {
  z-index: 1;
  animation: flipTop 0.3s cubic-bezier(.37,.01,.94,.35);
  animation-fill-mode: both;
  transform-origin: center bottom;
}

.flip .flip-card__bottom {
  transform-origin: center top;
  animation-fill-mode: both;
  animation: flipBottom 0.6s cubic-bezier(.15,.45,.28,1);
}

@keyframes flipTop {
  0% {
    transform: rotateX(0deg);
    z-index: 2;
  }
  0%, 99% {
    opacity: 1;
  }
  100% {
    transform: rotateX(-90deg);
    opacity: 0;
  }
}

@keyframes flipBottom {
  0%, 50% {
    z-index: -1;
    transform: rotateX(90deg);
    opacity: 0;
  }
  51% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: rotateX(0deg);
    z-index: 5;
  }
}
</style>
