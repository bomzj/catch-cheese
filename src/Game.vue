<template>
  <div class="container">
    <h1 class="text-center py-3">Catch the Cheese</h1>
    <div class="row">
        <div class="col">
          <GameStats :score="score" :round="round"/>
        </div>
    </div>
    <div class="row">
      <div class="col">
        <GameField :map="map"/>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <Trainer :agent="player"/>
      </div>
    </div>
  </div>
</template>

<script>
import GameStats from './components/GameStats.vue'
import GameField from './components/GameField.vue'
import Player from './actors/player'
import Agent from './actors/agent'
import Emojis from './components/emojis'
import Trainer from './components/Trainer.vue'

export default {
  name: 'app',
  components: {
    GameStats, GameField, Trainer
  },
  
  data()  {
    return {
      mapLength: 12,
      map: [],
      player: null,
      score: 0,
      round: 1
    }
  },

  created() {
    // Uncomment line below to play yourself and comment out line of '.. new Agent()'
    //var player = new Player(); 
    var player = new Agent();
    this.setPlayer(player);

    // Run infinite game loop without blocking Browser Event Loop
    async function run() {
        await this.update();
        setTimeout(run.bind(this), 0);
    };
    
    run.call(this);
  },

  methods: {
    setPlayer(player) {
        this.player = player;
        player.game = this;
        this.generateMap();
    },
    
    async update() {
          // Wait for player action: 0 - left,  1 - right
          var actionIndex = await this.player.act();
          
          var playerIndex = this.map.indexOf(Emojis.PlayerChar);

          // Update Score if player is hitting Cat or Cheese
          var nextPlayerIndex = playerIndex + (actionIndex || -1);
          var hitMapElement = this.map[nextPlayerIndex];
          var oldScore = this.score;
          if (hitMapElement == Emojis.CatChar) this.score--; 
          else if (hitMapElement == Emojis.CheeseChar) this.score++;
          
          // if Score hasn't been changed(player didn't hit Cat or Cheese),
          // Move player either left or right
          if (oldScore == this.score) {
              // we can not change values in array directly since 
              // vue can not track changes on array elements, so we use $set()
              this.$set(this.map, nextPlayerIndex, Emojis.PlayerChar);
              this.$set(this.map, playerIndex, '');
          } else { 
              // Regenerate game map
              this.generateMap();
              this.round++;
          }
    },

    generateMap() {
        this.map = Array(this.mapLength);
        this.map[0] = Math.random() > 0.5 ? Emojis.CatChar : Emojis.CheeseChar;
        this.map[this.map.length - 1] = this.map[0] == Emojis.CatChar ? Emojis.CheeseChar : Emojis.CatChar;
        // Generate random player position
        var playerIndex = Math.floor(Math.random() * (this.mapLength - 2)) + 1;
        this.map[playerIndex] = Emojis.PlayerChar;
    }
  }
}
</script>