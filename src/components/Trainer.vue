<template>
  <div class="text-center p-2">
    <button type="button" class="btn btn-success" @click="trainAgent" :disabled="agent.isTraining">{{buttonTitle}}</button>
  </div>
</template>

<script>
export default {
  name: 'Trainer',
  props: ['agent'],
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
    }
  }
}
</script>