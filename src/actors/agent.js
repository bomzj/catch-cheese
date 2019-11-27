import * as tf from '@tensorflow/tfjs'
import Emojis from '../components/emojis'

/**
 * AI player based on neural network
 */
export default class Agent {
  /** Reference to Game object */
  game = null;

  /** neural network based on Q-learning */
  model = null;

  /** Probability to take random action instead of the best one.
  Is used to showcase random actions of agent on inital load and is disabled after first training. */
  exploration = 1;

  /** Discount factor of future reward. */
  discount = 0.95;

  /** Previous score, is used to determine Score change in order to get reward for last action. */
  oldScore = 0;

  /** Index of action(0 or 1) taken in previous step(iteration).*/
  oldAction = 0;

  /** Previous state, is used in model training.*/
  oldState;
  
  /** Replay memory. */
  memory = [];

  /** Is agent in training mode or normal one?*/
  isTraining = false;

  /** Is enabled after each model.fit() to check how model is well trained.*/
  isModelValidating = false;

  /** Is used during model validation to show how good model is trained.
  If it equals to 10 then model is considered as well trained.*/
  winsInRow = 0;

  constructor() {
    this.buildModel();
  }

  /**
   * Builds 2 layer model that is enough for this particular game and consist of:
   * [1] input - direction, where Agent should go to reach a Cheese;
   * [2] outputs - array of Q values, where [0] - Q value to go left and [1] - Q value to go right
   */
  buildModel() {
    this.model = tf.sequential();
    this.model.add(tf.layers.dense({
      inputShape: 1,
      units: 2,
    }));
    this.model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });
  }

  /** 
   * Game state tensor is input for neural network.
   * We use only one feature - cheese position relative to player.
   */
  getState() {
    var cheeseIndex = this.game.map.indexOf(Emojis.CheeseChar);
    var playerIndex = this.game.map.indexOf(Emojis.PlayerChar);
    var cheeseDirection = playerIndex > cheeseIndex ? 0 : 1;
    return tf.tensor([cheeseDirection]);
  }

  /**
   * Returns the best action for the state based on Q value.
   * @returns 0 - Left, 1 - Right
   */
  getBestAction(state) {
    var actions = this.model.predict(state).arraySync()[0];
    var action = actions.indexOf(Math.max(...actions));
    return action;
  }

  /** Returns the best action or random one. */
  getAction() {
    if (this.exploration > Math.random()) {
      var action = Math.random() < 0.5 ? 0 : 1;
    } else {
      var state = this.getState();
      action = this.getBestAction(state);
    }

    return action;
  }

  /** Evaluates reward for the last action based on score change. */
  GetReward() {
    var reward = -1;
    // Player hit Cheese(+100) or Cat(-100). 
    // Chosen reward value of +/-100 makes training faster and usually requires 1 or 2 training iterations,
    // while values of +/-1 may slow down training for long time or even get stuck.
    if (this.oldScore < this.game.score) reward = 100;
    else if (this.oldScore > this.game.score) reward = -100;
    return reward;
  }

  act() {
    if (this.isTraining) {
      var action = this.handleTraining();
    }
    else {
      let state = this.getState();
      action = this.getBestAction(state);
    }

    return action;
  }

  /** Collects agent steps into replay memory and then trains on it. */
  handleTraining() {
    var state = this.getState();
    var action = this.getAction();

    // if it's not first game step iteration (oldState is unknown yet), 
    // then add experience step into memory replay for training later on
    if (this.oldState) {
      this.memory.push({
        state: this.oldState,
        action: this.oldAction,
        reward: this.GetReward(),
        nextState: state,
        isFinished: this.oldScore != this.game.score // is game finished
      });
    }

    // Validate recent training to determine whether agent plays good, otherwise retrain model one more time.
    if (this.isModelValidating) {
      if (this.game.score > this.oldScore) {
        this.winsInRow++;
      }
      else if (this.game.score < this.oldScore) {
        // Continue training until agent wins 20 times in row
        this.isModelValidating = false;
        this.winsInRow = 0;
      }

      // Stop training once model wins 20 times in row
      if (this.winsInRow == 20) {
        this.isTraining = false;
        this.isModelValidating = false;
        this.memory = [];
        this.winsInRow = 0;
      }

    } else if (this.memory.length >= 100) {
      this.fitModel();
      // Start validating training
      this.isModelValidating = true;
      this.memory = [];
      // disable exploration after first fit
      this.exploration = 0;
    }

    // Save state/action/score for next iteration
    this.oldState = state;
    this.oldAction = action;
    this.oldScore = this.game.score;

    return action;
  }

  /** Trains model on samples from replay memory. */
  fitModel() {
    let [inputs, outputs] = [[], []];
    for (let i = 0; i < this.memory.length; i++) {
      let { state, action, reward, nextState, isFinished } = this.memory[i];

      var q = reward;

      // If it's not the last action in the game, calculate future reward for previous state(step).
      if (!isFinished) {
        var actions = this.model.predict(nextState).arraySync()[0];
        // As our game is super simple, we could use immediate rewards [Q(s,a)=R(s,a)] +1 for each step if AI moves to Cheese and -1 otherwise.
        // But for full showcase we will use complete Q-learning formula with future rewards Q(s,a) = R(s,a) + g * maxQ(s',a), where immediate rewards are zeroes most of the time except last steps(near the Cheese/Cat).
        q = reward + this.discount * Math.max(...actions);
      }

      actions = this.model.predict(state).arraySync()[0];
      actions[action] = q;

      inputs.push(state.arraySync()[0]);
      outputs.push(actions);
    }

    inputs = tf.tensor(inputs);
    outputs = tf.tensor(outputs);
    // shuffle memory samples to disrupt state correlations for better training
    return this.model.fit(inputs, outputs,
      {
        epochs: 100,
        batchSize: this.memory.length,
        shuffle: true,
        callbacks: {
          onTrainEnd: console.log('training complete')
        }
      });
  }
}