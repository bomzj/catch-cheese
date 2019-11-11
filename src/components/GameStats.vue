<template>
  <div class="game-stats">
    <span class="p-3">Game {{ round }}</span>
    <span class="p-3">Score 
      <transition name="pulse" mode="out-in">
        <span :key="score" :class="scoreCssClass" class="score-value" >{{ score }}</span>
    </transition> 
    </span>
  </div>
</template>

<script>
export default {
  name: 'GameStats',
  props: ['score', 'round'],
  computed: {
    scoreCssClass() {
      return this.score >= 0 ? 'text-success': 'text-danger';
    }
  }
}
</script>

<style>
.game-stats {
    font-size: x-large;
    text-align: center;
}

.score-value {
  display: inline-block;
}

.pulse-enter-active, .pulse-leave-active  {
  transition: all 0.1s;
}

.pulse-enter, .pulse-leave-to {
  transform: scale(1.1);
}
</style>