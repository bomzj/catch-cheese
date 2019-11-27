<template>
  <div class="text-center p-2">
    <button type="button" class="btn btn-success" @click="trainAgent" :disabled="agent.isTraining">{{buttonTitle}}</button>
  </div>
</template>

<script>
export default {
  name: 'Trainer',
  props: ['agent', 'game'],
  data() {
    return {
      initialGamePace: this.game.pace
    }
  },
  watch: {
   'agent.isTraining': function(value){
      if (!value) this.game.pace = this.initialGamePace;
    }
  },
  computed: {
    buttonTitle() {
      var title = "Train Agent";
      if (this.agent.isTraining && this.agent.isModelValidating) 
        title = "Validating...";
      else if (this.agent.isTraining)
        title = "Training...";
      return title;
    }
  },
  methods: {
    trainAgent() {
      this.agent.isTraining = true;
      this.game.pace = 0;
    }
  }
}
</script>