<template>
  <div class="d-flex py-3 game-grid">
    <div class="border border-right-0 game-grid-cell" v-for="item in map">{{ item }}</div>
  </div>
</template>

<script>
export default {
  name: 'GameField',
  props: ['map']
}
</script>

<style lang="scss">
.game-grid {
    justify-content: center;
    text-align: center;
}

.game-grid-cell {
  width: 32px;
  font-size:1.3rem;
  
}

// Small devices (landscape phones, 576px and up)
@media (min-width: 576px) { 
  .game-grid-cell {
    width: 43px;
    font-size: 1.7rem;
  }
}

// Medium devices (tablets, 768px and up)
@media (min-width: 768px) {
  .game-grid-cell {
    width: 50px;
    font-size: 2rem;
  }
}

.game-grid-cell:last-child {
  border: 1px solid #dee2e6!important;
}
</style>