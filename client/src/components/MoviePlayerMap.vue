<template>
  <div class="movie-player-map">

    <div class="map-ctrl">
      <button 
        class="action button"
        @click="showMap=!showMap"
      >
        {{ showMap ? "close" : "open" }} <font-awesome-icon icon="map" class="flush-right"/>
      </button>
    </div>

<transition name="fade-down">
    <div 
      v-show="showMap" 
      class="map"
    >
        
      <div class="hot-spots">
        <dl class="cell">
          <dt>go back 30 seconds</dt>
          <dd>key: Ctrl-ArrowLeft</dd>
        </dl>
        <dl class="cell">
          <dt>increase speed</dt>
          <dd>key: “]” or “+”</dd>
        </dl>
        <dl class="cell">
          <dt>go forward 30 seconds</dt>
          <dd>key: Ctrl-ArrowRight</dd>
        </dl>

        <dl class="cell">
          <dt>go back 10 seconds</dt>
          <dd>key: ArrowLeft</dd>
        </dl>
        <dl class="cell">
          <dt>start/stop</dt>
          <dd>key: SpaceBar</dd>
        </dl>
        <dl class="cell">
          <dt>go forward 10 seconds</dt>
          <dd>key: ArrowRight</dd>
        </dl>

        <dl class="cell">
          <dt>go back 1 second</dt>
          <dd>key: “,”</dd>
        </dl>
        <dl class="cell">
          <dt>reduce speed</dt>
          <dd>key: “[” or “-”</dd>
        </dl>
        <dl class="cell">
          <dt>go forward 1 second</dt>
          <dd>key: “.”</dd>
        </dl>
      </div>

      <div class="hot-keys">
        <dl>
          <dt>set start-flag time (preview frame)</dt>
          <dd>key: “s”</dd>
          <dt>set marker</dt>
          <dd>key: “m”</dd>
          <dt>reset speed</dt>
          <dd>key: “=”</dd>
          <dt>volume up</dt>
          <dd>key: ArrowUp</dd>
          <dt>volume down</dt>
          <dd>key: ArrowDown</dd>
        </dl>
      </div>
    
    </div>
</transition>
  </div>
</template>

<script>
export default {
  name: "MoviePlayerMap",
  components: {
  },
  data() {
    return {
      showMap: false,
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>

<style scoped>
dl {
  margin-block: 0 0 ;
  
}
dt { 
  margin-top: .5em;
  font-style: italic;
  color: rgb(229,222,244);
}
dd {
  margin-inline: 0 0;
  margin-bottom: .5em;
  color: rgb(255,254,245);
  font-weight: 700;
}
.map-ctrl {
  text-align: right;
}
.map {
  background-color: rgb(21,6,6);
  padding: .2em;
  border: 3px solid rgb(78,32,83);
  border-radius: 10px;
  opacity: 1;
  transition: all 1s;
}
.hot-spots {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.cell {
  width: 33.33%;
  display: inline-block;
  border: 1px solid rgba(204, 204, 204, 0.445);
  padding: 1em .2em;
  text-align: center;
}
.hot-keys {
  margin-top: 1em;
}
.hot-keys .desc {
  padding: 1em 1em 0;
}

.fade-down-enter-active,
.fade-down-leave-active {
  transition: all 0.4s ease-in-out, transform 0.4s ease-in-out;
}
.fade-down-enter,
.fade-down-leave-to {
  opacity: 0;
  transform: translate(45px,-36px);
}
</style>